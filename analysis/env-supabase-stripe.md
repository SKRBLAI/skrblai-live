# Environment Variables Inventory - Supabase & Stripe

## Summary
- **Total Environment Variables**: 67
- **Supabase Variables**: 6
- **Stripe Core Variables**: 3  
- **Stripe Price IDs**: 58+
- **Present in .env.example**: 7
- **Missing from .env.example**: 60
- **Client-Safe Variables**: 61
- **Server-Only Variables**: 6

## Supabase Environment Variables

### ✅ Present in .env.example

| Variable | Type | Context | Status | Usage |
|----------|------|---------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client-Safe | Both | ✅ Present | Required for all Supabase operations |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-Safe | Both | ✅ Present | Required for client & anon server operations |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Only | Server | ✅ Present | Required for admin operations |

### 🔍 Alternative Key Support

| Primary Variable | Alternative | Support Status |
|------------------|-------------|----------------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ Supported |
| `NEXT_PUBLIC_SUPABASE_URL` | `SUPABASE_URL` | ✅ Supported |
| `SUPABASE_SERVICE_ROLE_KEY` | N/A | Primary only |

### 📊 Usage Analysis

```typescript
// Files using Supabase environment variables:
lib/supabase/client.ts         // NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
lib/supabase/server.ts         // NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
utils/supabase.ts              // NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
components/admin/*.tsx         // Direct usage (legacy pattern)
hooks/useUsageBasedPricing.ts  // Direct usage (legacy pattern)
```

## Stripe Environment Variables

### ✅ Present in .env.example

| Variable | Type | Context | Status | Usage |
|----------|------|---------|--------|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-Safe | Client | ✅ Present | Required for client-side Stripe.js |
| `STRIPE_SECRET_KEY` | Server-Only | Server | ✅ Present | Required for server-side operations |
| `STRIPE_WEBHOOK_SECRET` | Server-Only | Server | ✅ Present | Required for webhook verification |

### ⚠️ Missing from .env.example (Price IDs)

#### Sports Plans (16 variables)
```bash
# Primary resolution paths
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_ROOKIE=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ELITE=price_...
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE=price_...
NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR=price_...

# Monthly variants
NEXT_PUBLIC_STRIPE_PRICE_STARTER_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_ROOKIE_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_ELITE_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR_M=price_...
```

#### Business Plans (6 variables)
```bash
NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M=price_...
```

#### Sports Add-ons (8+ variables)
```bash
NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10=price_...

# Monthly variants
NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION_M=price_...
```

#### Business Add-ons (6+ variables)
```bash
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT=price_...

# Monthly variants
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION_M=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT_M=price_...
```

#### Promo Variants (10+ variables)
```bash
NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO_PROMO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION_PROMO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION_PROMO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION_PROMO=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS_PROMO=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION_PROMO=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT_PROMO=price_...
```

## Feature Flag Environment Variables

### 🎛️ Flag Control Variables

| Variable | Default | Type | Impact |
|----------|---------|------|--------|
| `NEXT_PUBLIC_ENABLE_STRIPE` | `true` | boolean | Global Stripe functionality toggle |
| `NEXT_PUBLIC_HP_GUIDE_STAR` | `true` | boolean | Homepage enhancement features |
| `NEXT_PUBLIC_ENABLE_ORBIT` | `false` | boolean | Agent orbit animation |
| `NEXT_PUBLIC_ENABLE_LEGACY` | `false` | boolean | Legacy code path access |
| `NEXT_PUBLIC_ENABLE_BUNDLES` | `false` | boolean | Bundle pricing display |
| `NEXT_PUBLIC_ENABLE_ARR_DASH` | `false` | boolean | ARR dashboard features |
| `NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT` | `'scan-first'` | string | Homepage hero layout |

## Security Classification

### 🔓 Client-Safe Variables (Exposed to Browser)

**Supabase (3)**
- `NEXT_PUBLIC_SUPABASE_URL` - Project URL, safe to expose
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key, designed for client use
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Alternative anon key

**Stripe (1)**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Publishable key, safe for client

**Price IDs (58+)**
- All `NEXT_PUBLIC_STRIPE_PRICE_*` variables - Price IDs are not sensitive

**Feature Flags (7)**
- All `NEXT_PUBLIC_*` flag variables - Configuration, not secrets

### 🔒 Server-Only Variables (Secrets)

**Supabase (1)**
- `SUPABASE_SERVICE_ROLE_KEY` - ❌ **NEVER expose to client**

**Stripe (2)**
- `STRIPE_SECRET_KEY` - ❌ **NEVER expose to client**
- `STRIPE_WEBHOOK_SECRET` - ❌ **NEVER expose to client**

## Environment Variable Usage Patterns

### 📊 Direct Environment Access

```typescript
// Found in these files (should be refactored):
components/admin/AccuracyDashboard.tsx
components/admin/RevenueAnalyticsDashboard.tsx
app/dashboard/analytics/page.tsx
app/checkout/page.tsx
hooks/useUsageBasedPricing.ts
```

### ✅ Canonical Environment Access

```typescript
// Preferred patterns:
import { readEnvAny } from '@/lib/env/readEnvAny';
import { FEATURE_FLAGS } from '@/lib/config/featureFlags';

// Multi-key fallback support
const url = readEnvAny('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
const key = readEnvAny('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

// Feature flag access
const stripeEnabled = FEATURE_FLAGS.ENABLE_STRIPE;
```

## Validation & Diagnostics

### 🔍 Environment Validation Scripts

| Script | Purpose | Variables Checked |
|--------|---------|-------------------|
| `scripts/diagnostics/check-supabase.ts` | Supabase connectivity | 3 Supabase vars |
| `scripts/test-stripe-resolver.js` | Price resolution testing | 47+ Price ID vars |
| `scripts/verifyEnv.ts` | General environment audit | All categories |
| `app/api/env-check/route.ts` | Runtime environment check | Core vars + flags |

### 🧪 Test Environment Setup

```bash
# Minimal test environment for development
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test_anon_key
SUPABASE_SERVICE_ROLE_KEY=test_service_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Test price IDs (subset for basic functionality)
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_test_starter
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_test_pro
NEXT_PUBLIC_STRIPE_PRICE_ELITE=price_test_elite
```

## Missing Variables Impact Analysis

### 🚨 Critical Missing Variables

| Variable Category | Impact When Missing | Fallback Behavior |
|-------------------|-------------------|-------------------|
| Supabase Core | Complete database failure | Graceful degradation with null clients |
| Stripe Core | Payment system failure | Shows "Contact Sales" buttons |
| Price IDs | SKU resolution failure | Falls back to legacy pricing system |

### 📊 Price ID Coverage Analysis

```typescript
// From lib/stripe/priceResolver.ts - Supported SKUs
Total Supported SKUs: 20+
Price ID Variables Needed: 58+
Current .env.example Coverage: 0%

// Resolution fallback chain:
1. Direct price ID match (NEXT_PUBLIC_STRIPE_PRICE_*)
2. Monthly variant fallback (*_M)
3. Legacy pricing system fallback
4. Null (shows error to user)
```

## Recommendations

### 🎯 High Priority Actions

1. **Update .env.example**
   ```bash
   # Add all critical price ID variables
   NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_example_starter
   NEXT_PUBLIC_STRIPE_PRICE_PRO=price_example_pro
   NEXT_PUBLIC_STRIPE_PRICE_ELITE=price_example_elite
   # ... (continue for all supported SKUs)
   ```

2. **Environment Variable Validation**
   - Add runtime checks for missing critical variables
   - Implement graceful degradation for optional variables
   - Add development warnings for incomplete configuration

3. **Security Audit**
   - Verify no server-only variables are exposed to client
   - Ensure all `NEXT_PUBLIC_*` variables are actually safe for client exposure
   - Review any hardcoded environment variable usage

### 🔧 Medium Priority Improvements

1. **Consolidate Environment Access**
   - Migrate all direct `process.env` usage to `readEnvAny()`
   - Standardize on canonical environment helpers
   - Remove duplicate environment variable patterns

2. **Documentation**
   - Document all environment variables with their purpose
   - Create setup guides for different environments (dev/staging/prod)
   - Add validation scripts for environment completeness

### 📊 Monitoring Opportunities

1. **Runtime Environment Health**
   - Monitor environment variable availability
   - Track price ID resolution success rates
   - Alert on missing critical configuration

2. **Development Experience**
   - Add environment setup validation to development scripts
   - Create environment variable templates for different use cases
   - Implement environment variable diff checking between environments