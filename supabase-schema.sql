-- ============================================================
-- LINKER — Schema SQL
-- Ejecuta esto en Supabase > SQL Editor > New Query
-- ============================================================

-- 1. EVENTS table
create table if not exists events (
  id text primary key,
  name text not null,
  organizer text not null,
  status text not null default 'registration' check (status in ('registration', 'live', 'closed')),
  password text not null,
  created_at timestamptz default now()
);

-- 2. PROFILES table
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  event_id text references events(id) on delete cascade,
  name text not null,
  company text not null,
  role text not null,
  offer text not null,
  seeking text not null,
  email text not null,
  phone text,
  linkedin text,
  instagram text,
  tiktok text,
  other text,
  photo_url text,
  consent boolean default true,
  created_at timestamptz default now()
);

-- 3. Enable Realtime on both tables
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table profiles;

-- 4. Row Level Security — public read, insert own profile
alter table events enable row level security;
alter table profiles enable row level security;

create policy "Anyone can read events" on events for select using (true);
create policy "Anyone can read profiles" on profiles for select using (true);
create policy "Anyone can insert profile" on profiles for insert with check (true);
create policy "Anyone can update own profile" on profiles for update using (true);

-- 5. Storage bucket for photos (run this too)
insert into storage.buckets (id, name, public) values ('linker-photos', 'linker-photos', true)
on conflict do nothing;

create policy "Anyone can upload photo" on storage.objects for insert with check (bucket_id = 'linker-photos');
create policy "Anyone can read photo" on storage.objects for select using (bucket_id = 'linker-photos');
create policy "Anyone can update photo" on storage.objects for update using (bucket_id = 'linker-photos');

-- 6. INSERT your first event (Colombia 5.0 Santander)
insert into events (id, name, organizer, status, password) values
('colombia50-santander-2026', 'Colombia 5.0 · Santander', 'Ministerio TIC', 'registration', 'col50admin2026')
on conflict do nothing;
