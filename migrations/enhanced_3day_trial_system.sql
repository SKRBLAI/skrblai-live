-- Migration: Enhanced 3-Day Trial System
-- Date: 2024-12-20
-- Purpose: Comprehensive 3-day trial management with access control

-- Add trial-related fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_status VARCHAR(20) DEFAULT 'active' CHECK (trial_status IN ('active', 'expired', 'converted', 'cancelled')),
ADD COLUMN IF NOT EXISTS trial_agent_usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS trial_daily_agent_usage JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS trial_features_used JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS trial_upgrade_prompts_shown INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_trial_prompt_date TIMESTAMP WITH TIME ZONE;

-- Create trial_usage_tracking table for detailed analytics
CREATE TABLE IF NOT EXISTS trial_usage_tracking (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  agents_used INTEGER DEFAULT 0,
  scans_performed INTEGER DEFAULT 0,
  features_accessed JSONB DEFAULT '[]',
  premium_attempts INTEGER DEFAULT 0,
  upgrade_prompts_shown INTEGER DEFAULT 0,
  session_duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, usage_date)
);

-- Create trial_agent_access table to track individual agent usage
CREATE TABLE IF NOT EXISTS trial_agent_access (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id VARCHAR(100) NOT NULL,
  access_date DATE NOT NULL DEFAULT CURRENT_DATE,
  access_count INTEGER DEFAULT 1,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  was_blocked BOOLEAN DEFAULT FALSE,
  upgrade_prompt_shown BOOLEAN DEFAULT FALSE,
  
  UNIQUE(user_id, agent_id, access_date)
);

-- Create upgrade_prompts table to track upgrade interactions
CREATE TABLE IF NOT EXISTS upgrade_prompts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_type VARCHAR(50) NOT NULL,
  prompt_context VARCHAR(100),
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  converted BOOLEAN DEFAULT FALSE,
  dismissed BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'
);

-- Create trial_metrics view for analytics
CREATE OR REPLACE VIEW trial_metrics AS
SELECT 
  p.id as user_id,
  p.trial_start_date,
  p.trial_end_date,
  p.trial_status,
  p.trial_agent_usage_count,
  p.trial_upgrade_prompts_shown,
  EXTRACT(days FROM (p.trial_end_date - p.trial_start_date)) as trial_duration_days,
  EXTRACT(days FROM (NOW() - p.trial_start_date)) as days_since_start,
  CASE 
    WHEN p.trial_end_date IS NULL THEN 'no_trial'
    WHEN NOW() > p.trial_end_date THEN 'expired'
    WHEN EXTRACT(days FROM (p.trial_end_date - NOW())) <= 1 THEN 'expiring_soon'
    ELSE 'active'
  END as current_trial_state,
  (
    SELECT COUNT(DISTINCT agent_id) 
    FROM trial_agent_access 
    WHERE user_id = p.id AND access_date = CURRENT_DATE
  ) as agents_used_today,
  (
    SELECT COUNT(*) 
    FROM percy_scans 
    WHERE user_id = p.id AND created_at::date = CURRENT_DATE
  ) as scans_today,
  (
    SELECT COUNT(*) 
    FROM upgrade_prompts 
    WHERE user_id = p.id
  ) as total_upgrade_prompts
FROM profiles p
WHERE p.trial_start_date IS NOT NULL;

-- Function to initialize trial for new users
CREATE OR REPLACE FUNCTION initialize_user_trial(
  p_user_id UUID,
  p_email TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  trial_end TIMESTAMP WITH TIME ZONE;
  result JSON;
BEGIN
  trial_end := NOW() + INTERVAL '3 days';
  
  UPDATE profiles 
  SET 
    trial_start_date = NOW(),
    trial_end_date = trial_end,
    trial_status = 'active',
    trial_agent_usage_count = 0,
    trial_daily_agent_usage = '{}',
    trial_features_used = '[]',
    trial_upgrade_prompts_shown = 0,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  INSERT INTO trial_usage_tracking (user_id, usage_date, agents_used, scans_performed)
  VALUES (p_user_id, CURRENT_DATE, 0, 0)
  ON CONFLICT (user_id, usage_date) DO NOTHING;
  
  INSERT INTO email_sequences (user_id, sequence_id, trigger_type, user_role, metadata)
  VALUES (
    p_user_id, 
    'trial_welcome', 
    'trial_start', 
    'client',
    json_build_object(
      'trial_end_date', trial_end,
      'email', p_email
    )
  )
  ON CONFLICT DO NOTHING;
  
  SELECT json_build_object(
    'success', true,
    'trial_start_date', NOW(),
    'trial_end_date', trial_end,
    'trial_status', 'active'
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check trial limits
CREATE OR REPLACE FUNCTION check_trial_limits(
  p_user_id UUID,
  p_check_type VARCHAR(20) DEFAULT 'agent'
) RETURNS JSON AS $$
DECLARE
  user_profile profiles%ROWTYPE;
  agents_used_today INTEGER;
  scans_used_today INTEGER;
  result JSON;
BEGIN
  SELECT * INTO user_profile 
  FROM profiles 
  WHERE id = p_user_id;
  
  IF NOT FOUND OR user_profile.trial_start_date IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found or no trial active'
    );
  END IF;
  
  IF user_profile.trial_end_date < NOW() THEN
    IF user_profile.trial_status != 'expired' THEN
      UPDATE profiles 
      SET trial_status = 'expired', updated_at = NOW()
      WHERE id = p_user_id;
    END IF;
    
    RETURN json_build_object(
      'success', false,
      'trial_expired', true,
      'can_access', false,
      'message', 'Your 3-day free trial has expired. Upgrade to continue using SKRBL AI.'
    );
  END IF;
  
  SELECT COALESCE(COUNT(DISTINCT agent_id), 0) INTO agents_used_today
  FROM trial_agent_access 
  WHERE user_id = p_user_id AND access_date = CURRENT_DATE;
  
  SELECT COALESCE(COUNT(*), 0) INTO scans_used_today
  FROM percy_scans 
  WHERE user_id = p_user_id AND created_at::date = CURRENT_DATE;
  
  IF p_check_type = 'agent' AND agents_used_today >= 3 THEN
    RETURN json_build_object(
      'success', false,
      'limit_reached', true,
      'can_access', false,
      'limit_type', 'daily_agent',
      'used_today', agents_used_today,
      'limit', 3,
      'message', 'You''ve reached your daily limit of 3 agents. Upgrade for unlimited access!'
    );
  END IF;
  
  IF p_check_type = 'scan' AND scans_used_today >= 3 THEN
    RETURN json_build_object(
      'success', false,
      'limit_reached', true,
      'can_access', false,
      'limit_type', 'daily_scan',
      'used_today', scans_used_today,
      'limit', 3,
      'message', 'You''ve reached your daily limit of 3 scans. Upgrade for unlimited access!'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'can_access', true,
    'trial_active', true,
    'days_remaining', EXTRACT(days FROM (user_profile.trial_end_date - NOW())),
    'agents_used_today', agents_used_today,
    'scans_used_today', scans_used_today,
    'agent_limit', 3,
    'scan_limit', 3
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record trial usage
CREATE OR REPLACE FUNCTION record_trial_usage(
  p_user_id UUID,
  p_usage_type VARCHAR(20),
  p_agent_id VARCHAR(100) DEFAULT NULL,
  p_feature_name VARCHAR(100) DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  INSERT INTO trial_usage_tracking (
    user_id, 
    usage_date, 
    agents_used, 
    scans_performed,
    features_accessed
  )
  VALUES (
    p_user_id,
    CURRENT_DATE,
    CASE WHEN p_usage_type = 'agent' THEN 1 ELSE 0 END,
    CASE WHEN p_usage_type = 'scan' THEN 1 ELSE 0 END,
    CASE WHEN p_feature_name IS NOT NULL THEN json_build_array(p_feature_name) ELSE '[]' END
  )
  ON CONFLICT (user_id, usage_date) DO UPDATE SET
    agents_used = CASE 
      WHEN p_usage_type = 'agent' THEN trial_usage_tracking.agents_used + 1 
      ELSE trial_usage_tracking.agents_used 
    END,
    scans_performed = CASE 
      WHEN p_usage_type = 'scan' THEN trial_usage_tracking.scans_performed + 1 
      ELSE trial_usage_tracking.scans_performed 
    END,
    features_accessed = CASE
      WHEN p_feature_name IS NOT NULL THEN 
        COALESCE(trial_usage_tracking.features_accessed, '[]'::jsonb) || json_build_array(p_feature_name)::jsonb
      ELSE trial_usage_tracking.features_accessed
    END,
    updated_at = NOW();
  
  IF p_agent_id IS NOT NULL THEN
    INSERT INTO trial_agent_access (user_id, agent_id, access_date, access_count)
    VALUES (p_user_id, p_agent_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, agent_id, access_date) DO UPDATE SET
      access_count = trial_agent_access.access_count + 1,
      last_accessed = NOW();
  END IF;
  
  UPDATE profiles 
  SET 
    trial_agent_usage_count = CASE 
      WHEN p_usage_type = 'agent' THEN trial_agent_usage_count + 1 
      ELSE trial_agent_usage_count 
    END,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN json_build_object('success', true, 'recorded', true);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trial_usage_tracking_user_date ON trial_usage_tracking(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_trial_agent_access_user_date ON trial_agent_access(user_id, access_date);
CREATE INDEX IF NOT EXISTS idx_trial_agent_access_agent ON trial_agent_access(agent_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_prompts_user_type ON upgrade_prompts(user_id, prompt_type);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_status ON profiles(trial_status);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_end_date ON profiles(trial_end_date);

-- Row Level Security (RLS)
ALTER TABLE trial_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_agent_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE upgrade_prompts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own trial usage" ON trial_usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trial usage" ON trial_usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trial usage" ON trial_usage_tracking FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own agent access" ON trial_agent_access FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own agent access" ON trial_agent_access FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agent access" ON trial_agent_access FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own upgrade prompts" ON upgrade_prompts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own upgrade prompts" ON upgrade_prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own upgrade prompts" ON upgrade_prompts FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all trial data" ON trial_usage_tracking FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can view all agent access" ON trial_agent_access FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can view all upgrade prompts" ON upgrade_prompts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Grant permissions
GRANT ALL ON trial_usage_tracking TO authenticated;
GRANT ALL ON trial_agent_access TO authenticated;
GRANT ALL ON upgrade_prompts TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE trial_usage_tracking_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE trial_agent_access_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE upgrade_prompts_id_seq TO authenticated;

GRANT ALL ON trial_usage_tracking TO service_role;
GRANT ALL ON trial_agent_access TO service_role;
GRANT ALL ON upgrade_prompts TO service_role;
GRANT USAGE, SELECT ON SEQUENCE trial_usage_tracking_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE trial_agent_access_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE upgrade_prompts_id_seq TO service_role;