create table if not exists public.driver_notifications (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references public.users(id) on delete cascade,
  clerk_id text not null,
  type text not null default 'subscription_reminder',
  title text not null,
  message text not null,
  status text not null default 'unread',
  channel text not null default 'dashboard_whatsapp',
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists driver_notifications_clerk_created_idx
  on public.driver_notifications (clerk_id, created_at desc);

create index if not exists driver_notifications_type_status_idx
  on public.driver_notifications (type, status);

alter table public.driver_notifications enable row level security;
