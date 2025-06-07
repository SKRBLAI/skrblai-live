-- Authentication Audit Logging System
-- Enhanced security monitoring and analytics for dashboard authentication

-- Create auth_audit_logs table for comprehensive authentication tracking
CREATE TABLE IF NOT EXISTS auth_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'signin_attempt', 
    'signin_success', 
    'signin_failure', 
    'promo_redemption', 
    'promo_validation', 
    'vip_check', 
    'security_violation', 
    'rate_limit', 
    'suspicious_activity'
  )),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  session_id TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  source TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance and analytics queries
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_event_type ON auth_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_email ON auth_audit_logs(email);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_severity ON auth_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_created_at ON auth_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_source ON auth_audit_logs(source);

-- Composite indexes for common analytics queries
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_time_event ON auth_audit_logs(created_at, event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_time_severity ON auth_audit_logs(created_at, severity);

-- Create rate limiting tracking table
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP address or email
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip', 'email')),
  event_type TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  first_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  UNIQUE(identifier, identifier_type, event_type)
);

-- Indexes for rate limiting
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_identifier ON auth_rate_limits(identifier, identifier_type);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_blocked_until ON auth_rate_limits(blocked_until);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_last_attempt ON auth_rate_limits(last_attempt);

-- Row Level Security for audit logs
ALTER TABLE auth_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Service role has full access to audit logs
CREATE POLICY "Service role full access to auth_audit_logs" ON auth_audit_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to auth_rate_limits" ON auth_rate_limits
  FOR ALL USING (auth.role() = 'service_role');

-- Users can only view their own audit logs
CREATE POLICY "Users can view own auth audit logs" ON auth_audit_logs
  FOR SELECT USING (user_id = auth.uid() OR email = (auth.jwt() ->> 'email'));

-- Admin users can view all audit logs (assuming admin role tracking)
CREATE POLICY "Admin users can view all auth audit logs" ON auth_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE userId = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Grant permissions
GRANT SELECT ON auth_audit_logs TO authenticated;
GRANT ALL ON auth_audit_logs TO service_role;
GRANT ALL ON auth_rate_limits TO service_role;

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_event_type TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15,
  p_block_minutes INTEGER DEFAULT 60
) RETURNS JSONB AS $$
DECLARE
  v_current_time TIMESTAMPTZ := NOW();
  v_window_start TIMESTAMPTZ := v_current_time - (p_window_minutes || ' minutes')::INTERVAL;
  v_rate_limit auth_rate_limits;
  v_is_blocked BOOLEAN := FALSE;
  v_attempts_in_window INTEGER := 0;
BEGIN
  -- Get or create rate limit record
  SELECT * INTO v_rate_limit
  FROM auth_rate_limits
  WHERE identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND event_type = p_event_type;

  -- Check if currently blocked
  IF v_rate_limit.blocked_until IS NOT NULL AND v_rate_limit.blocked_until > v_current_time THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked', true,
      'blocked_until', v_rate_limit.blocked_until,
      'reason', 'Rate limit exceeded'
    );
  END IF;

  -- Count attempts in current window
  IF v_rate_limit.id IS NOT NULL THEN
    IF v_rate_limit.first_attempt >= v_window_start THEN
      v_attempts_in_window := v_rate_limit.attempt_count;
    ELSE
      -- Reset counter if outside window
      v_attempts_in_window := 1;
    END IF;
  ELSE
    v_attempts_in_window := 1;
  END IF;

  -- Check if this attempt would exceed the limit
  IF v_attempts_in_window >= p_max_attempts THEN
    v_is_blocked := TRUE;
  END IF;

  -- Update or insert rate limit record
  INSERT INTO auth_rate_limits (
    identifier,
    identifier_type,
    event_type,
    attempt_count,
    first_attempt,
    last_attempt,
    blocked_until,
    metadata
  ) VALUES (
    p_identifier,
    p_identifier_type,
    p_event_type,
    v_attempts_in_window + 1,
    CASE 
      WHEN v_rate_limit.id IS NULL OR v_rate_limit.first_attempt < v_window_start 
      THEN v_current_time 
      ELSE v_rate_limit.first_attempt 
    END,
    v_current_time,
    CASE WHEN v_is_blocked THEN v_current_time + (p_block_minutes || ' minutes')::INTERVAL ELSE NULL END,
    jsonb_build_object(
      'window_minutes', p_window_minutes,
      'max_attempts', p_max_attempts,
      'block_minutes', p_block_minutes
    )
  )
  ON CONFLICT (identifier, identifier_type, event_type)
  DO UPDATE SET
    attempt_count = CASE 
      WHEN auth_rate_limits.first_attempt < v_window_start THEN 1
      ELSE auth_rate_limits.attempt_count + 1
    END,
    first_attempt = CASE 
      WHEN auth_rate_limits.first_attempt < v_window_start THEN v_current_time
      ELSE auth_rate_limits.first_attempt
    END,
    last_attempt = v_current_time,
    blocked_until = CASE 
      WHEN v_is_blocked THEN v_current_time + (p_block_minutes || ' minutes')::INTERVAL 
      ELSE NULL 
    END,
    metadata = jsonb_build_object(
      'window_minutes', p_window_minutes,
      'max_attempts', p_max_attempts,
      'block_minutes', p_block_minutes
    );

  RETURN jsonb_build_object(
    'allowed', NOT v_is_blocked,
    'blocked', v_is_blocked,
    'attempts_in_window', v_attempts_in_window + 1,
    'max_attempts', p_max_attempts,
    'window_start', v_window_start,
    'blocked_until', CASE WHEN v_is_blocked THEN v_current_time + (p_block_minutes || ' minutes')::INTERVAL ELSE NULL END
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'error', 'Rate limit check failed: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get authentication analytics
CREATE OR REPLACE FUNCTION get_auth_analytics(
  p_hours_back INTEGER DEFAULT 24
) RETURNS JSONB AS $$
DECLARE
  v_since TIMESTAMPTZ := NOW() - (p_hours_back || ' hours')::INTERVAL;
  v_total_attempts INTEGER;
  v_successful_signins INTEGER;
  v_failed_signins INTEGER;
  v_promo_redemptions INTEGER;
  v_security_violations INTEGER;
  v_unique_users INTEGER;
  v_failure_reasons JSONB;
BEGIN
  -- Get counts for different event types
  SELECT 
    COUNT(*) FILTER (WHERE event_type = 'signin_attempt'),
    COUNT(*) FILTER (WHERE event_type = 'signin_success'),
    COUNT(*) FILTER (WHERE event_type = 'signin_failure'),
    COUNT(*) FILTER (WHERE event_type = 'promo_redemption'),
    COUNT(*) FILTER (WHERE event_type = 'security_violation'),
    COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL)
  INTO 
    v_total_attempts,
    v_successful_signins,
    v_failed_signins,
    v_promo_redemptions,
    v_security_violations,
    v_unique_users
  FROM auth_audit_logs
  WHERE created_at >= v_since;

  -- Get top failure reasons
  SELECT jsonb_agg(
    jsonb_build_object(
      'reason', reason,
      'count', count
    ) ORDER BY count DESC
  )
  INTO v_failure_reasons
  FROM (
    SELECT 
      COALESCE(metadata->>'errorMessage', 'Unknown error') as reason,
      COUNT(*) as count
    FROM auth_audit_logs
    WHERE created_at >= v_since
      AND event_type = 'signin_failure'
    GROUP BY reason
    ORDER BY count DESC
    LIMIT 10
  ) failure_stats;

  RETURN jsonb_build_object(
    'timeRange', jsonb_build_object(
      'hours', p_hours_back,
      'since', v_since,
      'until', NOW()
    ),
    'signInAttempts', v_total_attempts,
    'successfulSignIns', v_successful_signins,
    'failedSignIns', v_failed_signins,
    'successRate', CASE 
      WHEN v_total_attempts > 0 
      THEN ROUND((v_successful_signins::DECIMAL / v_total_attempts) * 100, 2)
      ELSE 0 
    END,
    'promoRedemptions', v_promo_redemptions,
    'securityViolations', v_security_violations,
    'uniqueUsers', v_unique_users,
    'topFailureReasons', COALESCE(v_failure_reasons, '[]'::jsonb)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', 'Analytics calculation failed: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_auth_analytics(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_auth_analytics(INTEGER) TO service_role;

-- Create a view for real-time monitoring dashboard
CREATE OR REPLACE VIEW auth_monitoring_dashboard AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  event_type,
  severity,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT email) as unique_emails
FROM auth_audit_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), event_type, severity
ORDER BY hour DESC, event_count DESC;

-- Grant access to monitoring view
GRANT SELECT ON auth_monitoring_dashboard TO authenticated;
GRANT SELECT ON auth_monitoring_dashboard TO service_role;

-- Comments for documentation
COMMENT ON TABLE auth_audit_logs IS 'Comprehensive audit trail for all authentication events';
COMMENT ON TABLE auth_rate_limits IS 'Rate limiting tracking for authentication endpoints';
COMMENT ON FUNCTION check_rate_limit IS 'Checks and updates rate limiting for authentication attempts';
COMMENT ON FUNCTION get_auth_analytics IS 'Generates authentication analytics for monitoring dashboard';
COMMENT ON VIEW auth_monitoring_dashboard IS 'Real-time authentication monitoring dashboard data'; 