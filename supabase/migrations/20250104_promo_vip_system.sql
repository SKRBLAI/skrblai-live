-- Promo Code and VIP System Migration
-- Created for SKRBL AI dashboard sign-in validation

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('PROMO', 'VIP')),
  redeemed_by JSONB DEFAULT '[]', -- Array of user_ids who redeemed this code
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  usage_limit INTEGER DEFAULT NULL, -- NULL = unlimited usage
  current_usage INTEGER DEFAULT 0,
  benefits JSONB DEFAULT '{}', -- Store promo benefits/VIP perks
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create VIP users table if not exists (enhanced from existing)
CREATE TABLE IF NOT EXISTS vip_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  domain TEXT,
  user_title TEXT,
  company_name TEXT,
  company_size TEXT,
  linkedin_url TEXT,
  revenue TEXT,
  industry TEXT,
  team_size INTEGER,
  vip_score INTEGER DEFAULT 0,
  vip_level TEXT NOT NULL DEFAULT 'standard' CHECK (vip_level IN ('standard', 'silver', 'gold', 'platinum', 'enterprise')),
  domain_reputation JSONB DEFAULT '{}',
  linkedin_profile JSONB DEFAULT '{}',
  recommended_squad TEXT,
  personalized_plan TEXT,
  scoring_breakdown JSONB DEFAULT '{}',
  recognition_count INTEGER DEFAULT 0,
  is_vip BOOLEAN DEFAULT FALSE,
  promo_code_redeemed TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update auth.users metadata support (extend existing)
-- Note: This assumes Supabase auth.users already exists
-- We'll add a function to handle user metadata updates

-- User dashboard access table
CREATE TABLE IF NOT EXISTS user_dashboard_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_vip BOOLEAN DEFAULT FALSE,
  promo_code_used TEXT,
  access_level TEXT NOT NULL DEFAULT 'free' CHECK (access_level IN ('free', 'promo', 'vip')),
  benefits JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_type ON promo_codes(type);
CREATE INDEX IF NOT EXISTS idx_promo_codes_status ON promo_codes(status);
CREATE INDEX IF NOT EXISTS idx_promo_codes_expires_at ON promo_codes(expires_at);

CREATE INDEX IF NOT EXISTS idx_vip_users_email ON vip_users(email);
CREATE INDEX IF NOT EXISTS idx_vip_users_domain ON vip_users(domain);
CREATE INDEX IF NOT EXISTS idx_vip_users_vip_level ON vip_users(vip_level);
CREATE INDEX IF NOT EXISTS idx_vip_users_is_vip ON vip_users(is_vip);

CREATE INDEX IF NOT EXISTS idx_user_dashboard_access_user_id ON user_dashboard_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_access_email ON user_dashboard_access(email);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_access_access_level ON user_dashboard_access(access_level);

-- Row Level Security (RLS) policies
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_access ENABLE ROW LEVEL SECURITY;

-- Promo codes policies
CREATE POLICY "Service role full access to promo_codes" ON promo_codes
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view active promo codes" ON promo_codes
  FOR SELECT USING (status = 'active' AND (expires_at IS NULL OR expires_at > NOW()));

-- VIP users policies  
CREATE POLICY "Service role full access to vip_users" ON vip_users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own VIP data" ON vip_users
  FOR SELECT USING (email = (auth.jwt() ->> 'email'));

-- User dashboard access policies
CREATE POLICY "Service role full access to user_dashboard_access" ON user_dashboard_access
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own dashboard access" ON user_dashboard_access
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own dashboard access" ON user_dashboard_access
  FOR UPDATE USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT ON promo_codes TO authenticated;
GRANT SELECT ON vip_users TO authenticated;
GRANT SELECT, UPDATE ON user_dashboard_access TO authenticated;

GRANT ALL ON promo_codes TO service_role;
GRANT ALL ON vip_users TO service_role;
GRANT ALL ON user_dashboard_access TO service_role;

-- Insert sample promo codes for testing
INSERT INTO promo_codes (code, type, usage_limit, benefits, metadata) VALUES
('WELCOME2025', 'PROMO', 100, '{"dashboard_access": true, "duration_days": 30, "features": ["premium_agents", "advanced_analytics"]}', '{"description": "Welcome promo for 2025"}'),
('VIP_PREVIEW', 'VIP', 50, '{"dashboard_access": true, "vip_level": "gold", "features": ["full_vip_access", "priority_support"]}', '{"description": "VIP preview access"}'),
('BETA_TESTER', 'PROMO', 25, '{"dashboard_access": true, "duration_days": 60, "features": ["beta_features", "premium_agents"]}', '{"description": "Beta tester early access"}');

-- Function to validate and redeem promo codes
CREATE OR REPLACE FUNCTION redeem_promo_code(
  p_code TEXT,
  p_user_id UUID,
  p_email TEXT
) RETURNS JSONB AS $$
DECLARE
  v_promo_code promo_codes;
  v_result JSONB;
BEGIN
  -- Get the promo code
  SELECT * INTO v_promo_code
  FROM promo_codes
  WHERE code = p_code
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW());

  -- Check if code exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired promo code'
    );
  END IF;

  -- Check usage limit
  IF v_promo_code.usage_limit IS NOT NULL AND v_promo_code.current_usage >= v_promo_code.usage_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Promo code usage limit reached'
    );
  END IF;

  -- Check if user already redeemed this code
  IF v_promo_code.redeemed_by ? p_user_id::text THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Promo code already redeemed by this user'
    );
  END IF;

  -- Update promo code usage
  UPDATE promo_codes 
  SET 
    current_usage = current_usage + 1,
    redeemed_by = redeemed_by || jsonb_build_array(p_user_id::text),
    status = CASE 
      WHEN usage_limit IS NOT NULL AND current_usage + 1 >= usage_limit THEN 'used'
      ELSE status
    END,
    updated_at = NOW()
  WHERE code = p_code;

  -- Create or update user dashboard access
  INSERT INTO user_dashboard_access (user_id, email, is_vip, promo_code_used, access_level, benefits, metadata)
  VALUES (
    p_user_id,
    p_email,
    CASE WHEN v_promo_code.type = 'VIP' THEN true ELSE false END,
    p_code,
    CASE WHEN v_promo_code.type = 'VIP' THEN 'vip' ELSE 'promo' END,
    v_promo_code.benefits,
    jsonb_build_object('redeemed_at', NOW(), 'code_type', v_promo_code.type)
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    is_vip = CASE WHEN v_promo_code.type = 'VIP' THEN true ELSE EXCLUDED.is_vip END,
    promo_code_used = p_code,
    access_level = CASE WHEN v_promo_code.type = 'VIP' THEN 'vip' ELSE 'promo' END,
    benefits = v_promo_code.benefits,
    metadata = user_dashboard_access.metadata || jsonb_build_object('last_promo_redeemed', NOW(), 'last_code', p_code),
    updated_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'code_type', v_promo_code.type,
    'benefits', v_promo_code.benefits,
    'message', 'Promo code redeemed successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to redeem promo code: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION redeem_promo_code(TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_promo_code(TEXT, UUID, TEXT) TO service_role;

-- Comments for documentation
COMMENT ON TABLE promo_codes IS 'Stores promo and VIP codes for dashboard access validation';
COMMENT ON TABLE vip_users IS 'Enhanced VIP user recognition and scoring system';
COMMENT ON TABLE user_dashboard_access IS 'Tracks user dashboard access permissions and promo redemptions';
COMMENT ON FUNCTION redeem_promo_code IS 'Validates and redeems promo/VIP codes for dashboard access'; 