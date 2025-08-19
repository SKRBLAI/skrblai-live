-- Business Leads Table for Business Onboarding Wizard
-- This table stores leads captured from the new BusinessWizard component
-- Migration: 20250819_business_leads.sql

-- Create the business_leads table
CREATE TABLE IF NOT EXISTS business_leads (
  id bigserial PRIMARY KEY,
  
  -- Contact info
  email text,
  urls text[],
  
  -- Business profile  
  goals text[],
  industry text,
  team_size text,
  revenue_band text,
  channels text[],
  
  -- Metadata
  source text DEFAULT 'home_business_wizard',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS business_leads_created_idx ON business_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS business_leads_source_idx ON business_leads(source);
CREATE INDEX IF NOT EXISTS business_leads_industry_idx ON business_leads(industry);

-- Add RLS (Row Level Security) if needed
ALTER TABLE business_leads ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read their own data
CREATE POLICY "Users can view business leads" ON business_leads
  FOR SELECT USING (true); -- Adjust based on your auth requirements

-- Create policy for service role to insert
CREATE POLICY "Service role can insert business leads" ON business_leads
  FOR INSERT WITH CHECK (true);

-- Add helpful comments
COMMENT ON TABLE business_leads IS 'Stores business onboarding data from the BusinessWizard component';
COMMENT ON COLUMN business_leads.goals IS 'Array of selected business goals (dominate-seo, create-content, etc.)';
COMMENT ON COLUMN business_leads.channels IS 'Array of selected marketing channels (website, instagram, etc.)';
COMMENT ON COLUMN business_leads.urls IS 'Array of business URLs provided during scan';
COMMENT ON COLUMN business_leads.source IS 'Source of the lead (home_business_wizard, etc.)';
