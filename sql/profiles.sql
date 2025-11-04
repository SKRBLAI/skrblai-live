-- =====================================================
-- Profiles Table for SKRBL AI Platform
-- =====================================================
-- Purpose: Store user profile data synced from Clerk authentication
-- Features: UUID primary key, unique Clerk user ID, RLS for security

-- Drop existing table if recreating (use with caution in production)
-- DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on clerk_user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);

-- Create index on email for search/lookup
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies
-- =====================================================

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'sub' = clerk_user_id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'sub' = clerk_user_id)
WITH CHECK (auth.jwt() ->> 'sub' = clerk_user_id);

-- Policy 3: Allow profile inserts for authenticated users (initial profile creation)
CREATE POLICY "Authenticated users can insert profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'sub' = clerk_user_id);

-- Policy 4: Service role has unrestricted access (for admin operations)
CREATE POLICY "Service role has full access to profiles"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- Trigger: Auto-update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE profiles IS 'User profile data synced from Clerk authentication';
COMMENT ON COLUMN profiles.id IS 'Unique identifier for profile (UUID)';
COMMENT ON COLUMN profiles.clerk_user_id IS 'Clerk user ID (unique, matches JWT sub claim)';
COMMENT ON COLUMN profiles.email IS 'User email address from Clerk';
COMMENT ON COLUMN profiles.display_name IS 'User display name (first + last name or custom)';
COMMENT ON COLUMN profiles.created_at IS 'Timestamp when profile was created';
COMMENT ON COLUMN profiles.updated_at IS 'Timestamp when profile was last updated (auto-updated)';

-- =====================================================
-- Example Queries (for testing)
-- =====================================================

-- Upsert profile (insert or update if clerk_user_id exists)
-- INSERT INTO profiles (clerk_user_id, email, display_name)
-- VALUES ('user_abc123', 'user@example.com', 'John Doe')
-- ON CONFLICT (clerk_user_id)
-- DO UPDATE SET
--   email = EXCLUDED.email,
--   display_name = EXCLUDED.display_name,
--   updated_at = NOW();

-- Query profile by Clerk user ID
-- SELECT * FROM profiles WHERE clerk_user_id = 'user_abc123';

-- Query profile by email
-- SELECT * FROM profiles WHERE email = 'user@example.com';

-- Count total profiles
-- SELECT COUNT(*) as total_profiles FROM profiles;

-- =====================================================
-- Notes
-- =====================================================
-- * Run this SQL in Supabase SQL Editor or via migration
-- * Clerk user ID is stored in JWT 'sub' claim
-- * RLS policies ensure users can only access their own profile
-- * Service role key (SUPABASE_SERVICE_ROLE_KEY_BOOST) bypasses RLS for server-side operations
-- * Use upsert pattern in API routes to handle both create and update scenarios
-- * Trigger automatically updates updated_at on profile modifications
-- * See docs/AUTH_DB_GLUE.md for integration patterns and code examples
