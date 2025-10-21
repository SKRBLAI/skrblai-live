-- Optimize RLS policies to use subquery for auth.uid()
-- This prevents re-evaluation of auth.uid() for each row, improving performance at scale
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- 1. agent_permissions: Users can read own agent permissions
DROP POLICY IF EXISTS "Users can read own agent permissions" ON public.agent_permissions;
CREATE POLICY "Users can read own agent permissions" ON public.agent_permissions
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- 2. user_roles: Users can read own role
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- 3. profiles: Users can read own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT
  USING ((select auth.uid()) = id);

-- 4. profiles: Users can update own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- 5. user_settings: Users can read own settings
DROP POLICY IF EXISTS "Users can read own settings" ON public.user_settings;
CREATE POLICY "Users can read own settings" ON public.user_settings
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- 6. user_settings: Users can insert own settings
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- 7. user_settings: Users can update own settings
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 8. sports_intake: Users can read own sports intake
DROP POLICY IF EXISTS "Users can read own sports intake" ON public.sports_intake;
CREATE POLICY "Users can read own sports intake" ON public.sports_intake
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- Add comment for documentation
COMMENT ON POLICY "Users can read own agent permissions" ON public.agent_permissions IS 
  'Optimized RLS policy using subquery to prevent auth.uid() re-evaluation per row';
COMMENT ON POLICY "Users can read own role" ON public.user_roles IS 
  'Optimized RLS policy using subquery to prevent auth.uid() re-evaluation per row';
COMMENT ON POLICY "Users can read own profile" ON public.profiles IS 
  'Optimized RLS policy using subquery to prevent auth.uid() re-evaluation per row';
COMMENT ON POLICY "Users can update own profile" ON public.profiles IS 
  'Optimized RLS policy using subquery to prevent auth.uid() re-evaluation per row';
COMMENT ON POLICY "Users can read own settings" ON public.user_settings IS 
  'Optimized RLS policy using subquery to prevent auth.uid() re-evaluation per row';
COMMENT ON POLICY "Users can insert own settings" ON public.user_settings IS 
  'Optimized RLS policy using subquery to prevent auth.uid() re-evaluation per row';
COMMENT ON POLICY "Users can update own settings" ON public.user_settings IS 
  'Optimized RLS policy using subquery to prevent auth.uid() re-evaluation per row';
COMMENT ON POLICY "Users can read own sports intake" ON public.sports_intake IS 
  'Optimized RLS policy using subquery to prevent auth.uid() re-evaluation per row';
