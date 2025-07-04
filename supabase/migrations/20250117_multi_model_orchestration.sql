-- =====================================================================================
-- SKRBL AI Multi-Model Orchestration Database Schema
-- =====================================================================================
-- Purpose: Track performance metrics, costs, and optimization data for intelligent 
--          model selection across GPT-4, Claude-3, GPT-4-Vision providers
-- 
-- Features:
-- - Model performance tracking for optimization
-- - Cost monitoring and budget management  
-- - Agent-specific model preferences and success rates
-- - Real-time model selection analytics
-- - Performance-based model ranking system
-- =====================================================================================

-- Model Performance Logs (Detailed execution tracking)
CREATE TABLE IF NOT EXISTS model_performance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('analysis', 'creativity', 'conversation', 'code', 'vision', 'reasoning', 'orchestration')),
  execution_time INTEGER NOT NULL, -- milliseconds
  token_count_input INTEGER NOT NULL DEFAULT 0,
  token_count_output INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(10,6) NOT NULL DEFAULT 0.0, -- Cost in USD
  success BOOLEAN NOT NULL DEFAULT true,
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.95 CHECK (confidence >= 0 AND confidence <= 1),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  cost_budget TEXT NOT NULL DEFAULT 'standard' CHECK (cost_budget IN ('economy', 'standard', 'premium', 'unlimited')),
  performance_requirement TEXT NOT NULL DEFAULT 'balanced' CHECK (performance_requirement IN ('speed', 'accuracy', 'creativity', 'balanced')),
  fallback_used BOOLEAN NOT NULL DEFAULT false,
  retry_count INTEGER NOT NULL DEFAULT 0,
  optimization_reason TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Indexing for performance
  INDEX idx_model_performance_logs_model_agent (model_id, agent_id),
  INDEX idx_model_performance_logs_task_type (task_type),
  INDEX idx_model_performance_logs_created_at (created_at),
  INDEX idx_model_performance_logs_success_cost (success, cost),
  INDEX idx_model_performance_logs_composite (model_id, agent_id, task_type, created_at)
);

-- Model Performance Summary (Aggregated metrics for fast queries)
CREATE TABLE IF NOT EXISTS model_performance_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  task_type TEXT NOT NULL,
  success_rate DECIMAL(5,4) NOT NULL DEFAULT 1.0 CHECK (success_rate >= 0 AND success_rate <= 1),
  avg_response_time INTEGER NOT NULL DEFAULT 0, -- milliseconds
  avg_cost DECIMAL(10,6) NOT NULL DEFAULT 0.0,
  avg_tokens_used INTEGER NOT NULL DEFAULT 0,
  quality_score DECIMAL(3,2) NOT NULL DEFAULT 0.95 CHECK (quality_score >= 0 AND quality_score <= 1),
  usage_count INTEGER NOT NULL DEFAULT 0,
  total_cost DECIMAL(12,6) NOT NULL DEFAULT 0.0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Unique constraint to prevent duplicates
  UNIQUE(model_id, agent_id, task_type),
  
  -- Indexing for optimization queries
  INDEX idx_model_performance_summary_model (model_id),
  INDEX idx_model_performance_summary_agent (agent_id),
  INDEX idx_model_performance_summary_success_rate (success_rate),
  INDEX idx_model_performance_summary_cost (avg_cost),
  INDEX idx_model_performance_summary_quality (quality_score),
  INDEX idx_model_performance_summary_usage (usage_count)
);

-- Model Cost Tracking (Daily/Weekly/Monthly cost aggregation)
CREATE TABLE IF NOT EXISTS model_cost_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  model_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  total_executions INTEGER NOT NULL DEFAULT 0,
  total_tokens_input INTEGER NOT NULL DEFAULT 0,
  total_tokens_output INTEGER NOT NULL DEFAULT 0,
  total_cost DECIMAL(12,6) NOT NULL DEFAULT 0.0,
  avg_cost_per_execution DECIMAL(10,6) NOT NULL DEFAULT 0.0,
  success_rate DECIMAL(5,4) NOT NULL DEFAULT 1.0,
  avg_response_time INTEGER NOT NULL DEFAULT 0,
  cost_budget_distribution JSONB DEFAULT '{}', -- Track usage by budget tier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Unique constraint for period tracking
  UNIQUE(date, model_id, agent_id, period_type),
  
  -- Indexing for cost analysis
  INDEX idx_model_cost_tracking_date (date),
  INDEX idx_model_cost_tracking_model (model_id),
  INDEX idx_model_cost_tracking_period (period_type),
  INDEX idx_model_cost_tracking_cost (total_cost)
);

-- Model Selection Decisions (Track which models were chosen and why)
CREATE TABLE IF NOT EXISTS model_selection_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id TEXT NOT NULL, -- Unique request identifier
  agent_id TEXT NOT NULL,
  task_type TEXT NOT NULL,
  selected_model TEXT NOT NULL,
  alternative_models JSONB DEFAULT '[]', -- Models that were considered
  selection_scores JSONB DEFAULT '{}', -- Scores for each model considered
  selection_reasoning TEXT,
  capability_score DECIMAL(3,2) DEFAULT 0.0,
  cost_score DECIMAL(3,2) DEFAULT 0.0,
  performance_score DECIMAL(3,2) DEFAULT 0.0,
  speed_score DECIMAL(3,2) DEFAULT 0.0,
  final_score DECIMAL(3,2) DEFAULT 0.0,
  execution_successful BOOLEAN,
  actual_execution_time INTEGER,
  actual_cost DECIMAL(10,6),
  user_satisfaction DECIMAL(3,2), -- If available from feedback
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Indexing for decision analysis
  INDEX idx_model_selection_decisions_agent (agent_id),
  INDEX idx_model_selection_decisions_model (selected_model),
  INDEX idx_model_selection_decisions_task (task_type),
  INDEX idx_model_selection_decisions_success (execution_successful),
  INDEX idx_model_selection_decisions_created_at (created_at)
);

-- Agent Model Preferences (Override default model preferences for specific agents)
CREATE TABLE IF NOT EXISTS agent_model_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL UNIQUE,
  preferred_models JSONB NOT NULL DEFAULT '[]', -- Ordered list of preferred models
  task_specific_preferences JSONB DEFAULT '{}', -- Different models for different task types
  cost_constraints JSONB DEFAULT '{}', -- Budget limitations per task type
  performance_requirements JSONB DEFAULT '{}', -- Speed/accuracy requirements
  blacklisted_models JSONB DEFAULT '[]', -- Models to avoid for this agent
  custom_scoring_weights JSONB DEFAULT '{}', -- Custom weights for selection algorithm
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Indexing
  INDEX idx_agent_model_preferences_agent (agent_id)
);

-- Model Provider Status (Track availability and health of each AI provider)
CREATE TABLE IF NOT EXISTS model_provider_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name TEXT NOT NULL, -- 'openai', 'anthropic', etc.
  model_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'degraded', 'offline', 'maintenance')),
  response_time_percentile_95 INTEGER, -- 95th percentile response time
  error_rate DECIMAL(5,4) DEFAULT 0.0,
  last_successful_request TIMESTAMP WITH TIME ZONE,
  last_failed_request TIMESTAMP WITH TIME ZONE,
  consecutive_failures INTEGER DEFAULT 0,
  health_score DECIMAL(3,2) DEFAULT 1.0 CHECK (health_score >= 0 AND health_score <= 1),
  status_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Unique constraint
  UNIQUE(provider_name, model_id),
  
  -- Indexing
  INDEX idx_model_provider_status_provider (provider_name),
  INDEX idx_model_provider_status_status (status),
  INDEX idx_model_provider_status_health (health_score)
);

-- =====================================================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================================================

-- Function to update model performance summary when new logs are added
CREATE OR REPLACE FUNCTION update_model_performance_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the summary record
  INSERT INTO model_performance_summary (
    model_id, agent_id, task_type, success_rate, avg_response_time, 
    avg_cost, avg_tokens_used, quality_score, usage_count, total_cost, last_updated
  )
  SELECT 
    NEW.model_id,
    NEW.agent_id,
    NEW.task_type,
    AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END)::DECIMAL(5,4) as success_rate,
    AVG(execution_time)::INTEGER as avg_response_time,
    AVG(cost)::DECIMAL(10,6) as avg_cost,
    AVG(token_count_input + token_count_output)::INTEGER as avg_tokens_used,
    AVG(confidence)::DECIMAL(3,2) as quality_score,
    COUNT(*)::INTEGER as usage_count,
    SUM(cost)::DECIMAL(12,6) as total_cost,
    NOW() as last_updated
  FROM model_performance_logs 
  WHERE model_id = NEW.model_id 
    AND agent_id = NEW.agent_id 
    AND task_type = NEW.task_type
    AND created_at >= (NOW() - INTERVAL '30 days') -- Only last 30 days for relevance
  GROUP BY model_id, agent_id, task_type
  ON CONFLICT (model_id, agent_id, task_type) 
  DO UPDATE SET
    success_rate = EXCLUDED.success_rate,
    avg_response_time = EXCLUDED.avg_response_time,
    avg_cost = EXCLUDED.avg_cost,
    avg_tokens_used = EXCLUDED.avg_tokens_used,
    quality_score = EXCLUDED.quality_score,
    usage_count = EXCLUDED.usage_count,
    total_cost = EXCLUDED.total_cost,
    last_updated = EXCLUDED.last_updated;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update summary when logs are added
CREATE TRIGGER trigger_update_model_performance_summary
  AFTER INSERT ON model_performance_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_model_performance_summary();

-- Function to update daily cost tracking
CREATE OR REPLACE FUNCTION update_daily_cost_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update daily cost tracking
  INSERT INTO model_cost_tracking (
    date, model_id, agent_id, period_type, total_executions, total_tokens_input,
    total_tokens_output, total_cost, avg_cost_per_execution, success_rate, avg_response_time
  )
  SELECT 
    DATE(NEW.created_at) as date,
    NEW.model_id,
    NEW.agent_id,
    'daily' as period_type,
    COUNT(*)::INTEGER as total_executions,
    SUM(token_count_input)::INTEGER as total_tokens_input,
    SUM(token_count_output)::INTEGER as total_tokens_output,
    SUM(cost)::DECIMAL(12,6) as total_cost,
    AVG(cost)::DECIMAL(10,6) as avg_cost_per_execution,
    AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END)::DECIMAL(5,4) as success_rate,
    AVG(execution_time)::INTEGER as avg_response_time
  FROM model_performance_logs 
  WHERE model_id = NEW.model_id 
    AND agent_id = NEW.agent_id 
    AND DATE(created_at) = DATE(NEW.created_at)
  GROUP BY DATE(created_at), model_id, agent_id
  ON CONFLICT (date, model_id, agent_id, period_type) 
  DO UPDATE SET
    total_executions = EXCLUDED.total_executions,
    total_tokens_input = EXCLUDED.total_tokens_input,
    total_tokens_output = EXCLUDED.total_tokens_output,
    total_cost = EXCLUDED.total_cost,
    avg_cost_per_execution = EXCLUDED.avg_cost_per_execution,
    success_rate = EXCLUDED.success_rate,
    avg_response_time = EXCLUDED.avg_response_time;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for daily cost tracking
CREATE TRIGGER trigger_update_daily_cost_tracking
  AFTER INSERT ON model_performance_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_cost_tracking();

-- =====================================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================================

-- Enable RLS on all tables
ALTER TABLE model_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_performance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_selection_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_model_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_provider_status ENABLE ROW LEVEL SECURITY;

-- Admin users can see everything
CREATE POLICY "Admin full access to model_performance_logs" ON model_performance_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
           OR auth.users.raw_user_meta_data->>'role' = 'super_admin')
    )
  );

CREATE POLICY "Admin full access to model_performance_summary" ON model_performance_summary
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
           OR auth.users.raw_user_meta_data->>'role' = 'super_admin')
    )
  );

CREATE POLICY "Admin full access to model_cost_tracking" ON model_cost_tracking
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
           OR auth.users.raw_user_meta_data->>'role' = 'super_admin')
    )
  );

CREATE POLICY "Admin full access to model_selection_decisions" ON model_selection_decisions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
           OR auth.users.raw_user_meta_data->>'role' = 'super_admin')
    )
  );

CREATE POLICY "Admin full access to agent_model_preferences" ON agent_model_preferences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
           OR auth.users.raw_user_meta_data->>'role' = 'super_admin')
    )
  );

CREATE POLICY "Admin full access to model_provider_status" ON model_provider_status
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
           OR auth.users.raw_user_meta_data->>'role' = 'super_admin')
    )
  );

-- Regular users can only read summary data for transparency
CREATE POLICY "Users can read model_performance_summary" ON model_performance_summary
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can read model_provider_status" ON model_provider_status
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================================================
-- INITIAL DATA & CONFIGURATION
-- =====================================================================================

-- Insert default agent model preferences
INSERT INTO agent_model_preferences (agent_id, preferred_models, task_specific_preferences, notes) VALUES
('percy-agent', '["gpt-4", "claude-3-opus", "claude-3-sonnet"]', 
 '{"orchestration": ["gpt-4", "claude-3-opus"], "reasoning": ["gpt-4"], "conversation": ["claude-3-opus", "claude-3-sonnet"]}',
 'Percy needs high reasoning capability for orchestration tasks'),

('branding-agent', '["claude-3-opus", "gpt-4-vision", "gpt-4"]', 
 '{"creativity": ["claude-3-opus"], "vision": ["gpt-4-vision"], "analysis": ["gpt-4"]}',
 'Branding requires peak creativity and visual analysis capabilities'),

('content-creator-agent', '["claude-3-opus", "claude-3-sonnet", "gpt-4"]', 
 '{"creativity": ["claude-3-opus"], "conversation": ["claude-3-sonnet"], "analysis": ["gpt-4"]}',
 'Content creation prioritizes creativity and natural language'),

('social-bot-agent', '["claude-3-sonnet", "claude-3-opus", "gpt-4"]', 
 '{"creativity": ["claude-3-opus", "claude-3-sonnet"], "conversation": ["claude-3-sonnet"]}',
 'Social media needs creative and engaging content'),

('analytics-agent', '["gpt-4", "claude-3-sonnet", "gpt-4-vision"]', 
 '{"analysis": ["gpt-4"], "reasoning": ["gpt-4"], "vision": ["gpt-4-vision"]}',
 'Analytics requires precision and data interpretation skills'),

('ad-creative-agent', '["claude-3-opus", "gpt-4-vision", "claude-3-sonnet"]', 
 '{"creativity": ["claude-3-opus"], "vision": ["gpt-4-vision"], "conversation": ["claude-3-sonnet"]}',
 'Ad creation needs creativity and visual understanding'),

('video-content-agent', '["gpt-4-vision", "claude-3-opus", "gpt-4"]', 
 '{"vision": ["gpt-4-vision"], "creativity": ["claude-3-opus"], "analysis": ["gpt-4"]}',
 'Video content requires visual analysis and creative concepts'),

('publishing-agent', '["claude-3-opus", "claude-3-sonnet", "gpt-4"]', 
 '{"creativity": ["claude-3-opus"], "conversation": ["claude-3-sonnet"], "reasoning": ["gpt-4"]}',
 'Publishing needs long-form content creation capabilities'),

('biz-agent', '["gpt-4", "claude-3-opus", "claude-3-sonnet"]', 
 '{"reasoning": ["gpt-4"], "analysis": ["gpt-4"], "conversation": ["claude-3-opus"]}',
 'Business strategy requires strong reasoning and analysis'),

('payments-agent', '["gpt-4", "claude-3-sonnet", "gpt-4-vision"]', 
 '{"reasoning": ["gpt-4"], "analysis": ["gpt-4"], "conversation": ["claude-3-sonnet"]}',
 'Payments require precision and reliability');

-- Insert initial model provider status
INSERT INTO model_provider_status (provider_name, model_id, status, response_time_percentile_95, health_score) VALUES
('openai', 'gpt-4', 'active', 3500, 0.98),
('openai', 'gpt-4-vision', 'active', 4500, 0.95),
('anthropic', 'claude-3-opus', 'active', 4000, 0.97),
('anthropic', 'claude-3-sonnet', 'active', 2500, 0.96);

-- =====================================================================================
-- INDEXES FOR OPTIMIZATION
-- =====================================================================================

-- Additional composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_model_performance_logs_optimization 
  ON model_performance_logs (model_id, agent_id, task_type, success, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_model_cost_tracking_analysis 
  ON model_cost_tracking (model_id, period_type, date DESC);

CREATE INDEX IF NOT EXISTS idx_model_selection_decisions_analysis 
  ON model_selection_decisions (agent_id, task_type, execution_successful, created_at DESC);

-- =====================================================================================
-- GRANTS & PERMISSIONS
-- =====================================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT ON model_performance_summary TO authenticated;
GRANT SELECT ON model_provider_status TO authenticated;

-- Grant full access to service role for backend operations
GRANT ALL ON model_performance_logs TO service_role;
GRANT ALL ON model_performance_summary TO service_role;
GRANT ALL ON model_cost_tracking TO service_role;
GRANT ALL ON model_selection_decisions TO service_role;
GRANT ALL ON agent_model_preferences TO service_role;
GRANT ALL ON model_provider_status TO service_role;

-- =====================================================================================
-- COMPLETION NOTICE
-- =====================================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SKRBL AI Multi-Model Orchestration Database Schema Installed Successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables Created:';
  RAISE NOTICE '  ✅ model_performance_logs - Detailed execution tracking';
  RAISE NOTICE '  ✅ model_performance_summary - Aggregated performance metrics';
  RAISE NOTICE '  ✅ model_cost_tracking - Cost monitoring and optimization';
  RAISE NOTICE '  ✅ model_selection_decisions - Model selection analytics';
  RAISE NOTICE '  ✅ agent_model_preferences - Agent-specific configurations';
  RAISE NOTICE '  ✅ model_provider_status - Provider health monitoring';
  RAISE NOTICE '';
  RAISE NOTICE 'Features Enabled:';
  RAISE NOTICE '  ✅ Automatic performance summary updates';
  RAISE NOTICE '  ✅ Daily cost tracking automation';
  RAISE NOTICE '  ✅ Row Level Security (RLS)';
  RAISE NOTICE '  ✅ Optimized indexing for fast queries';
  RAISE NOTICE '  ✅ Default agent preferences configured';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for Phase 3: Multi-Model Orchestration! 🚀';
  RAISE NOTICE '========================================';
END $$; 