-- SKRBL AI Personal Network Promo Codes
-- 15 promo codes for 30-day full access for personal contacts
-- Execute this script in your Supabase SQL editor

INSERT INTO promo_codes (code, type, usage_limit, benefits, metadata, expires_at, status, current_usage) VALUES
('FRIEND01', 'PROMO', 1, 
 '{"dashboard_access": true, "duration_days": 30, "features": ["all_agents", "premium_features", "advanced_analytics", "priority_support"], "access_level": "full"}',
 '{"description": "30-day full access for personal contact #1", "campaign": "personal_network_2025", "target_audience": "personal_contacts"}',
 '2025-03-31T23:59:59Z', 'active', 0),

('FRIEND02', 'PROMO', 1,
 '{"dashboard_access": true, "duration_days": 30, "features": ["all_agents", "premium_features", "advanced_analytics", "priority_support"], "access_level": "full"}',
 '{"description": "30-day full access for personal contact #2", "campaign": "personal_network_2025", "target_audience": "personal_contacts"}',
 '2025-03-31T23:59:59Z', 'active', 0),

('FRIEND03', 'PROMO', 1,
 '{"dashboard_access": true, "duration_days": 30, "features": ["all_agents", "premium_features", "advanced_analytics", "priority_support"], "access_level": "full"}',
 '{"description": "30-day full access for personal contact #3", "campaign": "personal_network_2025", "target_audience": "personal_contacts"}',
 '2025-03-31T23:59:59Z', 'active', 0),

('FRIEND04', 'PROMO', 1,
 '{"dashboard_access": true, "duration_days": 30, "features": ["all_agents", "premium_features", "advanced_analytics", "priority_support"], "access_level": "full"}',
 '{"description": "30-day full access for personal contact #4", "campaign": "personal_network_2025", "target_audience": "personal_contacts"}',
 '2025-03-31T23:59:59Z', 'active', 0),

('FRIEND05', 'PROMO', 1,
 '{"dashboard_access": true, "duration_days": 30, "features": ["all_agents", "premium_features", "advanced_analytics", "priority_support"], "access_level": "full"}',
 '{"description": "30-day full access for personal contact #5", "campaign": "personal_network_2025", "target_audience": "personal_contacts"}',
 '2025-03-31T23:59:59Z', 'active', 0),

('FRIEND06', 'PROMO', 1,
 '{"dashboard_access": true, "duration_days": 30, "features": ["all_agents", "premium_features", "advanced_analytics", "priority_support"], "access_level": "full"}',
 '{"description": "30-day full access for personal contact #6", "campaign": "personal_network_2025", "target_audience": "personal_contacts"}',
 '2025-03-31T23:59:59Z', 'active', 0),

('FRIEND07', 'PROMO', 1,
 '{"dashboard_access": true, "duration_days": 30, "features": ["all_agents", "premium_features", "advanced_analytics", "priority_support"], "access_level": "full"}',
 '{"description": "30-day full access for personal contact #7", "campaign": "personal_network_2025", "target_audience": "personal_contacts"}',
 '2025-03-31T23:59:59Z', 'active', 0),

('FRIEND08', 'PROMO', 1,
 '{"dashboard_access": true, "duration_days": 30, "features": ["all_agents", "premium_features", "advanced_analytics", "priority_support"], "access_level": "full"}',
 '{"description": "30-day full access for personal contact #8", "campaign": "personal_network_2025", "target_audience": "personal_contacts"}',
 '2025-03-31T23:59:59Z', 'active', 0),

('FRIEND09', 'PROMO', 1,
 '{"dashboard_access": true, "duration_days": 30, "features": ["all_agents", "premium_features", "advanced_analytics", "priority_support"], "access_level": "full"}',
 '{"description": "30-day full access for personal contact #9", "campaign": "personal_network_2025", "target_audience": "personal_contacts"}',
 '2025-03-31T23:59:59Z', 'active', 0),

('FRIEND10', 'PROMO', 1,
 '{"dashboard_access": true, "duration_days": 30, "features": ["all_agents", "premium_features", "advanced_analytics", "priority_support"], "access_level": "full"}',
 '{"description": "30-day full access for personal contact #10", "campaign": "personal_network_2025", "target_audience": "personal_contacts"}',
 '2025-03-31T23:59:59Z', 'active', 0),

('FRIEND11', 'PROMO', 1,
 '{"dashboard_access": true, "duration_days": 30, "features": ["all_agents", "premium_features", "advanced_analytics", "priority_support"], "access_level": "full"}',
 '{"description": "30-day full access for personal contact #11", "campaign": "personal_network_2025", "target_audience": "personal_contacts"}',
 '2025-03-31T23:59:59Z', 'active', 0),

('FRIEND12', 'PROMO', 1,
 '{"dashboard_access": true, "duration_days": 30, "features": ["all_agents", "premium_features", "advanced_analytics", "priority_support"], "access_level": "full"}',
 '{"description": "30-day full access for personal contact #12", "campaign": "personal_network_2025", "target_audience": "personal_contacts"}',
 '2025-03-31T23:59:59Z', 'active', 0),

('FRIEND13', 'PROMO', 1,
 '{"dashboard_access": true, "duration_days": 30, "features": ["all_agents", "premium_features", "advanced_analytics", "priority_support"], "access_level": "full"}',
 '{"description": "30-day full access for personal contact #13", "campaign": "personal_network_2025", "target_audience": "personal_contacts"}',
 '2025-03-31T23:59:59Z', 'active', 0),

('FRIEND14', 'PROMO', 1,
 '{"dashboard_access": true, "duration_days": 30, "features": ["all_agents", "premium_features", "advanced_analytics", "priority_support"], "access_level": "full"}',
 '{"description": "30-day full access for personal contact #14", "campaign": "personal_network_2025", "target_audience": "personal_contacts"}',
 '2025-03-31T23:59:59Z', 'active', 0),

('FRIEND15', 'PROMO', 1,
 '{"dashboard_access": true, "duration_days": 30, "features": ["all_agents", "premium_features", "advanced_analytics", "priority_support"], "access_level": "full"}',
 '{"description": "30-day full access for personal contact #15", "campaign": "personal_network_2025", "target_audience": "personal_contacts"}',
 '2025-03-31T23:59:59Z', 'active', 0);

-- Verify the codes were created
SELECT 
  code,
  type,
  usage_limit,
  benefits->>'access_level' as access_level,
  benefits->>'duration_days' as duration_days,
  expires_at,
  status
FROM promo_codes 
WHERE code LIKE 'FRIEND%' 
ORDER BY code; 