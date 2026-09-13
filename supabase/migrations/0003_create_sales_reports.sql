-- Stores each extracted sales/CRM snapshot, scoped to the user who uploaded
-- it. Deliberately a separate table from `reports` rather than a shared
-- table with a "kind" column - the two have almost no columns in common
-- (this one has no channel mix, benchmarks, or red flags), and keeping them
-- separate means a query against one never needs to filter out the other.
create table if not exists sales_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reporting_period text,
  reporting_period_start date,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists sales_reports_user_id_period_idx
  on sales_reports (user_id, reporting_period_start desc, created_at desc);

alter table sales_reports enable row level security;

create policy "Users can view their own sales reports"
  on sales_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sales reports"
  on sales_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own sales reports"
  on sales_reports for delete
  using (auth.uid() = user_id);
