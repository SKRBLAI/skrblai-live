# Pricing Component Usage Map

## Import Graph

### Core Pricing Components
- `components/pricing/BuyButton.tsx` - Main purchase button component
- `components/pricing/PricingCard.tsx` - Reusable pricing card wrapper
- `components/pricing/SportsPricingGrid.tsx` - Sports-specific pricing grid
- `components/pricing/BusinessPricingGrid.tsx` - Business-specific pricing grid
- `components/pricing/PricingGrid.tsx` - Generic pricing grid component

### Importers and Usage

#### BuyButton.tsx
**Used by:**
- `components/pricing/SportsPricingGrid.tsx` (lines 52-60)
- `components/pricing/BusinessPricingGrid.tsx` (lines 50-59, 101-110)

**Gates found:**
- `FEATURE_FLAGS.ENABLE_STRIPE` (line 27) - Hard gate: disables button if false
- No role-based gates found

#### PricingCard.tsx
**Used by:**
- `components/pricing/SportsPricingGrid.tsx` (lines 66-78)
- `components/pricing/BusinessPricingGrid.tsx` (lines 63-74)
- `components/pricing/PricingGrid.tsx` (lines 103-118)
- `app/pricing/page.tsx` (lines 13, 33)

**Gates found:**
- No feature flags or gates found

#### SportsPricingGrid.tsx
**Used by:**
- `app/sports/page.tsx` (line 12, 258)

**Gates found:**
- User type gates (lines 250-260, 291-311):
  - Only renders for `userType === 'guest' || userType === 'auth'`
  - Platform users see different content (lines 263-288)

#### BusinessPricingGrid.tsx
**Used by:**
- `app/pricing/page.tsx` (line 33, 375)

**Gates found:**
- No feature flags or gates found

#### PricingGrid.tsx
**Used by:**
- `app/sports/page.tsx` (line 11) - but not actually used in the component

**Gates found:**
- No feature flags or gates found

## Pages That Render Pricing Components

### /pricing (app/pricing/page.tsx)
**Components rendered:**
- `BusinessPricingGrid` (line 375)
- `PricingCard` (line 13, 33)

**Gates found:**
- No feature flags or gates found

### /sports (app/sports/page.tsx)
**Components rendered:**
- `SportsPricingGrid` (line 258) - conditional on user type
- `PricingGrid` (line 11) - imported but not used

**Gates found:**
- User type gates (lines 250-260, 291-311):
  - `userType === 'guest' || userType === 'auth'` - shows pricing
  - `userType === 'platform'` - shows different content

## Hard Gates Analysis

### BuyButton.tsx
**Hard Gate Found:**
```typescript
const stripeEnabled = FEATURE_FLAGS.ENABLE_STRIPE;
// ...
if (isDisabled) {
  return (
    <button disabled>
      {stripeEnabled ? disabledText : 'Stripe Disabled'}
    </button>
  );
}
```
- **Type:** Feature flag gate
- **Flag:** `NEXT_PUBLIC_ENABLE_STRIPE`
- **Behavior:** Renders disabled button instead of hiding completely
- **Intentional:** Yes - this is appropriate behavior

### SportsPricingGrid.tsx
**Hard Gates Found:**
```typescript
{(userType === 'guest' || userType === 'auth') && (
  <motion.section>
    <SportsPricingGrid />
  </motion.section>
)}
```
- **Type:** User type gate
- **Behavior:** Completely hides pricing for platform users
- **Intentional:** Yes - platform users see different content

## Current Flag Evaluation

Based on `lib/config/featureFlags.ts`:
- `NEXT_PUBLIC_ENABLE_STRIPE`: defaults to `true`
- `NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS`: defaults to `false`
- `NEXT_PUBLIC_ENABLE_BUNDLES`: defaults to `false`
- `NEXT_PUBLIC_ENABLE_ORBIT`: defaults to `false`

## Summary

**Components are actually rendered in production:**
- ✅ BuyButton: Yes, when `NEXT_PUBLIC_ENABLE_STRIPE=true` (default)
- ✅ PricingCard: Yes, no gates
- ✅ SportsPricingGrid: Yes, for guest/auth users only
- ✅ BusinessPricingGrid: Yes, no gates

**No broken gates found** - all gates are intentional and working as designed.