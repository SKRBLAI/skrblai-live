# 🚨 Railway Rebuild Required - Environment Variables Not Loading

## Problem
You added environment variables to Railway, but the app was already built WITHOUT them. Next.js bakes `NEXT_PUBLIC_*` variables into the client bundle at **build time**, not runtime.

---

## ✅ Solution: Force a Rebuild

### Option 1: Trigger Redeploy (Fastest)
1. Go to Railway dashboard
2. Click on your service
3. Go to **"Deployments"** tab
4. Click the **"..."** menu on the latest deployment
5. Click **"Redeploy"**
6. Wait 3-5 minutes for rebuild

### Option 2: Push an Empty Commit (Alternative)
If redeploy doesn't work, force a new build:

```bash
git commit --allow-empty -m "Force Railway rebuild with new env vars"
git push origin main
```

---

## 🔍 Why This Happens

### Build Time vs Runtime
- **Server-side variables** (no `NEXT_PUBLIC_` prefix): Available at runtime ✅
- **Client-side variables** (`NEXT_PUBLIC_*` prefix): Baked into bundle at build time ⚠️

### What Happened
1. Railway built your app **before** you added the 14 variables
2. The build didn't include `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. The client-side code has `undefined` for these variables
4. Supabase client returns `null`
5. Auth fails with "Auth service unavailable"

---

## 🎯 After Rebuild, Test These

### 1. Check Browser Console
Visit `https://skrblai.io` and open DevTools (F12):

**You should see:**
```
[supabase] Checking environment variables...
[supabase] NEXT_PUBLIC_SUPABASE_URL: ✅ Present
[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY: ✅ Present
[supabase] ✅ Environment variables found, creating client...
```

**If you still see:**
```
[supabase] NEXT_PUBLIC_SUPABASE_URL: ❌ Missing
[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY: ❌ Missing
```
Then the rebuild didn't work.

### 2. Test Sign-In
- Visit: `https://skrblai.io/sign-in`
- Should NOT see "Auth service unavailable"
- Should see sign-in form and Google button

### 3. Test Stripe
- Visit: `https://skrblai.io/pricing`
- Buttons should be enabled
- Click a button - should redirect to Stripe checkout

---

## 🚨 If Rebuild Doesn't Fix It

### Check Railway Build Logs
1. Go to Railway dashboard
2. Click on deployment
3. Look for these lines in build logs:

```
Building...
NEXT_PUBLIC_SUPABASE_URL=https://zpqavydsinrtaxhowmnb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**If you DON'T see these**, Railway isn't reading the variables.

### Possible Causes:
1. **Variables not saved** - Go back to Variables tab, make sure they're there
2. **Wrong service** - Make sure you added variables to the correct Railway service
3. **Railway bug** - Try removing and re-adding the variables

---

## 📋 Verify Variables in Railway

Go to Railway → Your Service → Variables tab

**Must have these (minimum):**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

---

## 🎯 About Supabase Custom Domain

You mentioned `auth.skrblai.io`. Here's what that means:

### What is a Custom Domain?
Supabase lets you use your own domain instead of `*.supabase.co` for authentication.

### Do You Need It?
**Probably not!** Your current setup uses:
- `https://zpqavydsinrtaxhowmnb.supabase.co` ✅ This works fine

### If You Want to Use auth.skrblai.io:
1. Go to Supabase Dashboard → Project Settings → Custom Domains
2. Add `auth.skrblai.io`
3. Update DNS: Add CNAME record pointing to Supabase
4. Wait for SSL certificate
5. Update `NEXT_PUBLIC_SUPABASE_URL` to `https://auth.skrblai.io`

**But for now, stick with the default Supabase URL!**

---

## ✅ Quick Checklist

Before testing:
- [ ] Triggered redeploy in Railway
- [ ] Waited 3-5 minutes for build to complete
- [ ] Checked deployment logs for errors
- [ ] Verified variables are in Railway dashboard
- [ ] Cleared browser cache (Ctrl+Shift+Delete)
- [ ] Ready to test!

---

## 🚀 Expected Result After Rebuild

**Sign-In Page:**
- ✅ No "Auth service unavailable" error
- ✅ Email/password form works
- ✅ "Sign in with Google" button appears
- ✅ Can create account and sign in

**Pricing Page:**
- ✅ All buttons enabled
- ✅ Click button → Redirects to Stripe checkout
- ✅ Can complete purchase

**Browser Console:**
- ✅ Supabase client initialized
- ✅ No environment variable errors
- ✅ Auth working

---

## 📞 Still Not Working?

If rebuild doesn't fix it:
1. **Screenshot Railway variables tab** - Make sure they're all there
2. **Screenshot Railway build logs** - Look for env vars in output
3. **Screenshot browser console** - Check for Supabase client logs
4. **Let me know** - We'll debug further

---

**TL;DR: Click "Redeploy" in Railway, wait 5 minutes, then test again!** 🚀
