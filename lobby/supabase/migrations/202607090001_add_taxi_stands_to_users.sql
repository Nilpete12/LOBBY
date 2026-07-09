alter table public.users
  add column if not exists taxi_stands text[] not null default '{}';

create index if not exists users_taxi_stands_gin_idx
  on public.users using gin (taxi_stands);
