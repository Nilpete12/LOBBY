alter table public.analytics
  add column if not exists destination text,
  add column if not exists requested_stand text,
  add column if not exists vehicle_type_filter text;

create index if not exists analytics_event_type_created_at_idx
  on public.analytics (event_type, created_at desc);

create index if not exists analytics_requested_stand_idx
  on public.analytics (requested_stand)
  where requested_stand is not null and requested_stand <> '';
