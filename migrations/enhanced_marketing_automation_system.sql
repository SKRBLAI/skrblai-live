-- Enhanced Marketing Automation System Migration
-- This adds comprehensive lead nurturing, scoring, segmentation, and campaign management

-- ==========================================
-- 1. ENHANCED LEAD MANAGEMENT
-- ==========================================

-- Enhanced leads table with scoring and segmentation
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS segment TEXT DEFAULT 'cold';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_source TEXT DEFAULT 'organic';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_touch_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT DEFAULT 'subscriber';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_tags JSONB DEFAULT '[]';

-- Lead scoring activities table
CREATE TABLE IF NOT EXISTS lead_scoring_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'email_open', 'email_click', 'page_view', 'form_submit', 'download',
    'agent_interaction', 'trial_signup', 'upgrade_view', 'video_watch',
    'demo_request', 'pricing_view', 'feature_exploration'
  )),
  activity_value TEXT,
  score_change INTEGER DEFAULT 0,
  current_score INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead lifecycle transitions
CREATE TABLE IF NOT EXISTS lead_lifecycle_transitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  trigger_type TEXT, -- 'manual', 'score_threshold', 'campaign_action', 'time_based'
  trigger_metadata JSONB DEFAULT '{}',
  transitioned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. CAMPAIGN MANAGEMENT SYSTEM
-- ==========================================

-- Marketing campaigns table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN (
    'email_sequence', 'drip_campaign', 'behavioral_trigger', 
    'lead_magnet', 'retargeting', 'onboarding', 'winback'
  )),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  target_segment JSONB DEFAULT '{}', -- Criteria for targeting
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  goals JSONB DEFAULT '{}', -- Conversion goals, engagement targets
  budget_cents INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  n8n_workflow_id TEXT,
  n8n_webhook_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign performance metrics
CREATE TABLE IF NOT EXISTS campaign_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  metric_date DATE DEFAULT CURRENT_DATE,
  leads_generated INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_cents INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(campaign_id, metric_date)
);

-- Campaign enrollments (which leads are in which campaigns)
CREATE TABLE IF NOT EXISTS campaign_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  current_step INTEGER DEFAULT 1,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'unsubscribed')),
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(campaign_id, lead_id)
);

-- ==========================================
-- 3. DRIP CAMPAIGN SYSTEM
-- ==========================================

-- Drip campaign templates
CREATE TABLE IF NOT EXISTS drip_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'signup', 'trial_start', 'trial_end', 'first_agent_use', 'upgrade_abandonment',
    'inactive_user', 'high_value_action', 'segment_entry', 'manual'
  )),
  target_criteria JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drip campaign steps
CREATE TABLE IF NOT EXISTS drip_campaign_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES drip_campaigns(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('email', 'sms', 'push', 'webhook', 'delay', 'condition')),
  delay_hours INTEGER DEFAULT 0,
  conditions JSONB DEFAULT '{}', -- Conditions for execution
  email_template_id TEXT,
  subject TEXT,
  content TEXT,
  n8n_action JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(campaign_id, step_number)
);

-- User enrollments in drip campaigns
CREATE TABLE IF NOT EXISTS drip_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES drip_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 1,
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  next_action_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'unsubscribed')),
  completion_rate FLOAT DEFAULT 0.0,
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(campaign_id, user_id)
);

-- Drip execution log
CREATE TABLE IF NOT EXISTS drip_execution_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES drip_enrollments(id) ON DELETE CASCADE,
  step_id UUID REFERENCES drip_campaign_steps(id) ON DELETE CASCADE,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'failed')),
  error_message TEXT,
  execution_data JSONB DEFAULT '{}',
  n8n_execution_id TEXT
);

-- ==========================================
-- 4. LEAD MAGNETS & CONTENT DISTRIBUTION
-- ==========================================

-- Lead magnets table
CREATE TABLE IF NOT EXISTS lead_magnets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  magnet_type TEXT NOT NULL CHECK (magnet_type IN (
    'ebook', 'whitepaper', 'template', 'checklist', 'webinar', 
    'free_trial', 'consultation', 'tool', 'guide', 'video_series'
  )),
  file_url TEXT,
  thumbnail_url TEXT,
  landing_page_url TEXT,
  download_count INTEGER DEFAULT 0,
  conversion_rate FLOAT DEFAULT 0.0,
  target_segment JSONB DEFAULT '{}',
  value_score INTEGER DEFAULT 50, -- How valuable this magnet is (1-100)
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead magnet downloads tracking
CREATE TABLE IF NOT EXISTS lead_magnet_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  magnet_id UUID REFERENCES lead_magnets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  download_date TIMESTAMPTZ DEFAULT NOW(),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  ip_address INET,
  user_agent TEXT,
  follow_up_sent BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'
);

-- ==========================================
-- 5. BEHAVIORAL AUTOMATION TRIGGERS
-- ==========================================

-- Automation rules table
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL, -- 'page_view', 'email_click', 'score_threshold', etc.
  trigger_conditions JSONB DEFAULT '{}',
  action_type TEXT NOT NULL CHECK (action_type IN (
    'send_email', 'add_to_campaign', 'update_score', 'change_segment', 
    'create_task', 'send_webhook', 'trigger_n8n'
  )),
  action_config JSONB DEFAULT '{}',
  delay_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 100,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automation execution log
CREATE TABLE IF NOT EXISTS automation_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES automation_rules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  trigger_data JSONB DEFAULT '{}',
  execution_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed', 'skipped')),
  result_data JSONB DEFAULT '{}',
  error_message TEXT,
  execution_time_ms INTEGER
);

-- ==========================================
-- 6. ATTRIBUTION & ANALYTICS
-- ==========================================

-- Attribution touchpoints
CREATE TABLE IF NOT EXISTS attribution_touchpoints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  touchpoint_type TEXT NOT NULL, -- 'first_touch', 'last_touch', 'multi_touch'
  channel TEXT NOT NULL, -- 'organic', 'paid_search', 'social', 'email', 'direct'
  source TEXT, -- 'google', 'facebook', 'email_campaign_id'
  medium TEXT, -- 'cpc', 'email', 'social', 'organic'
  campaign TEXT,
  content TEXT,
  value_cents INTEGER DEFAULT 0,
  conversion_type TEXT, -- 'lead', 'trial', 'purchase', 'upgrade'
  touchpoint_date TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  page_url TEXT,
  referrer TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Marketing qualified leads (MQL) tracking
CREATE TABLE IF NOT EXISTS mql_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mql_date TIMESTAMPTZ DEFAULT NOW(),
  qualification_score INTEGER NOT NULL,
  qualification_criteria JSONB DEFAULT '{}',
  assigned_to UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'opportunity', 'customer', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. PERFORMANCE INDEXES
-- ==========================================

-- Lead scoring activities indexes
CREATE INDEX IF NOT EXISTS idx_lead_scoring_activities_lead_id ON lead_scoring_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_scoring_activities_user_id ON lead_scoring_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_scoring_activities_type ON lead_scoring_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_lead_scoring_activities_created_at ON lead_scoring_activities(created_at);

-- Campaign management indexes
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_type ON marketing_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaign_enrollments_campaign_id ON campaign_enrollments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_enrollments_lead_id ON campaign_enrollments(lead_id);

-- Drip campaign indexes
CREATE INDEX IF NOT EXISTS idx_drip_enrollments_campaign_id ON drip_enrollments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_drip_enrollments_user_id ON drip_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_drip_enrollments_status ON drip_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_drip_enrollments_next_action ON drip_enrollments(next_action_date);

-- Attribution indexes
CREATE INDEX IF NOT EXISTS idx_attribution_touchpoints_user_id ON attribution_touchpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_attribution_touchpoints_lead_id ON attribution_touchpoints(lead_id);
CREATE INDEX IF NOT EXISTS idx_attribution_touchpoints_channel ON attribution_touchpoints(channel);
CREATE INDEX IF NOT EXISTS idx_attribution_touchpoints_date ON attribution_touchpoints(touchpoint_date);

-- Enhanced leads table indexes
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_leads_segment ON leads(segment);
CREATE INDEX IF NOT EXISTS idx_leads_lifecycle_stage ON leads(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_leads_last_activity ON leads(last_activity_date);

-- ==========================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS on all new tables
ALTER TABLE lead_scoring_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_lifecycle_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_campaign_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_execution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_magnet_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribution_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE mql_tracking ENABLE ROW LEVEL SECURITY;

-- Service role policies (full access)
CREATE POLICY "Service role full access to lead_scoring_activities" ON lead_scoring_activities FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access to marketing_campaigns" ON marketing_campaigns FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access to campaign_metrics" ON campaign_metrics FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access to drip_campaigns" ON drip_campaigns FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access to lead_magnets" ON lead_magnets FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access to automation_rules" ON automation_rules FOR ALL TO service_role USING (true);

-- User policies (users can see their own data)
CREATE POLICY "Users can view own lead activities" ON lead_scoring_activities FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own campaign enrollments" ON campaign_enrollments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own drip enrollments" ON drip_enrollments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own magnet downloads" ON lead_magnet_downloads FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own attribution data" ON attribution_touchpoints FOR SELECT USING (user_id = auth.uid());

-- ==========================================
-- 9. GRANTS & PERMISSIONS
-- ==========================================

-- Grant permissions to service role
GRANT ALL ON lead_scoring_activities TO service_role;
GRANT ALL ON lead_lifecycle_transitions TO service_role;
GRANT ALL ON marketing_campaigns TO service_role;
GRANT ALL ON campaign_metrics TO service_role;
GRANT ALL ON campaign_enrollments TO service_role;
GRANT ALL ON drip_campaigns TO service_role;
GRANT ALL ON drip_campaign_steps TO service_role;
GRANT ALL ON drip_enrollments TO service_role;
GRANT ALL ON drip_execution_log TO service_role;
GRANT ALL ON lead_magnets TO service_role;
GRANT ALL ON lead_magnet_downloads TO service_role;
GRANT ALL ON automation_rules TO service_role;
GRANT ALL ON automation_executions TO service_role;
GRANT ALL ON attribution_touchpoints TO service_role;
GRANT ALL ON mql_tracking TO service_role;

-- Grant read permissions to authenticated users for their own data
GRANT SELECT ON lead_scoring_activities TO authenticated;
GRANT SELECT ON campaign_enrollments TO authenticated;
GRANT SELECT ON drip_enrollments TO authenticated;
GRANT SELECT ON lead_magnet_downloads TO authenticated;
GRANT SELECT ON attribution_touchpoints TO authenticated; 