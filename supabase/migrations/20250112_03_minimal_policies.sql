-- ============================================
-- MINIMAL WORKING RLS POLICIES
-- Run this if the full migration fails
-- ============================================

-- ============================================
-- AGENT_PERMISSIONS (CRITICAL)
-- ============================================
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
-- USER_SETTINGS (CRITICAL)
-- ============================================
CREATE POLICY "Users can read own settings"
ON user_settings FOR SELECT
TO authenticated
USING (auth.uid()::text = userId);

CREATE POLICY "Users can insert own settings"
ON user_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = userId);

CREATE POLICY "Users can update own settings"
ON user_settings FOR UPDATE
TO authenticated
USING (auth.uid()::text = userId)
WITH CHECK (auth.uid()::text = userId);

-- ============================================
-- PROFILES (CRITICAL)
-- ============================================
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
-- USER_ROLES (CRITICAL)
-- ============================================
CREATE POLICY "Users can read own role"
ON user_roles FOR SELECT
TO authenticated
USING (auth.uid()::text = userId);

-- ============================================
-- SYSTEM_LOGS (SERVER-SIDE ONLY)
-- ============================================
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
    WHERE userId = auth.uid()::text
    AND role IN ('admin', 'superadmin')
  )
);

-- ============================================
-- REVENUE_EVENTS (SERVER-SIDE ONLY)
-- ============================================
CREATE POLICY "Service role can manage revenue events"
ON revenue_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- SPORTS_INTAKE (PUBLIC INSERT)
-- ============================================
CREATE POLICY "Public can insert sports intake"
ON sports_intake FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can read own sports intake"
ON sports_intake FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id OR email = (auth.jwt() ->> 'email'));

-- ============================================
-- LEADS (SERVER-SIDE ONLY)
-- ============================================
CREATE POLICY "Service role can manage leads"
ON leads FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- SEED AGENT PERMISSIONS
-- ============================================
-- Grant Percy access to all existing users
INSERT INTO agent_permissions (user_id, agent_id, granted_at)
SELECT 
  id::text,
  'percy',
  NOW()
FROM auth.users
ON CONFLICT (user_id, agent_id) DO NOTHING;

-- Grant access to other core agents
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
-- AUTO-GRANT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION grant_default_agent_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Grant Percy and core agents
  INSERT INTO agent_permissions (user_id, agent_id, granted_at)
  VALUES 
    (NEW.id::text, 'percy', NOW()),
    (NEW.id::text, 'ira', NOW()),
    (NEW.id::text, 'skillsmith', NOW()),
    (NEW.id::text, 'content-automation', NOW()),
    (NEW.id::text, 'social-media', NOW()),
    (NEW.id::text, 'branding', NOW())
  ON CONFLICT (user_id, agent_id) DO NOTHING;
  
  -- Create default user_settings
  INSERT INTO user_settings (userId, onboarding, preferences, createdAt, updatedAt)
  VALUES (
    NEW.id::text,
    '{}'::jsonb,
    '{}'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (userId) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_agents ON auth.users;
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
  
  RAISE NOTICE '✅ Minimal Policies Applied!';
  RAISE NOTICE '📊 Total Users: %', user_count;
  RAISE NOTICE '🔑 Total Agent Permissions: %', permission_count;
END $$;
