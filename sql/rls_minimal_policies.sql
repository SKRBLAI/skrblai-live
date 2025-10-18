-- enable RLS
alter table if exists public.profiles enable row level security;
alter table if exists public.user_roles enable row level security;

-- profiles
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'profiles_select_owner') then
    create policy "profiles_select_owner" on public.profiles
    for select to authenticated using (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where polname = 'profiles_insert_self') then
    create policy "profiles_insert_self" on public.profiles
    for insert to authenticated with check (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where polname = 'profiles_update_owner') then
    create policy "profiles_update_owner" on public.profiles
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end$$;

-- user_roles (read-only for owner)
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'user_roles_select_owner') then
    create policy "user_roles_select_owner" on public.user_roles
    for select to authenticated using (user_id = auth.uid());
  end if;
end$$;

-- ============================================
-- PART 3: HELPFUL INDEXES
-- ============================================

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- ============================================
-- PART 4: VERIFICATION
-- ============================================

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'user_roles')
ORDER BY tablename, policyname;

-- ============================================
-- PART 5: COMMENTS
-- ============================================

COMMENT ON POLICY "profiles_select_owner" ON public.profiles IS 'Users can read their own profile';
COMMENT ON POLICY "profiles_insert_self" ON public.profiles IS 'Users can create their own profile';
COMMENT ON POLICY "profiles_update_owner" ON public.profiles IS 'Users can update their own profile';
COMMENT ON POLICY "user_roles_select_owner" ON public.user_roles IS 'Users can read their own role';
