# 🔧 Google OAuth Scopes Configuration Fix

## 🚨 Problem: No Scopes Selected

You mentioned that your Google OAuth consent screen has **no scopes selected**. This will cause sign-in to fail because Google won't know what user information to provide.

---

## ✅ Required Scopes for SKRBL AI

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/apis/credentials/consent
2. Select your project
3. Click **"EDIT APP"** on the OAuth consent screen

### Step 2: Navigate to Scopes
1. Click **"ADD OR REMOVE SCOPES"** button
2. You'll see a list of available scopes

### Step 3: Add These Required Scopes

**Select these scopes** (check the boxes):

#### ✅ OpenID Connect
- `openid` - Required for authentication
- `email` - Get user's email address
- `profile` - Get user's basic profile info

#### ✅ Google APIs
- `https://www.googleapis.com/auth/userinfo.email` - Email address access
- `https://www.googleapis.com/auth/userinfo.profile` - Profile information access

---

## 📋 Scope Details

| Scope | Purpose | Required? |
|-------|---------|-----------|
| `openid` | Authenticate user identity | ✅ YES |
| `email` | Access user's email address | ✅ YES |
| `profile` | Access user's name and profile picture | ✅ YES |
| `userinfo.email` | Verify email address | ✅ YES |
| `userinfo.profile` | Verify profile information | ✅ YES |

---

## 🎯 What These Scopes Allow

When a user signs in with Google, SKRBL AI will receive:
- ✅ User's email address (for account creation)
- ✅ User's full name (for personalization)
- ✅ User's profile picture (for avatar)
- ✅ Unique Google ID (for account linking)

**We do NOT request:**
- ❌ Access to Gmail
- ❌ Access to Google Drive
- ❌ Access to Calendar
- ❌ Any other Google services

---

## 🔐 Privacy & Security

These are **non-sensitive scopes** that:
- Only provide basic profile information
- Don't require Google verification
- Are standard for OAuth sign-in
- Can be used immediately

---

## 📸 Visual Guide

### What You Should See:

**Before (Problem):**
```
OAuth consent screen
Scopes: None selected ❌
```

**After (Fixed):**
```
OAuth consent screen
Scopes:
  ✅ openid
  ✅ email
  ✅ profile
  ✅ .../auth/userinfo.email
  ✅ .../auth/userinfo.profile
```

---

## 🚀 After Adding Scopes

1. **Click "SAVE AND CONTINUE"**
2. **Review the summary**
3. **Click "BACK TO DASHBOARD"**
4. **Test sign-in** at `https://skrblai.io/sign-in`

---

## 🧪 Testing Google Sign-In

After configuring scopes:

1. **Clear browser cookies** (to reset OAuth state)
2. **Visit**: `https://skrblai.io/sign-in`
3. **Click**: "Continue with Google"
4. **You should see**: Google's consent screen showing:
   - "SKRBL AI wants to access your Google Account"
   - "This will allow SKRBL AI to:"
   - ✅ See your email address
   - ✅ See your personal info
5. **Click "Allow"**
6. **You should be**: Redirected to dashboard

---

## 🔧 Troubleshooting

### Error: "Access blocked: This app's request is invalid"
**Cause**: Scopes not configured
**Fix**: Add the required scopes listed above

### Error: "Redirect URI mismatch"
**Cause**: Authorized redirect URIs not configured
**Fix**: Add these to Google Console:
- `http://localhost:3000/auth/callback` (for local dev)
- `https://skrblai.io/auth/callback` (for production)

### Error: "This app hasn't been verified by Google"
**Cause**: Using sensitive scopes (we're not)
**Fix**: The scopes we use don't require verification. If you see this, you may have added extra scopes. Remove any scopes beyond the 5 listed above.

---

## 📝 Supabase Custom Domain (auth.skrblai.io)

Since you mentioned using `auth.skrblai.io` as a custom domain:

### Additional Configuration Needed:

1. **In Supabase Dashboard**:
   - Go to: Authentication → URL Configuration
   - Add redirect URLs:
     - `https://skrblai.io/auth/callback`
     - `https://auth.skrblai.io/auth/callback`
   - Set site URL to: `https://skrblai.io`

2. **In Google Cloud Console**:
   - Add authorized redirect URIs:
     - `https://skrblai.io/auth/callback`
     - `https://auth.skrblai.io/auth/callback`

3. **DNS Configuration**:
   - Ensure `auth.skrblai.io` CNAME points to Supabase
   - Verify SSL certificate is active

---

## ✅ Final Checklist

Before testing:
- [ ] Added all 5 required scopes to Google OAuth consent screen
- [ ] Saved changes in Google Cloud Console
- [ ] Added redirect URIs to Google OAuth client
- [ ] Updated Supabase redirect URLs
- [ ] Configured custom domain (if using auth.skrblai.io)
- [ ] Added Google OAuth credentials to Railway
- [ ] Cleared browser cookies
- [ ] Ready to test!

---

## 🎯 Expected Result

After completing all steps:
1. User clicks "Sign in with Google"
2. Google consent screen appears with proper scopes
3. User approves access
4. User is redirected to SKRBL AI dashboard
5. User profile is created in Supabase
6. User can access all features

---

## 📞 Need Help?

If you're still having issues:
1. Check Railway deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Test with a different Google account
5. Check Supabase logs for authentication errors

---

## 🔗 Useful Links

- **Google Cloud Console**: https://console.cloud.google.com
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Railway Dashboard**: https://railway.app

---

**Good luck! Let me know if you need help with any of these steps.** 🚀
