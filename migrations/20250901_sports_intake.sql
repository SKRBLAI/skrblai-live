-- Sports Intake Table Migration
-- Created: 2025-09-01
-- Purpose: Store user sports preferences and demographics for personalized training

create table if not exists sports_intake (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  ip text,
  user_id uuid references auth.users(id),
  name text not null,
  email text,
  age text, -- '8-18' or '19+'
  gender text, -- 'M', 'F', 'Nonbinary', 'Prefer not'
  sport text, -- 'Basketball', 'Baseball', 'Soccer', 'Football', 'Tennis', 'Volleyball', 'Other'
  sport_other text, -- Free text when sport='Other'
  source text default 'sports_page'
);

-- Enable Row Level Security
alter table sports_intake enable row level security;

-- Public insert policy (allows anonymous intake submissions)
create policy "public insert" on sports_intake
for insert to anon, authenticated with check (true);

-- Owner read policy (users can read their own data)
create policy "owner read" on sports_intake
for select to authenticated using (auth.uid() = user_id);

-- Admin read policy (for analytics)
create policy "admin read" on sports_intake
for select to authenticated using (
  exists (
    select 1 from auth.users 
    where auth.uid() = id 
    and raw_user_meta_data->>'role' = 'admin'
  )
);

-- Indexes for performance
create index if not exists idx_sports_intake_user_id on sports_intake(user_id);
create index if not exists idx_sports_intake_created_at on sports_intake(created_at);
create index if not exists idx_sports_intake_source on sports_intake(source);