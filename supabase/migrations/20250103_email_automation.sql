-- Create email_sequences table for tracking user email journeys
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sequence_id TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('signup', 'trial_start', 'upgrade_prompt', 'agent_first_use', 'workflow_complete')),
  user_role TEXT NOT NULL DEFAULT 'client',
  metadata JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_email_sent TIMESTAMPTZ
);

-- Create email_logs table for tracking individual email sends
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID REFERENCES email_sequences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_step_id TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'failed')),
  provider_message_id TEXT,
  n8n_execution_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create email_templates table for storing email content
CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_variables JSONB DEFAULT '{}',
  category TEXT DEFAULT 'general',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_sequences_user_id ON email_sequences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_sequences_sequence_id ON email_sequences(sequence_id);
CREATE INDEX IF NOT EXISTS idx_email_sequences_trigger ON email_sequences(trigger_type);
CREATE INDEX IF NOT EXISTS idx_email_sequences_active ON email_sequences(active);

CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sequence_id ON email_logs(sequence_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(active);

-- Row Level Security (RLS) policies
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Users can only see their own email sequences and logs
CREATE POLICY "Users can view own email sequences" ON email_sequences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own email logs" ON email_logs
  FOR SELECT USING (user_id = auth.uid());

-- Templates are readable by all authenticated users
CREATE POLICY "Email templates are readable by authenticated users" ON email_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Service role can access all data
CREATE POLICY "Service role full access to email_sequences" ON email_sequences
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to email_logs" ON email_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to email_templates" ON email_templates
  FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT SELECT ON email_sequences TO authenticated;
GRANT SELECT ON email_logs TO authenticated;
GRANT SELECT ON email_templates TO authenticated;
GRANT ALL ON email_sequences TO service_role;
GRANT ALL ON email_logs TO service_role;
GRANT ALL ON email_templates TO service_role;

-- Insert default email templates
INSERT INTO email_templates (id, name, subject, html_content, category) VALUES
('welcome-immediate', 'Welcome Email', '🎉 Welcome to the League of Digital Superheroes!', 
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #1E90FF, #30D5C8); padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">SKRBL AI</h1>
      <p style="color: white; margin: 5px 0;">League of Digital Superheroes</p>
    </div>
    <div style="padding: 20px;">
      <h2>🎉 Welcome {{userName}}!</h2>
      <p>You''ve just joined the most advanced AI automation platform on the planet!</p>
      <p>Percy, your AI Concierge, is ready to help you unlock creative superpowers and automate your workflow.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{dashboardUrl}}" style="background: #1E90FF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
          🚀 Start Your Journey
        </a>
      </div>
      <p>Here''s what you can do right away:</p>
      <ul>
        <li>🎨 Create stunning content with our Content Creator Agent</li>
        <li>📈 Boost your social presence with Social Media Agent</li>
        <li>🎯 Generate compelling ads with Ad Creative Agent</li>
        <li>📊 Analyze your performance with Analytics Agent</li>
      </ul>
    </div>
  </div>', 'onboarding'),

('upgrade-benefits', 'Premium Upgrade Benefits', '💎 Unlock Premium Features - Limited Time Offer',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #1E90FF, #30D5C8); padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">SKRBL AI Pro</h1>
      <p style="color: white; margin: 5px 0;">Unlock Your Full Potential</p>
    </div>
    <div style="padding: 20px;">
      <h2>💎 Ready for Premium Features?</h2>
      <p>Hi {{userName}}, we noticed you''ve been exploring {{agentName}} - great choice!</p>
      <p>You''re just one step away from unlocking unlimited automation power:</p>
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>🚀 Pro Features Include:</h3>
        <ul>
          <li>✅ Unlimited agent usage</li>
          <li>✅ Advanced workflow automation</li>
          <li>✅ Priority processing</li>
          <li>✅ Custom integrations</li>
          <li>✅ 24/7 premium support</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{upgradeUrl}}" style="background: linear-gradient(135deg, #1E90FF, #30D5C8); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          🎯 Upgrade to Pro Now
        </a>
      </div>
    </div>
  </div>', 'conversion'),

('agent-next-steps', 'Agent Follow-up', '🎯 Great job! Here''s what to do next with {{agentName}}',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #1E90FF, #30D5C8); padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">SKRBL AI</h1>
      <p style="color: white; margin: 5px 0;">Agent Success Guide</p>
    </div>
    <div style="padding: 20px;">
      <h2>🎯 Awesome work with {{agentName}}!</h2>
      <p>You''ve just experienced the power of AI automation. Here''s how to get even more value:</p>
      <div style="background: #f0f8ff; padding: 15px; border-left: 4px solid #1E90FF; margin: 20px 0;">
        <h3>💡 Pro Tips for {{agentName}}:</h3>
        <ul>
          <li>Try combining it with other agents for powerful workflows</li>
          <li>Save your favorite prompts for quick access</li>
          <li>Experiment with different input styles for varied results</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{agentUrl}}" style="background: #30D5C8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          🔄 Use {{agentName}} Again
        </a>
      </div>
    </div>
  </div>', 'engagement'); 