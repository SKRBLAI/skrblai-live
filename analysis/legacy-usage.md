# Legacy vs Current Usage Analysis

## Overview
Identification of legacy components, their usage status, and cleanup recommendations.

---

## Legacy Component Categories

### 1. **Legacy Still Attached** 🕰️
Components actively imported/used by live pages

### 2. **New-Not-Used** 🆕
Recently built components not yet activated

### 3. **Unreferenced** 🗄️
Legacy components with no active imports

### 4. **Archived** ✅
Properly moved to archive directories

---

## Legacy Directories

### `components/legacy/` Directory

**Found Files** (16 total):
```
components/legacy/
├── services/
│   └── services/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── metadata.ts
│       ├── not-found.tsx
│       └── [agent]/
│           ├── AgentServiceClient.tsx
│           └── page.tsx
├── onboarding/
│   └── UnifiedOnboarding.tsx
└── home/
    ├── PercyOnboardingRevolution.tsx    # ← Still used!
    └── OnboardingSection.tsx
```

**Finding**: `PercyOnboardingRevolution.tsx` is in `/legacy/` but actively used!

**Usage** (`app/page.tsx:13, 51-52`):
```typescript
const PercyOnboardingRevolution = dynamic(() => 
  import("@/components/legacy/home/PercyOnboardingRevolution"), 
  { ssr: false }
);

// Line 51
if (analysisIntent) {
  return <PercyOnboardingRevolution />;
}
```

**Status**: 🕰️ **LEGACY-ATTACHED** - In legacy folder but actively used on homepage

---

### `archived-app/` Directory

**Found Directories**:
```
archived-app/
└── legacy/
    ├── agent-backstory/
    │   ├── layout.tsx
    │   └── [agentId]/page.tsx
    ├── branding/
    │   ├── page.tsx
    │   └── metadata.ts
    ├── book-publishing/
    │   ├── page.tsx
    │   ├── layout.tsx
    │   └── metadata.ts
    └── social-media/
        ├── page.tsx
        ├── layout.tsx
        └── metadata.ts
```

**Status**: ✅ **PROPERLY ARCHIVED** - In `archived-app/`, not in active `app/` directory

---

### `lib/agents/legacy/` Directory

**Found Files**:
```
lib/agents/legacy/
└── AgentConstellationArchive.tsx
```

**Status**: ✅ **PROPERLY ARCHIVED**

---

## Component Inventory by Status

### 🕰️ **LEGACY-ATTACHED** (Still Used)

| Component | Path | Used By | Replacement | Action Needed |
|-----------|------|---------|-------------|---------------|
| **PercyOnboardingRevolution** | `components/legacy/home/` | `app/page.tsx` (homepage) | `PercyOnboardingRevolution_LEGACY_v1.tsx` exists in `components/percy/archive/` | Move to `components/percy/` or fully deprecate |
| **Hero** (legacy) | `components/home/Hero.tsx` | `app/page.tsx` (when `HOMEPAGE_HERO_VARIANT='legacy'`) | `HomeHeroScanFirst` | Set variant to `scan-first`, archive old hero |
| **BUS_STARTER/PRO/ELITE** | `lib/pricing/catalog.ts` | Checkout fallback | Unified 4-tier (ROOKIE/PRO/ALL_STAR) | Complete migration to unified |
| **SPORTS_STARTER/PRO/ELITE** | `lib/pricing/catalog.ts` | Sports checkout | Unified sports plans | Verify mapping to unified SKUs |

**Total**: 4 legacy items actively attached

---

### 🆕 **NEW-NOT-USED** (Built But Inactive)

| Component | Path | Status | Reason Not Used | Action Needed |
|-----------|------|--------|----------------|---------------|
| **AgentLeagueOrbit** | `components/agents/` | Flag disabled | `ENABLE_ORBIT=false` | Enable for testing or archive |
| **AttentionGrabberHero** | `components/home/` | Not imported | Not in hero variant options | Add to variants or archive |
| **AgentOrbitCard** | `components/agents/` | Used only by Orbit | Indirect - orbit disabled | Enable orbit or archive |
| **HomeHeroSplit** | `components/home/` | Variant option | `HOMEPAGE_HERO_VARIANT='split'` not default | Keep as variant or archive |

**Total**: 4 new components not in use

---

### 🗄️ **UNREFERENCED** (No Active Imports)

**Hero Components** (Unclear Usage):

| Component | Path | Status | Action Needed |
|-----------|------|--------|---------------|
| **SplitHero** | `components/home/SplitHero.tsx` | Unknown usage | Check if duplicate of `HomeHeroSplit`, archive if unused |
| **SkillSmithHero** | `components/home/SkillSmithHero.tsx` | Unknown usage | Check if old sports hero, archive if unused |
| **SkillSmithStandaloneHero** | `components/home/SkillSmithStandaloneHero.tsx` | Unknown usage | Check if duplicate of `UnifiedSportsHero`, archive if unused |
| **PercyHero** | `app/PercyHero.tsx` | Unknown usage | Check if old Percy intro, archive if unused |

**Legacy Services** (In `components/legacy/services/`):
- `AgentServiceClient.tsx` - Old agent service interface
- Legacy service pages/layouts

**Legacy Onboarding**:
- `UnifiedOnboarding.tsx` - Old onboarding component

**Total**: ~10 unreferenced components

---

### ✅ **PROPERLY ARCHIVED**

| Component/Directory | Path | Status |
|---------------------|------|--------|
| **AgentConstellation** | `lib/agents/legacy/AgentConstellationArchive.tsx` | ✅ Archived |
| **Legacy app routes** | `archived-app/legacy/` | ✅ Archived |
| **Percy v1** | `components/percy/archive/PercyOnboardingRevolution_LEGACY_v1.tsx` | ✅ Archived |

**Total**: 3+ properly archived items

---

## Import Graph Analysis

### **Homepage** (`app/page.tsx`)

**Active Imports**:
- ✅ `MetricsStrip` (current)
- ✅ `FooterCTAs` (current)
- ✅ `AgentLeaguePreview` (current)
- ✅ `WizardLauncher` (current)
- 🕰️ `PercyOnboardingRevolution` (from `/legacy/` folder!)
- 🔀 Dynamic hero (3 variants based on flag)

**Legacy Dependency**: Homepage imports from `components/legacy/`

---

### **Agents Page** (`app/agents/page.tsx`)

**Active Imports**:
- ✅ `AgentLeagueCard` (current)
- ✅ `agentLeague` (current)
- ✅ `AuthContext` (current)
- 🆕 `AgentLeagueOrbit` (flag-gated, disabled)

**No legacy dependencies** (if orbit not enabled)

---

### **Dashboard Pages**

**No legacy imports detected** in:
- `app/dashboard/page.tsx`
- `app/dashboard/user/page.tsx`
- `app/dashboard/vip/page.tsx`
- `app/dashboard/founder/page.tsx`

**Clean** ✅

---

### **Pricing Page** (`app/pricing/page.tsx`)

**Active Imports**:
- ✅ `PricingCard` (current)
- ✅ `CheckoutButton` (current)
- ✅ `PRICING_CATALOG` from `lib/pricing/catalog.ts` (current)
- ⚠️ Uses `lib/config/pricing.ts` constants (legacy)

**Mixed** - Uses new catalog but old config constants

---

### **Sports Page** (`app/sports/page.tsx`)

**Active Imports**:
- ✅ `UnifiedSportsHero` (current)
- ✅ `SportsPricingGrid` (current)
- ✅ `MetricsStrip` (current)
- ⚠️ Uses `lib/sports/pricingData.ts` (legacy pricing)

**Mixed** - Current components but legacy pricing data

---

## API Routes - Legacy Endpoints

### Stripe Endpoints

| Endpoint | Status | Canonical Replacement |
|----------|--------|----------------------|
| `/api/stripe/create-checkout-session` | 🕰️ **LEGACY** | `/api/checkout` |
| `/api/stripe/create-session` | 🕰️ **LEGACY** | `/api/checkout` |
| `/api/stripe/calculate-tax` | ⚠️ **UNCLEAR** | May still be used |
| `/api/stripe/webhook` | ✅ **CURRENT** | N/A - This IS canonical |
| `/api/checkout` | ✅ **CURRENT** | N/A - This IS canonical |

**Finding**: 2 legacy Stripe checkout endpoints still exist

---

### Promo Code Endpoints

| Endpoint | Status | Notes |
|----------|--------|-------|
| `/api/promo/validate` | ⚠️ **UNCLEAR** | Hardcoded codes, not integrated with auth |
| `/api/auth/apply-code` | ✅ **CURRENT** | Database-driven, integrated |

**Finding**: Duplicate promo systems

---

## Cleanup Recommendation Matrix

### Priority 1: Remove Active Legacy Dependencies

| Item | Action | Impact | Effort |
|------|--------|--------|--------|
| **Move `PercyOnboardingRevolution`** | Out of `/legacy/` folder | High - Homepage dependency | Low |
| **Deprecate old pricing config** | Remove `lib/config/pricing.ts` | Medium - May break old imports | Medium |
| **Migrate pricing data** | Consolidate to `catalog.ts` | High - Affects checkout | High |
| **Archive legacy hero** | When `HOMEPAGE_HERO_VARIANT` settled | Medium - Variant system | Low |

### Priority 2: Clean Up Unreferenced Components

| Item | Action | Impact | Effort |
|------|--------|--------|--------|
| **Audit unclear heroes** | Check usage, archive if unused | Low - Reduces codebase | Medium |
| **Remove legacy services** | `components/legacy/services/` | Low - Already legacy | Low |
| **Remove legacy onboarding** | `UnifiedOnboarding.tsx` | Low - Already legacy | Low |

### Priority 3: Enable or Archive New Components

| Item | Action | Impact | Effort |
|------|--------|--------|--------|
| **Test `AgentLeagueOrbit`** | Enable flag, A/B test, keep or archive | Medium - New feature | Medium |
| **Decide `AttentionGrabberHero`** | Add to variants or archive | Low - Alternative hero | Low |
| **Clean up hero variants** | Consolidate to 1-2 heroes max | High - Simplifies codebase | Medium |

---

## File Count Summary

### Current State

| Category | Count | Status |
|----------|-------|--------|
| **Legacy-Attached** | 4+ | 🕰️ Actively used, needs migration |
| **New-Not-Used** | 4 | 🆕 Built but inactive |
| **Unreferenced** | ~10 | 🗄️ No imports, safe to delete |
| **Properly Archived** | 3+ | ✅ Already archived |
| **Total Legacy** | ~21 | Mix of statuses |

### Target State (After Cleanup)

| Category | Count | Status |
|----------|-------|--------|
| **Legacy-Attached** | 0 | ✅ All migrated |
| **New-Not-Used** | 0 | ✅ All decided (enabled or archived) |
| **Unreferenced** | 0 | ✅ All deleted or archived |
| **Properly Archived** | ~21 | ✅ All legacy code archived |

---

## Quick Wins (Low Effort, High Impact)

### 1. **Move Percy Component Out of Legacy**
**Current**: `components/legacy/home/PercyOnboardingRevolution.tsx`  
**Target**: `components/percy/PercyOnboardingRevolution.tsx` or `components/home/PercyOnboardingFlow.tsx`  
**Effort**: 5 minutes (move file + update import)

### 2. **Archive Unreferenced Heroes**
**Targets**: `SplitHero`, `SkillSmithHero`, `SkillSmithStandaloneHero`, `PercyHero`  
**Action**: 
```bash
mkdir -p components/archive/heroes
mv components/home/{SplitHero,SkillSmithHero,SkillSmithStandaloneHero}.tsx components/archive/heroes/
mv app/PercyHero.tsx components/archive/heroes/
```
**Effort**: 10 minutes (verify no imports, move files)

### 3. **Remove Legacy Stripe Endpoints**
**Targets**: `/api/stripe/create-checkout-session`, `/api/stripe/create-session`  
**Action**: 
```bash
rm -rf app/api/stripe/create-checkout-session
rm -rf app/api/stripe/create-session
```
**Effort**: 5 minutes (verify not used, delete folders)

### 4. **Archive Legacy Services**
**Target**: `components/legacy/services/`  
**Action**: 
```bash
mv components/legacy/services components/archive/
```
**Effort**: 2 minutes (already in legacy, just move deeper)

---

## Long-Term Migration Path

### Phase 1: Stabilize (1-2 weeks)
1. ✅ Move active legacy out of `/legacy/` folder
2. ✅ Choose canonical hero variant
3. ✅ Enable or archive new components (orbit, attention-grabber)
4. ✅ Remove unreferenced components

### Phase 2: Consolidate (2-4 weeks)
1. ✅ Migrate all pricing to unified catalog
2. ✅ Remove legacy pricing config files
3. ✅ Deprecate legacy Stripe endpoints
4. ✅ Consolidate promo code systems

### Phase 3: Archive (1 week)
1. ✅ Move all legacy to `components/archive/` or `ARCHIVED/`
2. ✅ Add README explaining archive
3. ✅ Document migration for teams

---

## Summary

### ✅ Well Organized
- `archived-app/legacy/` properly archived
- `lib/agents/legacy/AgentConstellation` properly archived
- Most current components cleanly separated

### ⚠️ Needs Attention
- `PercyOnboardingRevolution` in `/legacy/` but actively used
- Multiple hero variants (6+ heroes for 1 homepage)
- Duplicate promo/pricing systems
- Legacy Stripe endpoints still exist

### 🎯 Cleanup Target
**Remove**: ~21 legacy items  
**Archive**: ~15 items properly  
**Delete**: ~6 unreferenced items  
**Result**: Clean, maintainable codebase with clear boundaries

---

## Fix It Steps

1. **Audit**: Run `grep -r "import.*legacy" --include="*.tsx" --include="*.ts"`
2. **Verify**: Check each import is intentional
3. **Move**: Active legacy out of `/legacy/` folders
4. **Delete**: Unreferenced components
5. **Archive**: Everything else to `ARCHIVED/` or `components/archive/`
6. **Document**: Add `ARCHIVED/README.md` explaining what's there and why
