# Environment Variable Audit Report

## Required Environment Variables (Found in Codebase)

### Critical for App Boot/Runtime
- `NODE_ENV` - Should be "production" in Railway
- `PORT` - Railway provides this automatically
- `NEXT_PUBLIC_BASE_URL` - Should be "https://skrblai.io"
- `NEXT_PUBLIC_RAILWAY_ENV` - Railway environment indicator

### Supabase (Critical for DB/Auth)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (should start with 'eyJ')
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for server-side operations

### Payment Processing (Stripe)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key (pk_live_ or pk_test_)
- `STRIPE_SECRET_KEY` - Stripe secret key (sk_live_ or sk_test_)

### External Integrations
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `RESEND_API_KEY` - Email service API key
- `TWILIO_ACCOUNT_SID` - SMS service account SID
- `TWILIO_AUTH_TOKEN` - SMS service auth token  
- `TWILIO_PHONE_NUMBER` - SMS sender phone number
- `VIP_SMS_WHITELIST` - Comma-separated phone numbers

### Monitoring & Debugging
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry client-side DSN
- `SENTRY_DSN` - Sentry server-side DSN
- `NEXT_TELEMETRY_DISABLED` - Should be "1" in production

### N8N Workflow Automation
- `N8N_BASE_URL` - N8N instance URL
- `N8N_API_KEY` - N8N API key for workflow triggers
- `N8N_WORKFLOW_PUBLISH_BOOK` - Workflow ID for book publishing
- `N8N_WORKFLOW_SEND_PROPOSAL` - Workflow ID for proposals
- `N8N_WORKFLOW_SYNC_CONTENT` - Workflow ID for content sync
- `N8N_WORKFLOW_ONBOARD_USER` - Workflow ID for user onboarding

### Optional/Development
- `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` - LinkedIn integration (commented out)
- `NEXT_PUBLIC_REFAC_HOMEPAGE` - Feature flag for homepage refactor

## Validation Checklist for Railway

### Must Be Set (App Won't Boot Without These)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Check format: https://[project].supabase.co
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Check starts with 'eyJ'
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_BASE_URL=https://skrblai.io`
- [ ] `NEXT_TELEMETRY_DISABLED=1`

### Required for Core Features
- [ ] `STRIPE_SECRET_KEY` - Check starts with 'sk_'
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Check starts with 'pk_'
- [ ] `OPENAI_API_KEY` - Check starts with 'sk-'
- [ ] `RESEND_API_KEY` - For email functionality

### Service Role Key (If Used at Startup)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Only if server-side auth needed

## Common Issues That Cause 500 Errors

1. **Missing Supabase Keys**: App crashes on first database call
2. **Malformed URLs**: Base URL without https:// or trailing slash issues
3. **Wrong Environment Keys**: Using test keys in production
4. **Empty String Values**: Variables set but empty in Railway
5. **Trailing Spaces**: Copy-paste errors with extra whitespace

## Next Steps

1. Check Railway Variables dashboard
2. Verify no empty values or trailing spaces
3. Ensure Supabase keys are from correct project/environment
4. Test with curl after setting missing variables