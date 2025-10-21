-- ============================================
-- NUCLEAR OPTION: Drop All Tables
-- WARNING: This will delete ALL data in these tables!
-- Only use if you want a completely fresh start
-- ============================================

-- Drop tables in reverse dependency order
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

-- Drop any views
DROP VIEW IF EXISTS v_agent_popularity CASCADE;
DROP VIEW IF EXISTS v_founder_overview CASCADE;
DROP VIEW IF EXISTS v_scan_to_checkout CASCADE;

-- Confirmation
DO $$
BEGIN
  RAISE NOTICE '🔥 All tables dropped!';
  RAISE NOTICE '⚠️  All data has been deleted!';
  RAISE NOTICE '📋 Next step: Run 20250112_04_create_tables_fixed.sql';
END $$;
