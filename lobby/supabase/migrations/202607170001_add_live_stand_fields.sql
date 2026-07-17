alter table public.users
  add column if not exists current_stand text,
  add column if not exists current_stand_updated_at timestamptz;

alter table public.bookings
  add column if not exists requested_stand text;

create index if not exists users_current_stand_idx
  on public.users (current_stand)
  where current_stand is not null;

create index if not exists bookings_requested_stand_idx
  on public.bookings (requested_stand)
  where requested_stand is not null;
