# 🔍 Railway Deployment Debug Checklist

## 🚨 Problem: "Auth service unavailable" Still Showing

The Supabase client is returning `null` because environment variables aren't being found in the browser.

---

## 🎯 Root Cause Analysis

### How Next.js Handles NEXT_PUBLIC_* Variables

**Build Time (Railway):**
```
1. Railway reads environment variables from Variables tab
2. Next.js build process runs
3. NEXT_PUBLIC_* variables are BAKED into JavaScript bundle
4. Bundle is deployed
```

**Runtime (Browser):**
```
1. User visits site
2. JavaScript bundle loads
3. process.env.NEXT_PUBLIC_* is REPLACED with actual values (or undefined)
4. Supabase client tries to initialize
```

### The Problem
If variables aren't available during BUILD, they become `undefined` in the bundle.

---

## ✅ Verification Steps

### Step 1: Check Railway Build Logs

Go to Railway → Deployments → Latest → Logs

**Look for these lines during build:**
```
Building...
Environment variables:
  NEXT_PUBLIC_SUPABASE_URL=https://auth.skrblai.io
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**If you DON'T see these**, Railway isn't exposing the variables during build.

### Step 2: Check Railway Variables Tab

Go to Railway → Your Service → Variables

**Verify these exist:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

**Important:** Make sure they're in the CORRECT service (not a different one).

### Step 3: Check Browser Console

Visit: `https://skrblai.io`  
Press: F12  
Go to: Console tab

**You should see:**
```
[supabase] Checking environment variables...
[supabase] NEXT_PUBLIC_SUPABASE_URL: ✅ Present
[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY: ✅ Present
[supabase] ✅ Environment variables found, creating client...
```

**If you see ❌ Missing**, the variables weren't baked into the build.

### Step 4: Check Compiled JavaScript

Visit: `https://skrblai.io`  
Press: F12 → Sources tab  
Find: `_next/static/chunks/` files  
Search for: `auth.skrblai.io`

**If you find it:** Variables were baked in ✅  
**If you don't find it:** Variables were NOT baked in ❌

---

## 🔧 Possible Solutions

### Solution 1: Verify Railway Service

**Problem:** Variables might be in wrong service

**Fix:**
1. Go to Railway dashboard
2. Make sure you're in the correct project
3. Make sure you're editing the correct service
4. Check if there are multiple services (frontend vs backend)

### Solution 2: Force Complete Rebuild

**Problem:** Railway might be using cached build

**Fix:**
1. Go to Railway → Deployments
2. Click "..." on latest deployment
3. Click "Remove"
4. Go to Settings → "Redeploy"
5. This forces a fresh build from scratch

### Solution 3: Check Railway Build Command

**Problem:** Custom build command might not be using env vars

**Fix:**
1. Go to Railway → Settings
2. Check "Build Command"
3. Should be: `npm run build` or `next build`
4. Make sure it's NOT using a custom script that ignores env vars

### Solution 4: Add .env.production File

**Problem:** Next.js might need explicit production env file

**Fix:**
Create `.env.production` in your repo:
```bash
# .env.production
# Railway will override these with actual values
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

Then commit and push.

### Solution 5: Use Railway's Environment Variables Feature

**Problem:** Variables might not be exposed during build

**Fix:**
1. Go to Railway → Settings → Environment
2. Make sure "Expose environment variables during build" is enabled
3. Redeploy

---

## 🧪 Quick Test: Hardcode URL Temporarily

To verify if the issue is environment variables or something else:

**Edit `lib/supabase/client.ts`:**
```typescript
// TEMPORARY TEST - Remove after testing
let url = 'https://auth.skrblai.io';
let anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Your actual key
```

**If this works:**
- ✅ Supabase connection is fine
- ❌ Environment variables are the problem

**If this still doesn't work:**
- ❌ There's a different issue (DNS, CORS, etc.)

---

## 📊 Railway Environment Variable Checklist

Go through each variable in Railway:

### Critical Variables (Must Have)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://auth.skrblai.io`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJ...` (starts with eyJ)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `eyJ...` (starts with eyJ)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
- [ ] `STRIPE_SECRET_KEY` = `sk_live_...`
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_...`

### Google OAuth (For Sign-In)
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = `...apps.googleusercontent.com`
- [ ] `GOOGLE_CLIENT_SECRET` = `GOCSPX-...`

### Feature Flags
- [ ] `NEXT_PUBLIC_ENABLE_STRIPE` = `true`
- [ ] `NODE_ENV` = `production`

---

## 🚨 Common Railway Pitfalls

### 1. Wrong Service
Railway projects can have multiple services. Make sure you're editing the correct one!

### 2. Cached Build
Railway caches builds. Sometimes you need to force a clean rebuild.

### 3. Build vs Runtime
`NEXT_PUBLIC_*` variables must be available during BUILD, not just runtime.

### 4. Typos
Double-check variable names. `NEXT_PUBLIC_SUPABASE_URL` not `NEXT_PUBLIC_SUPABASE_URI`.

### 5. Missing Redeploy
Adding variables doesn't auto-redeploy. You must manually trigger a redeploy.

---

## 📞 What to Send Me

To help debug further, send:

1. **Screenshot of Railway Variables tab** - Show all NEXT_PUBLIC_* variables
2. **Screenshot of Railway build logs** - Show the "Building..." section
3. **Screenshot of browser console** - Show the [supabase] logs
4. **Tell me:** Did you see the variables in the build logs?

---

## 🎯 Expected vs Actual

### Expected (Working)
```
Browser Console:
  [supabase] NEXT_PUBLIC_SUPABASE_URL: ✅ Present
  [supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY: ✅ Present

Sign-In Page:
  ✅ No "Auth service unavailable" error
  ✅ Email/password form works
  ✅ Google button appears
```

### Actual (Broken)
```
Browser Console:
  [supabase] NEXT_PUBLIC_SUPABASE_URL: ❌ Missing
  [supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY: ❌ Missing

Sign-In Page:
  ❌ "Auth service unavailable" error
  ❌ Stripe buttons disabled
```

---

**Let's figure out which solution applies to your situation!** 🔍
