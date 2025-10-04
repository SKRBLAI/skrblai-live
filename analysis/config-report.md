# Config Folder Snapshot & Single Source of Truth

## Overview
Complete inventory of `lib/config/` directory structure with recommendations for consolidation and establishing single sources of truth.

---

## Directory Structure

```
lib/config/
├── agents.ts                      # Agent configuration
├── featureFlags.ts               # ✅ MAIN FEATURE FLAGS (PRIMARY)
├── heroConfig.ts                 # Hero component configuration
├── percyFeatureFlags.ts          # ⚠️ DUPLICATE Percy flags
├── pricing.ts                    # Legacy pricing display config
├── services.ts                   # Services configuration
├── skillsmithPriceMap.json       # Sports price mapping (JSON)
├── skillsmithPriceMap.ts         # Sports price mapping (TS)
└── skillsmithProducts.ts         # Sports product definitions
```

**Total**: 9 configuration files

---

## File-by-File Analysis

### 1. **featureFlags.ts** ✅ PRIMARY

**Purpose**: **Single source of truth for all feature flags**

**Status**: ✅ **CURRENT** - Should be THE authoritative flags file

**Contains** (16 flags total):
```typescript
export const FEATURE_FLAGS = {
  // Core Features (7 flags)
  HP_GUIDE_STAR: boolean,
  HOMEPAGE_HERO_VARIANT: 'scan-first' | 'split' | 'legacy',
  ENABLE_ORBIT: boolean,
  ENABLE_ARR_DASH: boolean,
  ENABLE_STRIPE: boolean,
  ENABLE_LEGACY: boolean,
  ENABLE_BUNDLES: boolean,
  
  // Progressive Enhancement (4 flags)
  AI_AUTOMATION_HOMEPAGE: boolean,
  ENHANCED_BUSINESS_SCAN: boolean,
  URGENCY_BANNERS: boolean,
  LIVE_METRICS: boolean,
  
  // Percy Flags (2 flags)
  USE_OPTIMIZED_PERCY: boolean,
  ENABLE_PERCY_ANIMATIONS: boolean,
}
```

**Helpers**:
- `isFeatureEnabled(flag)` - Check boolean flags
- `getFeatureFlag(flag, fallback)` - Get any flag with fallback

**Recommendation**: ⭐ **KEEP AS SINGLE SOURCE** - All flags should live here

---

### 2. **percyFeatureFlags.ts** ⚠️ DUPLICATE

**Purpose**: Percy-specific granular flags

**Status**: ⚠️ **DUPLICATE** - Conflicts with `featureFlags.ts`

**Contains** (9 flags):
```typescript
export const PERCY_FEATURE_FLAGS = {
  USE_OPTIMIZED_PERCY: boolean,          // ← DUPLICATE!
  SHOW_PERFORMANCE_WARNING: boolean,
  ENABLE_PERFORMANCE_MONITORING: boolean,
  ENABLE_PERCY_AVATAR: boolean,
  ENABLE_PERCY_CHAT: boolean,
  ENABLE_PERCY_SOCIAL_PROOF: boolean,
  ENABLE_PERCY_ANIMATIONS: boolean,      // ← DUPLICATE!
  AUTO_FALLBACK_ON_ERROR: boolean,
  LOG_COMPONENT_SWITCHES: boolean,
}
```

**Issue**: `USE_OPTIMIZED_PERCY` and `ENABLE_PERCY_ANIMATIONS` defined in BOTH files!

**Recommendation**: 
- Merge Percy-specific flags into `featureFlags.ts`
- Remove `percyFeatureFlags.ts`
- Keep granular control if needed, but in one place

---

### 3. **pricing.ts** 🕰️ LEGACY

**Purpose**: Legacy pricing configuration for UI display

**Status**: 🕰️ **LEGACY** - Superseded by `lib/pricing/catalog.ts`

**Contains**:
- `PricingPlan` interface (old format)
- `pricingPlans[]` array (4 plans: gateway, starter, business, enterprise)
- Helper functions: `getPlanById()`, `getPrice()`, `getFormattedPrice()`
- `liveMetrics[]` array
- `URGENCY_TIMER_INITIAL` constant

**Prices** (Old):
- Gateway: $0 (free)
- Starter: $27/month
- Business: $69/month
- Enterprise: $269/month

**New System** (`lib/pricing/catalog.ts`):
- ROOKIE: $9.99/month
- PRO: $16.99/month
- ALL_STAR: $29.99/month
- FRANCHISE: Custom

**Conflict**: Two different pricing structures!

**Recommendation**: 
- ❌ Deprecate `lib/config/pricing.ts`
- ✅ Use `lib/pricing/catalog.ts` exclusively
- Archive old pricing for historical reference

---

### 4. **heroConfig.ts** 📄 CONFIG

**Purpose**: Hero component configuration (assumed)

**Status**: 📄 **CONFIG** - Hero-specific settings

**Finding**: Not provided in files, but name suggests hero component settings

**Recommendation**: 
- If it configures hero variants, merge into main config or component-specific file
- If it's just constants, consider moving to hero components directly

---

### 5. **agents.ts** 📄 CONFIG

**Purpose**: Agent configuration and metadata

**Status**: 📄 **CONFIG** - Agent-specific settings

**Finding**: Not provided in detail, but likely contains agent registry configuration

**Actual Registry**: `lib/agents/agentLeague.ts` (more likely the source)

**Recommendation**: 
- Clarify relationship between `lib/config/agents.ts` and `lib/agents/agentLeague.ts`
- Consolidate if they're duplicates

---

### 6. **services.ts** 📄 CONFIG

**Purpose**: Services configuration

**Status**: 📄 **CONFIG** - Service-specific settings

**Finding**: Not provided in files

**Recommendation**: Audit usage, determine if needed

---

### 7. **skillsmithProducts.ts** 📄 CONFIG

**Purpose**: SkillSmith (Sports) product definitions

**Status**: 📄 **CONFIG** - Sports product catalog

**Contains** (assumed):
- Product SKUs
- Product names
- Descriptions
- Pricing references

**Recommendation**: ✅ **KEEP** - Sports-specific product definitions

---

### 8. **skillsmithPriceMap.ts** 📄 CONFIG

**Purpose**: TypeScript version of sports price mapping

**Status**: 📄 **CONFIG** - Maps SKUs to price IDs

**Recommendation**: 
- Consolidate with `lib/stripe/priceResolver.ts` if redundant
- OR keep as sports-specific mapping if needed

---

### 9. **skillsmithPriceMap.json** 📄 DATA

**Purpose**: JSON version of sports price mapping

**Status**: 📄 **DATA** - Static price data

**Recommendation**: 
- If `.ts` version exists, remove `.json` (prefer TypeScript)
- OR keep JSON if used by build tooling

---

## Recommendations by Category

### **Feature Flags** - Consolidate to ONE File

**Current State**: 2 files with overlapping flags
- `featureFlags.ts` (16 flags)
- `percyFeatureFlags.ts` (9 flags, 2 duplicates)

**Recommendation**:
```
✅ KEEP: featureFlags.ts as SINGLE SOURCE
❌ REMOVE: percyFeatureFlags.ts
📝 ACTION: Merge Percy flags into featureFlags.ts
```

**New Structure**:
```typescript
// lib/config/featureFlags.ts
export const FEATURE_FLAGS = {
  // Core Features
  HP_GUIDE_STAR: boolean,
  HOMEPAGE_HERO_VARIANT: string,
  ENABLE_ORBIT: boolean,
  ENABLE_ARR_DASH: boolean,
  ENABLE_STRIPE: boolean,
  
  // Percy Features (consolidated)
  USE_OPTIMIZED_PERCY: boolean,
  ENABLE_PERCY_ANIMATIONS: boolean,
  ENABLE_PERCY_AVATAR: boolean,
  ENABLE_PERCY_CHAT: boolean,
  ENABLE_PERCY_SOCIAL_PROOF: boolean,
  PERCY_PERFORMANCE_MONITORING: boolean,
  PERCY_AUTO_FALLBACK: boolean,
  PERCY_LOG_SWITCHES: boolean,
  
  // Progressive Enhancement
  AI_AUTOMATION_HOMEPAGE: boolean,
  ENHANCED_BUSINESS_SCAN: boolean,
  URGENCY_BANNERS: boolean,
  LIVE_METRICS: boolean,
} as const;
```

---

### **Pricing Config** - Use Catalog System

**Current State**: Multiple pricing sources
- `lib/config/pricing.ts` (legacy display config)
- `lib/pricing/catalog.ts` (unified 4-tier)
- `lib/business/pricingData.ts` (legacy business)
- `lib/sports/pricingData.ts` (sports plans)

**Recommendation**:
```
✅ KEEP: lib/pricing/catalog.ts (unified catalog)
❌ ARCHIVE: lib/config/pricing.ts (legacy)
⚠️ MIGRATE: lib/business/pricingData.ts → catalog
⚠️ MIGRATE: lib/sports/pricingData.ts → catalog
```

---

### **Routes Config** - Consider Adding

**Current State**: No centralized routes configuration

**Recommendation**: Add `lib/config/routes.ts`
```typescript
// lib/config/routes.ts
export const ROUTES = {
  HOME: '/',
  AGENTS: '/agents',
  PRICING: '/pricing',
  DASHBOARD: {
    HOME: '/dashboard',
    USER: '/dashboard/user',
    VIP: '/dashboard/vip',
    FOUNDER: '/dashboard/founder',
  },
  AUTH: {
    SIGNIN: '/(auth)/sign-in',
    SIGNUP: '/(auth)/sign-up',
    CALLBACK: '/auth/callback',
  },
  API: {
    CHECKOUT: '/api/checkout',
    WEBHOOK: '/api/stripe/webhook',
  }
} as const;
```

**Benefits**: Type-safe route references, easier refactoring

---

### **Site Config** - Consider Adding

**Current State**: Site-wide constants scattered

**Recommendation**: Add `lib/config/site.ts`
```typescript
// lib/config/site.ts
export const SITE_CONFIG = {
  NAME: 'SKRBL AI',
  DESCRIPTION: 'AI-Powered Business Automation & Content Creation',
  URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://skrblai.io',
  
  CONTACT: {
    EMAIL: 'hello@skrbl.ai',
    SUPPORT: 'support@skrbl.ai',
  },
  
  SOCIAL: {
    TWITTER: '@skrblai',
  },
  
  LEGAL: {
    PRIVACY_URL: '/privacy',
    TERMS_URL: '/terms',
  },
} as const;
```

---

## Single Source of Truth Designation

### **⭐ Feature Flags**
**File**: `lib/config/featureFlags.ts`  
**Status**: ***MMM*** (Main/Master/Must-Use)

### **⭐ Pricing Catalog**
**File**: `lib/pricing/catalog.ts`  
**Status**: ***MMM*** (Main/Master/Must-Use)

### **⭐ Agent Registry**
**File**: `lib/agents/agentLeague.ts`  
**Status**: ***MMM*** (Main/Master/Must-Use)

### **⭐ Stripe Price Resolution**
**File**: `lib/stripe/priceResolver.ts`  
**Status**: ***MMM*** (Main/Master/Must-Use)

### **⭐ Supabase Clients**
**Files**: 
- `lib/supabase/client.ts` → `getBrowserSupabase()` ***MMM***
- `lib/supabase/server.ts` → `getServerSupabaseAdmin()` ***MMM***

### **⚠️ Needs Consolidation**
**Files**:
- `lib/config/percyFeatureFlags.ts` → Merge into `featureFlags.ts`
- `lib/config/pricing.ts` → Archive (superseded)
- `lib/business/pricingData.ts` → Migrate to catalog
- `lib/sports/pricingData.ts` → Migrate to catalog

---

## Ideal Config Structure (After Cleanup)

```
lib/config/
├── featureFlags.ts          # *** MMM *** All feature flags
├── site.ts                  # *** MMM *** Site-wide constants (NEW)
├── routes.ts                # *** MMM *** Route definitions (NEW)
├── agents.ts                # Agent-specific config (if needed)
├── services.ts              # Service-specific config (if needed)
├── skillsmithProducts.ts    # Sports product definitions
└── skillsmithPriceMap.ts    # Sports price mappings

lib/pricing/
└── catalog.ts               # *** MMM *** Unified pricing catalog

lib/stripe/
└── priceResolver.ts         # *** MMM *** Price ID resolution

lib/agents/
└── agentLeague.ts           # *** MMM *** Agent registry

lib/supabase/
├── client.ts                # *** MMM *** getBrowserSupabase()
└── server.ts                # *** MMM *** getServerSupabaseAdmin()

ARCHIVED/
├── lib/config/pricing.ts              # Old pricing config
├── lib/config/percyFeatureFlags.ts    # Merged into featureFlags
├── lib/business/pricingData.ts        # Migrated to catalog
└── lib/sports/pricingData.ts          # Migrated to catalog
```

**Total Config Files**: 6 core + 3 specialized = 9 files (down from current ~15+ scattered files)

---

## Fix It Steps

1. **Merge Percy flags**:
   ```bash
   # Copy Percy-specific flags from percyFeatureFlags.ts to featureFlags.ts
   # Update all imports: percyFeatureFlags → featureFlags
   # Delete percyFeatureFlags.ts
   ```

2. **Archive legacy pricing**:
   ```bash
   mkdir -p ARCHIVED/lib/config
   mv lib/config/pricing.ts ARCHIVED/lib/config/
   ```

3. **Consolidate pricing data**:
   ```bash
   # Migrate pricingData.ts files to catalog.ts
   # Update all imports to use catalog
   # Move old files to ARCHIVED/
   ```

4. **Create new configs**:
   ```bash
   # Create lib/config/site.ts
   # Create lib/config/routes.ts
   ```

5. **Add ***MMM*** markers**:
   ```typescript
   // Add to top of canonical files:
   /**
    * *** MMM *** (Main/Master/Must-Use)
    * This is the single source of truth for [feature flags/pricing/etc]
    * DO NOT create duplicate configs
    */
   ```

6. **Update documentation**:
   ```bash
   # Create lib/config/README.md explaining structure
   # Add migration guide for teams
   ```

---

## Summary

### ✅ Current Single Sources of Truth
- `lib/config/featureFlags.ts` - Feature flags ***MMM***
- `lib/pricing/catalog.ts` - Pricing ***MMM***
- `lib/agents/agentLeague.ts` - Agent registry ***MMM***

### ⚠️ Duplicates/Conflicts Found
- `percyFeatureFlags.ts` duplicates `featureFlags.ts`
- `lib/config/pricing.ts` conflicts with `lib/pricing/catalog.ts`
- Multiple pricing data files (`pricingData.ts` in business/sports)

### 🎯 Consolidation Target
**From**: ~15+ scattered config files  
**To**: 9 well-organized config files with clear ***MMM*** markers

### ***MMM*** = Main/Master/Must-Use
This marker indicates the canonical source for each concern. All files without this marker should be considered secondary or deprecated.
