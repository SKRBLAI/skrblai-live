-- Migration: Webhook Errors Logging Table
-- Description: Adds table for logging webhook failures and monitoring
-- Generated by Cursor AI Assistant on 2025-01-06

-- ============================================================================
-- webhook_errors table for monitoring webhook failures
-- ============================================================================
CREATE TABLE IF NOT EXISTS webhook_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_path TEXT NOT NULL,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id TEXT,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  payload JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_errors_timestamp ON webhook_errors(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_errors_event_type ON webhook_errors(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_errors_user_id ON webhook_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_errors_webhook_path ON webhook_errors(webhook_path);

-- RLS Policies
ALTER TABLE webhook_errors ENABLE ROW LEVEL SECURITY;

-- Only service role can access webhook errors (admin/monitoring only)
CREATE POLICY "Service role full access on webhook_errors" ON webhook_errors
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT ON webhook_errors TO service_role;

-- Comment
COMMENT ON TABLE webhook_errors IS 'Logs webhook failures for monitoring and debugging n8n integrations'; 