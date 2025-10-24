-- Activity Feed Real-time Tables
-- Purpose: Support live agent activity feed with Supabase Realtime
-- Generated: 2025-10-24

-- ============================================================================
-- agent_launches - Real-time agent execution tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agent_launches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  agent_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'running', 'success', 'failed', 'webhook_failed', 'critical_failure', 'pending')),
  source TEXT DEFAULT 'dashboard', -- 'dashboard', 'percy', 'api', 'skillsmith', 'api_launch'
  payload JSONB, -- Original request payload
  result JSONB, -- Execution result
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_launches_agent_id ON public.agent_launches(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_launches_user_id ON public.agent_launches(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_launches_status ON public.agent_launches(status);
CREATE INDEX IF NOT EXISTS idx_agent_launches_started_at ON public.agent_launches(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_launches_source ON public.agent_launches(source);

-- ============================================================================
-- n8n_executions - Workflow execution tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.n8n_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  workflow_name TEXT,
  agent_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed', 'waiting')),
  chained BOOLEAN DEFAULT FALSE, -- true if part of multi-agent chain
  trigger_data JSONB,
  result_data JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_n8n_executions_execution_id ON public.n8n_executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_workflow_id ON public.n8n_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_agent_id ON public.n8n_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_user_id ON public.n8n_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_status ON public.n8n_executions(status);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_started_at ON public.n8n_executions(started_at DESC);

-- ============================================================================
-- system_health_logs - Platform health monitoring
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.system_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  overall_status TEXT NOT NULL CHECK (overall_status IN ('healthy', 'degraded', 'critical', 'unknown')),
  overall_score DECIMAL(5,2) DEFAULT 100.00, -- 0.00 to 100.00
  critical_issues JSONB DEFAULT '[]', -- Array of critical issues
  warnings JSONB DEFAULT '[]', -- Array of warnings
  component_statuses JSONB DEFAULT '{}', -- Status per component
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_system_health_logs_timestamp ON public.system_health_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_logs_status ON public.system_health_logs(overall_status);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.agent_launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;

-- agent_launches policies
CREATE POLICY "Users can view their own agent launches" ON public.agent_launches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on agent launches" ON public.agent_launches
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can insert their own agent launches" ON public.agent_launches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- n8n_executions policies
CREATE POLICY "Users can view their own workflow executions" ON public.n8n_executions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on n8n executions" ON public.n8n_executions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- system_health_logs policies (view-only for all authenticated users)
CREATE POLICY "Authenticated users can view system health" ON public.system_health_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access on system health logs" ON public.system_health_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.agent_launches TO authenticated;
GRANT ALL ON public.agent_launches TO service_role;

GRANT SELECT ON public.n8n_executions TO authenticated;
GRANT ALL ON public.n8n_executions TO service_role;

GRANT SELECT ON public.system_health_logs TO authenticated;
GRANT ALL ON public.system_health_logs TO service_role;

-- ============================================================================
-- REALTIME PUBLICATION
-- ============================================================================

-- Enable Realtime for live activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_launches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.n8n_executions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_health_logs;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to create agent launch record
CREATE OR REPLACE FUNCTION public.create_agent_launch(
  p_agent_id TEXT,
  p_agent_name TEXT,
  p_user_id UUID,
  p_source TEXT DEFAULT 'dashboard',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_launch_id UUID;
BEGIN
  INSERT INTO public.agent_launches (
    agent_id,
    agent_name,
    user_id,
    source,
    status,
    metadata
  ) VALUES (
    p_agent_id,
    p_agent_name,
    p_user_id,
    p_source,
    'running',
    p_metadata
  )
  RETURNING id INTO v_launch_id;

  RETURN v_launch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete agent launch
CREATE OR REPLACE FUNCTION public.complete_agent_launch(
  p_launch_id UUID,
  p_status TEXT,
  p_result JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.agent_launches
  SET
    status = p_status,
    result = p_result,
    error_message = p_error_message,
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_launch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE public.agent_launches IS 'Real-time agent execution tracking for live activity feed';
COMMENT ON TABLE public.n8n_executions IS 'N8N workflow execution tracking for monitoring and chaining';
COMMENT ON TABLE public.system_health_logs IS 'Platform health monitoring and status logs';
