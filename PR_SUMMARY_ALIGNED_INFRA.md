# PR Summary: Unified Auth/Stripe/Feature Flags Infrastructure

**Title:** `chore: unify feature flags, stabilize auth + stripe, de-legacy (no price changes)`

## Overview

This PR addresses the core infrastructure issues causing disabled Stripe buttons, auth failures, and invisible features by unifying feature flags, stabilizing auth/Stripe resolution, and gating legacy code paths. **No prices or environment variable names were changed.**

## Files Modified & Rationale

### 1. Feature Flags Unification
- **`lib/config/featureFlags.ts`** - Unified all feature flags into single source of truth with progressive enhancement approach
  - Consolidated flags from multiple files (percyFeatureFlags.ts, hardcoded values)
  - Added new flags: `ENABLE_ORBIT`, `ENABLE_ARR_DASH`, `ENABLE_STRIPE`, `ENABLE_LEGACY`, `ENABLE_BUNDLES`
  - All flags use `readBooleanFlag()` helper with consistent defaults

### 2. Stripe Resolution Improvements
- **`components/pricing/BuyButton.tsx`** - Updated resolver to prefer current env names with legacy fallbacks
  - Priority order: `STARTER/PRO/ELITE` → `SPORTS_*/BIZ_*` → `ROOKIE/ALLSTAR` → `*_M` variants
  - Uses unified `FEATURE_FLAGS.ENABLE_STRIPE` instead of direct env check
- **`app/api/checkout/route.ts`** - Aligned server-side resolver with same priority order
  - Added bundle/package gating behind `NEXT_PUBLIC_ENABLE_BUNDLES` (default: disabled)
  - Improved error handling and logging

### 3. Auth & Supabase Stabilization
- **`lib/supabase/client.ts`** - Added dual key lookup for browser client
  - URL: `NEXT_PUBLIC_SUPABASE_URL` → `SUPABASE_URL`
  - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → `SUPABASE_ANON_KEY`
- **`lib/supabase/server.ts`** - Added dual key lookup for server clients
  - Same fallback pattern for consistent resolution

### 4. Environment Check API Enhancement
- **`app/api/env-check/route.ts`** - Enhanced to show which env key names matched
  - Returns `"PRESENT via NEXT_PUBLIC_STRIPE_PRICE_STARTER"` instead of just `"PRESENT"`
  - Updated to use current preferred env names with fallbacks
  - Added new flags to monitoring

### 5. Legacy Code Gating
- **`components/legacy/home/PercyOnboardingRevolution.tsx`** - Gated behind `ENABLE_LEGACY` flag
  - Shows friendly message when disabled with return-to-homepage button
- **`app/page.tsx`** - Updated to use unified feature flags
- **`components/home/HomeHeroScanFirst.tsx`** - Updated to use unified feature flags
- **`components/home/AgentLeaguePreview.tsx`** - Updated to use unified feature flags

## Environment Variable Resolution Order

### Stripe Price IDs (Current → Legacy)
```
Sports Plans:
- STARTER: NEXT_PUBLIC_STRIPE_PRICE_STARTER → NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER → NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER_M
- PRO: NEXT_PUBLIC_STRIPE_PRICE_PRO → NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO → NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO_M  
- ELITE: NEXT_PUBLIC_STRIPE_PRICE_ELITE → NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE → NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE_M

Business Plans:
- BIZ_STARTER: NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER → NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M
- BIZ_PRO: NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO → NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M
- BIZ_ELITE: NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE → NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M

Add-ons:
- ADDON_*: NEXT_PUBLIC_STRIPE_PRICE_ADDON_* → NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_* → *_M variants
```

### Supabase Keys (Dual Lookup)
```
URL: NEXT_PUBLIC_SUPABASE_URL → SUPABASE_URL
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY → NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY → SUPABASE_ANON_KEY
```

### Site URLs (Fallback Chain)
```
SITE_URL: NEXT_PUBLIC_SITE_URL → NEXT_PUBLIC_BASE_URL → APP_BASE_URL
```

## Feature Flags (Final Names & Env Keys)

| Flag | Env Key | Default | Purpose |
|------|---------|---------|---------|
| `HP_GUIDE_STAR` | `NEXT_PUBLIC_HP_GUIDE_STAR` | `true` | Homepage league preview |
| `HOMEPAGE_HERO_VARIANT` | `NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT` | `'scan-first'` | Hero variant (scan-first\|split\|legacy) |
| `ENABLE_ORBIT` | `NEXT_PUBLIC_ENABLE_ORBIT` | `false` | Orbit animation on /agents |
| `ENABLE_ARR_DASH` | `NEXT_PUBLIC_ENABLE_ARR_DASH` | `false` | ARR dashboard features |
| `ENABLE_STRIPE` | `NEXT_PUBLIC_ENABLE_STRIPE` | `true` | Global Stripe toggle |
| `ENABLE_LEGACY` | `NEXT_PUBLIC_ENABLE_LEGACY` | `false` | Gate legacy code paths |
| `ENABLE_BUNDLES` | `NEXT_PUBLIC_ENABLE_BUNDLES` | `false` | Legacy bundle pricing |

## Legacy Paths Gated

- `components/legacy/home/PercyOnboardingRevolution.tsx` - Only renders if `ENABLE_LEGACY=1`
- Bundle/package SKUs in checkout - Only work if `ENABLE_BUNDLES=1`

## How to Verify

### 1. Environment Check
```bash
curl https://your-domain.com/api/env-check
```
Expected output shows:
- `"STARTER": "PRESENT via NEXT_PUBLIC_STRIPE_PRICE_STARTER"` (not SPORTS_*)
- `"SUPABASE_URL": "PRESENT via NEXT_PUBLIC_SUPABASE_URL"`
- `"SUPABASE_ANON_KEY": "PRESENT via NEXT_PUBLIC_SUPABASE_ANON_KEY"`

### 2. Stripe Button Test
With only these env vars set:
```
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_yyy  
NEXT_PUBLIC_STRIPE_PRICE_ELITE=price_zzz
NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER=price_aaa
NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10=price_bbb
NEXT_PUBLIC_ENABLE_STRIPE=1
```
Result: Buttons should be enabled and checkout sessions should be created successfully.

### 3. Feature Flag Test
- `/agents` renders grid; shows Orbit when `NEXT_PUBLIC_ENABLE_ORBIT=1`
- Auth pages render without pre-form errors
- Password AND magic link options work
- Google button only appears if Google secrets are present

### 4. Legacy Gate Test
- With `NEXT_PUBLIC_ENABLE_LEGACY=0` (default): Legacy Percy shows disabled message
- With `NEXT_PUBLIC_ENABLE_LEGACY=1`: Legacy Percy renders normally

## Breaking Changes

**None.** This is a non-destructive refactor that:
- Maintains all existing environment variable support
- Adds progressive enhancement (base UI always renders)
- Gates problematic code behind flags (default: disabled)
- Preserves all current pricing and functionality

## Rollback Plan

If issues arise:
1. Set `NEXT_PUBLIC_ENABLE_LEGACY=1` to restore legacy components
2. All existing env vars continue to work via fallback chains
3. No database migrations or external service changes required

## Testing Checklist

- [ ] `/api/env-check` shows correct env key resolution
- [ ] Stripe buttons enable with canonical env names only
- [ ] Checkout sessions create successfully
- [ ] Auth pages render and function without errors
- [ ] Feature flags toggle correctly (Orbit, Guide Star, etc.)
- [ ] Legacy components gate properly
- [ ] No console errors in browser
- [ ] No 500 errors in server logs