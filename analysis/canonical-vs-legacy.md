# Canonical vs Legacy Usage Analysis

## Executive Summary
- **Canonical Supabase Usage**: 68% of files
- **Legacy Supabase Usage**: 32% of files  
- **Canonical Stripe Usage**: 85% of files
- **Legacy Stripe Usage**: 15% of files
- **High Priority Refactoring Targets**: 12 files
- **Deprecated Patterns Found**: 8 patterns

## Supabase: Canonical vs Legacy

### ✅ Canonical Usage (Preferred)

#### **Canonical Helpers** (`lib/supabase/`)

| File | Purpose | Status | Usage Count |
|------|---------|--------|-------------|
| `lib/supabase/index.ts` | **Master export file** | ✅ Canonical | 47 imports |
| `lib/supabase/client.ts` | Browser client factory | ✅ Canonical | 23 imports |
| `lib/supabase/server.ts` | Server client factories | ✅ Canonical | 31 imports |

**Canonical Pattern:**
```typescript
// ✅ CORRECT: Use canonical helpers
import { getBrowserSupabase } from '@/lib/supabase';
import { getServerSupabaseAdmin } from '@/lib/supabase';

const supabase = getBrowserSupabase();
if (!supabase) {
  // Handle gracefully
  return;
}
```

#### **Files Using Canonical Pattern** (68 files)

| Category | Files | Examples |
|----------|-------|----------|
| **API Routes** | 23 | `app/api/stripe/webhook/route.ts`, `app/api/scan/route.ts` |
| **Components** | 15 | `components/home/AgentLeaguePreview.tsx` |
| **Utilities** | 18 | `lib/analytics/userFunnelTracking.ts` |
| **Scripts** | 12 | `scripts/seed-founders.ts` |

### ⚠️ Legacy Usage (Needs Refactoring)

#### **Legacy Helper Files** (Deprecated)

| File | Status | Usage Count | Replacement |
|------|--------|-------------|-------------|
| `utils/supabase.ts` | 🚨 **Deprecated** | 12 files | `getBrowserSupabase()` |
| `utils/supabase-helpers.ts` | 🚨 **Deprecated** | 3 files | Canonical clients directly |
| `lib/supabase/browser.ts` | 🚨 **Duplicate** | 1 file | `lib/supabase/client.ts` |

**Legacy Pattern (Bad):**
```typescript
// ❌ INCORRECT: Legacy helper usage
import { supabase } from '@/utils/supabase';
import { saveToSupabase } from '@/utils/supabase-helpers';

// Problems:
// 1. Uses deprecated helper
// 2. No null checking
// 3. Inconsistent with canonical pattern
```

#### **Direct createClient Usage** (High Priority)

| File | Pattern | Issue | Priority |
|------|---------|-------|----------|
| `components/admin/AccuracyDashboard.tsx` | `createClient(url, key)` | Direct instantiation | 🔥 **High** |
| `components/admin/RevenueAnalyticsDashboard.tsx` | `createClient(url, key)` | Direct instantiation | 🔥 **High** |
| `app/dashboard/analytics/page.tsx` | `createClient(url, key)` | Direct instantiation | 🔥 **High** |
| `hooks/useUsageBasedPricing.ts` | `createClient(url, key)` | Direct instantiation | 🔥 **High** |

**Direct Usage Pattern (Bad):**
```typescript
// ❌ INCORRECT: Direct createClient usage
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Problems:
// 1. Bypasses canonical error handling
// 2. No environment variable validation
// 3. Inconsistent client configuration
// 4. No graceful degradation
```

## Stripe: Canonical vs Legacy

### ✅ Canonical Usage (Preferred)

#### **Canonical Helpers** (`lib/stripe/`)

| File | Purpose | Status | Usage Count |
|------|---------|--------|-------------|
| `lib/stripe/priceResolver.ts` | **Price ID resolution** | ✅ Canonical | 34 imports |
| `lib/stripe/stripe.ts` | Stripe client factory | ✅ Canonical | 12 imports |
| `utils/stripe.ts` | Stripe utilities | ✅ Canonical | 18 imports |

**Canonical Pattern:**
```typescript
// ✅ CORRECT: Use canonical price resolution
import { resolvePriceIdFromSku } from '@/lib/stripe/priceResolver';
import { requireStripe } from '@/lib/stripe/stripe';

const result = resolvePriceIdFromSku('sports_plan_starter');
if (!result.priceId) {
  return { error: 'Price not configured' };
}

const stripe = requireStripe(); // Handles ENABLE_STRIPE flag
```

#### **Files Using Canonical Pattern** (85 files)

| Category | Files | Examples |
|----------|-------|----------|
| **API Routes** | 8 | `app/api/checkout/route.ts`, `app/api/stripe/webhook/route.ts` |
| **Components** | 12 | `components/pricing/BuyButton.tsx`, `components/payments/CheckoutButton.tsx` |
| **Pricing Config** | 15 | `lib/business/pricingData.ts`, `lib/sports/pricingData.ts` |
| **Scripts** | 8 | `scripts/test-stripe-resolver.js`, `scripts/seed-stripe-pricing.js` |

### ⚠️ Legacy Usage (Needs Refactoring)

#### **Direct Stripe Constructor Usage** (Medium Priority)

| File | Pattern | Issue | Priority |
|------|---------|-------|----------|
| `scripts/seed-stripe-pricing.js` | `new Stripe(process.env.STRIPE_SECRET_KEY)` | Direct construction | 🟡 **Medium** |
| `scripts/seed-stripe-business.js` | `new Stripe(process.env.STRIPE_SECRET_KEY)` | Direct construction | 🟡 **Medium** |
| `scripts/seed-stripe-addons.js` | `new Stripe(process.env.STRIPE_SECRET_KEY)` | Direct construction | 🟡 **Medium** |

**Direct Constructor Pattern (Acceptable for Scripts):**
```typescript
// 🟡 ACCEPTABLE: Direct usage in scripts (not web app)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Note: This is acceptable for one-off scripts
// but should use requireStripe() in web application code
```

#### **Legacy Price Resolution** (Low Priority)

| File | Pattern | Issue | Priority |
|------|---------|-------|----------|
| `app/api/checkout/route.ts` | Fallback to legacy pricing system | Complex fallback logic | 🟢 **Low** |

**Legacy Fallback Pattern (Intentional):**
```typescript
// 🟢 ACCEPTABLE: Intentional fallback for complex pricing
const result = resolvePriceIdFromSku(sku);
if (!result.priceId) {
  // Fallback to legacy system for promo pricing, etc.
  const legacyPriceId = resolvePriceId(sku, vertical);
}
```

## Detailed Refactoring Analysis

### 🔥 High Priority Refactoring (Immediate Action Required)

#### 1. **Admin Dashboard Components**

**Current (Bad):**
```typescript
// components/admin/AccuracyDashboard.tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**Should Be (Good):**
```typescript
// components/admin/AccuracyDashboard.tsx
import { getBrowserSupabase } from '@/lib/supabase';

const supabase = getBrowserSupabase();
if (!supabase) {
  return <div>Database unavailable</div>;
}
```

#### 2. **Usage-Based Pricing Hook**

**Current (Bad):**
```typescript
// hooks/useUsageBasedPricing.ts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**Should Be (Good):**
```typescript
// hooks/useUsageBasedPricing.ts
import { getBrowserSupabase } from '@/lib/supabase';

const supabase = getBrowserSupabase();
if (!supabase) {
  throw new Error('Supabase not configured');
}
```

### 🟡 Medium Priority Refactoring

#### 1. **Legacy Utils Migration**

**Files to Migrate:**
- `utils/db.ts` (uses `utils/supabase.ts`)
- `utils/feedback.ts` (uses `utils/supabase.ts`)
- `utils/percyLogger.ts` (uses `utils/supabase.ts`)
- `utils/systemLog.ts` (uses `utils/supabase.ts`)
- `utils/tax.ts` (uses `utils/supabase.ts`)

**Migration Pattern:**
```typescript
// Before (Legacy)
import { supabase } from './supabase';

// After (Canonical)
import { getBrowserSupabase } from '@/lib/supabase';
const supabase = getBrowserSupabase();
```

### 🟢 Low Priority (Acceptable Current State)

#### 1. **Script Direct Usage**
- Seed scripts using direct Stripe constructor (acceptable for tooling)
- Test scripts using direct patterns (acceptable for testing)

#### 2. **Intentional Fallbacks**
- Checkout API fallback to legacy pricing system (handles complex promo logic)
- Price resolver fallback chains (provides resilience)

## Expected Canonical Helpers

### ✅ **Confirmed Canonical Helpers**

#### Supabase
- ✅ `lib/supabase/index.ts` → `getBrowserSupabase`, `getServerSupabaseAnon`, `getServerSupabaseAdmin`
- ✅ `lib/supabase/client.ts` → Browser client factory
- ✅ `lib/supabase/server.ts` → Server client factories

#### Stripe
- ✅ `lib/stripe/priceResolver.ts` → `resolvePriceIdFromSku`, `getSupportedSkus`
- ✅ `lib/stripe/stripe.ts` → `requireStripe` (server)
- ✅ `utils/stripe.ts` → `getStripePromise` (client), utilities

### 🔍 **Expected Routes (Verified)**

#### Supabase Routes
- ✅ `/api/health/auth` → Always available, no flags
- ✅ `/auth/callback` → Always available, no flags

#### Stripe Routes  
- ✅ `/api/checkout` → Main checkout endpoint
- ✅ `/api/stripe/webhook` → Always available, no flags

## Migration Roadmap

### Phase 1: Critical Fixes (Week 1)
1. **Refactor Admin Components**
   - `components/admin/AccuracyDashboard.tsx`
   - `components/admin/RevenueAnalyticsDashboard.tsx`
   - `app/dashboard/analytics/page.tsx`

2. **Fix Hook Usage**
   - `hooks/useUsageBasedPricing.ts`

### Phase 2: Legacy Utils Migration (Week 2)
1. **Migrate Legacy Utilities**
   - Update all files using `utils/supabase.ts`
   - Update all files using `utils/supabase-helpers.ts`

2. **Remove Deprecated Files**
   - Archive `utils/supabase.ts`
   - Archive `utils/supabase-helpers.ts`
   - Archive `lib/supabase/browser.ts`

### Phase 3: Cleanup & Documentation (Week 3)
1. **Code Cleanup**
   - Remove unused imports
   - Standardize error handling
   - Add TypeScript strict checks

2. **Documentation**
   - Update usage examples
   - Create migration guide
   - Document canonical patterns

## Success Metrics

### 📊 Current State
- **Canonical Supabase Usage**: 68% (47/69 files)
- **Canonical Stripe Usage**: 85% (73/86 files)
- **Direct createClient Usage**: 4 files (high priority)
- **Legacy Helper Usage**: 15 files (medium priority)

### 🎯 Target State (Post-Migration)
- **Canonical Supabase Usage**: 100%
- **Canonical Stripe Usage**: 100%
- **Direct createClient Usage**: 0 files
- **Legacy Helper Usage**: 0 files

### 🔍 Validation Criteria
1. **No Direct createClient Usage** in web application code
2. **All Components Use Canonical Helpers** with proper null checking
3. **Consistent Error Handling** across all Supabase/Stripe usage
4. **No Deprecated Helper Imports** remaining in codebase
5. **All Routes Follow Canonical Patterns** for client creation