-- Tracks beta signups: sequential signup order and whether they landed
-- inside the first 10 (which locks in the $15/mo lifetime price after the
-- 3-month free trial). A trigger on auth.users keeps this populated
-- automatically for every future signup.

create sequence if not exists profiles_signup_number_seq;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  signup_number integer not null default nextval('profiles_signup_number_seq'),
  beta_price_locked boolean generated always as (signup_number <= 10) stored,
  trial_ends_at timestamptz not null default (now() + interval '3 months'),
  created_at timestamptz not null default now()
);

-- Backfill anyone who signed up before this migration existed, preserving
-- their original signup order.
insert into profiles (id, email, signup_number)
select u.id, u.email, nextval('profiles_signup_number_seq')
from auth.users u
where not exists (select 1 from profiles p where p.id = u.id)
order by u.created_at;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

-- Lets the (unauthenticated) signup page show how many founding spots are
-- left without exposing any profile rows publicly.
create or replace function public.beta_spots_taken()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer from public.profiles where beta_price_locked;
$$;

grant execute on function public.beta_spots_taken() to anon, authenticated;
