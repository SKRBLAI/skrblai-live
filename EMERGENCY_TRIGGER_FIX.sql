-- ================================================
-- EMERGENCY: Check and disable any auth.users triggers
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Check for triggers on auth.users
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users';

-- 2. If you see a trigger like "on_auth_user_created_grant_agents", disable it:
-- DROP TRIGGER IF EXISTS on_auth_user_created_grant_agents ON auth.users;

-- 3. Check for the problematic function
SELECT routine_name 
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'grant_default_agent_permissions';

-- 4. If function exists and causes issues, drop it:
-- DROP FUNCTION IF EXISTS grant_default_agent_permissions() CASCADE;
