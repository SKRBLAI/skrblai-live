-- ============================================
-- FRESH START - Clean Schema
-- Run AFTER nuclear reset
-- ============================================

-- ============================================
-- PART 1: AGENT_PERMISSIONS
-- ============================================
CREATE TABLE agent_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, agent_id)
);

CREATE INDEX idx_agent_permissions_user_id ON agent_permissions(user_id);
CREATE INDEX idx_agent_permissions_agent_id ON agent_permissions(agent_id);

ALTER TABLE agent_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own agent permissions"
ON agent_permissions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage agent permissions"
ON agent_permissions FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- ============================================
-- PART 2: USER_ROLES
-- ============================================
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'superadmin', 'vip', 'founder')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role"
ON user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- PART 3: PROFILES
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================
-- PART 4: USER_SETTINGS
-- ============================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  onboarding JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  trial_status TEXT DEFAULT 'active',
  trial_expires_at TIMESTAMPTZ,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings"
ON user_settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
ON user_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
ON user_settings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 5: SYSTEM_LOGS
-- ============================================
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('error', 'warning', 'info')),
  message TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);

ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert logs"
ON system_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================
-- PART 6: REVENUE_EVENTS
-- ============================================
CREATE TABLE revenue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE,
  customer_id TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'USD',
  event_type TEXT NOT NULL,
  raw JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_revenue_events_created_at ON revenue_events(created_at DESC);

ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage revenue events"
ON revenue_events FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- ============================================
-- PART 7: LEADS
-- ============================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  vertical TEXT,
  source TEXT,
  offer TEXT,
  score INTEGER DEFAULT 0,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage leads"
ON leads FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- ============================================
-- PART 8: SPORTS_INTAKE
-- ============================================
CREATE TABLE sports_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  intake_id UUID,
  name TEXT,
  email TEXT,
  age_group TEXT,
  gender TEXT,
  sport TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sports_intake_user_id ON sports_intake(user_id);
CREATE INDEX idx_sports_intake_email ON sports_intake(email);

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
-- PART 9: APP_EVENTS
-- ============================================
CREATE TABLE app_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_id UUID,
  event_type TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_app_events_user_id ON app_events(user_id);
CREATE INDEX idx_app_events_created_at ON app_events(created_at DESC);

ALTER TABLE app_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage events"
ON app_events FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- ============================================
-- PART 10: APP_SESSIONS
-- ============================================
CREATE TABLE app_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  user_agent TEXT,
  ip INET
);

CREATE INDEX idx_app_sessions_user_id ON app_sessions(user_id);

ALTER TABLE app_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage sessions"
ON app_sessions FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- ============================================
-- PART 11: SEED AGENT PERMISSIONS
-- ============================================
INSERT INTO agent_permissions (user_id, agent_id, created_at)
SELECT 
  id,
  'percy',
  NOW()
FROM auth.users
ON CONFLICT (user_id, agent_id) DO NOTHING;

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
-- PART 12: AUTO-GRANT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION grant_default_agent_permissions()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO agent_permissions (user_id, agent_id, created_at)
  VALUES 
    (NEW.id, 'percy', NOW()),
    (NEW.id, 'ira', NOW()),
    (NEW.id, 'skillsmith', NOW()),
    (NEW.id, 'content-automation', NOW()),
    (NEW.id, 'social-media', NOW()),
    (NEW.id, 'branding', NOW())
  ON CONFLICT (user_id, agent_id) DO NOTHING;
  
  INSERT INTO user_settings (user_id, onboarding, preferences, created_at, updated_at)
  VALUES (
    NEW.id,
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
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO permission_count FROM agent_permissions;
  SELECT COUNT(*) INTO user_count FROM auth.users;
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
  
  RAISE NOTICE '✅ FRESH START COMPLETE!';
  RAISE NOTICE '📊 Tables Created: %', table_count;
  RAISE NOTICE '👥 Total Users: %', user_count;
  RAISE NOTICE '🔑 Agent Permissions: %', permission_count;
  RAISE NOTICE '📈 Expected: % (% users × 6 agents)', user_count * 6, user_count;
END $$;
