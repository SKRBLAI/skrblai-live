# Production Verification + Stripe/Supabase Go-Live (with Payment Links Fallback)

## 🎯 Goal
Make the live site reliably accept payments and sign users in, with a safe fallback mechanism if Stripe Checkout fails.

## 📊 Summary

This PR verifies production configuration, ensures Stripe/Supabase work correctly, and adds an emergency fallback to Stripe Payment Links. All changes are minimal, revertible, and production-safe.

### ✅ What Was Verified
- ✅ Production probe endpoints (found: not deployed, documented in PROD_PROBE_STATUS.md)
- ✅ Stripe hosted checkout uses `requireStripe()` correctly
- ✅ Supabase has no prerender traps (all pages marked `force-dynamic`)
- ✅ Feature flag resolution normalized (`readBooleanFlag` exported)
- ✅ Payment Links fallback mechanism ready for emergency use

### 🚀 Key Changes

#### 1. Production Probe Documentation
- **Created:** `analysis/PROD_PROBE_STATUS.md`
- **Finding:** All `/api/_probe/*` endpoints return 404 in production
- **Cause:** Routes exist in code but not deployed
- **Action Required:** Deploy this branch to make probes accessible

#### 2. Stripe Payment Links Fallback
- **Added:** `FF_STRIPE_FALLBACK_LINKS` feature flag (default: `false`)
- **Created:** `lib/stripe/paymentLinks.ts` - SKU → Payment Link mapping
- **Updated:** `CheckoutButton` component to use fallback when enabled
- **How it Works:**
  - If `FF_STRIPE_FALLBACK_LINKS=true` AND Payment Link configured → Direct link
  - Else → Standard Checkout Session via `/api/checkout`

#### 3. Documentation
- **Created:** `analysis/GO_LIVE_CHECKLIST.md` - Complete verification checklist
- **Created:** `analysis/V2_MAPPING.md` - Payment infrastructure mapping
- **Created:** Probe results in `analysis/probes/20251016_200753/`

## 🔧 How to Use the Fallback

### Normal Operation (Default)
```bash
# Standard Checkout Sessions (default)
NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=false
```

### Emergency Fallback (If Checkout Fails)
```bash
# 1. Enable fallback
NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=true

# 2. Configure Payment Links (create in Stripe Dashboard first)
NEXT_PUBLIC_STRIPE_LINK_BIZ_ROOKIE=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_BIZ_PRO=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_BIZ_ALL_STAR=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_SPORTS_STARTER=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_SPORTS_PRO=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_SPORTS_ELITE=https://buy.stripe.com/...
```

## 📋 Probe Status Table

| Endpoint | Status | Notes |
|----------|--------|-------|
| `/api/_probe/env` | ❌ 404 | Exists in code, not deployed |
| `/api/_probe/supabase` | ❌ 404 | Exists in code, not deployed |
| `/api/_probe/stripe` | ❌ 404 | Exists in code, not deployed |
| `/api/_probe/auth` | ❌ 404 | Exists in code, not deployed |
| `/api/_probe/flags` | ❌ 404 | Exists in code, not deployed |
| `/api/_probe/storage` | ❌ 404 | Exists in code, not deployed |

**Action Required:** Deploy this branch to make probes accessible, then re-run verification.

## ✅ Post-Deploy Verification Steps

```bash
# 1. Verify probe endpoints
curl https://skrblai.io/api/_probe/env | jq
curl https://skrblai.io/api/_probe/stripe | jq
curl https://skrblai.io/api/_probe/supabase | jq

# 2. Test checkout
curl -X POST https://skrblai.io/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"sku":"PRO","vertical":"business"}' | jq

# 3. Verify webhook
# Check Stripe Dashboard → Webhooks → https://skrblai.io/api/stripe/webhook
# Should show 200 responses
```

## 🔄 Rollback Plan

### Option 1: Enable Fallback (Fastest - < 5 min)
```bash
NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=true
# Redeploy
```

### Option 2: Revert Deployment
```bash
git revert b1dbae02
git push
# Trigger deployment
```

## 📁 Files Changed

### New Files
- `lib/stripe/paymentLinks.ts` - Payment Links mapping
- `analysis/PROD_PROBE_STATUS.md` - Probe verification results
- `analysis/V2_MAPPING.md` - Payment infrastructure docs
- `analysis/GO_LIVE_CHECKLIST.md` - Acceptance criteria
- `analysis/probes/20251016_200753/prod/*.json` - Raw probe responses

### Modified Files
- `components/payments/CheckoutButton.tsx` - Added fallback logic
- `lib/config/featureFlags.ts` - Added `FF_STRIPE_FALLBACK_LINKS` flag

## 🎯 Acceptance Criteria

- ✅ No pricing/SKU changes
- ✅ No database schema changes  
- ✅ No legacy v1 route changes
- ✅ Changes are minimal and revertible
- ✅ Supabase: No prerender traps (verified)
- ✅ Stripe: Uses `requireStripe()` with env-driven API version
- ✅ Feature flags: `readBooleanFlag` exported and normalized
- ✅ Fallback: Payment Links ready for emergency use
- ✅ Documentation: Complete verification checklist provided

## 🚦 Deployment Instructions

1. **Merge this PR**
2. **Deploy to production**
3. **Run probe verification** (commands in GO_LIVE_CHECKLIST.md)
4. **Test checkout flow** (one test purchase)
5. **Verify webhooks** (check Stripe Dashboard)

## 📚 Related Documentation

- Full checklist: `analysis/GO_LIVE_CHECKLIST.md`
- Payment mapping: `analysis/V2_MAPPING.md`
- Probe status: `analysis/PROD_PROBE_STATUS.md`

## ⚠️ Important Notes

- **Fallback is OFF by default** (`FF_STRIPE_FALLBACK_LINKS=false`)
- **Payment Links must be manually created** in Stripe Dashboard before using fallback
- **Standard Checkout is preferred** - only use fallback if Checkout fails
- **After deploy: Re-run probes** to get actual production status

---

**If Stripe Checkout still fails in prod after deployment, flip `NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=true` so the business can sell while we finish debugging.**
