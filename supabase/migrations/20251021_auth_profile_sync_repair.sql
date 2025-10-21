-- ================================================
-- Auth Profile Sync Repair Migration
-- Date: 2025-10-21
-- Purpose: Ensure profiles and user_roles tables exist with proper RLS
-- ================================================

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY,
  email text,
  display_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY,
  role text CHECK (role IN ('user','vip','founder','heir','parent','admin')) DEFAULT 'user'
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS profiles_select_owner ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;
DROP POLICY IF EXISTS profiles_update_owner ON public.profiles;
DROP POLICY IF EXISTS user_roles_select_owner ON public.user_roles;

-- Profiles RLS Policies
CREATE POLICY profiles_select_owner
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY profiles_insert_self
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY profiles_update_owner
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- User Roles RLS Policies
CREATE POLICY user_roles_select_owner
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Comments for documentation
COMMENT ON TABLE public.profiles IS 'User profile information synced from auth';
COMMENT ON TABLE public.user_roles IS 'User role assignments for RBAC';
COMMENT ON POLICY profiles_select_owner ON public.profiles IS 'Users can read their own profile';
COMMENT ON POLICY profiles_insert_self ON public.profiles IS 'Users can create their own profile';
COMMENT ON POLICY profiles_update_owner ON public.profiles IS 'Users can update their own profile';
COMMENT ON POLICY user_roles_select_owner ON public.user_roles IS 'Users can read their own role';
