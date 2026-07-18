alter table public.users
  add column if not exists phone text,
  add column if not exists email_verified_at timestamptz,
  add column if not exists phone_verified_at timestamptz,
  add column if not exists contact_verified_at timestamptz;

create index if not exists users_phone_idx
  on public.users (phone)
  where phone is not null and phone <> '';
