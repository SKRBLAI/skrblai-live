# Stripe SKU Diagnostics Report

## Test Results with Mock Environment Variables

The following test was run with mock environment variables to verify the price resolution logic:

```bash
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_test_starter
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_test_pro
NEXT_PUBLIC_STRIPE_PRICE_ELITE=price_test_elite
NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER=price_test_biz_starter
NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO=price_test_biz_pro
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE=price_test_biz_elite
NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO=price_test_addon_video
NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10=price_test_addon_scans10
```

## Supported SKUs and Resolution Status

### ✅ Successfully Resolved SKUs:
- `sports_plan_starter` → `price_test_starter` (NEXT_PUBLIC_STRIPE_PRICE_STARTER)
- `sports_plan_pro` → `price_test_pro` (NEXT_PUBLIC_STRIPE_PRICE_PRO)
- `sports_plan_elite` → `price_test_elite` (NEXT_PUBLIC_STRIPE_PRICE_ELITE)
- `biz_plan_starter` → `price_test_biz_starter` (NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER)
- `biz_plan_pro` → `price_test_biz_pro` (NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO)
- `biz_plan_elite` → `price_test_biz_elite` (NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE)
- `sports_addon_scans10` → `price_test_addon_scans10` (NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10)
- `sports_addon_video` → `price_test_addon_video` (NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO)

### ❌ Missing Environment Variables:
- `biz_plan_starter_m` - Missing NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M
- `biz_plan_pro_m` - Missing NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M
- `biz_plan_elite_m` - Missing NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M
- `sports_addon_emotion` - Missing NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION
- `sports_addon_nutrition` - Missing NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION
- `sports_addon_foundation` - Missing NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION
- `biz_addon_adv_analytics` - Missing NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS
- `biz_addon_automation` - Missing NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION
- `biz_addon_team_seat` - Missing NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT

## Resolution Logic Verification

The `resolvePriceIdFromSku` function correctly implements the specified resolution order:

### Sports Plans:
- `STARTER` → `SPORTS_STARTER` → `ROOKIE` → `_M` fallbacks
- `PRO` → `SPORTS_PRO` → `_M` fallbacks
- `ELITE` → `SPORTS_ELITE` → `ALLSTAR` → `_M` fallbacks

### Business Plans:
- `_BIZ` variants → `_M` fallbacks

### Add-ons:
- `sports_addon_*` → `ADDON_*` → `ADDON_*_M`
- `biz_addon_*` → `BIZ_ADDON_*` → `BIZ_ADDON_*_M`

## Required Environment Variables for Production

To support all catalog items, ensure these environment variables are set in Railway:

```bash
# Sports Plans
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_ELITE=price_xxx

# Business Plans
NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE=price_xxx

# Monthly Variants (optional)
NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M=price_xxx

# Add-ons (as needed)
NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10=price_xxx
# ... additional add-ons as catalog expands
```

## Files Using Price Resolver:
- `/lib/stripe/priceResolver.ts` - Main resolver logic
- Components that use pricing will call this resolver

## Recommendations:
1. **Verify all catalog SKUs have corresponding price IDs** in production environment
2. **Add missing monthly variants** for business plans if needed
3. **Test actual Stripe price IDs** with real environment variables
4. **Monitor for new catalog items** that need price ID configuration