# SQL Migration Application Guide

This guide provides step-by-step instructions for applying the dual auth SQL migration.

## Migration Overview

The migration `20250101_add_clerk_id_and_minimal_policies.sql` adds:
- `clerk_id` column to `profiles` table
- `provider` column to `profiles` table
- Minimal RLS policies for dual auth support
- Indexes for performance

## Prerequisites

- Database access (admin privileges)
- Supabase CLI or psql client
- Backup of current database (recommended)

## Application Methods

### Method 1: Supabase CLI (Recommended)

```bash
# Navigate to project directory
cd /path/to/your/project

# Apply migration
supabase db push

# Verify migration
supabase db diff
```

### Method 2: Supabase Dashboard

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the migration SQL
4. Execute the migration
5. Verify results

### Method 3: psql Command Line

```bash
# Connect to database
psql -h your-db-host -U postgres -d your-db-name

# Apply migration
\i migrations/20250101_add_clerk_id_and_minimal_policies.sql

# Verify migration
\dt profiles
\d profiles
```

### Method 4: Direct SQL Execution

```sql
-- Connect to your database and run:

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

-- Add comments for documentation
COMMENT ON COLUMN profiles.clerk_id IS 'Clerk user ID for dual auth support';
COMMENT ON COLUMN profiles.provider IS 'Authentication provider: supabase or clerk';
```

## Verification Steps

### 1. Check Column Addition

```sql
-- Verify clerk_id column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('clerk_id', 'provider');

-- Expected result:
-- clerk_id | text | YES | NULL
-- provider | text | YES | 'supabase'
```

### 2. Check Indexes

```sql
-- Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND indexname IN ('idx_profiles_clerk_id', 'idx_profiles_provider');

-- Expected result: Two indexes should be present
```

### 3. Check RLS Policies

```sql
-- Verify RLS policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_roles')
ORDER BY tablename, policyname;

-- Expected result: 6 policies total
-- profiles: 4 policies
-- user_roles: 2 policies
```

### 4. Test RLS Policies

```sql
-- Test profile access (run as authenticated user)
SELECT * FROM profiles WHERE id = auth.uid()::text;
SELECT * FROM profiles WHERE clerk_id = auth.uid()::text;

-- Test role access
SELECT * FROM user_roles WHERE user_id = auth.uid()::text;

-- Test service role bypass
SET ROLE service_role;
SELECT * FROM profiles LIMIT 1;
SELECT * FROM user_roles LIMIT 1;
RESET ROLE;
```

## Rollback Procedures

If you need to rollback the migration:

```sql
-- Remove RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Service role bypass" ON profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage roles" ON user_roles;

-- Remove indexes
DROP INDEX IF EXISTS idx_profiles_clerk_id;
DROP INDEX IF EXISTS idx_profiles_provider;

-- Remove columns
ALTER TABLE profiles DROP COLUMN IF EXISTS clerk_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS provider;
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure you have admin privileges
   - Check database connection
   - Verify user permissions

2. **Column Already Exists**
   - Migration is idempotent
   - Use `IF NOT EXISTS` clauses
   - Check if migration was already applied

3. **RLS Policy Conflicts**
   - Check existing policies
   - Resolve naming conflicts
   - Review policy logic

4. **Index Creation Failed**
   - Check for duplicate indexes
   - Verify table exists
   - Review index definitions

### Debug Queries

```sql
-- Check table structure
\d profiles

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Check existing indexes
SELECT * FROM pg_indexes WHERE tablename = 'profiles';

-- Check column constraints
SELECT conname, contype, confrelid
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;
```

## Performance Considerations

### Index Usage

The migration adds two indexes:
- `idx_profiles_clerk_id`: For Clerk ID lookups
- `idx_profiles_provider`: For provider filtering

Monitor index usage:

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename = 'profiles';
```

### Query Performance

Test query performance:

```sql
-- Test Clerk ID lookup
EXPLAIN ANALYZE SELECT * FROM profiles WHERE clerk_id = 'test-clerk-id';

-- Test provider filtering
EXPLAIN ANALYZE SELECT * FROM profiles WHERE provider = 'clerk';
```

## Security Review

### RLS Policy Review

Review the RLS policies for:
- Proper user isolation
- Service role bypass functionality
- No privilege escalation
- Consistent logic

### Access Control

Ensure:
- Users can only access their own data
- Service role can manage all data
- No unauthorized access possible
- Policies are properly enforced

## Monitoring

### Post-Migration Monitoring

Monitor for:
- Query performance impact
- RLS policy effectiveness
- Index usage
- Error rates

### Alerts

Set up alerts for:
- RLS policy violations
- Index scan performance
- Query timeouts
- Authentication errors

## Support

For issues with this migration:
1. Check the troubleshooting section
2. Review database logs
3. Test with sample data
4. Contact database administrator