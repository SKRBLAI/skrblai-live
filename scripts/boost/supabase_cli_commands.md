# Supabase CLI Commands for Boost Migration

## Prerequisites
- Supabase CLI installed
- Boost project created
- Environment variables configured

## Database Setup

### 1. Initialize Supabase Project
```bash
# Initialize Supabase in project directory
supabase init

# Link to Boost project
supabase link --project-ref YOUR_PROJECT_REF
```

### 2. Apply Schema Migration
```bash
# Apply the Boost schema
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > lib/supabase/types.ts
```

### 3. Set Environment Variables
```bash
# Set project URL
supabase secrets set NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Set anon key
supabase secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Set service role key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Storage Setup

### 1. Create Storage Buckets
```bash
# Create public bucket
supabase storage create public --public

# Create private bucket
supabase storage create private

# Create avatars bucket
supabase storage create avatars
```

### 2. Set Storage Policies
```bash
# Apply storage policies (run the SQL from boost_schema.sql)
supabase db push
```

## Authentication Setup

### 1. Configure Google OAuth
```bash
# Set Google OAuth credentials
supabase secrets set NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
supabase secrets set NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 2. Configure Redirect URLs
```bash
# Set redirect URLs in Supabase dashboard
# https://skrblai.io/auth/callback
# https://skrblai.io/dashboard
# https://skrblai.io/thanks
# https://skrblai.io/cancel
```

## Testing Commands

### 1. Test Database Connection
```bash
# Test connection
supabase db ping

# Test queries
supabase db shell
```

### 2. Test Storage
```bash
# Test storage access
supabase storage ls

# Test file upload
supabase storage upload public test.txt
```

### 3. Test Authentication
```bash
# Test OAuth flow
supabase auth sign-in --provider google
```

## Migration Commands

### 1. Export Current Data
```bash
# Export profiles
supabase db dump --data-only --table profiles > profiles_backup.sql

# Export user_roles
supabase db dump --data-only --table user_roles > user_roles_backup.sql
```

### 2. Import to Boost
```bash
# Import profiles
supabase db reset --db-url "postgresql://postgres:password@localhost:54322/postgres" < profiles_backup.sql

# Import user_roles
supabase db reset --db-url "postgresql://postgres:password@localhost:54322/postgres" < user_roles_backup.sql
```

## Verification Commands

### 1. Check Database Status
```bash
# Check tables
supabase db shell -c "\dt"

# Check policies
supabase db shell -c "\dp"

# Check functions
supabase db shell -c "\df"
```

### 2. Check Storage Status
```bash
# List buckets
supabase storage ls

# Check bucket policies
supabase db shell -c "SELECT * FROM storage.buckets;"
```

### 3. Check Authentication
```bash
# Check auth providers
supabase auth providers

# Check redirect URLs
supabase auth settings
```

## Troubleshooting

### 1. Connection Issues
```bash
# Check connection
supabase status

# Restart services
supabase stop
supabase start
```

### 2. Migration Issues
```bash
# Check migration status
supabase migration list

# Rollback migration
supabase migration rollback
```

### 3. Storage Issues
```bash
# Check storage status
supabase storage ls

# Reset storage
supabase storage reset
```

## Production Deployment

### 1. Deploy to Production
```bash
# Deploy database changes
supabase db push --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy

# Deploy edge functions
supabase edge functions deploy
```

### 2. Verify Production
```bash
# Check production status
supabase status --project-ref YOUR_PROJECT_REF

# Test production endpoints
curl https://skrblai.io/api/_probe/supabase
curl https://skrblai.io/api/_probe/flags
```

## Rollback Commands

### 1. Rollback Database
```bash
# Rollback to previous migration
supabase migration rollback --project-ref YOUR_PROJECT_REF

# Restore from backup
supabase db reset --project-ref YOUR_PROJECT_REF < backup.sql
```

### 2. Rollback Environment
```bash
# Revert environment variables in Railway
# Redeploy application
# Verify rollback success
```

## Monitoring Commands

### 1. Check Logs
```bash
# Check database logs
supabase logs --project-ref YOUR_PROJECT_REF

# Check function logs
supabase functions logs --project-ref YOUR_PROJECT_REF
```

### 2. Check Metrics
```bash
# Check database metrics
supabase db metrics --project-ref YOUR_PROJECT_REF

# Check storage metrics
supabase storage metrics --project-ref YOUR_PROJECT_REF
```

## Security Commands

### 1. Check RLS Policies
```bash
# List all policies
supabase db shell -c "SELECT * FROM pg_policies WHERE schemaname = 'public';"

# Check policy effectiveness
supabase db shell -c "SELECT * FROM pg_policies WHERE tablename = 'profiles';"
```

### 2. Check Storage Policies
```bash
# List storage policies
supabase db shell -c "SELECT * FROM storage.policies;"

# Check bucket access
supabase storage ls --bucket public
```

## Cleanup Commands

### 1. Clean Up Local
```bash
# Stop local services
supabase stop

# Clean up local data
supabase db reset
```

### 2. Clean Up Production
```bash
# Remove test data
supabase db shell -c "DELETE FROM profiles WHERE email LIKE '%test%';"

# Clean up storage
supabase storage rm --bucket public test-files/
```

These commands provide a complete workflow for migrating to Supabase Boost and managing the new setup.