-- Notifies the founder by email the moment someone submits their email on
-- /signup (a new row lands in profiles), using Resend's API via pg_net.
-- The Resend API key lives in Supabase Vault (secret name: resend_api_key),
-- never in this file - if that secret isn't found, this silently no-ops
-- rather than breaking the signup flow.

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_new_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resend_api_key text;
begin
  select decrypted_secret into resend_api_key
  from vault.decrypted_secrets
  where name = 'resend_api_key'
  limit 1;

  if resend_api_key is null then
    return new;
  end if;

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || resend_api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'AdVitals <notifications@mail.aiadvise.agency>',
      'to', jsonb_build_array('chris@aiadvise.agency'),
      'subject', 'New AdVitals signup: ' || new.email,
      'html', format(
        '<p>New signup: <strong>%s</strong></p><p>Signup #%s%s</p>',
        new.email,
        new.signup_number,
        case when new.beta_price_locked then ' - founding price locked in.' else '.' end
      )
    )
  );

  return new;
end;
$$;

drop trigger if exists on_profile_created_notify on public.profiles;
create trigger on_profile_created_notify
  after insert on public.profiles
  for each row execute procedure public.notify_new_signup();
