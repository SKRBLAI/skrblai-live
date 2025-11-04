-- Migration: Add Clerk ID and minimal RLS policies for dual auth
-- This migration adds support for Clerk authentication alongside existing Supabase auth

-- Add clerk_id column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON profiles(clerk_id);

-- Add provider column to track auth source
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'supabase';

-- Add index for provider lookups
CREATE INDEX IF NOT EXISTS idx_profiles_provider ON profiles(provider);

-- Update existing profiles to have 'supabase' provider
UPDATE profiles 
SET provider = 'supabase' 
WHERE provider IS NULL;

-- Create minimal RLS policies for profiles table
-- Users can select and update their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON profiles
  FOR SELECT USING (
    auth.uid()::text = id OR 
    auth.uid()::text = clerk_id
  );

CREATE POLICY IF NOT EXISTS "Users can update own profile" ON profiles
  FOR UPDATE USING (
    auth.uid()::text = id OR 
    auth.uid()::text = clerk_id
  );

CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid()::text = id OR 
    auth.uid()::text = clerk_id
  );

-- Service role can bypass RLS (for webhook operations)
CREATE POLICY IF NOT EXISTS "Service role bypass" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Create minimal RLS policies for user_roles table
-- Users can view their own roles
CREATE POLICY IF NOT EXISTS "Users can view own roles" ON user_roles
  FOR SELECT USING (
    auth.uid()::text = user_id
  );

-- Service role can manage all roles (for webhook operations)
CREATE POLICY IF NOT EXISTS "Service role can manage roles" ON user_roles
  FOR ALL USING (auth.role() = 'service_role');

-- Add comment for documentation
COMMENT ON COLUMN profiles.clerk_id IS 'Clerk user ID for dual auth support';
COMMENT ON COLUMN profiles.provider IS 'Authentication provider: supabase or clerk';