# 🔐 SKRBL AI Supabase Auth Deployment Checklist

## ✅ COMPLETED CODE FIXES

### 1. Profile Sync Endpoint Fixed
- ✅ Updated `/app/api/user/profile-sync/route.ts` to properly:
  - Get authenticated user from cookies using `getServerSupabaseAnon()`
  - Use service role client to bypass RLS with `getServerSupabaseAdmin()`
  - Upsert both `profiles` and `user_roles` tables
  - Return proper error codes (401, 503, 500)

### 2. Auth Callback Updated
- ✅ Updated `/app/auth/callback/page.tsx` to:
  - Properly exchange OAuth code for session
  - Handle auth errors gracefully
  - Route based on user role using `getUserAndRole()`
  - Removed server-side profile-sync call (handled by dashboard)

### 3. Dashboard Profile Sync Fallback
- ✅ Added to `/app/dashboard/page.tsx`:
  - Profile sync check on dashboard load
  - Non-blocking fallback (doesn't prevent dashboard access)
  - Console logging for debugging
  - State management to prevent duplicate calls

### 4. Sign-Up Flow Already Correct
- ✅ `/app/(auth)/sign-up/page.tsx` already:
  - Calls profile-sync after successful registration
  - Redirects to `/auth/redirect` for role-based routing
  - Handles both password and OAuth flows

### 5. Database Schema Provided
- ✅ Created `supabase_auth_schema.sql` with:
  - `profiles` table (user_id, email, display_name, timestamps)
  - `user_roles` table (user_id, role)
  - RLS policies for authenticated users
  - Performance indexes

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Supabase Dashboard Configuration

#### A. Remove Custom Auth Domain
1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. **IMPORTANT**: Disable any custom auth domain (like `auth.skrblai.io`)
3. Set the following:
   - **Site URL**: `https://skrblai.io`
   - **Redirect URLs**: 
     ```
     https://skrblai.io/auth/callback
     http://localhost:3000/auth/callback
     ```

#### B. Verify Google OAuth Settings
1. Go to **Authentication → Providers → Google**
2. Ensure enabled with correct Client ID and Secret
3. Verify redirect URI in Google Cloud Console:
   ```
   https://<YOUR-SUPABASE-REF>.supabase.co/auth/v1/callback
   ```
   Example: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

#### C. Update Email Templates
1. Go to **Authentication → Email Templates**
2. For **Magic Link** template, ensure the button URL is:
   ```
   {{ .SiteURL }}/auth/callback
   ```
3. For **Confirm Signup** template, ensure:
   ```
   {{ .SiteURL }}/auth/callback
   ```

---

### Step 2: Database Setup

#### Run SQL Schema
1. Open **Supabase Dashboard → SQL Editor**
2. Create new query
3. Copy contents of `supabase_auth_schema.sql`
4. Run query
5. Verify success message

#### Verify Tables Created
```sql
-- Check profiles table
SELECT * FROM public.profiles LIMIT 1;

-- Check user_roles table
SELECT * FROM public.user_roles LIMIT 1;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'user_roles');
```

Expected output: Both tables should show `rowsecurity = true`

---

### Step 3: Railway Environment Variables

#### Required Environment Variables
Ensure these are set in **Railway → Variables**:

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://<YOUR-REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SITE_URL=https://skrblai.io

# Google OAuth (REQUIRED for Google Sign-In)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<client-id>
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=<client-secret>

# Stripe (Keep existing values)
NEXT_PUBLIC_ENABLE_STRIPE=1
NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=0
STRIPE_SECRET_KEY=sk_live_...
STRIPE_API_VERSION=2025-09-30.clover

# Remove these if present (OBSOLETE)
# AUTH_DOMAIN
# NEXTAUTH_URL
```

#### Verify All Three Keys Match Same Project
All Supabase keys must be from the **same Supabase project**:
- Get them from: **Supabase Dashboard → Project Settings → API**
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `anon` `public` key
- `SUPABASE_SERVICE_ROLE_KEY`: `service_role` key (keep secret!)

---

### Step 4: Deploy to Railway

1. Commit all changes:
   ```bash
   git add .
   git commit -m "Fix: Supabase auth + profile sync repair"
   git push origin main
   ```

2. Railway will auto-deploy (or manually trigger)

3. Monitor build logs for errors

---

### Step 5: Verification Testing

#### A. Test Probe Endpoints
Visit these URLs directly in browser (production):

1. **Auth Probe**:
   ```
   https://skrblai.io/api/_probe/auth
   ```
   Expected response:
   ```json
   {
     "cookieDomain": "<supabase-ref>.supabase.co",
     "authCookiesFound": 0,
     "sessionPresent": false,
     "warnings": []
   }
   ```

2. **Supabase Probe**:
   ```
   https://skrblai.io/api/_probe/supabase
   ```
   Expected response:
   ```json
   {
     "url": "<supabase-ref>.supabase.co",
     "anonPresent": true,
     "servicePresent": true,
     "anonConnectOk": true,
     "adminConnectOk": true,
     "errorClass": "Success"
   }
   ```

3. **Profile Check Probe**:
   ```
   https://skrblai.io/api/_probe/db/profile-check
   ```
   Expected response:
   ```json
   {
     "profiles": {
       "admin": { "success": true },
       "anon": { "rlsBlocked": true }
     },
     "userRoles": {
       "admin": { "success": true },
       "anon": { "rlsBlocked": true }
     }
   }
   ```

#### B. Test Sign-Up Flow

1. **Clear browser cookies** (Important!)

2. Go to: `https://skrblai.io/sign-up`

3. Create new account with test email

4. **Expected behavior**:
   - No "Database error saving new user" message
   - Redirect to `/dashboard` or email confirmation message
   - Check browser console for `[SIGN_UP] Profile sync successful`

5. **Verify in Supabase**:
   ```sql
   SELECT * FROM public.profiles 
   WHERE email = 'your-test-email@example.com';
   
   SELECT * FROM public.user_roles 
   WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'your-test-email@example.com');
   ```
   Should show one row in each table

#### C. Test Magic Link Sign-In

1. Go to: `https://skrblai.io/sign-in`

2. Click "Magic Link" tab

3. Enter email and submit

4. Check email for magic link

5. Click link in email

6. **Expected behavior**:
   - Redirects to `https://skrblai.io/auth/callback`
   - Then redirects to `/dashboard` (or role-based route)
   - Console shows `[DASHBOARD] Profile sync successful`

#### D. Test Google OAuth Sign-In

1. Go to: `https://skrblai.io/sign-in`

2. Click "Continue with Google" button

3. Complete Google OAuth flow

4. **Expected behavior**:
   - Redirects through Supabase OAuth
   - Lands at `https://skrblai.io/auth/callback?code=...`
   - Then redirects to `/dashboard`
   - Profile created automatically

---

## 🐛 TROUBLESHOOTING

### Issue: "Database error saving new user"

**Cause**: Profile sync endpoint not working

**Fix**:
1. Check Railway logs for profile-sync errors
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
3. Test profile-sync endpoint directly:
   ```bash
   curl -X POST https://skrblai.io/api/user/profile-sync \
     -H "Cookie: <your-auth-cookie>"
   ```
4. Check Supabase logs for RLS policy violations

---

### Issue: Magic Link Opens to Login Page

**Cause**: `emailRedirectTo` misconfigured

**Fix**:
1. Verify Supabase → Authentication → URL Configuration
2. Ensure Site URL is `https://skrblai.io` (no trailing slash)
3. Add redirect URL: `https://skrblai.io/auth/callback`
4. Check email template uses `{{ .SiteURL }}/auth/callback`

---

### Issue: Google OAuth Button Not Showing

**Cause**: Missing Google client ID

**Fix**:
1. Verify Railway has `NEXT_PUBLIC_GOOGLE_CLIENT_ID` set
2. Check browser console for env variable errors
3. Sign-up page checks for Google config on mount

---

### Issue: Session Not Persisting

**Cause**: Cookie domain mismatch or custom auth domain

**Fix**:
1. Remove custom auth domain from Supabase settings
2. Clear browser cookies
3. Check `/api/_probe/auth` for cookie warnings
4. Verify `cookieDomain` matches Supabase project URL

---

### Issue: Profile Not Created on Dashboard Load

**Cause**: Dashboard fallback not triggering

**Fix**:
1. Check browser console for profile-sync logs
2. Verify user is authenticated before dashboard loads
3. Test profile-sync endpoint manually
4. Check network tab for profile-sync request

---

## ✅ SUCCESS CRITERIA

All of these must pass:

- [ ] `/api/_probe/auth` returns `ok: true`
- [ ] `/api/_probe/supabase` returns `errorClass: "Success"`
- [ ] `/api/_probe/db/profile-check` shows admin success
- [ ] Sign-up creates user without errors
- [ ] Magic Link opens dashboard successfully
- [ ] Google OAuth completes and creates profile
- [ ] Dashboard loads without profile-sync errors
- [ ] No "Database error" banner on sign-up
- [ ] Role-based redirects work correctly

---

## 📋 POST-DEPLOYMENT CHECKLIST

After successful deployment:

- [ ] Test sign-up with real email
- [ ] Test magic link flow
- [ ] Test Google OAuth flow
- [ ] Verify profile records in Supabase
- [ ] Check Railway logs for errors
- [ ] Monitor error tracking (if configured)
- [ ] Update documentation
- [ ] Notify team of changes

---

## 🎯 KEY FILES MODIFIED

1. `/app/api/user/profile-sync/route.ts` - Fixed profile creation logic
2. `/app/auth/callback/page.tsx` - Removed broken server-side sync
3. `/app/dashboard/page.tsx` - Added profile sync fallback
4. `/supabase_auth_schema.sql` - Database schema for Supabase

---

## 📝 NOTES

- Profile sync is **best-effort** - dashboard still loads if sync fails
- RLS policies ensure users can only see their own profiles
- Service role key bypasses RLS for profile creation
- All auth flows now properly sync profiles
- Google OAuth requires correct redirect URI in Google Cloud Console
- Magic links require correct email template configuration

---

**Last Updated**: 2025
**Status**: Ready for deployment ✅
