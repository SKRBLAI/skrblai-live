-- SKRBL AI VIP User List Setup
-- Create VIP users for direct outreach and partnership opportunities
-- Execute this script in your Supabase SQL editor

-- High-Priority VIP Prospects for Direct Outreach
INSERT INTO vip_users (email, domain, company_name, vip_level, industry, vip_score, is_vip, recognition_count, scoring_breakdown, metadata) VALUES

-- Enterprise Tech Leaders (Ultra High Priority)
('partnerships@openai.com', 'openai.com', 'OpenAI', 'enterprise', 'AI/Technology', 100, true, 1,
 '{"manual_admin_assignment": true, "industry_recognition": true, "company_reputation": "ultra_high", "assigned_at": "2025-01-06T00:00:00Z"}',
 '{"priority": "ultra_high", "auto_generated": true, "created_for": "marketing_campaign_2025", "outreach_status": "pending"}'),

('business@microsoft.com', 'microsoft.com', 'Microsoft', 'enterprise', 'Technology', 100, true, 1,
 '{"manual_admin_assignment": true, "industry_recognition": true, "company_reputation": "ultra_high", "assigned_at": "2025-01-06T00:00:00Z"}',
 '{"priority": "ultra_high", "auto_generated": true, "created_for": "marketing_campaign_2025", "outreach_status": "pending"}'),

('partnerships@google.com', 'google.com', 'Google', 'enterprise', 'Technology', 100, true, 1,
 '{"manual_admin_assignment": true, "industry_recognition": true, "company_reputation": "ultra_high", "assigned_at": "2025-01-06T00:00:00Z"}',
 '{"priority": "ultra_high", "auto_generated": true, "created_for": "marketing_campaign_2025", "outreach_status": "pending"}'),

-- Marketing & SaaS Platforms (High Priority)
('partnerships@hubspot.com', 'hubspot.com', 'HubSpot', 'platinum', 'Marketing Technology', 85, true, 1,
 '{"manual_admin_assignment": true, "industry_recognition": true, "company_reputation": "high", "assigned_at": "2025-01-06T00:00:00Z"}',
 '{"priority": "high", "auto_generated": true, "created_for": "marketing_campaign_2025", "outreach_status": "pending"}'),

('business@mailchimp.com', 'mailchimp.com', 'Mailchimp', 'platinum', 'Email Marketing', 85, true, 1,
 '{"manual_admin_assignment": true, "industry_recognition": true, "company_reputation": "high", "assigned_at": "2025-01-06T00:00:00Z"}',
 '{"priority": "high", "auto_generated": true, "created_for": "marketing_campaign_2025", "outreach_status": "pending"}'),

('partnerships@salesforce.com', 'salesforce.com', 'Salesforce', 'platinum', 'CRM/Sales Technology', 85, true, 1,
 '{"manual_admin_assignment": true, "industry_recognition": true, "company_reputation": "high", "assigned_at": "2025-01-06T00:00:00Z"}',
 '{"priority": "high", "auto_generated": true, "created_for": "marketing_campaign_2025", "outreach_status": "pending"}'),

-- Content Creator Platforms (High Priority)
('creator-partnerships@youtube.com', 'youtube.com', 'YouTube', 'platinum', 'Content Platform', 85, true, 1,
 '{"manual_admin_assignment": true, "industry_recognition": true, "company_reputation": "high", "assigned_at": "2025-01-06T00:00:00Z"}',
 '{"priority": "high", "auto_generated": true, "created_for": "marketing_campaign_2025", "outreach_status": "pending"}'),

('business@tiktok.com', 'tiktok.com', 'TikTok', 'gold', 'Social Media', 70, true, 1,
 '{"manual_admin_assignment": true, "industry_recognition": true, "company_reputation": "high", "assigned_at": "2025-01-06T00:00:00Z"}',
 '{"priority": "high", "auto_generated": true, "created_for": "marketing_campaign_2025", "outreach_status": "pending"}'),

('partnerships@instagram.com', 'instagram.com', 'Instagram/Meta', 'gold', 'Social Media', 70, true, 1,
 '{"manual_admin_assignment": true, "industry_recognition": true, "company_reputation": "high", "assigned_at": "2025-01-06T00:00:00Z"}',
 '{"priority": "high", "auto_generated": true, "created_for": "marketing_campaign_2025", "outreach_status": "pending"}'),

-- Major Brands (Medium-High Priority)
('digital@nike.com', 'nike.com', 'Nike', 'gold', 'Consumer Brands', 70, true, 1,
 '{"manual_admin_assignment": true, "industry_recognition": true, "company_reputation": "medium", "assigned_at": "2025-01-06T00:00:00Z"}',
 '{"priority": "medium", "auto_generated": true, "created_for": "marketing_campaign_2025", "outreach_status": "pending"}'),

('marketing@coca-cola.com', 'coca-cola.com', 'Coca-Cola', 'gold', 'Consumer Brands', 70, true, 1,
 '{"manual_admin_assignment": true, "industry_recognition": true, "company_reputation": "medium", "assigned_at": "2025-01-06T00:00:00Z"}',
 '{"priority": "medium", "auto_generated": true, "created_for": "marketing_campaign_2025", "outreach_status": "pending"}'),

('innovation@disney.com', 'disney.com', 'Disney', 'gold', 'Entertainment', 70, true, 1,
 '{"manual_admin_assignment": true, "industry_recognition": true, "company_reputation": "medium", "assigned_at": "2025-01-06T00:00:00Z"}',
 '{"priority": "medium", "auto_generated": true, "created_for": "marketing_campaign_2025", "outreach_status": "pending"}'),

-- Agency & Service Providers (Medium Priority)
('partnerships@wpp.com', 'wpp.com', 'WPP Group', 'gold', 'Advertising Agency', 65, true, 1,
 '{"manual_admin_assignment": true, "industry_recognition": true, "company_reputation": "medium", "assigned_at": "2025-01-06T00:00:00Z"}',
 '{"priority": "medium", "auto_generated": true, "created_for": "marketing_campaign_2025", "outreach_status": "pending"}'),

('business@publicis.com', 'publicis.com', 'Publicis Groupe', 'gold', 'Marketing Agency', 65, true, 1,
 '{"manual_admin_assignment": true, "industry_recognition": true, "company_reputation": "medium", "assigned_at": "2025-01-06T00:00:00Z"}',
 '{"priority": "medium", "auto_generated": true, "created_for": "marketing_campaign_2025", "outreach_status": "pending"}');

-- Create VIP promo codes for direct invitation
INSERT INTO promo_codes (code, type, usage_limit, benefits, metadata, expires_at, status, current_usage) VALUES
('VIP_OPENAI', 'VIP', 1,
 '{"dashboard_access": true, "vip_level": "enterprise", "features": ["full_vip_access", "white_label", "priority_support", "custom_integration"], "access_level": "enterprise"}',
 '{"description": "Enterprise VIP access for OpenAI partnership", "campaign": "enterprise_partnerships", "target_audience": "enterprise_vip"}',
 '2025-06-30T23:59:59Z', 'active', 0),

('VIP_MICROSOFT', 'VIP', 1,
 '{"dashboard_access": true, "vip_level": "enterprise", "features": ["full_vip_access", "white_label", "priority_support", "custom_integration"], "access_level": "enterprise"}',
 '{"description": "Enterprise VIP access for Microsoft partnership", "campaign": "enterprise_partnerships", "target_audience": "enterprise_vip"}',
 '2025-06-30T23:59:59Z', 'active', 0),

('VIP_GOOGLE', 'VIP', 1,
 '{"dashboard_access": true, "vip_level": "enterprise", "features": ["full_vip_access", "white_label", "priority_support", "custom_integration"], "access_level": "enterprise"}',
 '{"description": "Enterprise VIP access for Google partnership", "campaign": "enterprise_partnerships", "target_audience": "enterprise_vip"}',
 '2025-06-30T23:59:59Z', 'active', 0),

('VIP_HUBSPOT', 'VIP', 1,
 '{"dashboard_access": true, "vip_level": "platinum", "features": ["full_vip_access", "priority_support", "integration_support"], "access_level": "vip"}',
 '{"description": "Platinum VIP access for HubSpot partnership", "campaign": "platform_partnerships", "target_audience": "platform_vip"}',
 '2025-04-30T23:59:59Z', 'active', 0),

('VIP_YOUTUBE', 'VIP', 1,
 '{"dashboard_access": true, "vip_level": "platinum", "features": ["full_vip_access", "priority_support", "creator_tools"], "access_level": "vip"}',
 '{"description": "Platinum VIP access for YouTube partnership", "campaign": "creator_partnerships", "target_audience": "creator_vip"}',
 '2025-04-30T23:59:59Z', 'active', 0);

-- Verify VIP users were created
SELECT 
  email,
  company_name,
  vip_level,
  industry,
  vip_score,
  metadata->>'priority' as priority,
  metadata->>'outreach_status' as outreach_status
FROM vip_users 
WHERE metadata->>'created_for' = 'marketing_campaign_2025'
ORDER BY vip_score DESC, company_name;

-- Verify VIP promo codes were created
SELECT 
  code,
  type,
  benefits->>'vip_level' as vip_level,
  benefits->>'access_level' as access_level,
  expires_at,
  status
FROM promo_codes 
WHERE code LIKE 'VIP_%' 
ORDER BY code; 