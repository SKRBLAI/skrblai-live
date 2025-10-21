-- ============================================
-- NUCLEAR RESET - Complete Database Wipe
-- WARNING: This will DELETE ALL DATA!
-- ============================================

-- Drop all views first (they depend on tables)
DROP VIEW IF EXISTS v_agent_popularity CASCADE;
DROP VIEW IF EXISTS v_founder_overview CASCADE;
DROP VIEW IF EXISTS v_scan_to_checkout CASCADE;

-- Drop all tables (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS agent_permissions CASCADE;
DROP TABLE IF EXISTS app_events CASCADE;
DROP TABLE IF EXISTS app_sessions CASCADE;
DROP TABLE IF EXISTS founder_codes CASCADE;
DROP TABLE IF EXISTS founder_memberships CASCADE;
DROP TABLE IF EXISTS founder_usage_logs CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS parent_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS revenue_events CASCADE;
DROP TABLE IF EXISTS sports_intake CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS tax_calculations CASCADE;

-- Drop all custom ENUM types
DROP TYPE IF EXISTS app_role CASCADE;
DROP TYPE IF EXISTS founder_role CASCADE;
DROP TYPE IF EXISTS membership_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS grant_default_agent_permissions() CASCADE;

-- Drop all triggers
-- (CASCADE above should handle this, but being explicit)

-- Confirmation
DO $$
BEGIN
  RAISE NOTICE '🔥 NUCLEAR RESET COMPLETE!';
  RAISE NOTICE '💥 All tables, views, enums, and functions dropped!';
  RAISE NOTICE '📋 Next: Run the fresh table creation migration';
END $$;
