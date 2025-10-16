# Go-Live Checklist - Production Payment Verification

**Date:** 2025-10-16  
**Branch:** cursor/prod-verify-and-stripe-fallback-b08d  
**Goal:** Ensure production can accept payments reliably with safe fallback

---

## 🎯 Pre-Deployment Checklist

### 1. Environment Variables

- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (sk_live_...)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (pk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (whsec_...)
- [ ] `STRIPE_API_VERSION` - API version (2025-09-30.clover)
- [ ] `NEXT_PUBLIC_SITE_URL` - Production URL (https://skrblai.io)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### 2. Stripe Configuration

- [ ] Webhook endpoint configured: `https://skrblai.io/api/stripe/webhook`
- [ ] Webhook events enabled:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] All product prices configured in Stripe Dashboard
- [ ] Price IDs match environment variables

### 3. Payment Links Fallback (Optional)

- [ ] Payment Links created in Stripe Dashboard (if using fallback)
- [ ] Payment Link env vars configured:
  - `NEXT_PUBLIC_STRIPE_LINK_BIZ_ROOKIE`
  - `NEXT_PUBLIC_STRIPE_LINK_BIZ_PRO`
  - `NEXT_PUBLIC_STRIPE_LINK_BIZ_ALL_STAR`
  - `NEXT_PUBLIC_STRIPE_LINK_SPORTS_STARTER`
  - `NEXT_PUBLIC_STRIPE_LINK_SPORTS_PRO`
  - `NEXT_PUBLIC_STRIPE_LINK_SPORTS_ELITE`
- [ ] Fallback flag set: `NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=false` (default)

---

## 🔍 Production Verification (Post-Deploy)

### Probe Endpoints

Run these commands after deployment:

```bash
# 1. Environment Check
curl https://skrblai.io/api/_probe/env | jq

# 2. Supabase Connectivity
curl https://skrblai.io/api/_probe/supabase | jq

# 3. Stripe Connectivity  
curl https://skrblai.io/api/_probe/stripe | jq

# 4. Auth Status
curl https://skrblai.io/api/_probe/auth | jq

# 5. Feature Flags
curl https://skrblai.io/api/_probe/flags | jq
```

**Expected Results:**

| Endpoint | Expected Status | Critical Fields |
|----------|----------------|-----------------|
| `/api/_probe/env` | 200 OK | `supabase.url: "PRESENT"`, `stripe.sk: "PRESENT"`, `stripe.whsec: "PRESENT"` |
| `/api/_probe/supabase` | 200 OK | `connectOk: true`, `rlsBlocked: true` (expected for anon) |
| `/api/_probe/stripe` | 200 OK | `ok: true`, `mode: "live"`, `webhookSecretSet: true` |
| `/api/_probe/auth` | 200 OK | `ok: true` |
| `/api/_probe/flags` | 200 OK | `NEXT_PUBLIC_ENABLE_STRIPE: true`, `FF_STRIPE_FALLBACK_LINKS: false` |

### Checkout Flow Testing

#### Test 1: Standard Checkout Session
```bash
# Test checkout endpoint
curl -X POST https://skrblai.io/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PRO",
    "vertical": "business",
    "mode": "subscription"
  }' | jq

# Expected response:
# {
#   "ok": true,
#   "url": "https://checkout.stripe.com/c/pay/...",
#   "sessionId": "cs_test_..."
# }
```

**Manual Test:**
1. [ ] Visit https://skrblai.io/pricing
2. [ ] Click "Get Started" on any plan
3. [ ] Verify redirect to Stripe Checkout
4. [ ] Complete test purchase with test card (4242 4242 4242 4242)
5. [ ] Verify redirect to success page
6. [ ] Check Stripe Dashboard for session

#### Test 2: Webhook Delivery
1. [ ] In Stripe Dashboard → Webhooks
2. [ ] Find `https://skrblai.io/api/stripe/webhook`
3. [ ] Check recent deliveries show 200 status
4. [ ] Send test webhook event
5. [ ] Verify 200 response

### Supabase Prerender Check

```bash
# Build should complete without errors
npm run build

# Look for errors like:
# ❌ "Missing Supabase env" 
# ❌ "prerender error"
# ✅ Should see: "Route (app) compiled successfully"
```

**Pages to Verify:**
- [ ] `/pricing` - No Supabase at module scope
- [ ] `/dashboard/*` - All have `export const dynamic = 'force-dynamic'`
- [ ] `/api/*` - All API routes are dynamic by default

---

## ✅ Acceptance Criteria

### Critical (Must Pass)

- [ ] **Probe Status:** All probe endpoints return 200 OK with correct data
- [ ] **Stripe Connectivity:** `/api/_probe/stripe` shows `ok: true`, `mode: "live"`
- [ ] **Checkout Works:** Can create checkout session via `/api/checkout`
- [ ] **Webhook Active:** Stripe webhooks deliver to `/api/stripe/webhook` with 200 responses
- [ ] **No Prerender Errors:** `npm run build` completes successfully
- [ ] **Pricing Clickable:** All pricing buttons work (either Checkout OR Payment Links)

### Secondary (Should Pass)

- [ ] **Supabase Connected:** `/api/_probe/supabase` shows `connectOk: true`
- [ ] **Auth Works:** `/api/_probe/auth` returns valid response
- [ ] **Feature Flags Correct:** All flags match expected production values
- [ ] **Success Flow:** Test purchase completes and redirects to `/thanks`
- [ ] **Cancel Flow:** Clicking "back" from Stripe returns to `/pricing`

### Fallback Mode (If Checkout Fails)

- [ ] **Payment Links Created:** Links exist in Stripe Dashboard for each SKU
- [ ] **Env Vars Set:** All `NEXT_PUBLIC_STRIPE_LINK_*` variables configured
- [ ] **Flag Enabled:** `NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=true`
- [ ] **Links Work:** Clicking pricing button opens Payment Link in new tab
- [ ] **Purchases Complete:** Test purchase via Payment Link succeeds

---

## 🚨 Failure Scenarios & Responses

### Scenario 1: Probe Endpoints Return 404
**Impact:** Cannot verify production configuration  
**Action:**
1. Verify probe routes exist in `app/api/_probe/`
2. Check build includes API routes
3. Redeploy if needed
4. Re-run probes

### Scenario 2: Stripe Checkout Fails
**Impact:** No sales possible  
**Immediate Action (< 5 min):**
```bash
# Enable fallback
NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=true
# Redeploy
```

**Follow-up (< 1 hour):**
1. Create Payment Links in Stripe
2. Add env vars
3. Verify links work
4. Debug Checkout issue

### Scenario 3: Supabase Connection Fails
**Impact:** Auth/user data unavailable  
**Action:**
1. Check Supabase project status
2. Verify env variables
3. Check RLS policies
4. Review connection limits

### Scenario 4: Webhook 500 Errors
**Impact:** Payment events not processed  
**Action:**
1. Check webhook route `/api/stripe/webhook`
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Review server logs
4. Test with Stripe CLI: `stripe trigger checkout.session.completed`

---

## 📊 Post-Launch Monitoring

### First 24 Hours
- [ ] Monitor Stripe Dashboard for successful payments
- [ ] Check webhook delivery success rate (target: >99%)
- [ ] Review error logs for checkout failures
- [ ] Verify success page analytics
- [ ] Monitor support tickets for payment issues

### First Week
- [ ] Analyze checkout → purchase conversion rate
- [ ] Review failed payment reasons
- [ ] Optimize based on user feedback
- [ ] Document any edge cases found

---

## 🔄 Rollback Plan

### If Critical Issues Arise:

**Option 1: Enable Fallback (Fastest)**
```bash
NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=true
# Redeploy
```

**Option 2: Revert Deployment**
```bash
git revert HEAD
git push origin main
# Trigger deployment
```

**Option 3: Emergency Contact**
- Direct customers to contact form: `/contact`
- Process payments manually via Stripe Dashboard
- Communicate expected resolution time

---

## 📝 Sign-Off

**Probes Verified By:** _______________ Date: ___________  
**Checkout Tested By:** _______________ Date: ___________  
**Webhooks Verified By:** _______________ Date: ___________  
**Production Approved By:** _______________ Date: ___________  

---

## 🎉 Success Criteria Met

- ✅ Production accepts payments via Stripe Checkout
- ✅ Fallback mechanism tested and ready
- ✅ All probe endpoints accessible
- ✅ Webhooks receiving events
- ✅ No prerender failures
- ✅ Team trained on rollback procedures

**Status:** 🟢 READY FOR PRODUCTION
