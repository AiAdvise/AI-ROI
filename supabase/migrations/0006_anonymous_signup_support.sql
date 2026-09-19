-- Supports the instant-access signup flow: submitting an email on /signup
-- now signs the visitor in anonymously right away (see
-- SignupMagicLinkForm.tsx) instead of gating access behind a magic-link
-- click. Their email is attached to that session in the background via
-- supabase.auth.updateUser(), and separately claimed onto their profiles
-- row immediately through this RPC so our own tracking/notification
-- doesn't depend on Supabase's own email-confirmation timing.

create or replace function public.claim_signup_email(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Must be signed in to claim an email';
  end if;

  update public.profiles
  set email = p_email
  where id = auth.uid();
end;
$$;

grant execute on function public.claim_signup_email(text) to authenticated;

-- Anonymous signups insert into profiles with a null email, but the
-- existing trigger had no guard against that - it would fire on every
-- insert regardless, producing a notification for an email-less row.
-- Re-create it guarded to only fire when an email is actually present.
drop trigger if exists on_profile_created_notify on public.profiles;
create trigger on_profile_created_notify
  after insert on public.profiles
  for each row
  when (new.email is not null)
  execute procedure public.notify_new_signup();

-- Covers the anonymous-signup path: fires when claim_signup_email (or
-- anything else) sets the email on an existing profile for the first time.
drop trigger if exists on_profile_email_claimed_notify on public.profiles;
create trigger on_profile_email_claimed_notify
  after update of email on public.profiles
  for each row
  when (new.email is not null and old.email is distinct from new.email)
  execute procedure public.notify_new_signup();
