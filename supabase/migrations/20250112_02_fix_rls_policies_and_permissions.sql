-- ============================================
-- SKRBL AI - Complete RLS Policy & Permissions Fix
-- Migration: 20250112_fix_rls_policies_and_permissions
-- Purpose: Add missing RLS policies and seed agent permissions
-- ============================================

-- ============================================
-- PART 1: USER_SETTINGS TABLE
-- ============================================

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can read own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Service role can manage all settings" ON user_settings;

-- Enable RLS on user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own settings
CREATE POLICY "Users can read own settings"
ON user_settings FOR SELECT
TO authenticated
USING (auth.uid()::text = userId);

-- Allow authenticated users to insert their own settings
CREATE POLICY "Users can insert own settings"
ON user_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = userId);

-- Allow authenticated users to update their own settings
CREATE POLICY "Users can update own settings"
ON user_settings FOR UPDATE
TO authenticated
USING (auth.uid()::text = userId)
WITH CHECK (auth.uid()::text = userId);

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role can manage all settings"
ON user_settings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PART 2: SYSTEM_LOGS TABLE
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can insert logs" ON system_logs;
DROP POLICY IF EXISTS "Admins can read logs" ON system_logs;
DROP POLICY IF EXISTS "Service role can manage logs" ON system_logs;

-- Enable RLS on system_logs
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert logs (server-side only)
CREATE POLICY "Service role can insert logs"
ON system_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow admins to read logs
CREATE POLICY "Admins can read logs"
ON system_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE userId = auth.uid()::text
    AND role IN ('admin', 'superadmin')
  )
  OR
  -- Allow @skrbl.ai and @skrblai.io emails to read logs
  (auth.jwt() ->> 'email') LIKE '%@skrbl.ai'
  OR
  (auth.jwt() ->> 'email') LIKE '%@skrblai.io'
);

-- Allow service role full access
CREATE POLICY "Service role can manage logs"
ON system_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PART 3: TAX_CALCULATIONS TABLE
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own tax calculations" ON tax_calculations;
DROP POLICY IF EXISTS "Users can insert own tax calculations" ON tax_calculations;
DROP POLICY IF EXISTS "Service role can manage tax calculations" ON tax_calculations;

-- Enable RLS on tax_calculations
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own tax calculations
CREATE POLICY "Users can read own tax calculations"
ON tax_calculations FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- Allow authenticated users to insert their own tax calculations
CREATE POLICY "Users can insert own tax calculations"
ON tax_calculations FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- Allow service role full access
CREATE POLICY "Service role can manage tax calculations"
ON tax_calculations FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PART 4: AGENT_PERMISSIONS TABLE
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own agent permissions" ON agent_permissions;
DROP POLICY IF EXISTS "Service role can manage agent permissions" ON agent_permissions;
DROP POLICY IF EXISTS "Public can read agent permissions" ON agent_permissions;

-- Enable RLS on agent_permissions
ALTER TABLE agent_permissions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own permissions
CREATE POLICY "Users can read own agent permissions"
ON agent_permissions FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- Allow service role to manage permissions
CREATE POLICY "Service role can manage agent permissions"
ON agent_permissions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PART 5: LEADS TABLE (if exists)
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage leads" ON leads;
DROP POLICY IF EXISTS "Admins can read leads" ON leads;

-- Enable RLS on leads (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads') THEN
    ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
    
    -- Allow service role full access
    CREATE POLICY "Service role can manage leads"
    ON leads FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
    
    -- Allow admins to read leads
    CREATE POLICY "Admins can read leads"
    ON leads FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE userId = auth.uid()::text
        AND role IN ('admin', 'superadmin')
      )
    );
  END IF;
END $$;

-- ============================================
-- PART 6: SEED DEFAULT AGENT PERMISSIONS
-- ============================================

-- Grant Percy access to all existing users
INSERT INTO agent_permissions (user_id, agent_id, granted_at)
SELECT 
  id::text,
  'percy',
  NOW()
FROM auth.users
ON CONFLICT (user_id, agent_id) DO NOTHING;

-- Grant access to other core agents for existing users
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
-- PART 7: AUTO-GRANT TRIGGER FOR NEW USERS
-- ============================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created_grant_agents ON auth.users;
DROP FUNCTION IF EXISTS grant_default_agent_permissions();

-- Create function to auto-grant agent permissions
CREATE OR REPLACE FUNCTION grant_default_agent_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Grant Percy access (always available)
  INSERT INTO agent_permissions (user_id, agent_id, granted_at)
  VALUES (NEW.id::text, 'percy', NOW())
  ON CONFLICT (user_id, agent_id) DO NOTHING;
  
  -- Grant access to other core agents
  INSERT INTO agent_permissions (user_id, agent_id, granted_at)
  VALUES 
    (NEW.id::text, 'ira', NOW()),
    (NEW.id::text, 'skillsmith', NOW()),
    (NEW.id::text, 'content-automation', NOW()),
    (NEW.id::text, 'social-media', NOW()),
    (NEW.id::text, 'branding', NOW())
  ON CONFLICT (user_id, agent_id) DO NOTHING;
  
  -- Create default user_settings entry
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

-- Attach trigger to auth.users
CREATE TRIGGER on_auth_user_created_grant_agents
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION grant_default_agent_permissions();

-- ============================================
-- PART 8: VERIFICATION QUERIES
-- ============================================

-- Count agent permissions (should be > 0 after migration)
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

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Restart your Next.js dev server: npm run dev
-- 2. Sign in at http://localhost:3000/sign-in
-- 3. Navigate to /dashboard to verify agent access
-- 4. Check browser console for any Supabase errors
-- ============================================
