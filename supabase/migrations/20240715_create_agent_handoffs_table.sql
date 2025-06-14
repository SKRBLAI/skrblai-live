CREATE TABLE IF NOT EXISTS agent_handoffs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  source_agent_id TEXT NOT NULL,
  target_agent_id TEXT NOT NULL,
  source_execution_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('recommended', 'executed', 'completed', 'failed')),
  recommendation_details JSONB,
  execution_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE agent_handoffs IS 'Logs every agent-to-agent handoff event for workflow tracing and analytics.';
COMMENT ON COLUMN agent_handoffs.status IS 'The current state of the handoff process.';
COMMENT ON COLUMN agent_handoffs.recommendation_details IS 'Stores the HandoffRecommendation object.';
COMMENT ON COLUMN agent_handoffs.execution_details IS 'Stores the HandoffExecution object.';

-- Indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_handoffs_source_agent ON agent_handoffs(source_agent_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_target_agent ON agent_handoffs(target_agent_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_user_id ON agent_handoffs(user_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_status ON agent_handoffs(status);

ALTER TABLE agent_handoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin access" ON agent_handoffs FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Allow user to see their own handoffs" ON agent_handoffs FOR SELECT
  USING (auth.uid() = user_id);

GRANT ALL ON TABLE agent_handoffs TO service_role;
GRANT SELECT ON TABLE agent_handoffs TO authenticated; 