-- ============================================
-- SKRBL AI - RLS Policies (Matching Existing Schema)
-- Migration: 20250112_07_rls_policies_matching_schema
-- Purpose: Add RLS policies to existing tables with correct column names
-- ============================================

-- ============================================
-- PART 1: AGENT_PERMISSIONS (UUID-based)
-- ============================================

DROP POLICY IF EXISTS "Users can read own agent permissions" ON agent_permissions;
DROP POLICY IF EXISTS "Service role can manage agent permissions" ON agent_permissions;

ALTER TABLE agent_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own agent permissions"
ON agent_permissions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage agent permissions"
ON agent_permissions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PART 2: USER_ROLES (UUID-based)
-- ============================================

DROP POLICY IF EXISTS "Users can read own role" ON user_roles;

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role"
ON user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- PART 3: PROFILES (UUID-based)
-- ============================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- PART 4: REVENUE_EVENTS (Server-side only)
-- ============================================

DROP POLICY IF EXISTS "Service role can manage revenue events" ON revenue_events;

ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage revenue events"
ON revenue_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PART 5: LEADS (Server-side only)
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
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);

-- ============================================
-- PART 6: SPORTS_INTAKE (Public insert, user read)
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
USING (auth.uid() = user_id OR email = (auth.jwt() ->> 'email'));

-- ============================================
-- PART 7: APP_EVENTS (User can read own)
-- ============================================

DROP POLICY IF EXISTS "Users can read own events" ON app_events;
DROP POLICY IF EXISTS "Service role can manage events" ON app_events;

ALTER TABLE app_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own events"
ON app_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage events"
ON app_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PART 8: APP_SESSIONS (User can read own)
-- ============================================

DROP POLICY IF EXISTS "Users can read own sessions" ON app_sessions;
DROP POLICY IF EXISTS "Service role can manage sessions" ON app_sessions;

ALTER TABLE app_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
ON app_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage sessions"
ON app_sessions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PART 9: FOUNDER_CODES (Admin only)
-- ============================================

DROP POLICY IF EXISTS "Admins can manage founder codes" ON founder_codes;

ALTER TABLE founder_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage founder codes"
ON founder_codes FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);

-- ============================================
-- PART 10: FOUNDER_MEMBERSHIPS (User can read own)
-- ============================================

DROP POLICY IF EXISTS "Users can read own membership" ON founder_memberships;
DROP POLICY IF EXISTS "Admins can manage memberships" ON founder_memberships;

ALTER TABLE founder_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own membership"
ON founder_memberships FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR email = (auth.jwt() ->> 'email'));

CREATE POLICY "Admins can manage memberships"
ON founder_memberships FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);

-- ============================================
-- PART 11: FOUNDER_USAGE_LOGS (User can read own)
-- ============================================

DROP POLICY IF EXISTS "Users can read own usage logs" ON founder_usage_logs;
DROP POLICY IF EXISTS "Service role can insert logs" ON founder_usage_logs;

ALTER TABLE founder_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage logs"
ON founder_usage_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR email = (auth.jwt() ->> 'email'));

CREATE POLICY "Service role can insert logs"
ON founder_usage_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================
-- PART 12: PARENT_PROFILES (User can read/update own)
-- ============================================

DROP POLICY IF EXISTS "Users can read own parent profile" ON parent_profiles;
DROP POLICY IF EXISTS "Users can update own parent profile" ON parent_profiles;

ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own parent profile"
ON parent_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own parent profile"
ON parent_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 13: SEED AGENT PERMISSIONS
-- ============================================

-- Grant Percy access to all existing users
INSERT INTO agent_permissions (user_id, agent_id, created_at)
SELECT 
  id,
  'percy',
  NOW()
FROM auth.users
ON CONFLICT (user_id, agent_id) DO NOTHING;

-- Grant access to other core agents
INSERT INTO agent_permissions (user_id, agent_id, created_at)
SELECT 
  id,
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
-- PART 14: AUTO-GRANT TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created_grant_agents ON auth.users;
DROP FUNCTION IF EXISTS grant_default_agent_permissions();

CREATE OR REPLACE FUNCTION grant_default_agent_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Grant Percy and core agents
  INSERT INTO agent_permissions (user_id, agent_id, created_at)
  VALUES 
    (NEW.id, 'percy', NOW()),
    (NEW.id, 'ira', NOW()),
    (NEW.id, 'skillsmith', NOW()),
    (NEW.id, 'content-automation', NOW()),
    (NEW.id, 'social-media', NOW()),
    (NEW.id, 'branding', NOW())
  ON CONFLICT (user_id, agent_id) DO NOTHING;
  
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
  
  RAISE NOTICE '✅ RLS Policies Applied!';
  RAISE NOTICE '📊 Total Users: %', user_count;
  RAISE NOTICE '🔑 Total Agent Permissions: %', permission_count;
  RAISE NOTICE '📈 Expected Permissions: % (% users × 6 agents)', user_count * 6, user_count;
  
  IF permission_count = 0 AND user_count > 0 THEN
    RAISE WARNING '⚠️  No agent permissions created! Check if agent_permissions table exists.';
  END IF;
END $$;
