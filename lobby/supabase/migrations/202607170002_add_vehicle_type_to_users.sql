alter table public.users
  add column if not exists vehicle_type text;

create index if not exists users_vehicle_type_idx
  on public.users (vehicle_type)
  where vehicle_type is not null and vehicle_type <> '';
