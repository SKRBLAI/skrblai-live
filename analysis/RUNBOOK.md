# Dual Auth + Boost Hardening Runbook

This runbook provides step-by-step instructions for implementing and testing the dual authentication system with Boost Supabase hardening.

## Overview

The dual auth system supports three modes:
1. **Legacy Mode**: Original Supabase auth (default)
2. **Boost Mode**: New Supabase instance with enhanced security
3. **Clerk Mode**: Clerk authentication with Boost Supabase backend

## Environment Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure all required variables:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Legacy Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Legacy Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Legacy Supabase service role key
- `NEXT_PUBLIC_SUPABASE_URL_BOOST` - Boost Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST` - Boost Supabase anon key
- `SUPABASE_SECRET_API_KEY_BOOST` - Boost Supabase secret key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLERK_WEBHOOK_SECRET` - Clerk webhook secret
- `NEXT_PUBLIC_FF_CLERK` - Feature flag for Clerk (0 or 1)
- `FF_USE_BOOST_FOR_AUTH` - Feature flag for Boost (0 or 1)
- `NEXT_PUBLIC_SITE_URL` - Site URL for webhooks

### 2. Environment Validation

Run the environment validation script:

```bash
node scripts/check-env.mjs
```

This will exit with code 1 if any required variables are missing.

## Database Setup

### 1. Apply SQL Migration

Run the migration to add Clerk support:

```bash
# Using Supabase CLI
supabase db push

# Or using psql directly
psql -h your-db-host -U postgres -d your-db-name -f migrations/20250101_add_clerk_id_and_minimal_policies.sql
```

### 2. Verify Migration

Check that the migration was applied successfully:

```sql
-- Check if clerk_id column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'clerk_id';

-- Check if RLS policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_roles');
```

## Feature Flag Configuration

### Legacy Mode (Default)
```bash
NEXT_PUBLIC_FF_CLERK=0
FF_USE_BOOST_FOR_AUTH=0
```
- Uses original Supabase auth
- Routes: `/sign-in`, `/sign-up`, `/dashboard/*`

### Boost Mode
```bash
NEXT_PUBLIC_FF_CLERK=0
FF_USE_BOOST_FOR_AUTH=1
```
- Uses Boost Supabase auth
- Routes: `/auth2/sign-in`, `/auth2/sign-up`, `/auth2/callback`, `/udash/*`

### Clerk Mode
```bash
NEXT_PUBLIC_FF_CLERK=1
FF_USE_BOOST_FOR_AUTH=1
```
- Uses Clerk authentication
- Backend: Boost Supabase
- Routes: `/auth2/sign-in`, `/auth2/sign-up`, `/auth2/callback`, `/udash/*`

## Testing Procedures

### 1. Smoke Tests

Run the comprehensive smoke tests:

```bash
# Test all configurations
npm run test:smoke

# Or run individual tests
npm run test:smoke:ui
```

### 2. Manual Testing

#### Test Legacy Mode
1. Set flags: `NEXT_PUBLIC_FF_CLERK=0`, `FF_USE_BOOST_FOR_AUTH=0`
2. Visit `/dashboard` - should redirect to `/sign-in`
3. Sign in with existing credentials
4. Verify access to dashboard

#### Test Boost Mode
1. Set flags: `NEXT_PUBLIC_FF_CLERK=0`, `FF_USE_BOOST_FOR_AUTH=1`
2. Visit `/udash` - should redirect to `/auth2/sign-in`
3. Sign in with Boost credentials
4. Verify access to universal dashboard

#### Test Clerk Mode
1. Set flags: `NEXT_PUBLIC_FF_CLERK=1`, `FF_USE_BOOST_FOR_AUTH=1`
2. Visit `/udash` - should redirect to `/auth2/sign-in`
3. Sign in with Clerk
4. Verify webhook sync to Boost database
5. Verify access to universal dashboard

### 3. Diagnostics

Visit `/ops/diag` in development mode to check:
- Feature flag status
- Environment variable configuration
- Supabase connection health
- Webhook endpoint health
- Active authentication path

## Webhook Configuration

### Clerk Webhook Setup

1. In Clerk Dashboard, go to Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy webhook secret to `CLERK_WEBHOOK_SECRET`

### Webhook Testing

Test webhook delivery:

```bash
# Test webhook endpoint
curl -X HEAD https://your-domain.com/api/webhooks/clerk

# Should return 200 OK
```

## Troubleshooting

### Common Issues

1. **Environment Variables Missing**
   - Run `node scripts/check-env.mjs`
   - Check `.env.local` file

2. **Supabase Connection Failed**
   - Verify URLs and keys
   - Check network connectivity
   - Review Supabase project status

3. **Webhook Verification Failed**
   - Verify `CLERK_WEBHOOK_SECRET`
   - Check webhook URL configuration
   - Review Clerk webhook logs

4. **RLS Policy Errors**
   - Check migration was applied
   - Verify user permissions
   - Review policy definitions

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

### Rollback Procedures

To rollback to legacy mode:

1. Set feature flags to legacy values
2. Restart application
3. Verify `/dashboard` routes work
4. Check user authentication

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Webhook Secrets**: Rotate regularly
3. **RLS Policies**: Review and test thoroughly
4. **Service Role Keys**: Use only in server-side code
5. **Clerk Keys**: Keep secret keys secure

## Monitoring

Monitor the following:
- Authentication success/failure rates
- Webhook delivery success
- Database connection health
- Feature flag usage
- Error logs

## Support

For issues or questions:
1. Check diagnostics at `/ops/diag`
2. Review application logs
3. Verify environment configuration
4. Test with smoke test suite