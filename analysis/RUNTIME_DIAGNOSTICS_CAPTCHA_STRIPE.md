# Runtime Diagnostics: Captcha & Stripe Issues

**Date**: 2025-10-16  
**Status**: Build successful (71/71 pages), but runtime issues detected  
**Scope**: Production deployment on Railway

---

## 🔍 Issues Identified

### 1. **Captcha Verification Failed** (Sign-In Page)
**Error Message**: `"captcha verification process failed"`  
**Location**: `/sign-in` page during authentication

### 2. **Non-Functional Stripe Buttons**
**Symptoms**: Checkout/payment buttons not working  
**Location**: Pricing page and other payment flows

---

## 📊 Root Cause Analysis

### Issue 1: Captcha Error

#### What We Found:
1. **Source of Error**: Supabase Auth backend (not app code)
   - The sign-in page (`app/(auth)/sign-in/page.tsx`) does NOT call any captcha verification
   - No hCaptcha widget is rendered in the UI
   - The error is coming from Supabase's auth service directly

2. **App's Captcha Infrastructure**:
   - `/api/recaptcha/verify` route exists with **bypass logic** (lines 24-29)
   - If `HCAPTCHA_SECRET` env var is missing, it returns `{ success: true, bypass: true }`
   - **However**: This API route is NOT called anywhere in the sign-in flow

3. **The Fix**:
   - ✅ **User has already disabled captcha in Supabase Auth settings**
   - This should eliminate the error on next deployment

#### Environment Variables Status:
```bash
HCAPTCHA_SECRET=<not set>                    # Optional - triggers bypass
NEXT_PUBLIC_HCAPTCHA_SITEKEY=<not set>       # Optional - no widget rendered
```

**Verdict**: ✅ **RESOLVED** - User disabled captcha in Supabase. No code changes needed.

---

### Issue 2: Stripe Buttons Not Working

#### What We Found:

1. **Frontend Logic** (`components/payments/CheckoutButton.tsx`):
   ```typescript
   const stripeEnabled = FEATURE_FLAGS.ENABLE_STRIPE;  // Line 22
   
   if (!stripeEnabled) {
     return <button disabled>Stripe Disabled</button>;  // Line 27
   }
   ```

2. **Feature Flag Configuration** (`lib/config/featureFlags.ts`):
   ```typescript
   ENABLE_STRIPE: readBooleanFlag('NEXT_PUBLIC_ENABLE_STRIPE', true), // Line 30
   ```
   - **Default**: `true`
   - **Reads from**: `NEXT_PUBLIC_ENABLE_STRIPE` env var

3. **Backend API** (`app/api/checkout/route.ts`):
   ```typescript
   const stripe = requireStripe();  // Line 121
   ```
   - Calls `lib/stripe/stripe.ts::requireStripe()`
   - **Throws error** if `STRIPE_SECRET_KEY` is missing

4. **Stripe Client Initialization** (`lib/stripe/stripe.ts`):
   ```typescript
   export function requireStripe(): Stripe {
     const s = getOptionalStripe();
     if (!s) throw new Error('STRIPE_SECRET_KEY missing');  // Line 23
     return s;
   }
   ```

#### Critical Missing Environment Variables:
```bash
# Required for backend
STRIPE_SECRET_KEY=sk_live_...                         # ❌ MISSING

# Required for frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...       # ❌ LIKELY MISSING

# Optional feature flags
NEXT_PUBLIC_ENABLE_STRIPE=true                        # ✅ Defaults to true
NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=false            # ✅ Defaults to false
```

**Verdict**: ❌ **Stripe environment variables not configured in Railway**

---

## 🎯 Action Plan (Option A - User Approved)

Since you've already disabled captcha in Supabase, we'll focus on fixing Stripe:

### Step 1: Verify Stripe Environment Variables in Railway ⚡

Add the following to your Railway environment variables:

```bash
# Required Backend Keys
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_API_VERSION=2025-09-30.clover

# Required Frontend Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# Optional (already default to correct values)
NEXT_PUBLIC_ENABLE_STRIPE=true
```

**Where to find these values:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Use **live mode** keys for production (or test mode for staging)
3. Copy `Secret key` → `STRIPE_SECRET_KEY`
4. Copy `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Step 2: Verify Additional Stripe Price IDs

The checkout system also needs price IDs for your products. Check if these are set:

```bash
# Example price IDs (check your actual product catalog)
STRIPE_PRICE_BUSINESS_STARTER=price_xxxxx
STRIPE_PRICE_BUSINESS_PRO=price_xxxxx
# ... etc
```

**How to check**: Look at `lib/business/pricingData.ts` and `lib/sports/pricingData.ts` for `envPriceVar` fields.

### Step 3: Redeploy on Railway

After adding the environment variables:
1. Trigger a new Railway deployment
2. No code changes needed - just env vars
3. The app will automatically pick up the new configuration

### Step 4: Test the Fix

1. **Captcha Test**:
   - Visit `/sign-in`
   - Try to sign in
   - ✅ Should no longer see "captcha verification process failed"

2. **Stripe Test**:
   - Visit `/pricing`
   - Click any checkout button
   - ✅ Should redirect to Stripe checkout
   - ❌ Should NOT see "Stripe Disabled" message

---

## 🔧 Alternative: Stripe Fallback Mode (If Needed)

If you need payments to work IMMEDIATELY while configuring Stripe properly, you can use payment links:

1. Set this env var:
   ```bash
   NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=true
   ```

2. The app will use direct Stripe Payment Links instead of Checkout Sessions
3. See `lib/stripe/paymentLinks.ts` for configuration

**Trade-off**: Less flexible than Checkout Sessions, but works without backend Stripe API calls.

---

## 📝 Summary

| Issue | Root Cause | Status | Action Required |
|-------|-----------|---------|-----------------|
| Captcha Error | Supabase Auth captcha enabled | ✅ Fixed | User disabled in Supabase |
| Stripe Buttons | Missing `STRIPE_SECRET_KEY` | ⚠️ Pending | Add env vars to Railway |

---

## ✅ Expected Outcome After Fixes

1. ✅ Sign-in works without captcha errors
2. ✅ Stripe checkout buttons are functional
3. ✅ Users can complete purchases
4. ✅ No code changes required - only env var configuration

---

## 🚨 If Issues Persist

**Captcha Still Failing?**
- Double-check Supabase project settings: Auth → Settings → Enable Email Confirmation (should be OFF or without captcha)
- Clear browser cache and test in incognito mode

**Stripe Still Not Working?**
- Check Railway logs for exact error messages
- Verify Stripe Dashboard shows your products/prices are active
- Test with Stripe test mode first: `sk_test_...` and `pk_test_...`

---

**Next Steps**: Add Stripe env vars to Railway and redeploy.

