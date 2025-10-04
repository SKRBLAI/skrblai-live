# Stripe & Buy Flow Wiring Analysis

## Overview
Complete trace of payment flows from UI → API → Webhook, including SKU/plan resolution and env var mappings.

---

## Payment Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  UI LAYER (Client Components)                                 │
│  ├─ CheckoutButton (components/payments/)                     │
│  ├─ BuyButton (components/pricing/)                           │
│  └─ Pricing grids (Business/Sports)                           │
└──────────────────┬──────────────────────────────────────────┘
                   │ POST {sku, mode, vertical}
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  API LAYER                                                    │
│  /api/checkout (UNIFIED ENDPOINT)                            │
│  ├─ Resolves SKU → Price ID                                 │
│  ├─ Creates Stripe Checkout Session                          │
│  └─ Returns checkout URL                                      │
└──────────────────┬──────────────────────────────────────────┘
                   │ Redirects to Stripe
                   │ User completes payment
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  WEBHOOK LAYER                                                │
│  /api/stripe/webhook (CANONICAL ENDPOINT)                    │
│  ├─ Verifies webhook signature                               │
│  ├─ Handles events (checkout.session.completed, etc.)        │
│  ├─ Updates Supabase (profiles, subscriptions, orders)       │
│  └─ Optional: Forwards to N8N                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Client Layer (UI Components)

### CheckoutButton Component
**Location**: `components/payments/CheckoutButton.tsx`  
**Status**: ✅ Assumed to exist (not in provided files, but referenced in `app/pricing/page.tsx`)

**Props**:
```typescript
interface CheckoutButtonProps {
  label: string;
  sku: ProductKey;
  mode: 'subscription' | 'payment';
  vertical: 'business' | 'sports';
  className?: string;
}
```

**Usage Example** (from `app/pricing/page.tsx:459-469`):
```typescript
<CheckoutButton
  label="Get Started"
  sku="ROOKIE"
  mode="subscription"
  vertical="business"
  className="w-full font-bold text-sm ..."
/>
```

### Pricing Grids
1. **BusinessPricingGrid** (`components/pricing/BusinessPricingGrid.tsx`)
   - Used on `/pricing` page
   - Displays 4 tiers: ROOKIE, PRO, ALL_STAR, FRANCHISE
   
2. **SportsPricingGrid** (`components/pricing/SportsPricingGrid.tsx`)
   - Used on `/sports` page
   - Displays sports plans + add-ons

3. **PricingCard** (`components/pricing/PricingCard.tsx`)
   - Generic card component
   - Used by both grids

---

## 2. API Layer (`/api/checkout`)

### Unified Checkout Endpoint
**Location**: `app/api/checkout/route.ts`  
**Method**: POST  
**Status**: ✅ **CURRENT** - Primary checkout endpoint

### Request Body Schema
```typescript
{
  sku?: string;           // Product SKU (e.g., "ROOKIE", "sports_plan_starter")
  priceId?: string;       // Direct Stripe Price ID (optional)
  mode?: "subscription" | "payment" | "trial" | "contact";
  vertical?: "business" | "sports";
  customerEmail?: string;
  metadata?: Record<string, string>;
  successPath?: string;   // Default: "/thanks"
  cancelPath?: string;    // Default: "/pricing"
  addons?: string[];      // Array of addon SKUs
  userId?: string;
}
```

### Price Resolution Logic

**Resolution Order** (via `lib/stripe/priceResolver.ts`):

#### Sports Plans
```
SKU: sports_plan_starter
Tries (in order):
1. NEXT_PUBLIC_STRIPE_PRICE_STARTER
2. NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER
3. NEXT_PUBLIC_STRIPE_PRICE_ROOKIE
4. NEXT_PUBLIC_STRIPE_PRICE_STARTER_M
5. NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER_M
6. NEXT_PUBLIC_STRIPE_PRICE_ROOKIE_M
```

```
SKU: sports_plan_pro
Tries (in order):
1. NEXT_PUBLIC_STRIPE_PRICE_PRO
2. NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO
3. NEXT_PUBLIC_STRIPE_PRICE_PRO_M
4. NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO_M
```

```
SKU: sports_plan_elite
Tries (in order):
1. NEXT_PUBLIC_STRIPE_PRICE_ELITE
2. NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE
3. NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR
4. NEXT_PUBLIC_STRIPE_PRICE_ELITE_M
5. NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE_M
6. NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR_M
```

#### Business Plans
```
SKU: biz_plan_starter
Tries (in order):
1. NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER
2. NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M
```

```
SKU: biz_plan_pro
Tries (in order):
1. NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO
2. NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M
```

```
SKU: biz_plan_elite
Tries (in order):
1. NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE
2. NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M
```

#### Add-ons (Sports)
```
SKU: sports_addon_<slug>
Tries (in order):
1. NEXT_PUBLIC_STRIPE_PRICE_ADDON_<SLUG>
2. NEXT_PUBLIC_STRIPE_PRICE_ADDON_<SLUG>_M
```

#### Add-ons (Business)
```
SKU: biz_addon_<slug>
Tries (in order):
1. NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_<SLUG>
2. NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_<SLUG>_M
```

### Fallback to Legacy Resolver
If unified resolver fails, checkout falls back to legacy pricing data:
- `lib/business/pricingData.ts` → `getBusinessPlanBySku()`, `getBusinessAddonBySku()`
- `lib/sports/pricingData.ts` → `getSportsPlanBySku()`, `getSportsAddonBySku()`

---

## 3. Webhook Layer

### Canonical Webhook Endpoint
**Location**: `app/api/stripe/webhook/route.ts`  
**Method**: POST  
**Signature Verification**: Uses `STRIPE_WEBHOOK_SECRET` env var  
**Status**: ✅ **CURRENT** - Single webhook endpoint

### Handled Events

| Event | Handler Function | Action |
|-------|-----------------|--------|
| `checkout.session.completed` | `handleCheckoutCompleted` | Creates subscription/order records |
| `customer.subscription.created` | `handleSubscriptionCreated` | Updates profiles, creates subscription record |
| `customer.subscription.updated` | `handleSubscriptionUpdated` | Updates subscription status |
| `customer.subscription.deleted` | `handleSubscriptionDeleted` | Marks subscription as canceled |
| `invoice.payment_succeeded` | `handleInvoicePaymentSucceeded` | Logs successful payments |
| `invoice.payment_failed` | `handleInvoicePaymentFailed` | Logs failed payments |
| `payment_intent.succeeded` | `handlePaymentIntentSucceeded` | Records one-time payments |

### Supabase Tables Updated
- `profiles` - subscription_status, stripe_customer_id
- `subscriptions` - Full subscription lifecycle
- `skillsmith_orders` - Sports one-time purchases (when `metadata.category === 'sports'`)
- `payment_events` - Payment history

### N8N Integration (Optional)
If `N8N_STRIPE_WEBHOOK_URL` env var set:
- Forwards `skillsmith_purchase` events to N8N
- Non-blocking (logs warning if fails)

---

## SKU → Env Var Mapping Table

### Unified Catalog (4 Tiers)

| Plan | SKU | Primary Env | Fallback Env(s) | Price (Monthly) |
|------|-----|-------------|----------------|----------------|
| **Rookie** | `ROOKIE` | `NEXT_PUBLIC_STRIPE_PRICE_ROOKIE` | `_ROOKIE_M`, `_STARTER` | $9.99 |
| **Pro** | `PRO` | `NEXT_PUBLIC_STRIPE_PRICE_PRO` | `_PRO_M`, `_SPORTS_PRO` | $16.99 |
| **All-Star** | `ALL_STAR` | `NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR` | `_ALLSTAR_M`, `_SPORTS_ELITE` | $29.99 |
| **Franchise** | `FRANCHISE` | `NEXT_PUBLIC_STRIPE_PRICE_FRANCHISE` | `_FRANCHISE_M` | Contact/Custom |

### Legacy Business Plans (Still Active)

| Plan | SKU | Primary Env | Fallback Env | Price (Monthly) |
|------|-----|-------------|-------------|----------------|
| **Business Starter** | `BUS_STARTER` | `NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER` | `_BIZ_STARTER_M` | $29.00 |
| **Business Pro** | `BUS_PRO` | `NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO` | `_BIZ_PRO_M` | $49.00 |
| **Business Elite** | `BUS_ELITE` | `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE` | `_BIZ_ELITE_M` | $99.00 |

### Legacy Sports Plans (One-Time)

| Plan | SKU | Primary Env | Price (One-Time) |
|------|-----|-------------|-----------------|
| **Sports Starter** | `SPORTS_STARTER` | `NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER` | $19.00 |
| **Sports Pro** | `SPORTS_PRO` | `NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO` | $29.00 |
| **Sports Elite** | `SPORTS_ELITE` | `NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE` | $49.00 |
| **All Access Bundle** | `BUNDLE_ALL_ACCESS` | `NEXT_PUBLIC_STRIPE_PRICE_BUNDLE_ALL_ACCESS` | $99.00 |

### Add-ons (Recurring)

| Add-on | SKU | Primary Env | Price (Monthly) | Scope |
|--------|-----|-------------|----------------|-------|
| **+10 Scans** | `ADDON_SCANS_10` | `NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS_10` | $5.00 | Both |
| **MOE** | `ADDON_MOE` | `NEXT_PUBLIC_STRIPE_PRICE_ADDON_MOE` | $9.00 | Sports |
| **Nutrition** | `ADDON_NUTRITION` | `NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION` | $7.00 | Sports |
| **Adv Analytics** | `ADDON_ADV_ANALYTICS` | `NEXT_PUBLIC_STRIPE_PRICE_ADDON_ADV_ANALYTICS` | $9.00 | Both |
| **Automation** | `ADDON_AUTOMATION` | `NEXT_PUBLIC_STRIPE_PRICE_ADDON_AUTOMATION` | $19.00 | Business |
| **Additional Seat** | `ADDON_SEAT` | `NEXT_PUBLIC_STRIPE_PRICE_ADDON_SEAT` | $3.00 | Both |

---

## Legacy vs. Current Pricing

### Finding: **DUAL PRICING SYSTEMS ACTIVE**

#### System 1: Unified 4-Tier (New)
**Location**: `lib/pricing/catalog.ts`  
**Tiers**: ROOKIE, PRO, ALL_STAR, FRANCHISE  
**Used**: `/pricing` page (via `BusinessPricingGrid`)  
**Prices**: $9.99, $16.99, $29.99, Custom  
**Status**: ✅ **CURRENT** - Intended replacement

#### System 2: Legacy Business + Sports (Old)
**Locations**:  
- `lib/business/pricingData.ts`
- `lib/sports/pricingData.ts`

**Business Tiers**: BUS_STARTER ($29), BUS_PRO ($49), BUS_ELITE ($99)  
**Sports Tiers**: One-time purchases at $19, $29, $49, $99  
**Status**: 🕰️ **LEGACY-ATTACHED** - Still referenced by checkout fallback logic

### Pricing Discrepancy Alert! 🚨

**Conflict Detected**: Two different "Starter" prices:
1. **Unified Catalog**: ROOKIE at $9.99/month
2. **Legacy Business**: BUS_STARTER at $29/month

**Resolution Needed**: Which is the canonical price?
- If ROOKIE is canonical: Deprecate BUS_STARTER
- If BUS_STARTER is canonical: Update unified catalog

---

## Which Pricing is Active?

### On `/pricing` Page
✅ **Uses Unified 4-Tier System**:
- Source: `lib/pricing/catalog.ts`
- Component: `BusinessPricingGrid`
- Displays: ROOKIE, PRO, ALL_STAR, FRANCHISE
- Prices: $9.99, $16.99, $29.99, Custom

### On `/sports` Page
✅ **Uses Sports-Specific System**:
- Source: `lib/sports/pricingData.ts` (via `getSportsPlans()`, `getSportsAddons()`)
- Component: `SportsPricingGrid`
- Plans: sports_plan_starter, sports_plan_pro, sports_plan_elite
- Prices: Varies (needs verification from pricingData.ts)

### In Checkout API
🔀 **Hybrid Resolution**:
1. **Primary**: Unified resolver (`lib/stripe/priceResolver.ts`)
2. **Fallback**: Legacy pricing data (`lib/business/pricingData.ts`, `lib/sports/pricingData.ts`)

---

## Environment Variables Required

### Core Stripe (2 vars)
```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Unified 4-Tier Plans (8 vars minimum)
```bash
# Main prices
NEXT_PUBLIC_STRIPE_PRICE_ROOKIE=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR=price_...
NEXT_PUBLIC_STRIPE_PRICE_FRANCHISE=price_...

# _M fallbacks (optional but recommended)
NEXT_PUBLIC_STRIPE_PRICE_ROOKIE_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_FRANCHISE_M=price_...
```

### Legacy Business Plans (6 vars)
```bash
NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M=price_...
```

### Sports Plans (varies)
```bash
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE=price_...
# ... more sports SKUs
```

### Add-ons (12+ vars)
```bash
NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS_10=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_MOE=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION=price_...
# ... more add-ons
```

**Total Estimate**: ~50-60 Stripe price ID environment variables

---

## Button Disabling Logic

### When Buttons Disabled
Checkout buttons disabled if:
1. **Price ID not resolved**: SKU lookup returns `null`
2. **Missing env var**: Required `NEXT_PUBLIC_STRIPE_PRICE_*` not set
3. **Mode=contact**: Franchise/Enterprise plans (price=0, shows "Contact Sales")

### Tooltip Behavior
**Finding**: Tooltips likely handled by UI components, but not definitively traced in provided files.

**Recommendation**: Add explicit tooltips:
```typescript
<CheckoutButton
  disabled={!priceId}
  tooltip={!priceId ? "Pricing not configured. Contact support." : undefined}
/>
```

---

## Fix It Steps

### 1. **Resolve Pricing Conflict**
- Audit active prices in Stripe dashboard
- Document canonical price for each tier
- Update unified catalog or legacy data accordingly

### 2. **Consolidate Pricing Systems**
- Migrate all pricing to unified catalog (`lib/pricing/catalog.ts`)
- Remove legacy `lib/business/pricingData.ts` and `lib/sports/pricingData.ts`
- Update checkout to use unified catalog only

### 3. **Simplify Env Vars**
- Reduce ~50 price ID vars to ~15 canonical vars
- Remove all `_M` fallbacks after migration (or keep only essential)
- Document env var naming convention

### 4. **Add Tooltips**
- Implement tooltip system for disabled buttons
- Show clear error messages: "Price not configured" vs. "Contact for pricing"

### 5. **Test Webhook**
- Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Verify all events handled correctly
- Test both subscription and one-time payment flows

---

## Summary

### ✅ What's Working
- Single unified checkout endpoint
- Single webhook endpoint
- SKU resolution with fallbacks
- Both subscription and payment modes supported

### ⚠️ What Needs Attention
- **Dual pricing systems** (unified vs. legacy)
- **Pricing conflicts** (ROOKIE $9.99 vs BUS_STARTER $29)
- **Too many env vars** (~50 price IDs)
- **Legacy checkout endpoints** still exist but unused

### 🚨 Critical Action Required
**Decide canonical pricing structure** - Unified 4-tier or Legacy 3-tier + Sports?
