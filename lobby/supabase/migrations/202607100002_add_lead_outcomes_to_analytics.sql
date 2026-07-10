alter table public.analytics
  add column if not exists lead_status text not null default 'pending',
  add column if not exists rider_outcome text,
  add column if not exists rider_reported_at timestamptz,
  add column if not exists driver_outcome text,
  add column if not exists driver_reported_at timestamptz,
  add column if not exists driver_outcome_notes text;

create index if not exists analytics_driver_lead_status_idx
  on public.analytics (driver_id, lead_status, created_at desc);

create index if not exists analytics_rider_lead_status_idx
  on public.analytics (rider_id, lead_status, created_at desc);
