-- Create Percy analytics table for tracking conversation funnel
CREATE TABLE IF NOT EXISTS percy_analytics (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  step_number INTEGER,
  user_choice TEXT,
  session_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(100),
  qualification_score INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_percy_analytics_event_type ON percy_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_percy_analytics_session_id ON percy_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_percy_analytics_created_at ON percy_analytics(created_at);

-- Create leads table if it doesn't exist
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company_size VARCHAR(50),
  problem TEXT,
  industry VARCHAR(100),
  timeline VARCHAR(100),
  qualification_score INTEGER DEFAULT 0,
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_qualification_score ON leads(qualification_score);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at); 