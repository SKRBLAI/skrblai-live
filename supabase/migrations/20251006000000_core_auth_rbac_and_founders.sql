-- Core: profiles, user_roles, founder_codes, RLS (idempotent)

-- 1) Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  role text default 'user',
  created_at timestamptz default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','vip','parent','founder','admin')),
  created_at timestamptz default now()
);

create table if not exists public.founder_codes (
  code text primary key,
  hashed boolean default false,
  created_at timestamptz default now()
);

-- 2) Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

-- 3) Helper for idempotent policy creation
create or replace function public.ensure_policy(
  p_name text,
  p_table regclass,
  p_cmd text,
  p_using text
) returns void language plpgsql as $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = split_part(p_table::text, '.', 2) and policyname = p_name
  ) then
    execute format(
      'create policy %I on %s for %s using (%s)',
      p_name, p_table, p_cmd, p_using
    );
  end if;
end; $$;

-- 4) Profiles policies
select public.ensure_policy(
  'profiles_self_read',
  'public.profiles',
  'select',
  'id = auth.uid()'
);

select public.ensure_policy(
  'profiles_self_upsert',
  'public.profiles',
  'update',
  'id = auth.uid()'
);

select public.ensure_policy(
  'profiles_self_insert',
  'public.profiles',
  'insert',
  'id = auth.uid()'
);

-- 5) User roles policies
select public.ensure_policy(
  'roles_self_read',
  'public.user_roles',
  'select',
  'user_id = auth.uid() or exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in (''admin'',''founder''))'
);

-- 6) Founders seed (idempotent)
insert into public.founder_codes (code, hashed) values
  ('diggin_420', false),        -- BrandAlexander (Brandon Sutton)
  ('bmore_finest_365', false),  -- SocialNino (Mark Brown)
  ('gold_glove_92', false),     -- ContentCarltig (Carlton Soders)
  ('aod_aoi_619', false),       -- IRA (Roderick Cooksey)
  ('mstr_jay_2003', false),     -- PayPhomo (Jaelin Famber, heir)
  ('mstr_skrbl_3', false)       -- The Don of Data (D. Famber, creator)
on conflict (code) do nothing;

-- 7) Utility: grant role by code (safe to keep for admin use)
create or replace function public.grant_role_by_code(p_code text, p_user uuid, p_role text)
returns void language plpgsql as $$
begin
  if exists (select 1 from public.founder_codes where code = p_code) then
    insert into public.user_roles (user_id, role)
    values (p_user, p_role)
    on conflict do nothing;
  end if;
end; $$;
