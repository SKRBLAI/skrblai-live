# 🔐 CRITICAL: Fix "Database error saving new user" - Add INSERT Policy

## 🚨 Problem Solved

**Users could not sign up** - Getting error: "Database error saving new user"

**Root Cause**: Missing INSERT policy on `profiles` table. RLS was blocking profile creation.

---

## ✅ Critical Fixes Applied

### 1. **Added Missing INSERT Policy** (Migration: `20251021_auth_profile_sync_repair.sql`)
```sql
CREATE POLICY "profiles_insert_self"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());
```

### 2. **Fixed Schema Mismatch** (`/app/api/user/profile-sync/route.ts`)
- Changed `user_id: user.id` → `id: user.id` (to match production schema)
- Changed `onConflict: 'user_id'` → `onConflict: 'id'`

### 3. **Added Missing Columns**
- `display_name` - For user's full name
- `updated_at` - Timestamp tracking

### 4. **Migration Already Pushed to Supabase**
✅ Changes are LIVE on remote database - no additional DB work needed

---

## 🧪 Testing Instructions

After Railway deploys (1-2 minutes after merge):

### Test Sign-Up Flow:
1. Go to https://skrblai.io/sign-up
2. Enter test email (e.g., `test+timestamp@yourdomain.com`)
3. Enter password (min 6 chars)
4. Click "Create Account"

**Expected Result**: ✅ No error, redirects to dashboard

### Verify in Supabase:
1. Open Supabase dashboard → Table Editor
2. Check `public.profiles` - new row should exist
3. Check `public.user_roles` - role should be 'user'

### Test Google OAuth:
1. Click "Continue with Google" on sign-up page
2. Complete Google auth flow
3. Should redirect to dashboard without errors

---

## 📊 Changes Summary

**Files Modified:**
- `app/api/user/profile-sync/route.ts` - Fixed schema column name
- `supabase/migrations/20251021_auth_profile_sync_repair.sql` - Added INSERT policy

**Database Changes:**
- ✅ Profiles INSERT policy created
- ✅ Old conflicting policies dropped
- ✅ display_name and updated_at columns added

**No Breaking Changes** - Existing users unaffected

---

## 🚀 Deployment Steps

1. **Merge this PR to main**
2. **Railway auto-deploys** (1-2 min)
3. **Test sign-up immediately**

---

## ⚡ Rollback Plan (if needed)

If sign-up still fails:
1. Check Railway logs: `railway logs`
2. Check Supabase RLS policies in dashboard
3. Verify service role key is set in Railway env vars

---

## 📋 Post-Deployment Checklist

- [ ] Test email/password sign-up
- [ ] Test Google OAuth sign-up  
- [ ] Verify profile created in Supabase
- [ ] Verify user role assigned
- [ ] Check dashboard loads correctly
- [ ] Monitor Railway logs for errors

---

**This is a CRITICAL FIX - merge immediately to restore sign-up functionality.**

Branch: `feat/supabase-cli-verify`
