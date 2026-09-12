-- The date a report's own stated reporting period starts (e.g. the first
-- day of "August 2026"), as extracted by the model - distinct from
-- created_at, which is just when it was uploaded to this tool. Null for
-- reports whose document didn't state a period, and for reports saved
-- before this column existed.
alter table reports add column if not exists reporting_period_start date;

create index if not exists reports_user_id_period_idx
  on reports (user_id, reporting_period_start desc, created_at desc);
