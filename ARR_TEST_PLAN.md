# ARR Telemetry Testing Plan

## Pre-Deployment Checklist

### Environment Variables Setup
- [ ] `STRIPE_SECRET_KEY` is set (starts with `sk_`)
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ROOKIE` or `NEXT_PUBLIC_STRIPE_PRICE_ROOKIE_M` is set
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_PRO` or `NEXT_PUBLIC_STRIPE_PRICE_PRO_M` is set
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR` or `NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR_M` is set
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER` or `NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M` is set
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO` or `NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M` is set
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE` or `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M` is set
- [ ] (Optional) `NEXT_PUBLIC_ENABLE_ARR_DASH=1` to enable dashboard cards
- [ ] (Optional) `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for snapshots

### Database Migration
- [ ] Run migration: `supabase/migrations/20250930_arr_snapshots.sql`
- [ ] Verify table exists: `SELECT * FROM arr_snapshots LIMIT 1;`
- [ ] Verify index exists: `\d arr_snapshots` (should show `idx_arr_snapshots_captured_at`)

## API Testing

### Test 1: ARR Endpoint (Success Case)
```bash
curl https://your-domain.com/api/analytics/arr
```

**Expected Response (200 OK):**
```json
{
  "ok": true,
  "sportsARR": 12000,
  "businessARR": 24000,
  "totalARR": 36000,
  "counts": {
    "sportsSubs": 10,
    "businessSubs": 20,
    "unknownSubs": 0
  }
}
```

**Verify:**
- [ ] Response status is 200
- [ ] `ok` is `true`
- [ ] All ARR values are numbers
- [ ] Subscription counts match expected active subscriptions in Stripe

### Test 2: ARR Endpoint (Stripe Unavailable)
**Setup:** Temporarily unset `STRIPE_SECRET_KEY`

```bash
curl https://your-domain.com/api/analytics/arr
```

**Expected Response (503 Service Unavailable):**
```json
{
  "ok": false,
  "reason": "stripe_unavailable"
}
```

**Verify:**
- [ ] Response status is 503
- [ ] `ok` is `false`
- [ ] `reason` is `"stripe_unavailable"`
- [ ] No crash or 500 error

**Cleanup:** Restore `STRIPE_SECRET_KEY`

### Test 3: Snapshot Endpoint (Success Case)
```bash
curl -X POST https://your-domain.com/api/analytics/arr/snapshot
```

**Expected Response (200 OK):**
```json
{
  "ok": true,
  "snapshot": {
    "id": 1,
    "captured_at": "2025-09-30T12:00:00.000Z",
    "sports_arr": 12000,
    "business_arr": 24000,
    "total_arr": 36000
  }
}
```

**Verify:**
- [ ] Response status is 200
- [ ] `ok` is `true`
- [ ] Snapshot data matches current ARR
- [ ] Database has new row: `SELECT * FROM arr_snapshots ORDER BY id DESC LIMIT 1;`

### Test 4: Snapshot Endpoint (Supabase Unavailable)
**Setup:** Temporarily unset Supabase keys

```bash
curl -X POST https://your-domain.com/api/analytics/arr/snapshot
```

**Expected Response (503 Service Unavailable):**
```json
{
  "ok": false,
  "reason": "supabase_unavailable"
}
```

**Verify:**
- [ ] Response status is 503
- [ ] `ok` is `false`
- [ ] `reason` is `"supabase_unavailable"`
- [ ] No crash or 500 error

**Cleanup:** Restore Supabase keys

### Test 5: Snapshot Endpoint (Stripe Unavailable)
**Setup:** Temporarily unset `STRIPE_SECRET_KEY`

```bash
curl -X POST https://your-domain.com/api/analytics/arr/snapshot
```

**Expected Response (503 Service Unavailable):**
```json
{
  "ok": false,
  "reason": "stripe_unavailable"
}
```

**Verify:**
- [ ] Response status is 503
- [ ] `ok` is `false`
- [ ] `reason` is `"stripe_unavailable"`
- [ ] No database insert occurred

**Cleanup:** Restore `STRIPE_SECRET_KEY`

## Dashboard Testing

### Test 6: Dashboard with ARR Cards Enabled
**Setup:** Set `NEXT_PUBLIC_ENABLE_ARR_DASH=1`

1. Navigate to: `https://your-domain.com/dashboard/analytics/internal`

**Expected:**
- [ ] Page loads without errors
- [ ] Three ARR cards appear below key metrics section
- [ ] Sports ARR card shows:
  - Dollar icon (blue)
  - "Sports ARR" label
  - Dollar amount formatted with commas
  - Subscription count
- [ ] Business ARR card shows:
  - Dollar icon (green)
  - "Business ARR" label
  - Dollar amount formatted with commas
  - Subscription count
- [ ] Total ARR card shows:
  - Dollar icon (purple)
  - "Total ARR" label
  - Dollar amount formatted with commas
  - Total subscription count
- [ ] Values match API response from Test 1

### Test 7: Dashboard with ARR Cards Disabled
**Setup:** Unset or set `NEXT_PUBLIC_ENABLE_ARR_DASH=0`

1. Navigate to: `https://your-domain.com/dashboard/analytics/internal`

**Expected:**
- [ ] Page loads without errors
- [ ] ARR cards do NOT appear
- [ ] Other analytics cards (events, users, etc.) still visible
- [ ] No console errors related to ARR

### Test 8: Dashboard with Stripe Unavailable
**Setup:** 
- Set `NEXT_PUBLIC_ENABLE_ARR_DASH=1`
- Temporarily unset `STRIPE_SECRET_KEY`

1. Navigate to: `https://your-domain.com/dashboard/analytics/internal`

**Expected:**
- [ ] Page loads without errors
- [ ] A single card appears with message: "ARR unavailable (stripe_unavailable)"
- [ ] No crash or error overlay
- [ ] Other analytics sections still work

**Cleanup:** Restore `STRIPE_SECRET_KEY`

## Smoke Test Script

### Test 9: Run Smoke Test
```bash
npm run smoke:arr
```

**Expected Output:**
```
ARR check → {
  ok: true,
  sportsARR: 12000,
  businessARR: 24000,
  totalARR: 36000,
  counts: { sportsSubs: 10, businessSubs: 20, unknownSubs: 0 }
}
```

**Verify:**
- [ ] Script runs without errors
- [ ] Output shows ARR data
- [ ] Values are reasonable

## Data Validation Testing

### Test 10: Verify ARR Calculation Accuracy

1. **Manual Stripe Check:**
   - Log into Stripe Dashboard
   - Navigate to Subscriptions → Active
   - Note down all active monthly subscriptions
   - Calculate expected ARR: (sum of monthly prices) × 12

2. **Compare with API:**
   ```bash
   curl https://your-domain.com/api/analytics/arr
   ```

3. **Verify:**
   - [ ] `totalARR` matches manual calculation (within rounding)
   - [ ] `sportsSubs` + `businessSubs` equals total active subscriptions
   - [ ] `unknownSubs` is 0 (or matches subscriptions with non-plan prices)

### Test 11: Verify Vertical Classification

1. **Check Sports Subscriptions:**
   - In Stripe, filter by sports price IDs (ROOKIE, PRO, ALLSTAR)
   - Count active subscriptions
   - Compare with `counts.sportsSubs` from API

2. **Check Business Subscriptions:**
   - In Stripe, filter by business price IDs (STARTER, PRO, ELITE)
   - Count active subscriptions
   - Compare with `counts.businessSubs` from API

3. **Verify:**
   - [ ] Sports count matches Stripe
   - [ ] Business count matches Stripe
   - [ ] No subscriptions misclassified

## Edge Cases

### Test 12: No Active Subscriptions
**Setup:** Test in a Stripe test environment with no active subscriptions

```bash
curl https://your-domain.com/api/analytics/arr
```

**Expected Response:**
```json
{
  "ok": true,
  "sportsARR": 0,
  "businessARR": 0,
  "totalARR": 0,
  "counts": {
    "sportsSubs": 0,
    "businessSubs": 0,
    "unknownSubs": 0
  }
}
```

**Verify:**
- [ ] All values are 0
- [ ] No errors or crashes

### Test 13: Large Number of Subscriptions (Pagination)
**Setup:** Test with > 100 active subscriptions (triggers pagination)

```bash
curl https://your-domain.com/api/analytics/arr
```

**Verify:**
- [ ] All subscriptions are counted (not just first 100)
- [ ] Response time is reasonable (< 5 seconds)
- [ ] ARR totals are accurate

### Test 14: Subscriptions with Unknown Price IDs
**Setup:** Create a test subscription with a price ID not in env vars

```bash
curl https://your-domain.com/api/analytics/arr
```

**Verify:**
- [ ] `unknownSubs` count includes the test subscription
- [ ] Unknown subscriptions don't contribute to `sportsARR` or `businessARR`
- [ ] No crashes or errors

## Performance Testing

### Test 15: Response Time
```bash
time curl https://your-domain.com/api/analytics/arr
```

**Verify:**
- [ ] Response time < 3 seconds (for < 100 subscriptions)
- [ ] Response time < 10 seconds (for 100-500 subscriptions)
- [ ] No timeout errors

### Test 16: Concurrent Requests
```bash
for i in {1..10}; do
  curl https://your-domain.com/api/analytics/arr &
done
wait
```

**Verify:**
- [ ] All requests succeed
- [ ] No rate limit errors from Stripe
- [ ] Consistent responses across all requests

## Security Testing

### Test 17: CORS and Authentication
```bash
# Test CORS (if applicable)
curl -H "Origin: https://malicious-site.com" https://your-domain.com/api/analytics/arr

# Test without authentication (if required)
curl https://your-domain.com/api/analytics/arr
```

**Verify:**
- [ ] Appropriate CORS headers (or blocked if not allowed)
- [ ] Authentication enforced if required
- [ ] No sensitive data leaked in error messages

### Test 18: Secret Exposure Check
```bash
# Check logs for any exposed secrets
# View application logs after making requests

curl https://your-domain.com/api/analytics/arr
curl -X POST https://your-domain.com/api/analytics/arr/snapshot
```

**Verify:**
- [ ] No `STRIPE_SECRET_KEY` in logs
- [ ] No `SUPABASE_SERVICE_ROLE_KEY` in logs
- [ ] Price IDs are logged (okay, they're public)
- [ ] No stack traces with sensitive paths

## Integration Testing

### Test 19: End-to-End Workflow
1. Create a new subscription in Stripe (sports tier)
2. Wait 30 seconds for Stripe to propagate
3. Call ARR API: `curl /api/analytics/arr`
4. Verify sports count increased by 1
5. Create snapshot: `curl -X POST /api/analytics/arr/snapshot`
6. Check dashboard shows updated values
7. Cancel the subscription
8. Wait 30 seconds
9. Call ARR API again
10. Verify sports count decreased by 1

**Verify:**
- [ ] All steps complete without errors
- [ ] ARR values update correctly
- [ ] Dashboard reflects changes
- [ ] Snapshots capture correct values

## Regression Testing

### Test 20: Existing Features Unchanged
**Verify that ARR implementation didn't break existing features:**

- [ ] Checkout flow still works (`/checkout`)
- [ ] Pricing pages load correctly (`/pricing`, `/business/pricing`)
- [ ] Other analytics endpoints work (`/api/analytics/dashboard`, etc.)
- [ ] Dashboard loads all existing metrics (events, users, popups, add-ons)
- [ ] No TypeScript errors in build: `npm run build` (if dependencies installed)

## Post-Deployment Verification

### Test 21: Production Smoke Test
After deploying to production:

```bash
# Replace with actual production domain
PROD_DOMAIN="https://skrbl.ai"

# Test ARR endpoint
curl $PROD_DOMAIN/api/analytics/arr

# Test dashboard
open $PROD_DOMAIN/dashboard/analytics/internal

# Create snapshot (if cron not set up yet)
curl -X POST $PROD_DOMAIN/api/analytics/arr/snapshot
```

**Verify:**
- [ ] ARR endpoint returns real production data
- [ ] Dashboard displays ARR cards (if flag enabled)
- [ ] Snapshot successfully saved to production database
- [ ] No errors in production logs

### Test 22: Monitor for 24 Hours
- [ ] Check error logs for any ARR-related errors
- [ ] Monitor API response times
- [ ] Verify no Stripe rate limit issues
- [ ] Check database for growing snapshot history (if cron enabled)

## Optional: Cron Job Setup

### Test 23: Daily Snapshot Cron
**Setup cron job (example using cron syntax):**
```bash
0 0 * * * curl -X POST https://your-domain.com/api/analytics/arr/snapshot
```

**Or using Vercel Cron (vercel.json):**
```json
{
  "crons": [{
    "path": "/api/analytics/arr/snapshot",
    "schedule": "0 0 * * *"
  }]
}
```

**Verify after 24 hours:**
- [ ] New snapshot created automatically
- [ ] Snapshots table has entries for each day
- [ ] No errors in cron logs

## Troubleshooting Guide

### Issue: ARR returns 0 for all values
**Possible causes:**
- Price ID env vars don't match actual Stripe price IDs
- No active subscriptions in Stripe
- Subscriptions are in a different status (trialing, canceled)

**Fix:**
- Verify price IDs in Stripe Dashboard
- Check subscription status in Stripe
- Review `unknownSubs` count (should be > 0 if classification failing)

### Issue: Dashboard shows "ARR unavailable"
**Possible causes:**
- `STRIPE_SECRET_KEY` not set or invalid
- API endpoint returning error
- Network issue between frontend and backend

**Fix:**
- Check browser console for API errors
- Verify `STRIPE_SECRET_KEY` in environment variables
- Test API endpoint directly: `curl /api/analytics/arr`

### Issue: Snapshot fails with "insert_failed"
**Possible causes:**
- Database migration not run
- RLS policy blocking insert
- Invalid data format

**Fix:**
- Verify `arr_snapshots` table exists
- Check table schema matches migration
- Review Supabase logs for detailed error

---

**Testing Completed By:** _______________  
**Date:** _______________  
**Environment:** [ ] Staging [ ] Production  
**Result:** [ ] Pass [ ] Fail (see notes)  
**Notes:**