alter table public.users
  add column if not exists vehicle_plate text;

create index if not exists users_vehicle_plate_idx
  on public.users (vehicle_plate)
  where vehicle_plate is not null and vehicle_plate <> '';
