-- Migration: Create percy_scans table for instant scan functionality
-- Date: 2024-12-20
-- Purpose: Store scan results and track usage for trial limits

CREATE TABLE IF NOT EXISTS percy_scans (
  id BIGSERIAL PRIMARY KEY,
  scan_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('website', 'linkedin', 'youtube')),
  scanned_url TEXT NOT NULL,
  analysis_result JSONB,
  agent_recommendations JSONB,
  upsell_suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_percy_scans_user_id ON percy_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_percy_scans_session_id ON percy_scans(session_id);
CREATE INDEX IF NOT EXISTS idx_percy_scans_scan_type ON percy_scans(scan_type);
CREATE INDEX IF NOT EXISTS idx_percy_scans_created_at ON percy_scans(created_at);
CREATE INDEX IF NOT EXISTS idx_percy_scans_scan_id ON percy_scans(scan_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_percy_scans_updated_at BEFORE UPDATE ON percy_scans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE percy_scans ENABLE ROW LEVEL SECURITY;

-- Users can only see their own scans
CREATE POLICY "Users can view own scans" ON percy_scans FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own scans" ON percy_scans FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own scans" ON percy_scans FOR UPDATE USING (auth.uid() = user_id);

-- Admin users can see all scans
CREATE POLICY "Admins can view all scans" ON percy_scans FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Grant permissions
GRANT ALL ON percy_scans TO authenticated;
GRANT ALL ON percy_scans TO service_role;
GRANT USAGE, SELECT ON SEQUENCE percy_scans_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE percy_scans_id_seq TO service_role; 