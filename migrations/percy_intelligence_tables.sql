-- Percy Intelligence System Database Tables
-- Run this migration to support the new Percy intelligence features

-- Table for storing Percy user contexts and behavior tracking
CREATE TABLE IF NOT EXISTS percy_contexts (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  contextData JSONB NOT NULL DEFAULT '{}',
  sessionId VARCHAR(255),
  isAuthenticated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(userId)
);

-- Index for faster context lookups
CREATE INDEX IF NOT EXISTS idx_percy_contexts_userid ON percy_contexts(userId);
CREATE INDEX IF NOT EXISTS idx_percy_contexts_session ON percy_contexts(sessionId);
CREATE INDEX IF NOT EXISTS idx_percy_contexts_updated ON percy_contexts(updated_at);

-- Table for tracking agent access attempts and subscription conversion opportunities
CREATE TABLE IF NOT EXISTS agent_access_logs (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  agentId VARCHAR(255) NOT NULL,
  hasAccess BOOLEAN NOT NULL,
  reason VARCHAR(100),
  userRole VARCHAR(50),
  requiredRole VARCHAR(50),
  conversionOpportunity BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for agent access analytics
CREATE INDEX IF NOT EXISTS idx_agent_access_userid ON agent_access_logs(userId);
CREATE INDEX IF NOT EXISTS idx_agent_access_agentid ON agent_access_logs(agentId);
CREATE INDEX IF NOT EXISTS idx_agent_access_timestamp ON agent_access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_access_conversion ON agent_access_logs(conversionOpportunity);

-- Enhanced Percy analytics table (extends existing percy_analytics)
CREATE TABLE IF NOT EXISTS percy_intelligence_events (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(255),
  sessionId VARCHAR(255),
  eventType VARCHAR(100) NOT NULL,
  eventData JSONB DEFAULT '{}',
  conversationPhase VARCHAR(50),
  conversionScore INTEGER DEFAULT 0,
  subscriptionOffer JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Percy intelligence analytics
CREATE INDEX IF NOT EXISTS idx_percy_intel_userid ON percy_intelligence_events(userId);
CREATE INDEX IF NOT EXISTS idx_percy_intel_session ON percy_intelligence_events(sessionId);
CREATE INDEX IF NOT EXISTS idx_percy_intel_type ON percy_intelligence_events(eventType);
CREATE INDEX IF NOT EXISTS idx_percy_intel_phase ON percy_intelligence_events(conversationPhase);
CREATE INDEX IF NOT EXISTS idx_percy_intel_timestamp ON percy_intelligence_events(timestamp);

-- Table for tracking subscription conversion funnels
CREATE TABLE IF NOT EXISTS subscription_conversion_funnel (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  stage VARCHAR(100) NOT NULL, -- interest, consideration, decision, conversion
  triggerEvent VARCHAR(100), -- locked_agent_click, pricing_visit, etc.
  agentId VARCHAR(255),
  currentPlan VARCHAR(50) DEFAULT 'free',
  targetPlan VARCHAR(50),
  conversionScore INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for conversion funnel analytics
CREATE INDEX IF NOT EXISTS idx_conversion_userid ON subscription_conversion_funnel(userId);
CREATE INDEX IF NOT EXISTS idx_conversion_stage ON subscription_conversion_funnel(stage);
CREATE INDEX IF NOT EXISTS idx_conversion_trigger ON subscription_conversion_funnel(triggerEvent);
CREATE INDEX IF NOT EXISTS idx_conversion_timestamp ON subscription_conversion_funnel(timestamp);

-- View for Percy conversation analytics
CREATE OR REPLACE VIEW percy_conversation_analytics AS
SELECT 
  p.userId,
  p.sessionId,
  p.conversationPhase,
  p.conversionScore,
  COUNT(*) as total_events,
  COUNT(CASE WHEN p.eventType = 'locked_agent_click' THEN 1 END) as locked_agent_clicks,
  COUNT(CASE WHEN p.eventType = 'subscription_inquiry' THEN 1 END) as subscription_inquiries,
  COUNT(CASE WHEN p.subscriptionOffer IS NOT NULL THEN 1 END) as subscription_offers,
  MIN(p.timestamp) as session_start,
  MAX(p.timestamp) as session_end,
  EXTRACT(EPOCH FROM (MAX(p.timestamp) - MIN(p.timestamp)))/60 as session_duration_minutes
FROM percy_intelligence_events p
GROUP BY p.userId, p.sessionId, p.conversationPhase, p.conversionScore;

-- View for agent access patterns and conversion opportunities
CREATE OR REPLACE VIEW agent_conversion_opportunities AS
SELECT 
  a.agentId,
  COUNT(*) as total_access_attempts,
  COUNT(CASE WHEN a.hasAccess = false THEN 1 END) as blocked_attempts,
  COUNT(CASE WHEN a.hasAccess = false AND a.userRole = 'client' THEN 1 END) as free_user_blocks,
  COUNT(DISTINCT a.userId) as unique_users,
  COUNT(DISTINCT CASE WHEN a.hasAccess = false THEN a.userId END) as users_needing_upgrade,
  ROUND(
    COUNT(CASE WHEN a.hasAccess = false THEN 1 END)::decimal / 
    COUNT(*)::decimal * 100, 2
  ) as conversion_opportunity_rate
FROM agent_access_logs a
GROUP BY a.agentId
ORDER BY conversion_opportunity_rate DESC;

-- Update the updated_at timestamp for percy_contexts
CREATE OR REPLACE FUNCTION update_percy_context_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at field
DROP TRIGGER IF EXISTS trigger_percy_context_updated_at ON percy_contexts;
CREATE TRIGGER trigger_percy_context_updated_at
  BEFORE UPDATE ON percy_contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_percy_context_timestamp();

-- Permissions (adjust based on your RLS policies)
-- Allow authenticated users to manage their own context
ALTER TABLE percy_contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY percy_contexts_user_policy ON percy_contexts
  FOR ALL USING (auth.uid()::text = userId OR userId LIKE 'anon_%');

-- Allow authenticated users to view their own logs
ALTER TABLE agent_access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY agent_access_logs_user_policy ON agent_access_logs
  FOR ALL USING (auth.uid()::text = userId OR userId LIKE 'anon_%');

-- Allow authenticated users to view their own intelligence events
ALTER TABLE percy_intelligence_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY percy_intelligence_events_user_policy ON percy_intelligence_events
  FOR ALL USING (auth.uid()::text = userId OR userId LIKE 'anon_%');

-- Allow authenticated users to view their own conversion funnel
ALTER TABLE subscription_conversion_funnel ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscription_conversion_funnel_user_policy ON subscription_conversion_funnel
  FOR ALL USING (auth.uid()::text = userId);

-- Grant access to service role for admin operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Comments for documentation
COMMENT ON TABLE percy_contexts IS 'Stores Percy user contexts for intelligent conversation tracking';
COMMENT ON TABLE agent_access_logs IS 'Logs agent access attempts for subscription conversion analytics';
COMMENT ON TABLE percy_intelligence_events IS 'Enhanced Percy analytics for conversation intelligence';
COMMENT ON TABLE subscription_conversion_funnel IS 'Tracks user progression through subscription conversion stages';

COMMENT ON VIEW percy_conversation_analytics IS 'Aggregated view of Percy conversation metrics per session';
COMMENT ON VIEW agent_conversion_opportunities IS 'Agent-level conversion opportunity analysis'; 