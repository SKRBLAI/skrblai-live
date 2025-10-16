# Railway Deployment Checklist

**Date**: 2025-10-16  
**Issue**: Environment variables are set in Railway, but runtime issues persist

---

## 🔍 Critical Understanding: Build-Time vs Runtime Variables

### `NEXT_PUBLIC_*` Variables (Build-Time)
These are **embedded into the JavaScript bundle** during `npm run build`:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M=price_xxx
NEXT_PUBLIC_ENABLE_STRIPE=true
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

**⚠️ IMPORTANT**: If you added/changed these AFTER your last Railway build, you MUST trigger a new deployment for them to take effect.

### Server-Only Variables (Runtime)
These are read at runtime and don't require a rebuild:

```bash
STRIPE_SECRET_KEY=sk_live_xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
HCAPTCHA_SECRET=xxx
```

---

## ✅ Verification Steps

### Step 1: Check Runtime Environment in Production

Visit this URL after deploying this diagnostic endpoint:
```
https://your-app.railway.app/api/debug/runtime-env
```

This will show you which environment variables are actually present in production (without exposing the values).

### Step 2: Verify Captcha is Disabled

**Expected**:
```json
{
  "captcha": {
    "siteKey": "❌ Missing",
    "secret": "❌ Missing",
    "status": "🟢 Disabled (as intended)"
  }
}
```

**If you see**:
- `"✅ Present"` for either siteKey or secret → Remove those env vars from Railway
- You've already disabled captcha in Supabase, so these should NOT be set

### Step 3: Verify Stripe Configuration

**Expected**:
```json
{
  "stripe": {
    "secretKey": "✅ Present",
    "publishableKey": "✅ Present",
    "enableStripe": "true (default)" or "true"
  },
  "stripePrices": {
    "bizStarter": "✅ Present",
    "bizPro": "✅ Present",
    "sportsRookie": "✅ Present",
    "sportsPro": "✅ Present"
  }
}
```

**If you see Missing**:
- Check if the env var names match exactly (case-sensitive)
- Verify you're using the correct Stripe mode (test vs live)

---

## 🚀 Required Actions

### Action 1: Trigger a New Railway Deployment

Even if all env vars are set, you need to rebuild if you recently added `NEXT_PUBLIC_*` variables:

**Option A: Via Railway Dashboard**
1. Go to your Railway project
2. Click "Deploy" → "Redeploy" (or push a new commit)
3. Wait for build to complete

**Option B: Via Git Push** (Recommended)
```bash
# Make a trivial change to force rebuild
git commit --allow-empty -m "chore: trigger Railway rebuild for env vars"
git push origin master
```

### Action 2: Verify Captcha Env Vars Are NOT Set

In Railway dashboard, check that these are REMOVED or not present:
```bash
NEXT_PUBLIC_HCAPTCHA_SITEKEY  # Should NOT exist
HCAPTCHA_SECRET                # Should NOT exist
```

If they exist, remove them since you've disabled captcha in Supabase.

### Action 3: Check Stripe Test vs Live Mode

Make sure your Stripe keys match the mode you're in:

**If using Test Mode** (for testing):
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
# All price IDs should be: price_test_xxxxx
```

**If using Live Mode** (for production):
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
# All price IDs should be: price_xxxxx (without _test_)
```

**Common Issue**: Using `price_test_xxx` with `sk_live_xxx` causes "No such price" errors.

---

## 🔧 Testing After Deployment

### Test 1: Captcha Issue
1. Visit `/sign-in`
2. Try to sign in with valid credentials
3. ✅ Should work without "captcha verification process failed"

### Test 2: Stripe Buttons
1. Visit `/pricing`
2. Inspect a checkout button in DevTools
3. ✅ Should NOT see disabled state
4. Click button
5. ✅ Should redirect to Stripe checkout

### Test 3: Runtime Environment Check
1. Visit `/api/debug/runtime-env`
2. Verify all critical env vars show "✅ Present"
3. Check that captcha shows "🟢 Disabled"

---

## 🐛 Common Railway-Specific Issues

### Issue 1: Variables Set But Not Taking Effect
**Cause**: `NEXT_PUBLIC_*` vars require rebuild  
**Fix**: Trigger a new deployment (see Action 1 above)

### Issue 2: Variables Disappear After Deploy
**Cause**: Railway sometimes clears env vars during service recreation  
**Fix**: 
1. Check Railway dashboard → Variables tab
2. Re-add any missing variables
3. Redeploy

### Issue 3: Different Behavior Than Local
**Cause**: `.env.local` might have different values than Railway  
**Fix**: Export Railway env vars and compare:
```bash
railway variables | grep STRIPE
railway variables | grep SUPABASE
```

---

## 📊 Comparison: Local vs Railway

Create a quick comparison table:

| Variable | Local (.env.local) | Railway | Match? |
|----------|-------------------|---------|--------|
| `STRIPE_SECRET_KEY` | sk_test_xxx | ??? | ??? |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_test_xxx | ??? | ??? |
| `NEXT_PUBLIC_ENABLE_STRIPE` | true | ??? | ??? |

Use `/api/debug/runtime-env` to fill in the Railway column.

---

## ✅ Success Criteria

After completing all actions:

- ✅ Build completes successfully (71/71 pages)
- ✅ `/api/debug/runtime-env` shows all Stripe vars present
- ✅ `/api/debug/runtime-env` shows captcha disabled
- ✅ Sign-in works without captcha errors
- ✅ Checkout buttons redirect to Stripe
- ✅ Test purchase completes successfully

---

## 🆘 If Still Not Working

1. **Check Railway Logs**:
   ```bash
   railway logs
   ```
   Look for errors mentioning "STRIPE" or "captcha"

2. **Check Browser Console**:
   - Open DevTools on `/pricing`
   - Look for errors when clicking checkout buttons
   - Check Network tab for failed API calls

3. **Verify Stripe Dashboard**:
   - Are your products/prices active?
   - Are you in the correct mode (test vs live)?
   - Check [Stripe Logs](https://dashboard.stripe.com/logs) for any errors

---

**Next Step**: Deploy the diagnostic endpoint and visit `/api/debug/runtime-env` to see actual production state.

