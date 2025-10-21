-- SkillSmith Tables Migration
-- Create tables for SkillSmith sports functionality

-- SkillSmith leads table for free scan tracking
CREATE TABLE IF NOT EXISTS skillsmith_leads (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  sport VARCHAR(100),
  scans_used INTEGER DEFAULT 0,
  first_scan_at TIMESTAMPTZ,
  last_scan_at TIMESTAMPTZ,
  source VARCHAR(100) DEFAULT 'sports_page',
  video_urls JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SkillSmith orders table for paid purchases
CREATE TABLE IF NOT EXISTS skillsmith_orders (
  id SERIAL PRIMARY KEY,
  stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
  product_sku VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL,
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  source VARCHAR(100),
  category VARCHAR(50) DEFAULT 'sports',
  status VARCHAR(50) DEFAULT 'pending',
  fulfilled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_skillsmith_leads_session_id ON skillsmith_leads(session_id);
CREATE INDEX IF NOT EXISTS idx_skillsmith_leads_email ON skillsmith_leads(email);
CREATE INDEX IF NOT EXISTS idx_skillsmith_leads_source ON skillsmith_leads(source);
CREATE INDEX IF NOT EXISTS idx_skillsmith_leads_created_at ON skillsmith_leads(created_at);

CREATE INDEX IF NOT EXISTS idx_skillsmith_orders_stripe_session_id ON skillsmith_orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_skillsmith_orders_product_sku ON skillsmith_orders(product_sku);
CREATE INDEX IF NOT EXISTS idx_skillsmith_orders_customer_email ON skillsmith_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_skillsmith_orders_status ON skillsmith_orders(status);
CREATE INDEX IF NOT EXISTS idx_skillsmith_orders_created_at ON skillsmith_orders(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE skillsmith_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillsmith_orders ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your auth requirements)
CREATE POLICY "Allow all access for now" ON skillsmith_leads FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON skillsmith_orders FOR ALL USING (true);
