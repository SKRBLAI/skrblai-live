-- General Leads Table for Exit-Intent and Lead Magnets
-- This table stores all leads captured across the platform
-- Migration: 20250122_leads_table.sql

-- Create the leads table (general purpose)
CREATE TABLE IF NOT EXISTS leads (
  id bigserial PRIMARY KEY,
  
  -- Contact info
  email text NOT NULL,
  name text,
  
  -- Lead source tracking
  source text NOT NULL DEFAULT 'unknown', -- exit_intent, pricing, cta, modal, etc.
  page_path text, -- where they were when captured
  vertical text, -- business, sports, or null
  
  -- Campaign/offer tracking
  offer_type text, -- launch40, exit_capture, free_scan, etc.
  campaign text,
  referrer text,
  
  -- Lead qualification
  status text DEFAULT 'new', -- new, contacted, qualified, converted, unsubscribed
  score integer DEFAULT 0, -- lead scoring 0-100
  
  -- Additional data (JSON for flexibility)
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_source_idx ON leads(source);
CREATE INDEX IF NOT EXISTS leads_vertical_idx ON leads(vertical);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to manage all leads
CREATE POLICY "Service role can manage leads" ON leads
  FOR ALL USING (true);

-- Create policy for authenticated users to view leads (admin dashboard)
CREATE POLICY "Authenticated users can view leads" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

-- Add helpful comments
COMMENT ON TABLE leads IS 'General purpose leads table for all lead capture across the platform';
COMMENT ON COLUMN leads.source IS 'Source of lead capture: exit_intent, pricing_modal, percy_scan, etc.';
COMMENT ON COLUMN leads.vertical IS 'Business vertical: business, sports, or null for general';
COMMENT ON COLUMN leads.offer_type IS 'Type of offer/lead magnet: launch40, exit_capture, free_scan, etc.';
COMMENT ON COLUMN leads.metadata IS 'Additional lead data in JSON format for flexibility';
COMMENT ON COLUMN leads.score IS 'Lead scoring from 0-100 based on engagement and profile';

-- Insert some sample data for testing (optional)
INSERT INTO leads (email, source, page_path, vertical, offer_type, metadata) VALUES
('test@example.com', 'exit_intent', '/pricing', 'business', 'launch40', '{"trigger": "pricing_page"}'),
('demo@skrblai.io', 'percy_modal', '/agents', 'sports', 'free_scan', '{"agent": "skillsmith", "confidence": 95}')
ON CONFLICT DO NOTHING;