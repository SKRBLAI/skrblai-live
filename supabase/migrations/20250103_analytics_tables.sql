-- Create user_journey_events table for analytics
CREATE TABLE IF NOT EXISTS user_journey_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'agent_view', 'agent_launch', 'upgrade_prompt', 'conversion', 'percy_interaction')),
  event_data JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_role TEXT NOT NULL DEFAULT 'client',
  source TEXT NOT NULL CHECK (source IN ('homepage', 'dashboard', 'agents_page', 'features_page', 'pricing_page')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_journey_events_user_id ON user_journey_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_timestamp ON user_journey_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_event_type ON user_journey_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_source ON user_journey_events(source);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_session_id ON user_journey_events(session_id);

-- Create workflow_jobs table (optional - for persistent queue storage)
CREATE TABLE IF NOT EXISTS workflow_jobs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  task TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL DEFAULT 'client',
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'retrying')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  error TEXT,
  result JSONB,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Create indexes for workflow jobs
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_user_id ON workflow_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_status ON workflow_jobs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_priority ON workflow_jobs(priority);
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_created_at ON workflow_jobs(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE user_journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own analytics events
CREATE POLICY "Users can view own analytics events" ON user_journey_events
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own analytics events
CREATE POLICY "Users can insert own analytics events" ON user_journey_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can only see their own workflow jobs
CREATE POLICY "Users can view own workflow jobs" ON workflow_jobs
  FOR SELECT USING (user_id = auth.uid());

-- Service role can access all data for admin purposes
CREATE POLICY "Service role full access to analytics" ON user_journey_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to workflow_jobs" ON workflow_jobs
  FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT SELECT, INSERT ON user_journey_events TO authenticated;
GRANT SELECT ON workflow_jobs TO authenticated;
GRANT ALL ON user_journey_events TO service_role;
GRANT ALL ON workflow_jobs TO service_role; 