-- =====================================================================
-- 🎯 N8N MULTI-AGENT WORKFLOW ACCURACY EVALUATION SYSTEM
-- =====================================================================
-- 
-- Creates comprehensive accuracy evaluation infrastructure for all
-- SKRBL AI agent workflows with automated QA, retry logic, and 
-- admin reporting dashboards.
--
-- @version 1.0.0 - ACCURACY DOMINATION
-- @date 2025-01-17

-- =====================================================================
-- AGENT EVALUATION LOGS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS agent_evaluation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Workflow identification
  execution_id TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  superhero_name TEXT,
  
  -- Evaluation details
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('agent_execution', 'handoff', 'validation', 'output_formatting')),
  evaluation_type TEXT NOT NULL CHECK (evaluation_type IN ('schema_validation', 'output_quality', 'handoff_accuracy', 'completion_check')),
  
  -- Results
  accuracy_status TEXT NOT NULL CHECK (accuracy_status IN ('pass', 'fail', 'warning', 'retry')),
  accuracy_score DECIMAL(5,2) CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
  confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Evaluation criteria and results
  expected_schema JSONB,
  actual_output JSONB,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  quality_metrics JSONB DEFAULT '{}'::jsonb,
  
  -- Error handling
  error_message TEXT,
  error_code TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Performance metrics
  execution_time_ms INTEGER,
  processing_time_ms INTEGER,
  response_size_bytes INTEGER,
  
  -- Context and metadata
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_role TEXT DEFAULT 'client',
  user_prompt TEXT,
  handoff_context JSONB DEFAULT '{}'::jsonb,
  workflow_capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Correction and improvement
  suggested_improvements JSONB DEFAULT '[]'::jsonb,
  auto_correction_applied BOOLEAN DEFAULT FALSE,
  fallback_agent_used TEXT,
  escalation_triggered BOOLEAN DEFAULT FALSE,
  
  -- Admin notifications
  admin_notified BOOLEAN DEFAULT FALSE,
  notification_type TEXT CHECK (notification_type IN ('email', 'slack', 'dashboard', 'none')),
  
  -- Timestamps
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retry_timestamp TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- WORKFLOW ACCURACY SUMMARY TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS workflow_accuracy_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Workflow identification
  workflow_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  
  -- Time period
  summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  summary_period TEXT NOT NULL CHECK (summary_period IN ('daily', 'weekly', 'monthly')) DEFAULT 'daily',
  
  -- Accuracy metrics
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  retry_executions INTEGER DEFAULT 0,
  average_accuracy_score DECIMAL(5,2),
  average_confidence_score DECIMAL(5,2),
  
  -- Performance metrics
  average_execution_time_ms INTEGER,
  total_processing_time_ms BIGINT DEFAULT 0,
  fastest_execution_ms INTEGER,
  slowest_execution_ms INTEGER,
  
  -- Error analysis
  common_error_types JSONB DEFAULT '[]'::jsonb,
  error_patterns JSONB DEFAULT '{}'::jsonb,
  improvement_suggestions JSONB DEFAULT '[]'::jsonb,
  
  -- Success tracking
  accuracy_trend TEXT CHECK (accuracy_trend IN ('improving', 'declining', 'stable')) DEFAULT 'stable',
  completion_rate DECIMAL(5,2),
  user_satisfaction_score DECIMAL(5,2),
  
  -- Admin insights
  requires_attention BOOLEAN DEFAULT FALSE,
  optimization_opportunities JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint for summary period
  UNIQUE(workflow_id, agent_id, summary_date, summary_period)
);

-- =====================================================================
-- ACCURACY THRESHOLDS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS accuracy_thresholds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Configuration
  agent_id TEXT NOT NULL,
  workflow_id TEXT,
  step_type TEXT NOT NULL,
  
  -- Thresholds
  minimum_accuracy_score DECIMAL(5,2) NOT NULL DEFAULT 85.0,
  warning_accuracy_score DECIMAL(5,2) NOT NULL DEFAULT 70.0,
  minimum_confidence_score DECIMAL(5,2) NOT NULL DEFAULT 80.0,
  maximum_execution_time_ms INTEGER DEFAULT 30000,
  maximum_retry_attempts INTEGER DEFAULT 3,
  
  -- Actions
  auto_retry_enabled BOOLEAN DEFAULT TRUE,
  fallback_agent_id TEXT,
  escalation_enabled BOOLEAN DEFAULT TRUE,
  admin_notification_enabled BOOLEAN DEFAULT TRUE,
  
  -- Custom validation rules
  validation_rules JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(agent_id, workflow_id, step_type)
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Agent evaluation logs indexes
CREATE INDEX IF NOT EXISTS idx_agent_evaluation_logs_execution_id ON agent_evaluation_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_agent_evaluation_logs_agent_id ON agent_evaluation_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_evaluation_logs_workflow_id ON agent_evaluation_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_agent_evaluation_logs_accuracy_status ON agent_evaluation_logs(accuracy_status);
CREATE INDEX IF NOT EXISTS idx_agent_evaluation_logs_timestamp ON agent_evaluation_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_evaluation_logs_user_id ON agent_evaluation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_evaluation_logs_requires_attention ON agent_evaluation_logs(admin_notified) WHERE accuracy_status = 'fail';

-- Workflow accuracy summary indexes
CREATE INDEX IF NOT EXISTS idx_workflow_accuracy_summary_agent_id ON workflow_accuracy_summary(agent_id);
CREATE INDEX IF NOT EXISTS idx_workflow_accuracy_summary_date ON workflow_accuracy_summary(summary_date);
CREATE INDEX IF NOT EXISTS idx_workflow_accuracy_summary_requires_attention ON workflow_accuracy_summary(requires_attention) WHERE requires_attention = TRUE;

-- Accuracy thresholds indexes
CREATE INDEX IF NOT EXISTS idx_accuracy_thresholds_agent_id ON accuracy_thresholds(agent_id);
CREATE INDEX IF NOT EXISTS idx_accuracy_thresholds_workflow_id ON accuracy_thresholds(workflow_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

ALTER TABLE agent_evaluation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_accuracy_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE accuracy_thresholds ENABLE ROW LEVEL SECURITY;

-- Service role has full access for system operations
CREATE POLICY "Service role full access to evaluation logs" ON agent_evaluation_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to accuracy summary" ON workflow_accuracy_summary
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to accuracy thresholds" ON accuracy_thresholds
  FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own evaluation logs (for transparency)
CREATE POLICY "Users can view own evaluation logs" ON agent_evaluation_logs
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

-- Admins and pro users can view accuracy summaries
CREATE POLICY "Authenticated users can view accuracy summaries" ON workflow_accuracy_summary
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can modify accuracy thresholds
CREATE POLICY "Only service role can modify thresholds" ON accuracy_thresholds
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================================
-- PERMISSIONS
-- =====================================================================

-- Grant necessary permissions
GRANT SELECT ON agent_evaluation_logs TO authenticated;
GRANT SELECT ON workflow_accuracy_summary TO authenticated;
GRANT SELECT ON accuracy_thresholds TO authenticated;

GRANT ALL ON agent_evaluation_logs TO service_role;
GRANT ALL ON workflow_accuracy_summary TO service_role;
GRANT ALL ON accuracy_thresholds TO service_role;

-- =====================================================================
-- INITIAL ACCURACY THRESHOLDS FOR ALL AGENTS
-- =====================================================================

INSERT INTO accuracy_thresholds (agent_id, step_type, minimum_accuracy_score, warning_accuracy_score, minimum_confidence_score) VALUES
-- Percy - The orchestrator needs high accuracy
('percy-agent', 'agent_execution', 90.0, 75.0, 85.0),
('percy-agent', 'handoff', 95.0, 80.0, 90.0),

-- BrandAlexander - Creative work allows some variance
('branding-agent', 'agent_execution', 85.0, 70.0, 80.0),
('branding-agent', 'output_formatting', 90.0, 75.0, 85.0),

-- ContentCarltig - Content quality is critical
('content-creator-agent', 'agent_execution', 88.0, 73.0, 83.0),
('content-creator-agent', 'validation', 92.0, 77.0, 87.0),

-- SocialNino - Social content needs high engagement potential
('social-bot-agent', 'agent_execution', 87.0, 72.0, 82.0),
('social-bot-agent', 'validation', 90.0, 75.0, 85.0),

-- Analytics Don - Data accuracy is paramount
('analytics-agent', 'agent_execution', 95.0, 85.0, 90.0),
('analytics-agent', 'validation', 98.0, 90.0, 95.0),

-- AdmEthen - Ad performance needs high accuracy
('ad-creative-agent', 'agent_execution', 89.0, 74.0, 84.0),
('ad-creative-agent', 'validation', 92.0, 77.0, 87.0),

-- High-stakes agents require maximum accuracy
('payments-agent', 'agent_execution', 98.0, 90.0, 95.0),
('publishing-agent', 'agent_execution', 95.0, 85.0, 90.0),
('sync-agent', 'agent_execution', 97.0, 88.0, 93.0)

ON CONFLICT (agent_id, workflow_id, step_type) 
DO UPDATE SET 
  minimum_accuracy_score = EXCLUDED.minimum_accuracy_score,
  warning_accuracy_score = EXCLUDED.warning_accuracy_score,
  minimum_confidence_score = EXCLUDED.minimum_confidence_score,
  updated_at = NOW();

-- =====================================================================
-- SUCCESS MESSAGE
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '🎯 N8N Agent Accuracy Evaluation System Successfully Created!';
  RAISE NOTICE '✅ agent_evaluation_logs table with comprehensive tracking';
  RAISE NOTICE '✅ workflow_accuracy_summary table for admin reporting';
  RAISE NOTICE '✅ accuracy_thresholds table with agent-specific rules';
  RAISE NOTICE '✅ Initial thresholds configured for all major agents';
  RAISE NOTICE '✅ RLS policies and permissions configured';
  RAISE NOTICE '🚀 Ready for N8N workflow accuracy evaluation integration!';
END $$;
