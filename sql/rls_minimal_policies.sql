-- Minimal RLS Policies for SKRBL AI
-- Idempotent SQL - safe to run multiple times
-- Run this in Supabase SQL Editor

-- ============================================
-- PART 1: PROFILES TABLE
-- ============================================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_select_owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_owner" ON public.profiles;

-- Create policies for profiles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_select_owner'
  ) THEN
    CREATE POLICY "profiles_select_owner"
      ON public.profiles FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_insert_self'
  ) THEN
    CREATE POLICY "profiles_insert_self"
      ON public.profiles FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_update_owner'
  ) THEN
    CREATE POLICY "profiles_update_owner"
      ON public.profiles FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- ============================================
-- PART 2: USER_ROLES TABLE
-- ============================================

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "user_roles_select_owner" ON public.user_roles;

-- Create policy for user_roles (read-only to owner; writes remain server-side)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='user_roles_select_owner'
  ) THEN
    CREATE POLICY "user_roles_select_owner"
      ON public.user_roles FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

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
