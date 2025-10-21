-- ================================================
-- Auth Profile Sync Repair Migration
-- Date: 2025-10-21
-- Purpose: Add missing INSERT policy and display_name column to profiles
-- ================================================

-- Add display_name column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'display_name'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN display_name text;
    END IF;
END $$;

-- Add updated_at column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "profiles_select_owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_owner" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_upsert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;

-- Profiles RLS Policies (using 'id' to match existing schema)
CREATE POLICY "profiles_select_owner"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "profiles_insert_self"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_owner"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Comments for documentation
COMMENT ON TABLE public.profiles IS 'User profile information synced from auth - INSERT policy added for profile-sync endpoint';
COMMENT ON POLICY "profiles_select_owner" ON public.profiles IS 'Users can read their own profile';
COMMENT ON POLICY "profiles_insert_self" ON public.profiles IS 'Users can create their own profile via profile-sync endpoint';
COMMENT ON POLICY "profiles_update_owner" ON public.profiles IS 'Users can update their own profile';
