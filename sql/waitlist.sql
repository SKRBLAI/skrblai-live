-- =====================================================
-- Waitlist Table for SKRBL AI Platform
-- =====================================================
-- Purpose: Store email signups for waitlist/early access
-- Features: UUID primary key, unique email constraint, RLS enabled

-- Drop existing table if recreating (use with caution in production)
-- DROP TABLE IF EXISTS waitlist CASCADE;

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  intent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Create index on created_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies
-- =====================================================

-- Policy 1: Allow authenticated users to insert their own waitlist entry
CREATE POLICY "Authenticated users can insert waitlist entries"
ON waitlist
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 2: Allow authenticated users to view waitlist entries
CREATE POLICY "Authenticated users can view waitlist entries"
ON waitlist
FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Service role has unrestricted access (for API routes)
CREATE POLICY "Service role has full access to waitlist"
ON waitlist
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE waitlist IS 'Stores email signups for platform waitlist and early access';
COMMENT ON COLUMN waitlist.id IS 'Unique identifier for waitlist entry';
COMMENT ON COLUMN waitlist.email IS 'User email address (unique, required)';
COMMENT ON COLUMN waitlist.name IS 'Optional user name';
COMMENT ON COLUMN waitlist.intent IS 'Optional user intent or message';
COMMENT ON COLUMN waitlist.created_at IS 'Timestamp when entry was created';

-- =====================================================
-- Example Queries (for testing)
-- =====================================================

-- Insert test data (use service role or disable RLS temporarily)
-- INSERT INTO waitlist (email, name, intent) VALUES
--   ('test@example.com', 'Test User', 'Interested in early access'),
--   ('demo@example.com', 'Demo User', 'Exploring features');

-- Query all waitlist entries
-- SELECT * FROM waitlist ORDER BY created_at DESC;

-- Count total waitlist signups
-- SELECT COUNT(*) as total_signups FROM waitlist;

-- Check if email exists
-- SELECT EXISTS(SELECT 1 FROM waitlist WHERE email = 'test@example.com') as is_registered;

-- =====================================================
-- Notes
-- =====================================================
-- * Run this SQL in Supabase SQL Editor or via migration
-- * Ensure NEXT_PUBLIC_SUPABASE_URL_BOOST and SUPABASE_SERVICE_ROLE_KEY_BOOST are set
-- * API route at /api/waitlist handles inserts with proper error handling
-- * Unique constraint on email prevents duplicate signups
-- * RLS policies secure access; service role key bypasses RLS for API routes
