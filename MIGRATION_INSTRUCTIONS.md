# 🚀 Supabase RLS Policy & Permissions Migration Guide

## 📋 What This Migration Does

1. **Adds Missing RLS Policies** for:
   - `user_settings` - Users can read/write their own settings
   - `system_logs` - Service role can insert, admins can read
   - `tax_calculations` - Users can read/write their own tax data
   - `agent_permissions` - Users can read their own permissions
   - `leads` - Service role and admins only

2. **Seeds Agent Permissions** for all existing users:
   - Percy (core onboarding agent)
   - IRA (investment agent)
   - SkillSmith (sports performance)
   - Content Automation
   - Social Media
   - Branding

3. **Creates Auto-Grant Trigger** - New users automatically get:
   - Access to 6 core agents
   - Default `user_settings` entry

---

## 🎯 Quick Start (Recommended)

### Option 1: Supabase Dashboard (Easiest)

1. **Open Supabase SQL Editor**:
   - Go to https://zpqavydsinrtaxhowmnb.supabase.co
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

2. **Copy & Paste Migration**:
   - Open `supabase/migrations/20250112_fix_rls_policies_and_permissions.sql`
   - Copy the entire file contents
   - Paste into SQL Editor
   - Click **Run** (or press Ctrl+Enter)

3. **Verify Success**:
   - Check the output panel for "✅ Migration Complete!"
   - Should show user count and permission count
   - Example output:
     ```
     ✅ Migration Complete!
     📊 Total Users: 5
     🔑 Total Agent Permissions: 30
     📈 Expected Permissions: 30 (5 users × 6 agents)
     ```

4. **Restart Your App**:
   ```bash
   # In your terminal
   rm -rf .next
   npm run dev
   ```

---

## 🛠️ Option 2: Supabase CLI (Advanced)

### Prerequisites
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Verify installation
supabase --version
```

### Steps

1. **Login to Supabase**:
   ```bash
   supabase login
   ```
   - Opens browser for authentication
   - Copy access token if prompted

2. **Link to Your Project**:
   ```bash
   cd c:\Users\baked\Documents\SKRBL_AI_DEPLOY_2025
   supabase link --project-ref zpqavydsinrtaxhowmnb
   ```
   - Enter your database password when prompted

3. **Run Migration**:
   ```bash
   supabase db push
   ```
   - Applies all migrations in `supabase/migrations/`
   - Shows success/error messages

4. **Verify Migration**:
   ```bash
   # Check if policies were created
   supabase db diff
   ```

---

## ✅ Post-Migration Verification

### 1. Check Agent Permissions Table
```sql
-- Run in Supabase SQL Editor
SELECT 
  COUNT(DISTINCT user_id) as total_users,
  COUNT(*) as total_permissions,
  COUNT(*) / NULLIF(COUNT(DISTINCT user_id), 0) as avg_permissions_per_user
FROM agent_permissions;
```

**Expected Result**: Each user should have ~6 permissions

### 2. Test User Settings Access
```sql
-- Run in Supabase SQL Editor
SELECT * FROM user_settings LIMIT 5;
```

**Expected Result**: Should see user settings without errors

### 3. Test in Your App

1. **Sign In**:
   - Go to http://localhost:3000/sign-in
   - Sign in with your test account

2. **Check Dashboard**:
   - Navigate to http://localhost:3000/dashboard
   - Should see agent cards (Percy, IRA, etc.)
   - No "Access Denied" errors

3. **Test Percy Chat**:
   - Click on Percy agent
   - Try sending a message
   - Should get a response without auth errors

---

## 🐛 Troubleshooting

### Issue: "relation 'agent_permissions' does not exist"

**Solution**: Create the table first:
```sql
CREATE TABLE IF NOT EXISTS agent_permissions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, agent_id)
);

-- Then re-run the migration
```

### Issue: "relation 'user_settings' does not exist"

**Solution**: Create the table first:
```sql
CREATE TABLE IF NOT EXISTS user_settings (
  id BIGSERIAL PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  onboarding JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Then re-run the migration
```

### Issue: "No agent permissions created"

**Solution**: Manually seed permissions:
```sql
-- Grant Percy to all users
INSERT INTO agent_permissions (user_id, agent_id, granted_at)
SELECT id::text, 'percy', NOW()
FROM auth.users
ON CONFLICT (user_id, agent_id) DO NOTHING;
```

### Issue: "Still getting 'Unauthorized' errors"

**Checklist**:
1. ✅ Migration ran successfully
2. ✅ Restarted Next.js dev server (`npm run dev`)
3. ✅ Cleared browser cache and cookies
4. ✅ Signed out and signed back in
5. ✅ Check browser console for specific error messages

---

## 📊 Migration Status Checklist

After running the migration, verify these items:

- [ ] Migration ran without errors
- [ ] `agent_permissions` table has rows (check in Supabase Table Editor)
- [ ] `user_settings` table has rows
- [ ] RLS policies show up in Authentication → Policies
- [ ] Trigger `on_auth_user_created_grant_agents` exists
- [ ] Function `grant_default_agent_permissions()` exists
- [ ] Next.js dev server restarted
- [ ] Can sign in without errors
- [ ] Dashboard shows agent cards
- [ ] Percy chat works

---

## 🔄 Rollback (If Needed)

If something goes wrong, you can rollback:

```sql
-- Remove policies
DROP POLICY IF EXISTS "Users can read own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Service role can manage all settings" ON user_settings;
DROP POLICY IF EXISTS "Service role can insert logs" ON system_logs;
DROP POLICY IF EXISTS "Admins can read logs" ON system_logs;
DROP POLICY IF EXISTS "Users can read own tax calculations" ON tax_calculations;
DROP POLICY IF EXISTS "Users can insert own tax calculations" ON tax_calculations;
DROP POLICY IF EXISTS "Users can read own agent permissions" ON agent_permissions;
DROP POLICY IF EXISTS "Service role can manage agent permissions" ON agent_permissions;

-- Remove trigger
DROP TRIGGER IF EXISTS on_auth_user_created_grant_agents ON auth.users;
DROP FUNCTION IF EXISTS grant_default_agent_permissions();

-- Optionally clear agent permissions (WARNING: This removes all permissions)
-- TRUNCATE agent_permissions;
```

---

## 📞 Need Help?

If you encounter issues:

1. **Check Supabase Logs**:
   - Go to Supabase Dashboard → Logs
   - Filter by "Database" or "API"
   - Look for error messages

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for Supabase or authentication errors

3. **Verify Environment Variables**:
   - Run `http://localhost:3000/api/test-env`
   - All should say "SET"

4. **Test Supabase Connection**:
   ```bash
   npm run test:supabase
   ```

---

## 🎉 Success Indicators

You'll know the migration worked when:

1. ✅ No "Unauthorized" errors in browser console
2. ✅ Dashboard shows all agent cards
3. ✅ Percy chat responds to messages
4. ✅ User settings save without errors
5. ✅ Stripe checkout works (if configured)
6. ✅ New user signups automatically get agent access

---

**Last Updated**: 2025-01-12  
**Migration File**: `supabase/migrations/20250112_fix_rls_policies_and_permissions.sql`  
**Project**: SKRBL AI (zpqavydsinrtaxhowmnb.supabase.co)
