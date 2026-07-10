create table if not exists public.driver_monthly_surveys (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references public.users(id) on delete cascade,
  clerk_id text not null,
  survey_month date not null,
  estimated_completed_rides integer not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clerk_id, survey_month)
);

create index if not exists driver_monthly_surveys_clerk_month_idx
  on public.driver_monthly_surveys (clerk_id, survey_month desc);

alter table public.driver_monthly_surveys enable row level security;
