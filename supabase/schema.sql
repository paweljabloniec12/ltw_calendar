create extension if not exists pgcrypto;

-- 1. TABELA PROFILI USŁUGODAWCÓW
-- Rozszerza auth.users - każdy zalogowany ma tu swój wiersz.
create table if not exists public.profiles (
  id             uuid        references auth.users(id) on delete cascade primary key,
  full_name      text        not null,
  service_type   text        not null
    check (service_type in (
      'Fotografia','Video','Zespół','DJ',
      'Dekoracje','Beauty','Bar','Cukiernia','Atrakcje','Samochód',
      'Content Creator','Oprawa muzyczna','Animacje'
    )),
  phone          text,
  email_public   text,
  website_url    text,
  instagram_url  text,
  description    text,
  is_active      boolean     default true,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- 2. TABELA ZAJĘTYCH TERMINÓW
create table if not exists public.booked_dates (
  id           uuid        default gen_random_uuid() primary key,
  provider_id  uuid        not null references public.profiles(id) on delete cascade,
  date         date        not null,
  notes        text,
  created_at   timestamptz default now(),
  constraint booked_dates_unique unique (provider_id, date)
);

create index if not exists idx_booked_dates_date
  on public.booked_dates(date);

create index if not exists idx_booked_dates_provider
  on public.booked_dates(provider_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.booked_dates enable row level security;

drop policy if exists "public_read_profiles" on public.profiles;
create policy "public_read_profiles"
  on public.profiles for select
  using (is_active = true);

drop policy if exists "provider_update_own_profile" on public.profiles;
create policy "provider_update_own_profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "public_read_booked_dates" on public.booked_dates;
create policy "public_read_booked_dates"
  on public.booked_dates for select
  using (true);

drop policy if exists "provider_insert_own_dates" on public.booked_dates;
create policy "provider_insert_own_dates"
  on public.booked_dates for insert
  with check (auth.uid() = provider_id);

drop policy if exists "provider_delete_own_dates" on public.booked_dates;
create policy "provider_delete_own_dates"
  on public.booked_dates for delete
  using (auth.uid() = provider_id);

-- ============================================================
-- TRIGGER - automatyczne tworzenie profilu po rejestracji
-- Dane przekazywane przez signUp({ options: { data: {...} } })
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    service_type,
    phone,
    website_url,
    instagram_url,
    description,
    email_public
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'service_type', 'Fotografia'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'website_url',
    new.raw_user_meta_data->>'instagram_url',
    new.raw_user_meta_data->>'description',
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================
-- TRIGGER - aktualizacja updated_at w profiles
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();
