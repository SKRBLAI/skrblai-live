# SKRBL Platform Configuration Report

**Generated**: 2025-10-04  
**Platform**: SKRBL AI - AI-Powered Business Automation & Athletic Performance  
**Tech Stack**: Next.js 14 (App Router), Supabase, Stripe, N8N

---

## Executive Summary

This report provides a complete inventory of the SKRBL AI platform configuration, including routing structure, feature flags, payment flows, authentication system, access control, and legacy code. All findings are documented across 8 detailed analysis files with actionable recommendations.

### 🎯 Key Findings

1. **39 page routes**, **10 layouts**, **84 API routes** - Well-structured Next.js app
2. **16+ feature flags** with some duplication (Percy flags in 2 places)
3. **3 hero variants** on homepage - needs consolidation
4. **Dual pricing systems** (Unified 4-tier + Legacy 3-tier) - conflicts detected
5. **7 Supabase client factories** - consolidation to 3 recommended
6. **4 different access control systems** (Promo, VIP, Founder, Hardcoded)
7. **~21 legacy items** identified - some still actively used

---

## Quick Navigation

| Analysis File | Description | Key Question Answered |
|---------------|-------------|----------------------|
| [**Routes Map**](./routes-map.md) | All page/API routes | What pages exist and where do they route? |
| [**Flags Inventory**](./flags-inventory.md) | Feature flags & gates | Which flags control what features? |
| [**Agents Section**](./agents-section.md) | Agent components | Where are Orbit, League, Constellation components? |
| [**Stripe Wiring**](./stripe-wiring.md) | Payment flows | What is the checkout path and pricing structure? |
| [**Supabase Helpers**](./supabase-helpers-report.md) | Auth & database clients | Which Supabase helpers are canonical? |
| [**VIP/Promo Map**](./vip-promo-map.md) | Access control system | How are access levels determined? |
| [**Config Report**](./config-report.md) | Configuration structure | Which file is the source of truth for config? |
| [**Legacy Usage**](./legacy-usage.md) | Legacy code inventory | Which legacy files are still attached? |

---

## Critical Questions Answered

### 1. "What renders on `/` (home) today, and which flags could hide parts of it?"

**Current Homepage Rendering** (`app/page.tsx`):

```
┌─────────────────────────────────────────────────────────────┐
│  HOMEPAGE STRUCTURE                                          │
├─────────────────────────────────────────────────────────────┤
│  1. Hero (variant-based)                                     │
│     → Flag: HOMEPAGE_HERO_VARIANT                            │
│     → Options: 'scan-first' | 'split' | 'legacy'             │
│     → Default: 'scan-first' (HomeHeroScanFirst component)    │
├─────────────────────────────────────────────────────────────┤
│  2. AgentLeaguePreview                                       │
│     → Flag: HP_GUIDE_STAR                                    │
│     → When true: Shows live metrics, activity data           │
│     → When false: Shows basic agent cards only               │
│     → Gate Type: PARTIAL (enhanced features only)            │
├─────────────────────────────────────────────────────────────┤
│  3. MetricsStrip                                             │
│     → No flags (always shows)                                │
├─────────────────────────────────────────────────────────────┤
│  4. FooterCTAs                                               │
│     → No flags (always shows)                                │
├─────────────────────────────────────────────────────────────┤
│  CONDITIONAL: PercyOnboardingRevolution                      │
│     → Shown when: ?scan={agentId} URL parameter present      │
│     → Replaces entire homepage with onboarding flow          │
└─────────────────────────────────────────────────────────────┘
```

**Flags That Control Homepage**:
- `HOMEPAGE_HERO_VARIANT` (string) - Changes entire hero component
- `HP_GUIDE_STAR` (boolean) - Toggles advanced features in AgentLeaguePreview

**Progressive Enhancement**: ✅ Base homepage always works, flags enhance experience

**See**: [flags-inventory.md](./flags-inventory.md) for all flag details

---

### 2. "Where are Orbit, League grid, Constellation, AttentionGetter, and which pages import them?"

| Component | Status | Page | Flag | Import Location |
|-----------|--------|------|------|----------------|
| **AgentLeaguePreview** | ✅ CURRENT | `/` (homepage) | `HP_GUIDE_STAR` (partial gate) | `app/page.tsx:11` |
| **AgentLeagueOrbit** | 🆕 NEW-NOT-USED | `/agents` | `ENABLE_ORBIT` (full gate, default=false) | `app/agents/page.tsx:17` |
| **AgentConstellation** | 🗄️ ARCHIVED | N/A | N/A | `lib/agents/legacy/AgentConstellationArchive.tsx` |
| **AttentionGrabberHero** | 🆕 NEW-NOT-USED | None | None | Not imported (built but inactive) |
| **Agent Grid** | ✅ CURRENT | `/agents` | None | Inline grid in `app/agents/page.tsx:309-353` |

**Key Finding**: 
- **Orbit** is built but disabled by default (`ENABLE_ORBIT=false`)
- **Constellation** has been properly archived
- **AttentionGrabberHero** is complete but not added to hero variant options
- **Grid** is not a separate component - implemented inline on agents page

**How to Enable Orbit**:
```bash
# .env
NEXT_PUBLIC_ENABLE_ORBIT=1
```

**See**: [agents-section.md](./agents-section.md) for complete component analysis

---

### 3. "What is the pricing checkout path? Which envs must exist for each plan? What disables buttons?"

**Unified Checkout Flow**:

```
UI (Pricing Page)
   ↓ POST {sku, mode, vertical}
/api/checkout
   ↓ Resolves SKU → Stripe Price ID
   ↓ Creates Checkout Session
   ↓ Returns checkout URL
Stripe Checkout
   ↓ User completes payment
   ↓ Sends webhook
/api/stripe/webhook
   ↓ Updates Supabase
   ↓ Creates subscription/order records
Done ✅
```

**Required Environment Variables** (Minimum):

**Core** (2 vars):
```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Unified 4-Tier Plans** (4 vars minimum):
```bash
NEXT_PUBLIC_STRIPE_PRICE_ROOKIE=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR=price_...
NEXT_PUBLIC_STRIPE_PRICE_FRANCHISE=price_...
```

**Add-ons** (6 vars):
```bash
NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS_10=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_MOE=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_ADV_ANALYTICS=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_AUTOMATION=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_SEAT=price_...
```

**Total Minimum**: ~12 environment variables  
**With Fallbacks**: ~50-60 environment variables (includes `_M` variants and legacy)

**What Disables Checkout Buttons**:
1. **Price ID not resolved** - SKU lookup returns null
2. **Missing env var** - Required `NEXT_PUBLIC_STRIPE_PRICE_*` not set
3. **Mode='contact'** - Franchise/Enterprise plans (intentional, shows "Contact Sales")

**Pricing Conflict Detected** 🚨:
- **Unified Catalog**: ROOKIE at $9.99/month
- **Legacy Business**: BUS_STARTER at $29/month

**See**: [stripe-wiring.md](./stripe-wiring.md) for complete payment flow analysis

---

### 4. "Which Supabase helper(s) are canonical vs. strays (e.g., `getBrowserSupabase`), and where are they used?"

**⭐ CANONICAL Supabase Helpers** (Keep These):

| Helper | File | Returns | Use Case |
|--------|------|---------|----------|
| **`getBrowserSupabase()`** | `lib/supabase/client.ts` | `SupabaseClient \| null` | ***MMM*** Browser/client components |
| **`getServerSupabaseAdmin()`** | `lib/supabase/server.ts` | `SupabaseClient \| null` | ***MMM*** Server API routes (bypass RLS) |
| **`getServerSupabaseAnon()`** | `lib/supabase/server.ts` | `SupabaseClient \| null` | ***MMM*** Server API routes (respect RLS) |

**❌ DEPRECATED Helpers** (Migrate Away):

| Helper | File | Status | Replacement |
|--------|------|--------|-------------|
| `createSafeSupabaseClient()` | `lib/supabase/client.ts` | 🕰️ LEGACY | Use `getBrowserSupabase()` with null handling |
| `createBrowserSupabaseClient()` | `lib/supabase/browser.ts` | 🕰️ DUPLICATE | Use `getBrowserSupabase()` |
| `getOptionalServerSupabase()` | `lib/supabase/server.ts` | 🕰️ LEGACY | Use `getServerSupabaseAdmin()` |
| `createServerSupabaseClient()` | `lib/supabase/server.ts` | 🕰️ LEGACY | Use `getServerSupabaseAdmin()` |

**AuthContext Anomaly** (From Screenshot):

**Finding**: ✅ **HANDLED CORRECTLY**

`components/context/AuthContext.tsx:5` imports `getBrowserSupabase()` which returns `SupabaseClient | null`. 

AuthContext properly handles null case (lines 118-126):
```typescript
const supabase = getBrowserSupabase();
if (!supabase || !supabase.auth) {
  console.warn("[Auth] Supabase auth not available");
  setIsLoading(false);
  return;
}
```

**Where Used**:
- ✅ `components/context/AuthContext.tsx` (primary usage)
- Potentially other components (needs full audit)

**See**: [supabase-helpers-report.md](./supabase-helpers-report.md) for complete Supabase analysis

---

### 5. "How many different wiring setups for CODES-VIP-User-Promo, oldest to newest, and how are VIP/Promo access levels determined?"

**4 Different Access Control Systems Detected** (Oldest → Newest):

#### 1. **Hardcoded Promo Validation** (Oldest)
**Location**: `/api/promo/validate/route.ts`  
**Era**: Early implementation  
**Codes**: Hardcoded in file (`VIP50`, `PREMIUM25`, `LAUNCH10`, `SKRBLAI2025`)  
**Action**: Validation only (no redemption, no database)  
**Status**: ⚠️ **UNCLEAR** - Not integrated with main auth system

#### 2. **Database-Driven Promo/VIP** (Current Production)
**Location**: `lib/auth/dashboardAuth.ts` + `/api/auth/apply-code`  
**Era**: Current production system  
**Tables**: `promo_codes` OR `codes`, `user_codes`, `user_dashboard_access`  
**Code Types**: `PROMO`, `VIP`  
**Action**: Full redemption + access level update  
**Status**: ✅ **ACTIVE** - Primary system

#### 3. **VIP Recognition** (Parallel System)
**Location**: `vip_users` table + `/api/vip/recognition`  
**Era**: VIP program implementation  
**How It Works**: Email-based VIP status check  
**Action**: Grants `vip` access without code  
**Status**: ✅ **ACTIVE** - Can grant VIP independently

#### 4. **Founder Codes** (Newest/Parallel)
**Location**: `/api/founders/redeem`  
**Era**: Founder program implementation  
**Roles**: `founder`, `creator`, `heir`, `parent`  
**Action**: Grants founder role (separate from access levels)  
**Status**: ✅ **ACTIVE** - Separate system

**Access Level Determination** (Priority Order):

**Sign-Up**:
```typescript
if (vipCode redeemed) 
  → accessLevel = 'vip'
else if (promoCode redeemed) 
  → accessLevel = 'promo'
else if (email in vip_users table) 
  → accessLevel = 'vip'
else 
  → accessLevel = 'free'
```

**Dashboard Routing** (Hierarchy):
```
1. Founder role → /dashboard/founder
2. Heir role → /dashboard/heir
3. VIP access → /dashboard/vip
4. Promo/Free → /dashboard/user
```

**Total Systems**: 4 different wiring setups for access control!

**See**: [vip-promo-map.md](./vip-promo-map.md) for complete access control analysis

---

### 6. "Which legacy files are still attached to live routes?"

**🕰️ LEGACY-ATTACHED** (Actively Used):

| Item | Type | Used By | Location |
|------|------|---------|----------|
| **PercyOnboardingRevolution** | Component | Homepage (`app/page.tsx`) | `components/legacy/home/` ⚠️ |
| **Hero** (legacy variant) | Component | Homepage (when `HOMEPAGE_HERO_VARIANT='legacy'`) | `components/home/Hero.tsx` |
| **BUS_STARTER/PRO/ELITE** | Pricing | Checkout fallback | `lib/pricing/catalog.ts` |
| **SPORTS_STARTER/PRO/ELITE** | Pricing | Sports checkout | `lib/pricing/catalog.ts` |
| **getOptionalServerSupabase()** | Supabase helper | Many API routes | `lib/supabase/server.ts` |
| **lib/config/pricing.ts** | Config | Pricing page constants | `lib/config/` |

**Total**: 6 legacy items actively attached to production code

**Anomaly**: `PercyOnboardingRevolution` is in `/legacy/` folder but actively imported by homepage!

**See**: [legacy-usage.md](./legacy-usage.md) for complete legacy analysis

---

## Configuration Single Sources of Truth

### ⭐ ***MMM*** Markers (Main/Master/Must-Use)

These files are the **canonical sources** for their respective concerns:

| Concern | File | ***MMM*** Status |
|---------|------|----------|
| **Feature Flags** | `lib/config/featureFlags.ts` | ***MMM*** ✅ |
| **Pricing Catalog** | `lib/pricing/catalog.ts` | ***MMM*** ✅ |
| **Agent Registry** | `lib/agents/agentLeague.ts` | ***MMM*** ✅ |
| **Stripe Price Resolution** | `lib/stripe/priceResolver.ts` | ***MMM*** ✅ |
| **Browser Supabase Client** | `lib/supabase/client.ts` → `getBrowserSupabase()` | ***MMM*** ✅ |
| **Server Supabase Admin** | `lib/supabase/server.ts` → `getServerSupabaseAdmin()` | ***MMM*** ✅ |

**⚠️ Files That Need Deprecation**:
- `lib/config/percyFeatureFlags.ts` - Merge into `featureFlags.ts`
- `lib/config/pricing.ts` - Superseded by `lib/pricing/catalog.ts`
- `lib/business/pricingData.ts` - Migrate to unified catalog
- `lib/sports/pricingData.ts` - Migrate to unified catalog

**See**: [config-report.md](./config-report.md) for complete config structure

---

## Platform Statistics

### Routes & Pages
- **39 Page Routes** (user-facing pages)
- **10 Layout Routes** (section layouts)
- **84 API Routes** (backend endpoints)
- **Total**: 133 route files

### Configuration
- **16 Feature Flags** (with 2 duplicates)
- **9 Config Files** in `lib/config/`
- **4 Access Control Systems** (Promo, VIP, Founder, Hardcoded)
- **7 Supabase Client Factories** (should be 3)

### Pricing
- **2 Pricing Systems** (Unified 4-tier + Legacy 3-tier)
- **4 Unified Tiers**: ROOKIE ($9.99), PRO ($16.99), ALL_STAR ($29.99), FRANCHISE (custom)
- **3 Legacy Business Tiers**: BUS_STARTER ($29), BUS_PRO ($49), BUS_ELITE ($99)
- **6 Add-ons**: Scans, MOE, Nutrition, Analytics, Automation, Seat
- **50-60 Stripe Env Vars** (with fallbacks)

### Components
- **12+ Hero Components** (6+ variants for 1 homepage!)
- **5 Agent Display Components**
- **~21 Legacy Items** (4 actively used, 4 new-not-used, ~10 unreferenced, 3+ archived)

---

## Critical Issues & Recommendations

### 🚨 CRITICAL (Fix Immediately)

#### 1. **Pricing Conflict**
**Issue**: Two different "Starter" prices
- Unified: ROOKIE at $9.99/month
- Legacy: BUS_STARTER at $29/month

**Action**: 
```
1. Verify which is correct price in Stripe dashboard
2. Update one system to match the other
3. Document canonical price in both catalogs
```

#### 2. **AuthContext in Legacy Folder**
**Issue**: `PercyOnboardingRevolution` in `components/legacy/` but actively used

**Action**:
```bash
mv components/legacy/home/PercyOnboardingRevolution.tsx components/percy/
# Update import in app/page.tsx
```

#### 3. **Supabase Client Proliferation**
**Issue**: 7 different client factories causing confusion

**Action**:
```
1. Audit all usages of deprecated factories
2. Migrate to 3 canonical factories
3. Remove deprecated exports
```

### ⚠️ HIGH PRIORITY (Fix Soon)

#### 4. **Hero Component Chaos**
**Issue**: 12+ hero components for 1 homepage

**Action**:
```
1. A/B test current variants for 2 weeks
2. Choose winner (scan-first vs split vs legacy)
3. Archive losing variants
4. Decide on AttentionGrabberHero (enable or archive)
```

#### 5. **Duplicate Feature Flags**
**Issue**: Percy flags in both `featureFlags.ts` and `percyFeatureFlags.ts`

**Action**:
```
1. Merge Percy flags into main featureFlags.ts
2. Update all imports
3. Delete percyFeatureFlags.ts
```

#### 6. **Multiple Promo Systems**
**Issue**: Hardcoded validation + Database-driven redemption

**Action**:
```
1. Verify if /api/promo/validate is used
2. If unused, remove hardcoded system
3. Document database-driven system as canonical
```

### ✅ GOOD (Low Priority)

#### 7. **Well-Organized Routes**
**Status**: Route structure is clean and logical

#### 8. **Progressive Enhancement Flags**
**Status**: Most flags follow progressive enhancement (base UI always works)

#### 9. **Properly Archived Components**
**Status**: Some legacy properly moved to `archived-app/` and `lib/agents/legacy/`

---

## Quick Wins (Immediate Actions)

### 1. **Move Percy Out of Legacy** (5 minutes)
```bash
mv components/legacy/home/PercyOnboardingRevolution.tsx components/percy/
# Update app/page.tsx:13
```

### 2. **Archive Unreferenced Heroes** (10 minutes)
```bash
mkdir -p components/archive/heroes
mv components/home/SplitHero.tsx components/archive/heroes/
mv components/home/SkillSmithHero.tsx components/archive/heroes/
mv app/PercyHero.tsx components/archive/heroes/
```

### 3. **Remove Legacy Stripe Endpoints** (5 minutes)
```bash
rm -rf app/api/stripe/create-checkout-session
rm -rf app/api/stripe/create-session
```

### 4. **Add ***MMM*** Markers** (15 minutes)
```typescript
// Add to top of canonical files:
/**
 * *** MMM *** (Main/Master/Must-Use)
 * This is the single source of truth for [feature flags/pricing/etc]
 * DO NOT create duplicate configs
 */
```

---

## Long-Term Roadmap

### Phase 1: Stabilize (1-2 weeks)
- ✅ Fix critical issues (pricing conflict, legacy folder issue)
- ✅ Choose canonical hero variant
- ✅ Consolidate feature flags
- ✅ Remove unreferenced components

### Phase 2: Consolidate (2-4 weeks)
- ✅ Migrate all pricing to unified catalog
- ✅ Deprecate legacy Supabase helpers
- ✅ Consolidate access control systems
- ✅ Remove legacy Stripe endpoints

### Phase 3: Optimize (1-2 weeks)
- ✅ Reduce environment variables (~60 → ~15)
- ✅ Add type-safe route definitions
- ✅ Create site-wide config file
- ✅ Document all single sources of truth

### Phase 4: Document (1 week)
- ✅ Create README files for each system
- ✅ Add architecture decision records (ADRs)
- ✅ Update onboarding docs for developers

---

## Testing Checklist

Before deploying changes:

### Authentication
- [ ] Sign-up works (with/without promo code)
- [ ] Sign-in works (with/without promo code)
- [ ] OAuth (Google) works
- [ ] Magic link works
- [ ] Email confirmation works

### Payments
- [ ] All 4 unified tier purchases work
- [ ] Add-on purchases work
- [ ] Stripe webhook processes correctly
- [ ] Subscription created in Supabase

### Homepage
- [ ] Each hero variant loads correctly
- [ ] AgentLeaguePreview shows (with/without HP_GUIDE_STAR)
- [ ] Percy onboarding triggers with ?scan= parameter

### Dashboard
- [ ] Free users route to /dashboard/user
- [ ] Promo users route to /dashboard/user
- [ ] VIP users route to /dashboard/vip
- [ ] Founders route to /dashboard/founder

### Feature Flags
- [ ] All flags toggle correctly
- [ ] No broken UI when flags disabled
- [ ] Progressive enhancement works

---

## Support & Maintenance

### For Each System

| System | Primary File | Backup/Fallback | Documentation |
|--------|-------------|----------------|---------------|
| **Feature Flags** | `lib/config/featureFlags.ts` | None | [flags-inventory.md](./flags-inventory.md) |
| **Pricing** | `lib/pricing/catalog.ts` | Legacy fallback in checkout | [stripe-wiring.md](./stripe-wiring.md) |
| **Auth** | `components/context/AuthContext.tsx` | N/A | [supabase-helpers-report.md](./supabase-helpers-report.md) |
| **Access Control** | `lib/auth/dashboardAuth.ts` | Multiple systems | [vip-promo-map.md](./vip-promo-map.md) |
| **Routes** | `app/**` directories | N/A | [routes-map.md](./routes-map.md) |

---

## Conclusion

The SKRBL AI platform is **well-structured** overall with clear routing and progressive enhancement patterns. However, there are **multiple legacy systems** running in parallel with current implementations, creating confusion and maintenance burden.

### Key Takeaways:

✅ **Strengths**:
- Well-organized Next.js app structure
- Progressive enhancement approach to feature flags
- Unified checkout endpoint
- Single webhook endpoint
- Properly archived some legacy code

⚠️ **Areas for Improvement**:
- Consolidate duplicate systems (pricing, promo codes, Supabase helpers)
- Resolve pricing conflicts
- Clean up hero component proliferation
- Move active code out of `/legacy/` folders
- Reduce environment variable count

🎯 **Priority**: Focus on **critical issues** first (pricing conflict, legacy folder anomaly, Supabase consolidation), then move to **quick wins** (archive unreferenced code, remove unused endpoints).

**Estimated Cleanup Time**: 4-8 weeks for complete consolidation

---

## Next Steps

1. **Review this report** with team
2. **Prioritize critical issues** based on business impact
3. **Assign quick wins** to developers
4. **Schedule sprint** for Phase 1 (Stabilize)
5. **Set up monitoring** for feature flags and access control
6. **Document decisions** as you make them

---

## Report Files

| File | Status | Last Updated |
|------|--------|--------------|
| [routes-map.md](./routes-map.md) | ✅ Complete | 2025-10-04 |
| [flags-inventory.md](./flags-inventory.md) | ✅ Complete | 2025-10-04 |
| [agents-section.md](./agents-section.md) | ✅ Complete | 2025-10-04 |
| [stripe-wiring.md](./stripe-wiring.md) | ✅ Complete | 2025-10-04 |
| [supabase-helpers-report.md](./supabase-helpers-report.md) | ✅ Complete | 2025-10-04 |
| [vip-promo-map.md](./vip-promo-map.md) | ✅ Complete | 2025-10-04 |
| [config-report.md](./config-report.md) | ✅ Complete | 2025-10-04 |
| [legacy-usage.md](./legacy-usage.md) | ✅ Complete | 2025-10-04 |

---

**Report End** - For questions or clarifications, refer to individual analysis files linked above.
