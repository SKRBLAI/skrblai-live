# Feature Flags, Gates & Configuration Inventory

## Overview
Complete inventory of all feature flags, environment-driven toggles, and hard gates in the SKRBL AI platform.

---

## Primary Feature Flags File

**Location**: `lib/config/featureFlags.ts`

This is the **unified source of truth** for feature flags. All flags are read from environment variables with safe defaults.

### Core Feature Flags

| Flag Name | Env Var | Default | Type | Purpose |
|-----------|---------|---------|------|---------|
| `HP_GUIDE_STAR` | `NEXT_PUBLIC_HP_GUIDE_STAR` | `true` | boolean | Enable/disable AgentLeaguePreview enhanced features on homepage |
| `HOMEPAGE_HERO_VARIANT` | `NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT` | `'scan-first'` | string | Homepage hero version: 'scan-first' \| 'split' \| 'legacy' |
| `ENABLE_ORBIT` | `NEXT_PUBLIC_ENABLE_ORBIT` | `false` | boolean | Enable AgentLeagueOrbit animation on `/agents` page |
| `ENABLE_ARR_DASH` | `NEXT_PUBLIC_ENABLE_ARR_DASH` | `false` | boolean | Enable ARR dashboard features |
| `ENABLE_STRIPE` | `NEXT_PUBLIC_ENABLE_STRIPE` | `true` | boolean | Global Stripe payments toggle |
| `ENABLE_LEGACY` | `NEXT_PUBLIC_ENABLE_LEGACY` | `false` | boolean | Gate legacy code paths |
| `ENABLE_BUNDLES` | `NEXT_PUBLIC_ENABLE_BUNDLES` | `false` | boolean | Legacy bundle pricing (deprecated) |

### Progressive Enhancement Flags

| Flag Name | Env Var | Default | Type | Purpose |
|-----------|---------|---------|------|---------|
| `AI_AUTOMATION_HOMEPAGE` | `NEXT_PUBLIC_AI_AUTOMATION_HOMEPAGE` | `true` | boolean | AI automation UI on homepage |
| `ENHANCED_BUSINESS_SCAN` | `NEXT_PUBLIC_ENHANCED_BUSINESS_SCAN` | `true` | boolean | Enhanced business scanning features |
| `URGENCY_BANNERS` | `NEXT_PUBLIC_URGENCY_BANNERS` | `true` | boolean | Urgency/scarcity banners |
| `LIVE_METRICS` | `NEXT_PUBLIC_LIVE_METRICS` | `true` | boolean | Live metrics animations |

### Percy Component Flags

| Flag Name | Env Var | Default | Type | Purpose |
|-----------|---------|---------|------|---------|
| `USE_OPTIMIZED_PERCY` | `NEXT_PUBLIC_USE_OPTIMIZED_PERCY` | `false` | boolean | Use optimized Percy vs. legacy (2,827 lines) |
| `ENABLE_PERCY_ANIMATIONS` | `NEXT_PUBLIC_ENABLE_PERCY_ANIMATIONS` | `true` | boolean | Percy animation effects |

---

## Secondary Feature Flags File

**Location**: `lib/config/percyFeatureFlags.ts`

### Percy-Specific Flags (Granular Control)

**⚠️ This file provides more granular Percy control but may conflict with main featureFlags.ts**

| Flag Name | Default | Purpose |
|-----------|---------|---------|
| `USE_OPTIMIZED_PERCY` | `false` | Main toggle for Percy optimization |
| `SHOW_PERFORMANCE_WARNING` | `true` | Warn about legacy Percy performance issues |
| `ENABLE_PERFORMANCE_MONITORING` | `true` | Monitor Percy component performance |
| `ENABLE_PERCY_AVATAR` | `true` | Percy avatar component |
| `ENABLE_PERCY_CHAT` | `true` | Percy chat component |
| `ENABLE_PERCY_SOCIAL_PROOF` | `true` | Percy social proof elements |
| `ENABLE_PERCY_ANIMATIONS` | `true` | Percy animations |
| `AUTO_FALLBACK_ON_ERROR` | `true` | Auto-fallback to legacy Percy on error |
| `LOG_COMPONENT_SWITCHES` | `true` | Log component version switches |

**📝 Recommendation**: Consolidate Percy flags into main `featureFlags.ts` to avoid duplication.

---

## Hard Gates Found

### 1. **Homepage AgentLeaguePreview** (`components/home/AgentLeaguePreview.tsx:123`)

```typescript
const isGuideStarEnabled = FEATURE_FLAGS.HP_GUIDE_STAR;
const showAdvancedFeatures = isGuideStarEnabled;

// Lines 186-201: Hard gate for live activity UI
{showAdvancedFeatures && (
  <div className="flex flex-wrap justify-center gap-6 text-sm">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <span className="text-green-400 font-semibold">
        {Object.values(liveActivity).reduce((sum, agent) => sum + agent.liveUsers, 0)} Live Users
      </span>
    </div>
    // ...more UI hidden
  </div>
)}
```

**Impact**: When `HP_GUIDE_STAR=false`, entire live activity summary hidden  
**Recommendation**: ✅ **PROGRESSIVE** - Base UI still shows, enhanced features toggleable

### 2. **Agents Page Orbit** (`app/agents/page.tsx:39, 290-306`)

```typescript
const isOrbitEnabled = process.env.NEXT_PUBLIC_ENABLE_ORBIT === '1';

// Lines 290-306: Hard gate for entire Orbit component
{isOrbitEnabled && (
  <motion.div>
    <AgentLeagueOrbit 
      agents={agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        superheroName: agent.superheroName,
        catchphrase: agent.catchphrase
      }))}
    />
  </motion.div>
)}
```

**Impact**: Orbit animation completely hidden when flag off  
**Recommendation**: ✅ **OK** - Optional enhancement, grid still functions

### 3. **Homepage Hero Variant** (`app/page.tsx:16-21`)

```typescript
const variant = FEATURE_FLAGS.HOMEPAGE_HERO_VARIANT;
const Hero = variant === 'split'
  ? require('@/components/home/HomeHeroSplit').default
  : variant === 'legacy'
    ? require('@/components/home/Hero').default
    : require('@/components/home/HomeHeroScanFirst').default;
```

**Impact**: Changes entire hero component based on flag  
**Recommendation**: ⚠️ **DECIDE** - Choose one variant, deprecate others to reduce maintenance burden

### 4. **Percy Onboarding** (`app/page.tsx:50-52`)

```typescript
// If scan parameter is present, show Percy onboarding UI
if (analysisIntent) {
  return <PercyOnboardingRevolution />;
}
```

**Impact**: URL parameter triggers entirely different page  
**Recommendation**: ✅ **GOOD** - Conditional flow based on user action

---

## Configuration Files Structure

### `lib/config/` Directory Contents

| File | Purpose | Status |
|------|---------|--------|
| `featureFlags.ts` | **MAIN** - Unified feature flags | ✅ Current |
| `percyFeatureFlags.ts` | Percy-specific granular flags | ⚠️ Duplicate |
| `heroConfig.ts` | Hero component configuration | 📄 Config |
| `pricing.ts` | Pricing display configuration | 📄 Config |
| `services.ts` | Services configuration | 📄 Config |
| `agents.ts` | Agent configuration | 📄 Config |
| `skillsmithProducts.ts` | SkillSmith product definitions | 📄 Config |
| `skillsmithPriceMap.ts` | SkillSmith price mappings | 📄 Config |
| `skillsmithPriceMap.json` | SkillSmith price data (JSON) | 📄 Data |

---

## Environment Variable Categories

### 1. **Feature Flags** (11 vars)
```bash
NEXT_PUBLIC_HP_GUIDE_STAR=true
NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT=scan-first
NEXT_PUBLIC_ENABLE_ORBIT=false
NEXT_PUBLIC_ENABLE_ARR_DASH=false
NEXT_PUBLIC_ENABLE_STRIPE=true
NEXT_PUBLIC_ENABLE_LEGACY=false
NEXT_PUBLIC_ENABLE_BUNDLES=false
NEXT_PUBLIC_AI_AUTOMATION_HOMEPAGE=true
NEXT_PUBLIC_ENHANCED_BUSINESS_SCAN=true
NEXT_PUBLIC_URGENCY_BANNERS=true
NEXT_PUBLIC_LIVE_METRICS=true
```

### 2. **Supabase** (3-5 vars)
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# Legacy aliases also supported:
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_ANON_KEY=
```

### 3. **Stripe** (2 required + ~50 price IDs)
```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
# Price IDs (examples):
NEXT_PUBLIC_STRIPE_PRICE_STARTER=
NEXT_PUBLIC_STRIPE_PRICE_PRO=
NEXT_PUBLIC_STRIPE_PRICE_ELITE=
NEXT_PUBLIC_STRIPE_PRICE_ROOKIE=
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER=
# ... many more
```

### 4. **N8N** (1-2 vars)
```bash
N8N_STRIPE_WEBHOOK_URL=
N8N_API_KEY=
```

### 5. **Observability** (optional)
```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

---

## Hard Gates Requiring Attention

### ⚠️ **Priority: Homepage Hero Decision**

**Current State**: 3 hero variants selectable via `HOMEPAGE_HERO_VARIANT`
- `HomeHeroScanFirst` (default)
- `HomeHeroSplit`
- `Hero` (legacy)

**Files Involved**:
- `app/page.tsx:16-21`
- `components/home/HomeHeroScanFirst.tsx`
- `components/home/HomeHeroSplit.tsx`
- `components/home/Hero.tsx`

**Recommendation**: 
1. Choose one hero variant as canonical
2. A/B test if needed, then deprecate losers
3. Remove variant switching logic
4. Archive unused components to `components/legacy/home/`

### ✅ **Good: Progressive Enhancement**

Most flags follow progressive enhancement pattern:
- Base UI always renders
- Enhanced features toggle on/off
- No broken states when flags disabled

**Examples**:
- `HP_GUIDE_STAR`: Shows basic agent league, adds live metrics when enabled
- `ENABLE_ORBIT`: Grid works without orbit, adds orbit animation when enabled
- `URGENCY_BANNERS`: Pricing works without urgency, adds banners when enabled

---

## Recommendations

### 1. **Consolidate Percy Flags**
Merge `percyFeatureFlags.ts` into `featureFlags.ts` to have single source of truth.

### 2. **Homepage Simplification**
Pick one hero variant, archive others. Current A/B testing approach adds complexity.

### 3. **Document Flag Dependencies**
Create flag dependency tree (e.g., `ENABLE_ARR_DASH` requires `ENABLE_STRIPE`).

### 4. **Add Flag Expiration**
Add `expiresAt` field to flags for temporary experiments:
```typescript
{
  name: 'ENABLE_ORBIT',
  default: false,
  expiresAt: '2025-03-01', // Remove after experiment
  purpose: 'A/B test orbit animation'
}
```

### 5. **Remove Unused Flags**
Audit and remove:
- `ENABLE_LEGACY` - if no legacy code paths remain
- `ENABLE_BUNDLES` - if bundle pricing deprecated

---

## Fix It Steps

1. **Run audit**: `grep -r "FEATURE_FLAGS\." --include="*.tsx" --include="*.ts"`
2. **Consolidate Percy**: Move Percy flags to main `featureFlags.ts`
3. **Choose hero**: A/B test for 2 weeks, pick winner, remove losers
4. **Document**: Add inline comments explaining each flag's purpose
5. **Cleanup**: Remove unused flags and dead code paths
