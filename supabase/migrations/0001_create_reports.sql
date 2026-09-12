-- Stores each completed media plan diagnostic, scoped to the user who ran it.
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_type text,
  trade text,
  reporting_period text,
  overall_assessment text,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists reports_user_id_created_at_idx
  on reports (user_id, created_at desc);

alter table reports enable row level security;

create policy "Users can view their own reports"
  on reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reports"
  on reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own reports"
  on reports for delete
  using (auth.uid() = user_id);
