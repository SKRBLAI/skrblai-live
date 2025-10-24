-- Quick diagnostic to check user_id column names
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN (
    'agent_launches',
    'founder_memberships',
    'founder_codes',
    'n8n_executions',
    'percy_intelligence_events',
    'percy_contexts',
    'agent_access_logs',
    'subscription_conversion_funnel',
    'system_health_logs'
)
AND column_name LIKE '%user%'
ORDER BY table_name, column_name;
