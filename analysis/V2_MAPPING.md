# V2 Payment Infrastructure Mapping

**Last Updated:** 2025-10-16

## Overview

This document maps the payment infrastructure for the v2 funnel, including SKU → Payment Link fallback mappings.

## Current Checkout Flow

### Standard Flow (Default)
- **Entry Points:** `/pricing`, `/sports/pricing`
- **Component:** `CheckoutButton` component
- **API Route:** `/api/checkout` (POST)
- **Stripe Method:** Checkout Sessions (hosted)
- **Success URL:** `/thanks?session_id={CHECKOUT_SESSION_ID}`
- **Cancel URL:** `/pricing`

### Fallback Flow (When FF_STRIPE_FALLBACK_LINKS=true)
- **Entry Points:** Same as standard
- **Component:** `CheckoutButton` component (renders as `<a>` tag)
- **Stripe Method:** Payment Links (hosted, pre-created)
- **Redirect:** Direct to Stripe Payment Link
- **Return:** Configured in Payment Link settings

## SKU → Payment Link Mapping

### Business Plans

| SKU | Plan Name | Payment Link URL | Status |
|-----|-----------|-----------------|--------|
| `ROOKIE` | Rookie | `NEXT_PUBLIC_STRIPE_LINK_BIZ_ROOKIE` | ⚠️ Not Configured |
| `PRO` | Pro | `NEXT_PUBLIC_STRIPE_LINK_BIZ_PRO` | ⚠️ Not Configured |
| `ALL_STAR` | All Star | `NEXT_PUBLIC_STRIPE_LINK_BIZ_ALL_STAR` | ⚠️ Not Configured |
| `FRANCHISE` | Franchise | N/A (Contact Sales) | N/A |

### Sports Plans

| SKU | Plan Name | Payment Link URL | Status |
|-----|-----------|-----------------|--------|
| `SPORTS_STARTER` | Starter | `NEXT_PUBLIC_STRIPE_LINK_SPORTS_STARTER` | ⚠️ Not Configured |
| `SPORTS_PRO` | Pro | `NEXT_PUBLIC_STRIPE_LINK_SPORTS_PRO` | ⚠️ Not Configured |
| `SPORTS_ELITE` | Elite | `NEXT_PUBLIC_STRIPE_LINK_SPORTS_ELITE` | ⚠️ Not Configured |

### Legacy Aliases

| Legacy SKU | Maps To | Notes |
|-----------|---------|-------|
| `BIZ_STARTER` | `ROOKIE` | Backward compatibility |
| `BIZ_PRO` | `PRO` | Backward compatibility |
| `BIZ_ELITE` | `ALL_STAR` | Backward compatibility |
| `SPORTS_STARTER` | `SPORTS_STARTER` | Direct mapping |

## How to Configure Payment Links

### 1. Create Payment Links in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Payment Links
2. Click "Create payment link"
3. For each product:
   - Select the price (monthly subscription)
   - Configure success/cancel URLs
   - Copy the generated link (format: `https://buy.stripe.com/...`)

### 2. Add to Environment Variables

Add to your `.env.local` or production environment:

```bash
# Business Plans
NEXT_PUBLIC_STRIPE_LINK_BIZ_ROOKIE=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_BIZ_PRO=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_BIZ_ALL_STAR=https://buy.stripe.com/...

# Sports Plans
NEXT_PUBLIC_STRIPE_LINK_SPORTS_STARTER=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_SPORTS_PRO=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_SPORTS_ELITE=https://buy.stripe.com/...
```

### 3. Enable Fallback (Emergency Only)

```bash
NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=true
```

## Feature Flag Configuration

### Payment Links Fallback Flag

**Environment Variable:** `NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS`  
**Default:** `false`  
**Values:** `true`, `false`, `1`, `0`

**When to Enable:**
- Stripe Checkout Sessions are failing in production
- Need to maintain sales while debugging
- Emergency fallback scenario

**How it Works:**
1. `CheckoutButton` checks `FEATURE_FLAGS.FF_STRIPE_FALLBACK_LINKS`
2. If `true` AND Payment Link configured for SKU:
   - Renders as `<a>` tag with `href={paymentLink}`
   - Opens in new tab (`target="_blank"`)
3. If `false` OR no Payment Link:
   - Uses standard Checkout Session flow via `/api/checkout`

## Verification Steps

### Local Testing
```bash
# Test standard flow
npm run dev
# Visit /pricing, click any plan button
# Should POST to /api/checkout → Stripe Checkout Session

# Test fallback flow
# 1. Add payment links to .env.local
# 2. Set NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=true
npm run dev
# Visit /pricing, click any plan button  
# Should open Payment Link in new tab
```

### Production Verification
```bash
# Check if payment links are configured
curl https://skrblai.io/api/_probe/flags | jq '.flags.FF_STRIPE_FALLBACK_LINKS'

# Verify checkout endpoint
curl -X POST https://skrblai.io/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"sku":"PRO","vertical":"business"}' | jq
```

## Rollback Plan

If Stripe Checkout fails in production:

1. **Immediate (< 5 min):**
   ```bash
   # Set fallback flag in production env
   NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=true
   ```

2. **Short-term (< 1 hour):**
   - Create Payment Links in Stripe Dashboard
   - Add env vars to production
   - Redeploy

3. **Long-term:**
   - Debug Checkout Session issue
   - Fix root cause
   - Disable fallback flag
   - Redeploy

## Notes

- Payment Links are a **fallback only**, not the primary method
- Payment Links require manual creation per product in Stripe Dashboard
- Standard Checkout Sessions provide better integration and metadata handling
- Always test both flows in staging before production deployment
