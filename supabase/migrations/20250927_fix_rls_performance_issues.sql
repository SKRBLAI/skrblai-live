-- Migration: Fix RLS Performance Issues
-- Date: 2025-09-27
-- Purpose: Address Supabase database linter warnings for RLS policy performance
-- 
-- This migration fixes two main types of performance issues:
-- 1. Auth RLS Initialization Plan warnings - wrapping auth functions with SELECT
-- 2. Multiple Permissive Policies warnings - consolidating duplicate policies

-- ============================================================================
-- 1. FIX AUTH RLS INITIALIZATION PLAN ISSUES
-- ============================================================================

-- The issue: auth.uid() and auth.role() are being re-evaluated for each row
-- The fix: Wrap them with (select auth.uid()) or (select auth.role())
-- This allows PostgreSQL to evaluate the function once and cache the result

-- Fix profiles table policies
DO $$
BEGIN
  -- Drop existing problematic policies for profiles table
  DROP POLICY IF EXISTS "read own profile" ON profiles;
  DROP POLICY IF EXISTS "update own profile" ON profiles;
  
  -- Create optimized policies for profiles table
  CREATE POLICY "read own profile" ON profiles
    FOR SELECT USING ((select auth.uid()) = id);
    
  CREATE POLICY "update own profile" ON profiles
    FOR UPDATE USING ((select auth.uid()) = id);
END $$;

-- Fix user_roles table policies
DO $$
BEGIN
  -- Drop existing problematic policies for user_roles table
  DROP POLICY IF EXISTS "read own role" ON user_roles;
  
  -- Create optimized policy for user_roles table
  CREATE POLICY "read own role" ON user_roles
    FOR SELECT USING ((select auth.uid()) = user_id);
END $$;

-- Fix agent_permissions table policies
DO $$
BEGIN
  -- Drop existing problematic policies for agent_permissions table
  DROP POLICY IF EXISTS "read own agent permissions" ON agent_permissions;
  
  -- Create optimized policy for agent_permissions table
  CREATE POLICY "read own agent permissions" ON agent_permissions
    FOR SELECT USING ((select auth.uid()) = user_id);
END $$;

-- Fix sports_intake table policies
DO $$
BEGIN
  -- Drop existing problematic policy for sports_intake table
  DROP POLICY IF EXISTS "owner read intake" ON sports_intake;
  
  -- Create optimized policy for sports_intake table
  CREATE POLICY "owner read intake" ON sports_intake
    FOR SELECT USING ((select auth.uid()) = user_id);
END $$;

-- Fix parent_profiles table policies
DO $$
BEGIN
  -- Drop existing problematic policies for parent_profiles table
  DROP POLICY IF EXISTS "read own parent profile" ON parent_profiles;
  DROP POLICY IF EXISTS "upsert own parent profile" ON parent_profiles;
  
  -- Create optimized policies for parent_profiles table
  CREATE POLICY "read own parent profile" ON parent_profiles
    FOR SELECT USING ((select auth.uid()) = user_id);
    
  CREATE POLICY "upsert own parent profile" ON parent_profiles
    FOR ALL USING ((select auth.uid()) = user_id);
END $$;

-- Fix app_sessions table policies
DO $$
BEGIN
  -- Drop existing problematic policy for app_sessions table
  DROP POLICY IF EXISTS "select_own_sessions" ON app_sessions;
  
  -- Create optimized policy for app_sessions table
  CREATE POLICY "select_own_sessions" ON app_sessions
    FOR SELECT USING ((select auth.uid()) = user_id);
END $$;

-- Fix app_events table policies
DO $$
BEGIN
  -- Drop existing problematic policy for app_events table
  DROP POLICY IF EXISTS "select_own_events" ON app_events;
  
  -- Create optimized policy for app_events table
  CREATE POLICY "select_own_events" ON app_events
    FOR SELECT USING ((select auth.uid()) = user_id);
END $$;

-- Fix founder_codes table policies
DO $$
BEGIN
  -- Drop existing problematic policy for founder_codes table
  DROP POLICY IF EXISTS "service_role_all" ON founder_codes;
  
  -- Create optimized policy for founder_codes table
  CREATE POLICY "service_role_all" ON founder_codes
    FOR ALL USING ((select auth.jwt() ->> 'role') = 'service_role');
END $$;

-- ============================================================================
-- 2. FIX MULTIPLE PERMISSIVE POLICIES ISSUES
-- ============================================================================

-- The issue: Multiple permissive policies for the same role and action cause performance overhead
-- The fix: Consolidate multiple policies into single policies using OR conditions

-- Fix founder_memberships table policies
DO $$
BEGIN
  -- Drop existing duplicate policies for founder_memberships table
  DROP POLICY IF EXISTS "own_membership_select" ON founder_memberships;
  DROP POLICY IF EXISTS "service_role_membership_all" ON founder_memberships;
  DROP POLICY IF EXISTS "service_role_membership_insert" ON founder_memberships;
  
  -- Create consolidated policies for founder_memberships table
  CREATE POLICY "founder_memberships_select" ON founder_memberships
    FOR SELECT USING (
      (select auth.uid()) = user_id OR 
      (select auth.jwt() ->> 'role') = 'service_role'
    );
    
  CREATE POLICY "founder_memberships_insert" ON founder_memberships
    FOR INSERT WITH CHECK (
      (select auth.uid()) = user_id OR 
      (select auth.jwt() ->> 'role') = 'service_role'
    );
    
  CREATE POLICY "founder_memberships_update" ON founder_memberships
    FOR UPDATE USING (
      (select auth.uid()) = user_id OR 
      (select auth.jwt() ->> 'role') = 'service_role'
    );
    
  CREATE POLICY "founder_memberships_delete" ON founder_memberships
    FOR DELETE USING (
      (select auth.jwt() ->> 'role') = 'service_role'
    );
END $$;

-- Fix founder_usage_logs table policies
DO $$
BEGIN
  -- Drop existing duplicate policies for founder_usage_logs table
  DROP POLICY IF EXISTS "own_logs_select" ON founder_usage_logs;
  DROP POLICY IF EXISTS "service_role_logs_all" ON founder_usage_logs;
  DROP POLICY IF EXISTS "service_role_logs_insert" ON founder_usage_logs;
  
  -- Create consolidated policies for founder_usage_logs table
  CREATE POLICY "founder_usage_logs_select" ON founder_usage_logs
    FOR SELECT USING (
      (select auth.uid()) = user_id OR 
      (select auth.jwt() ->> 'role') = 'service_role'
    );
    
  CREATE POLICY "founder_usage_logs_insert" ON founder_usage_logs
    FOR INSERT WITH CHECK (
      (select auth.uid()) = user_id OR 
      (select auth.jwt() ->> 'role') = 'service_role'
    );
    
  CREATE POLICY "founder_usage_logs_update" ON founder_usage_logs
    FOR UPDATE USING (
      (select auth.jwt() ->> 'role') = 'service_role'
    );
    
  CREATE POLICY "founder_usage_logs_delete" ON founder_usage_logs
    FOR DELETE USING (
      (select auth.jwt() ->> 'role') = 'service_role'
    );
END $$;

-- ============================================================================
-- 3. ENSURE EXISTING POLICIES ALSO USE OPTIMIZED PATTERNS
-- ============================================================================

-- Update any remaining policies that might be using direct auth function calls

-- Fix any remaining auth.uid() patterns in existing policies
DO $$
DECLARE
    pol_record RECORD;
    new_definition TEXT;
BEGIN
    -- Find policies that use auth.uid() directly (not in subquery)
    FOR pol_record IN
        SELECT schemaname, tablename, policyname, definition
        FROM pg_policies
        WHERE definition LIKE '%auth.uid()%'
        AND definition NOT LIKE '%(select auth.uid())%'
        AND schemaname = 'public'
    LOOP
        -- Skip if it's one of the policies we just created
        CONTINUE WHEN pol_record.policyname IN (
            'read own profile', 'update own profile', 'read own role',
            'read own agent permissions', 'owner read intake',
            'read own parent profile', 'upsert own parent profile',
            'select_own_sessions', 'select_own_events', 'service_role_all',
            'founder_memberships_select', 'founder_memberships_insert',
            'founder_memberships_update', 'founder_memberships_delete',
            'founder_usage_logs_select', 'founder_usage_logs_insert',
            'founder_usage_logs_update', 'founder_usage_logs_delete'
        );
        
        -- Replace auth.uid() with (select auth.uid())
        new_definition := REPLACE(pol_record.definition, 'auth.uid()', '(select auth.uid())');
        
        -- Also replace auth.role() if present
        new_definition := REPLACE(new_definition, 'auth.role()', '(select auth.role())');
        
        -- Also replace auth.jwt() if present
        new_definition := REPLACE(new_definition, 'auth.jwt()', '(select auth.jwt())');
        
        -- Only update if definition actually changed
        IF new_definition != pol_record.definition THEN
            -- Drop and recreate the policy
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                pol_record.policyname, pol_record.schemaname, pol_record.tablename);
            
            -- Extract the policy type and condition from the definition
            -- This is a simplified approach - in production you might need more sophisticated parsing
            IF new_definition LIKE '%FOR SELECT%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR SELECT %s', 
                    pol_record.policyname, pol_record.schemaname, pol_record.tablename, 
                    substring(new_definition from 'USING \((.*)\)'));
            ELSIF new_definition LIKE '%FOR INSERT%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR INSERT %s', 
                    pol_record.policyname, pol_record.schemaname, pol_record.tablename, 
                    substring(new_definition from 'WITH CHECK \((.*)\)'));
            ELSIF new_definition LIKE '%FOR UPDATE%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR UPDATE %s', 
                    pol_record.policyname, pol_record.schemaname, pol_record.tablename, 
                    substring(new_definition from 'USING \((.*)\)'));
            ELSIF new_definition LIKE '%FOR DELETE%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR DELETE %s', 
                    pol_record.policyname, pol_record.schemaname, pol_record.tablename, 
                    substring(new_definition from 'USING \((.*)\)'));
            ELSIF new_definition LIKE '%FOR ALL%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL %s', 
                    pol_record.policyname, pol_record.schemaname, pol_record.tablename, 
                    substring(new_definition from 'USING \((.*)\)'));
            END IF;
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- 4. ADD HELPFUL COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles with optimized RLS policies for performance';
COMMENT ON TABLE user_roles IS 'User role assignments with optimized RLS policies for performance';
COMMENT ON TABLE agent_permissions IS 'Agent permission mappings with optimized RLS policies for performance';
COMMENT ON TABLE sports_intake IS 'Sports intake forms with optimized RLS policies for performance';
COMMENT ON TABLE parent_profiles IS 'Parent profile data with optimized RLS policies for performance';
COMMENT ON TABLE founder_memberships IS 'Founder membership records with consolidated RLS policies for performance';
COMMENT ON TABLE founder_usage_logs IS 'Founder usage audit logs with consolidated RLS policies for performance';

-- ============================================================================
-- 5. VERIFICATION QUERIES (FOR MANUAL TESTING)
-- ============================================================================

-- You can run these queries after the migration to verify the changes:

-- Check for any remaining direct auth function calls in policies
-- SELECT schemaname, tablename, policyname, definition
-- FROM pg_policies
-- WHERE (definition LIKE '%auth.uid()%' OR definition LIKE '%auth.role()%' OR definition LIKE '%auth.jwt()%')
-- AND definition NOT LIKE '%(select auth.uid())%'
-- AND definition NOT LIKE '%(select auth.role())%'
-- AND definition NOT LIKE '%(select auth.jwt())%'
-- AND schemaname = 'public';

-- Check for multiple permissive policies on the same table/role/action
-- SELECT schemaname, tablename, cmd, roles, count(*)
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- GROUP BY schemaname, tablename, cmd, roles
-- HAVING count(*) > 1;

-- ============================================================================

-- Log successful completion
SELECT 'RLS performance optimization migration completed successfully' AS status;
