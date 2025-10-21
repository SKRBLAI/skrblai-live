# 🔧 Supabase Configuration Reference

## 📍 Quick Access

**Supabase Dashboard**: https://app.supabase.com  
**Project**: SKRBL AI  
**Production URL**: https://skrblai.io

---

## 🔑 Authentication → URL Configuration

```
Site URL:
  https://skrblai.io

Redirect URLs:
  https://skrblai.io/auth/callback
  http://localhost:3000/auth/callback

Additional Redirect URLs: (leave blank)

Wildcard Redirect Patterns: (leave blank)
```

### ⚠️ IMPORTANT
- **DO NOT** use custom auth domain (like `auth.skrblai.io`)
- Remove any custom auth domain if present
- Site URL should have **no trailing slash**

---

## 🔐 Authentication → Providers

### Email Provider
```
✅ Enabled
✅ Confirm email: Disabled (for faster testing)
   OR Enabled (for production security)
```

### Google Provider
```
✅ Enabled

Client ID (OAuth):
  Get from: Google Cloud Console → Credentials
  Format: 123456789012-abc...xyz.apps.googleusercontent.com
  
Client Secret (OAuth):
  Get from: Google Cloud Console → Credentials
  Format: GOCSPX-abc...xyz
  
Authorized Client IDs: (leave blank)

Skip nonce check: ❌ Unchecked
```

### Important: Google Cloud Console Setup
```
In Google Cloud Console → APIs & Services → Credentials:

OAuth 2.0 Client ID:
  Application type: Web application
  Name: SKRBL AI Production
  
  Authorized JavaScript origins:
    https://skrblai.io
    
  Authorized redirect URIs:
    https://<YOUR-SUPABASE-REF>.supabase.co/auth/v1/callback
    
  Example: https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

---

## 📧 Authentication → Email Templates

### Magic Link Template

**Subject**: `Magic Link to sign in`

**Body**: (Keep default or customize)

**Confirmation URL** (important):
```
{{ .SiteURL }}/auth/callback
```

### Confirm Signup Template

**Subject**: `Confirm your signup`

**Body**: (Keep default or customize)

**Confirmation URL** (important):
```
{{ .SiteURL }}/auth/callback
```

### Change Email Template

**Subject**: `Confirm email change`

**Body**: (Keep default or customize)

**Confirmation URL** (important):
```
{{ .SiteURL }}/auth/callback
```

### Reset Password Template

**Subject**: `Reset your password`

**Body**: (Keep default or customize)

**Confirmation URL** (important):
```
{{ .SiteURL }}/auth/callback
```

---

## 🗄️ Database → SQL Editor

### Run This Schema (One Time)

```sql
-- Copy entire contents of supabase_auth_schema.sql
-- Paste here
-- Click "Run"
```

### Verify Schema

```sql
-- Check profiles table exists
SELECT COUNT(*) FROM public.profiles;

-- Check user_roles table exists
SELECT COUNT(*) FROM public.user_roles;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'user_roles');
```

Expected output:
```
tablename    | rowsecurity
-------------+-------------
profiles     | true
user_roles   | true
```

---

## 🔒 Database → Policies

### profiles Table Policies

```
Policy Name: profiles_select_owner
Command: SELECT
Target roles: authenticated
Policy definition: (user_id = auth.uid())

Policy Name: profiles_insert_self
Command: INSERT
Target roles: authenticated
Policy definition: (user_id = auth.uid())

Policy Name: profiles_update_owner
Command: UPDATE
Target roles: authenticated
Using expression: (user_id = auth.uid())
With check expression: (user_id = auth.uid())
```

### user_roles Table Policies

```
Policy Name: user_roles_select_owner
Command: SELECT
Target roles: authenticated
Policy definition: (user_id = auth.uid())
```

---

## 🔑 Project Settings → API

### Keys to Copy to Railway

```
Project URL:
  NEXT_PUBLIC_SUPABASE_URL=<this-value>
  Example: https://abcdefghijklmnop.supabase.co

Project API keys:
  
  anon / public:
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<this-value>
    Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    
  service_role (secret):
    SUPABASE_SERVICE_ROLE_KEY=<this-value>
    Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ⚠️ NEVER expose this in client-side code
```

---

## 📊 Database → Table Editor

### profiles Table Structure

```
Column Name    | Type         | Default              | Nullable
---------------|--------------|----------------------|---------
user_id        | uuid         | -                    | NOT NULL (PK)
email          | text         | -                    | YES
display_name   | text         | -                    | YES
created_at     | timestamptz  | now()                | YES
updated_at     | timestamptz  | now()                | YES
```

### user_roles Table Structure

```
Column Name | Type | Default | Nullable | Constraints
------------|------|---------|----------|------------
user_id     | uuid | -       | NOT NULL (PK) | -
role        | text | 'user'  | YES      | CHECK (role IN ('user','vip','founder','heir','parent','admin'))
```

---

## ✅ Verification Checklist

After configuring Supabase:

- [ ] Site URL set to `https://skrblai.io`
- [ ] Redirect URL includes `https://skrblai.io/auth/callback`
- [ ] Custom auth domain disabled
- [ ] Google provider enabled with correct credentials
- [ ] Magic Link template uses `{{ .SiteURL }}/auth/callback`
- [ ] Database schema created successfully
- [ ] RLS enabled on profiles and user_roles
- [ ] All three API keys copied to Railway
- [ ] Google Cloud Console has correct redirect URI

---

## 🧪 Quick Test

Run these in browser after deployment:

```
1. Auth Probe:
   https://skrblai.io/api/_probe/auth
   → Should show Supabase cookie domain

2. Supabase Probe:
   https://skrblai.io/api/_probe/supabase
   → Should show errorClass: "Success"

3. Profile Check:
   https://skrblai.io/api/_probe/db/profile-check
   → Should show admin: success: true
```

---

## 🆘 Common Issues

### Issue: "Invalid redirect URL"
→ Add exact URL to Supabase → Authentication → Redirect URLs

### Issue: "Invalid client credentials" (Google OAuth)
→ Verify Client ID/Secret in Supabase match Google Cloud Console

### Issue: "Email not sent"
→ Check Supabase → Authentication → Email Rate Limits  
→ Verify email provider settings

### Issue: "Permission denied" on profiles table
→ Check RLS policies are created correctly  
→ Verify user is authenticated before querying

### Issue: "Could not verify JWT"
→ Verify all three Supabase keys are from same project  
→ Check for typos in environment variables

---

**Need Help?**  
- Full deployment guide: `SUPABASE_AUTH_DEPLOYMENT_CHECKLIST.md`
- Technical details: `AUTH_REPAIR_SUMMARY.md`
- Environment template: `.env.production.example`

---

**Last Updated**: 2025-01-21  
**Status**: ✅ Configuration Complete
