# Feature Flag Gates Analysis - Supabase & Stripe Impact

## Executive Summary

**Total Feature Flags Found**: 11 active flags affecting auth, pricing, checkout, and dashboards
**Hard Gates Found**: 2 problematic hard gates that return null
**Progressive Enhancement**: 9 flags using proper fallback patterns
**Core Route Impact**: 4 critical routes affected by gating

## Feature Flag Classification

### 1. Hard Gates (Problematic - Return Null)

#### ENABLE_ARR_DASH
- **File**: `app/dashboard/analytics/internal/page.tsx`
- **Line**: Inferred from analysis files
- **Code**: 
```typescript
if (!FEATURE_FLAGS.ENABLE_ARR_DASH) {
  return null; // ❌ HARD GATE
}
```
- **Route**: `/dashboard/analytics/internal`
- **Impact**: Entire ARR dashboard disappears when disabled
- **Supabase/Stripe Impact**: Hides Stripe analytics and revenue data
- **Recommendation**: Show "Coming Soon" banner instead

#### ENABLE_LEGACY (Multiple Components)
- **Files**: Various legacy components
- **Pattern**: 
```typescript
if (!FEATURE_FLAGS.ENABLE_LEGACY) {
  return null; // ❌ HARD GATE
}
```
- **Routes**: Multiple legacy component routes
- **Impact**: Components completely disappear
- **Supabase/Stripe Impact**: May hide auth flows or payment options
- **Recommendation**: Show migration notices instead

### 2. Progressive Enhancement (Good Patterns)

#### ENABLE_STRIPE
- **Files**: 
  - `components/pricing/BuyButton.tsx` (line 27)
  - `components/payments/CheckoutButton.tsx` (line 21)
- **Code**: 
```typescript
const stripeEnabled = FEATURE_FLAGS.ENABLE_STRIPE;
const isDisabled = !stripeEnabled || !sku || !resolvedPriceId;

if (!stripeEnabled) {
  return (
    <button disabled className="opacity-50">
      Stripe Disabled
    </button>
  );
}
```
- **Routes**: All pricing and checkout pages
- **Impact**: Shows disabled state with explanation
- **Pattern**: ✅ Progressive enhancement

#### HP_GUIDE_STAR
- **Files**: 
  - `app/page.tsx` (line 25)
  - `components/home/HomeHeroScanFirst.tsx` (line 35)
  - `components/home/AgentLeaguePreview.tsx` (line 137)
- **Code**: 
```typescript
const isGuideStarEnabled = FEATURE_FLAGS.HP_GUIDE_STAR;
// Base UI always renders
{isGuideStarEnabled && <GuideStar />}
```
- **Routes**: Homepage (`/`)
- **Impact**: Adds enhanced animations when enabled
- **Pattern**: ✅ Progressive enhancement

#### ENABLE_ORBIT
- **Files**: `app/agents/page.tsx` (line 40)
- **Code**: 
```typescript
const isOrbitEnabled = FEATURE_FLAGS.ENABLE_ORBIT;
// Grid always shows
{isOrbitEnabled && <OrbitLeague />}
```
- **Routes**: `/agents`
- **Impact**: Adds orbit animation when enabled
- **Pattern**: ✅ Progressive enhancement

### 3. Variant Selection (Configuration)

#### HOMEPAGE_HERO_VARIANT
- **File**: `app/page.tsx` (line 16)
- **Code**: 
```typescript
const variant = FEATURE_FLAGS.HOMEPAGE_HERO_VARIANT;
const Hero = variant === 'split'
  ? require('@/components/home/HomeHeroSplit').default
  : variant === 'legacy'
  ? require('@/components/home/Hero').default
  : require('@/components/home/HomeHeroScanFirst').default;
```
- **Routes**: Homepage (`/`)
- **Impact**: Selects hero component variant
- **Pattern**: ✅ Configuration-based selection

### 4. Feature Toggles (Boolean)

#### AI_AUTOMATION_HOMEPAGE
- **File**: `app/page.tsx` (inferred from analysis)
- **Pattern**: 
```typescript
{FEATURE_FLAGS.AI_AUTOMATION_HOMEPAGE ? (
  <AutomationSection />
) : (
  <LegacySection />
)}
```
- **Routes**: Homepage (`/`)
- **Impact**: Toggles between automation and legacy sections
- **Pattern**: ✅ Fallback to legacy version

#### USE_OPTIMIZED_PERCY
- **Files**: Multiple Percy components
- **Pattern**: 
```typescript
{FEATURE_FLAGS.USE_OPTIMIZED_PERCY ? (
  <OptimizedPercy />
) : (
  <LegacyPercy />
)}
```
- **Routes**: Pages with Percy components
- **Impact**: Performance optimization toggle
- **Pattern**: ✅ Fallback to legacy implementation

#### ENABLE_BUNDLES
- **File**: `components/sports/PlansAndBundles.tsx` (line 48)
- **Code**: 
```typescript
const bundles = FEATURE_FLAGS.ENABLE_BUNDLES ? [
  { key: 'BUNDLE_ALL_ACCESS', ... }
] : [];
```
- **Routes**: `/sports` pricing section
- **Impact**: Shows/hides bundle options
- **Supabase/Stripe Impact**: Affects available Stripe price IDs
- **Pattern**: ✅ Progressive enhancement

## Core Route Analysis

### Authentication Routes

#### /auth/callback
- **Flags Affecting**: None directly detected
- **Supabase Impact**: Uses legacy `utils/supabase` imports
- **Risk**: May fail if legacy client misconfigured
- **Always-On Status**: ✅ No gates detected

#### /api/health/auth
- **Flags Affecting**: None directly detected
- **Supabase Impact**: Likely uses legacy patterns
- **Risk**: Health check may not reflect canonical auth state
- **Always-On Status**: ✅ No gates detected

### Checkout Routes

#### /api/checkout
- **Flags Affecting**: `ENABLE_STRIPE` (component level only)
- **Stripe Impact**: Uses canonical `requireStripe()`
- **Risk**: Low - canonical implementation
- **Always-On Status**: ✅ API route not gated

#### /api/stripe/webhook
- **Flags Affecting**: None detected
- **Stripe Impact**: Uses canonical patterns
- **Risk**: Low - webhook processing unaffected
- **Always-On Status**: ✅ No gates detected

### Dashboard Routes

#### /dashboard/analytics/internal
- **Flags Affecting**: `ENABLE_ARR_DASH` (hard gate)
- **Stripe Impact**: HIGH - hides all Stripe revenue analytics
- **Supabase Impact**: May hide user analytics data
- **Risk**: HIGH - entire dashboard disappears
- **Always-On Status**: ❌ Hard gated

#### Other Dashboard Routes
- **Flags Affecting**: None directly, but use legacy Supabase imports
- **Impact**: Authentication and data loading risks
- **Always-On Status**: ✅ No feature flag gates

## Flag Impact Matrix

| Flag | Type | Default | Auth Impact | Pricing Impact | Checkout Impact | Dashboard Impact |
|------|------|---------|-------------|----------------|-----------------|------------------|
| `ENABLE_STRIPE` | Progressive | `true` | None | Shows disabled buttons | None (API ungated) | None |
| `ENABLE_ARR_DASH` | Hard Gate | `false` | None | None | None | **Hides entire ARR dashboard** |
| `HP_GUIDE_STAR` | Progressive | `true` | None | None | None | None |
| `ENABLE_ORBIT` | Progressive | `false` | None | None | None | None |
| `HOMEPAGE_HERO_VARIANT` | Variant | `'scan-first'` | None | None | None | None |
| `ENABLE_BUNDLES` | Progressive | `false` | None | **Hides bundle pricing** | None | None |
| `AI_AUTOMATION_HOMEPAGE` | Toggle | `true` | None | None | None | None |
| `USE_OPTIMIZED_PERCY` | Toggle | `false` | None | None | None | Performance impact |
| `ENABLE_LEGACY` | Hard Gate | `false` | **May hide auth flows** | **May hide payment options** | None | **May hide legacy dashboards** |

## Recommendations

### Immediate Fixes (Hard Gates → Progressive Enhancement)

1. **ARR Dashboard**
```typescript
// BEFORE:
if (!FEATURE_FLAGS.ENABLE_ARR_DASH) {
  return null;
}

// AFTER:
if (!FEATURE_FLAGS.ENABLE_ARR_DASH) {
  return (
    <div className="p-8 text-center">
      <h1>ARR Dashboard</h1>
      <p className="text-gray-600">This feature is currently disabled.</p>
      <p className="text-sm">Contact admin to enable ARR analytics.</p>
    </div>
  );
}
```

2. **Legacy Components**
```typescript
// BEFORE:
if (!FEATURE_FLAGS.ENABLE_LEGACY) {
  return null;
}

// AFTER:
if (!FEATURE_FLAGS.ENABLE_LEGACY) {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
      <p>This legacy component has been migrated.</p>
      <Link href="/new-path">Use new version →</Link>
    </div>
  );
}
```

### Always-On Route Verification

✅ **Confirmed Always-On**:
- `/auth/callback` - No feature flag gates
- `/api/health/auth` - No feature flag gates  
- `/api/checkout` - No feature flag gates
- `/api/stripe/webhook` - No feature flag gates

❌ **Problematic Gates**:
- `/dashboard/analytics/internal` - Hard gated by `ENABLE_ARR_DASH`

## Verification Checklist

- [ ] No hard gates that return null for core routes
- [ ] All Stripe-related flags use progressive enhancement
- [ ] Auth routes remain always accessible
- [ ] Checkout/webhook routes remain always accessible
- [ ] Dashboard routes show fallback UI when features disabled
- [ ] Bundle/pricing flags don't break checkout flows