-- Core user profile + roles with safe, idempotent RLS policies
-- This migration is written to be re-runnable: it uses conditional guards for policies.

-- 1) Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text default 'user',
  created_at timestamptz default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','vip','parent','founder','admin')),
  created_at timestamptz default now()
);

-- 2) Enable RLS (safe to re-run)
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

-- 3) Helper to conditionally create a policy if it does not exist
create or replace function public.__ensure_policy(
  p_schema text,
  p_table text,
  p_policy_name text,
  p_cmd text,
  p_qual text
) returns void language plpgsql as $$
begin
  if not exists (
    select 1 
    from pg_policies 
    where schemaname = p_schema 
      and tablename  = p_table 
      and policyname = p_policy_name
  )
  then
    execute format(
      'create policy %I on %I.%I for %s using (%s);',
      p_policy_name, p_schema, p_table, p_cmd, p_qual
    );
  end if;
end $$;

-- 4) Profiles policies
select public.__ensure_policy('public','profiles','Users can view own profile','select','auth.uid() = id');
select public.__ensure_policy('public','profiles','Users can update own profile','update','auth.uid() = id');

-- 5) User roles policies
select public.__ensure_policy('public','user_roles','Users can view own role','select','auth.uid() = user_id');

-- Founders/admins can view all roles (separate name so both can coexist)
do $$
begin
  if not exists (
    select 1 from pg_policies 
     where schemaname='public' and tablename='user_roles' and policyname='Founders and admins can view all roles'
  ) then
    create policy "Founders and admins can view all roles"
      on public.user_roles for select
      using (exists (
        select 1 from public.user_roles ur
        where ur.user_id = auth.uid()
          and ur.role in ('founder','admin')
      ));
  end if;
end $$;

-- 6) Optional indexes
create index if not exists idx_profiles_email on public.profiles (email);
create index if not exists idx_user_roles_user on public.user_roles (user_id);

-- 7) Cleanup helper
drop function if exists public.__ensure_policy(p_schema text, p_table text, p_policy_name text, p_cmd text, p_qual text);
