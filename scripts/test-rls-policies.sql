-- Test script for RLS policy performance fixes
-- Run this script after applying the migration to verify functionality

-- ============================================================================
-- 1. VERIFICATION QUERIES
-- ============================================================================

-- Check for any remaining direct auth function calls in policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    definition,
    'WARNING: Direct auth function call found' as warning
FROM pg_policies
WHERE (
    definition LIKE '%auth.uid()%' OR 
    definition LIKE '%auth.role()%' OR 
    definition LIKE '%auth.jwt()%'
)
AND definition NOT LIKE '%(select auth.uid())%'
AND definition NOT LIKE '%(select auth.role())%'
AND definition NOT LIKE '%(select auth.jwt())%'
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Check for multiple permissive policies on the same table/role/action
WITH policy_analysis AS (
    SELECT 
        schemaname, 
        tablename, 
        cmd, 
        roles, 
        count(*) as policy_count,
        array_agg(policyname) as policy_names
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY schemaname, tablename, cmd, roles
)
SELECT 
    schemaname,
    tablename,
    cmd,
    roles,
    policy_count,
    policy_names,
    'WARNING: Multiple permissive policies found' as warning
FROM policy_analysis
WHERE policy_count > 1
ORDER BY tablename, cmd;

-- List all optimized policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN definition LIKE '%(select auth.uid())%' THEN 'OPTIMIZED'
        WHEN definition LIKE '%(select auth.role())%' THEN 'OPTIMIZED'
        WHEN definition LIKE '%(select auth.jwt())%' THEN 'OPTIMIZED'
        ELSE 'NOT OPTIMIZED'
    END as optimization_status,
    definition
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'profiles', 'user_roles', 'agent_permissions', 'sports_intake',
    'parent_profiles', 'app_sessions', 'app_events', 'founder_codes',
    'founder_memberships', 'founder_usage_logs'
)
ORDER BY tablename, policyname;

-- ============================================================================
-- 2. FUNCTIONAL TESTS (Run these with appropriate test data)
-- ============================================================================

-- Test 1: Verify profiles table access
-- Expected: Users can only see their own profile
-- TODO: Replace 'test-user-id' with actual test user ID
/*
SET role authenticated;
SET request.jwt.claims TO '{"sub": "test-user-id", "role": "authenticated"}';

SELECT 'Testing profiles table access' as test_name;
SELECT count(*) as visible_profiles 
FROM profiles 
WHERE id = 'test-user-id';  -- Should return 1

SELECT count(*) as total_profiles 
FROM profiles;  -- Should return only user's own profile due to RLS

RESET role;
*/

-- Test 2: Verify founder_memberships consolidated policies
-- Expected: Users can see their own memberships, service role can see all
/*
SET role authenticated;
SET request.jwt.claims TO '{"sub": "test-user-id", "role": "authenticated"}';

SELECT 'Testing founder_memberships access' as test_name;
SELECT count(*) as visible_memberships 
FROM founder_memberships 
WHERE user_id = 'test-user-id';

RESET role;

-- Test service role access
SET role service_role;
SELECT 'Testing service role access to founder_memberships' as test_name;
SELECT count(*) as total_memberships 
FROM founder_memberships;

RESET role;
*/

-- ============================================================================
-- 3. PERFORMANCE COMPARISON (Optional - requires EXPLAIN ANALYZE)
-- ============================================================================

-- Before optimization (example of what NOT to do):
-- EXPLAIN ANALYZE SELECT * FROM profiles WHERE auth.uid() = id;

-- After optimization (what we implemented):
-- EXPLAIN ANALYZE SELECT * FROM profiles WHERE (select auth.uid()) = id;

-- The optimized version should show that auth.uid() is evaluated once instead of per row

-- ============================================================================
-- 4. POLICY INVENTORY
-- ============================================================================

-- Count policies by table
SELECT 
    tablename,
    count(*) as policy_count,
    array_agg(policyname) as policy_names
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Count policies by command type
SELECT 
    cmd,
    count(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY cmd
ORDER BY cmd;

-- ============================================================================
-- 5. SUMMARY REPORT
-- ============================================================================

WITH optimization_summary AS (
    SELECT 
        tablename,
        COUNT(*) as total_policies,
        COUNT(CASE 
            WHEN definition LIKE '%(select auth.uid())%' OR 
                 definition LIKE '%(select auth.role())%' OR 
                 definition LIKE '%(select auth.jwt())%' 
            THEN 1 
        END) as optimized_policies,
        COUNT(CASE 
            WHEN definition LIKE '%auth.uid()%' OR 
                 definition LIKE '%auth.role()%' OR 
                 definition LIKE '%auth.jwt()%'
            THEN 1 
        END) as auth_function_policies
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN (
        'profiles', 'user_roles', 'agent_permissions', 'sports_intake',
        'parent_profiles', 'app_sessions', 'app_events', 'founder_codes',
        'founder_memberships', 'founder_usage_logs'
    )
    GROUP BY tablename
)
SELECT 
    'RLS OPTIMIZATION SUMMARY' as report_type,
    tablename,
    total_policies,
    optimized_policies,
    auth_function_policies,
    CASE 
        WHEN optimized_policies = auth_function_policies 
        THEN 'FULLY OPTIMIZED'
        WHEN optimized_policies > 0 
        THEN 'PARTIALLY OPTIMIZED'
        ELSE 'NOT OPTIMIZED'
    END as status
FROM optimization_summary
ORDER BY tablename;

-- Final success message
SELECT 
    'RLS Policy Test Completed' as status,
    NOW() as tested_at;
