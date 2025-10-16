-- ============================================
-- SKRBL AI - RLS Policies (FIXED for lowercase columns)
-- Migration: 20250112_05_rls_policies_fixed
-- Purpose: Add RLS policies with correct column names
-- Run AFTER 20250112_04_create_tables_fixed.sql
-- ============================================

-- ============================================
-- PART 1: USER_SETTINGS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can read own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Service role can manage all settings" ON user_settings;

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings"
ON user_settings FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own settings"
ON user_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own settings"
ON user_settings FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage all settings"
ON user_settings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PART 2: SYSTEM_LOGS TABLE
-- ============================================

DROP POLICY IF EXISTS "Service role can insert logs" ON system_logs;
DROP POLICY IF EXISTS "Admins can read logs" ON system_logs;
DROP POLICY IF EXISTS "Service role can manage logs" ON system_logs;

ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert logs"
ON system_logs FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Admins can read logs"
ON system_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()::text
    AND role IN ('admin', 'superadmin')
  )
  OR
  (auth.jwt() ->> 'email') LIKE '%@skrbl.ai'
  OR
  (auth.jwt() ->> 'email') LIKE '%@skrblai.io'
);

CREATE POLICY "Service role can manage logs"
ON system_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PART 3: TAX_CALCULATIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can read own tax calculations" ON tax_calculations;
DROP POLICY IF EXISTS "Users can insert own tax calculations" ON tax_calculations;
DROP POLICY IF EXISTS "Service role can manage tax calculations" ON tax_calculations;

ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tax calculations"
ON tax_calculations FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own tax calculations"
ON tax_calculations FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage tax calculations"
ON tax_calculations FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PART 4: AGENT_PERMISSIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can read own agent permissions" ON agent_permissions;
DROP POLICY IF EXISTS "Service role can manage agent permissions" ON agent_permissions;

ALTER TABLE agent_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own agent permissions"
ON agent_permissions FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage agent permissions"
ON agent_permissions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PART 5: LEADS TABLE
-- ============================================

DROP POLICY IF EXISTS "Service role can manage leads" ON leads;
DROP POLICY IF EXISTS "Admins can read leads" ON leads;

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage leads"
ON leads FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can read leads"
ON leads FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()::text
    AND role IN ('admin', 'superadmin')
  )
);

-- ============================================
-- PART 6: PROFILES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- ============================================
-- PART 7: USER_ROLES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can read own role" ON user_roles;

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role"
ON user_roles FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- ============================================
-- PART 8: REVENUE_EVENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Service role can manage revenue events" ON revenue_events;

ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage revenue events"
ON revenue_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PART 9: SPORTS_INTAKE TABLE
-- ============================================

DROP POLICY IF EXISTS "Public can insert sports intake" ON sports_intake;
DROP POLICY IF EXISTS "Users can read own sports intake" ON sports_intake;

ALTER TABLE sports_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert sports intake"
ON sports_intake FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can read own sports intake"
ON sports_intake FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id OR email = (auth.jwt() ->> 'email'));

-- ============================================
-- PART 10: SEED AGENT PERMISSIONS
-- ============================================

INSERT INTO agent_permissions (user_id, agent_id, granted_at)
SELECT 
  id::text,
  'percy',
  NOW()
FROM auth.users
ON CONFLICT (user_id, agent_id) DO NOTHING;

INSERT INTO agent_permissions (user_id, agent_id, granted_at)
SELECT 
  id::text,
  agent_id,
  NOW()
FROM auth.users
CROSS JOIN (
  VALUES 
    ('ira'),
    ('skillsmith'),
    ('content-automation'),
    ('social-media'),
    ('branding')
) AS agents(agent_id)
ON CONFLICT (user_id, agent_id) DO NOTHING;

-- ============================================
-- PART 11: AUTO-GRANT TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created_grant_agents ON auth.users;
DROP FUNCTION IF EXISTS grant_default_agent_permissions();

CREATE OR REPLACE FUNCTION grant_default_agent_permissions()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO agent_permissions (user_id, agent_id, granted_at)
  VALUES 
    (NEW.id::text, 'percy', NOW()),
    (NEW.id::text, 'ira', NOW()),
    (NEW.id::text, 'skillsmith', NOW()),
    (NEW.id::text, 'content-automation', NOW()),
    (NEW.id::text, 'social-media', NOW()),
    (NEW.id::text, 'branding', NOW())
  ON CONFLICT (user_id, agent_id) DO NOTHING;
  
  INSERT INTO user_settings (user_id, onboarding, preferences, created_at, updated_at)
  VALUES (
    NEW.id::text,
    '{}'::jsonb,
    '{}'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_grant_agents
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION grant_default_agent_permissions();

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  permission_count INTEGER;
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO permission_count FROM agent_permissions;
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  RAISE NOTICE '✅ Migration Complete!';
  RAISE NOTICE '📊 Total Users: %', user_count;
  RAISE NOTICE '🔑 Total Agent Permissions: %', permission_count;
  RAISE NOTICE '📈 Expected Permissions: % (% users × 6 agents)', user_count * 6, user_count;
  
  IF permission_count = 0 AND user_count > 0 THEN
    RAISE WARNING '⚠️  No agent permissions created! Check if agent_permissions table exists.';
  END IF;
END $$;
