# Agents Area Components Analysis

## Overview
Complete map of all agent-related UI components, their locations, imports, flags, and current status.

---

## Agent Display Components

### 1. **AgentLeaguePreview** (Homepage)

| Attribute | Value |
|-----------|-------|
| **Path** | `components/home/AgentLeaguePreview.tsx` |
| **Imported By** | `app/page.tsx` (homepage) |
| **Flag(s)** | `FEATURE_FLAGS.HP_GUIDE_STAR` |
| **Hard Gate?** | ✅ Partial - Advanced features only |
| **Status** | ✅ **CURRENT** - Active on homepage |

**What It Does**:
- Displays core 5 agents: Percy, BrandAlexander, SkillSmith, Social Nino, Content Carltig
- Shows live activity metrics when `HP_GUIDE_STAR=true`
- Fetches agent data from `agentRegistry`
- Handles IRA agent access check via `/api/agents/ira/is-allowed`

**Progressive Enhancement**:
```typescript
// Lines 123-138
const isGuideStarEnabled = FEATURE_FLAGS.HP_GUIDE_STAR;
const showAdvancedFeatures = isGuideStarEnabled;

// Base league always shows
// Lines 186-201: Enhanced features gated
{showAdvancedFeatures && (
  <div>Live Users, Today Created, Market Control</div>
)}

// Lines 238-255: Live activity indicator gated
{showAdvancedFeatures && (
  <div>Live activity cards</div>
)}
```

**Behavior**:
- Without flag: Shows basic agent cards with LEARN/CHAT/DEMO buttons
- With flag: Adds live user counts, activity metrics, competitive edge data

---

### 2. **AgentLeagueOrbit** (Agents Page)

| Attribute | Value |
|-----------|-------|
| **Path** | `components/agents/AgentLeagueOrbit.tsx` |
| **Imported By** | `app/agents/page.tsx` |
| **Flag(s)** | `NEXT_PUBLIC_ENABLE_ORBIT` (checked as `process.env`) |
| **Hard Gate?** | ✅ YES - Entire component hidden when off |
| **Status** | 🆕 **NEW-NOT-USED** (Disabled by default, flag=false) |

**What It Does**:
- Rotating orbit animation with Percy at center
- 4-agent "petals" rotating around Percy
- Mobile fallback: 2x2 grid slider
- Desktop: Full orbit with auto-rotation every 5 seconds

**Gate Location** (`app/agents/page.tsx:39, 290-306`):
```typescript
const isOrbitEnabled = process.env.NEXT_PUBLIC_ENABLE_ORBIT === '1';

// Lines 290-306
{isOrbitEnabled && (
  <motion.div>
    <AgentLeagueOrbit agents={agents} />
  </motion.div>
)}
```

**Behavior**:
- When `ENABLE_ORBIT=false` (default): Component not rendered
- When `ENABLE_ORBIT=true`: Animated orbit appears between hero and agent grid

**Recommendation**: Enable for testing, measure engagement vs. grid-only layout.

---

### 3. **AgentConstellation**

| Attribute | Value |
|-----------|-------|
| **Path** | **NOT FOUND** in current codebase |
| **Imported By** | None |
| **Flag(s)** | N/A |
| **Hard Gate?** | N/A |
| **Status** | 🗄️ **ARCHIVED** - Found in `lib/agents/legacy/AgentConstellationArchive.tsx` |

**Finding**: AgentConstellation has been archived. No active references found.

**Archive Location**: `lib/agents/legacy/AgentConstellationArchive.tsx`

**Recommendation**: ✅ Properly archived, no cleanup needed.

---

### 4. **AttentionGrabberHero** (aka AttentionGetter)

| Attribute | Value |
|-----------|-------|
| **Path** | `components/home/AttentionGrabberHero.tsx` |
| **Imported By** | **NONE** - Not currently imported |
| **Flag(s)** | None |
| **Hard Gate?** | N/A |
| **Status** | 🆕 **NEW-NOT-USED** - Built but not activated |

**What It Does**:
- Dual-path hero: "Automate My Business" or "Level Up My Game"
- Percy + SkillSmith character cards on sides
- Platform selection grid (Instagram, YouTube, Shopify, LinkedIn, etc.)
- Integrates with `/api/percy/scan` for business analysis
- URL input with quick scan feature

**Why Not Used**:
- Homepage uses dynamic hero selection (`HOMEPAGE_HERO_VARIANT`)
- AttentionGrabberHero not in the variant options
- No import statement in `app/page.tsx`

**Recommendation**: 
- Add as 4th `HOMEPAGE_HERO_VARIANT` option: `'attention-grabber'`
- OR replace one of the existing variants (split/legacy) with this
- OR archive if not part of roadmap

---

## Other Agent Components

### 5. **AgentLeagueCard**

| Attribute | Value |
|-----------|-------|
| **Path** | `components/ui/AgentLeagueCard.tsx` |
| **Imported By** | `app/agents/page.tsx` (agents listing page) |
| **Flag(s)** | None |
| **Hard Gate?** | No |
| **Status** | ✅ **CURRENT** - Active on `/agents` page |

**Purpose**: Individual agent card component used in grid layout on agents page.

---

### 6. **AgentOrbitCard**

| Attribute | Value |
|-----------|-------|
| **Path** | `components/agents/AgentOrbitCard.tsx` |
| **Imported By** | `components/agents/AgentLeagueOrbit.tsx` |
| **Flag(s)** | Inherits from parent `ENABLE_ORBIT` |
| **Hard Gate?** | Indirect - only used if orbit enabled |
| **Status** | 🆕 **NEW-NOT-USED** (Part of orbit system) |

**Purpose**: Smaller card format optimized for orbit animation.

---

### 7. **AgentImage**

| Attribute | Value |
|-----------|-------|
| **Path** | `components/shared/AgentImage.tsx` |
| **Imported By** | Multiple - `AgentLeaguePreview`, `AgentLeagueOrbit`, agent pages |
| **Flag(s)** | None |
| **Hard Gate?** | No |
| **Status** | ✅ **CURRENT** - Widely used |

**Purpose**: Unified agent image component with fallback progression:
1. `/images/agents/<slug>.png`
2. `/images/agents/<slug>-nobg.png`
3. `/images/agents/<slug>.webp`
4. `/images/agents/default.png`
5. Letter/emoji fallback

---

## Agent Grid/List Components

### AgentGrid vs AgentsGrid

**Finding**: No `AgentGrid.tsx` or `AgentsGrid.tsx` found as standalone components.

The "grid" on `/agents` page is implemented inline using:
```typescript
// app/agents/page.tsx:309-353
<motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredAgents.map(agent => (
    <AgentLeagueCard agent={agent} />
  ))}
</motion.div>
```

**No separate grid component** - Grid layout integrated directly in page.

---

## Hero Components (All Variants)

### Homepage Hero Variants

| Component | Path | Used When | Status |
|-----------|------|-----------|--------|
| **HomeHeroScanFirst** | `components/home/HomeHeroScanFirst.tsx` | `HOMEPAGE_HERO_VARIANT='scan-first'` (**default**) | ✅ CURRENT |
| **HomeHeroSplit** | `components/home/HomeHeroSplit.tsx` | `HOMEPAGE_HERO_VARIANT='split'` | 🔀 VARIANT |
| **Hero** (legacy) | `components/home/Hero.tsx` | `HOMEPAGE_HERO_VARIANT='legacy'` | 🕰️ LEGACY-ATTACHED |
| **AttentionGrabberHero** | `components/home/AttentionGrabberHero.tsx` | Not in variant options | 🆕 NEW-NOT-USED |

### Other Hero Components

| Component | Path | Used On | Status |
|-----------|------|---------|--------|
| **SplitHero** | `components/home/SplitHero.tsx` | Unknown - Possible duplicate? | ❓ UNCLEAR |
| **SkillSmithHero** | `components/home/SkillSmithHero.tsx` | Unknown - Legacy? | ❓ UNCLEAR |
| **SkillSmithStandaloneHero** | `components/home/SkillSmithStandaloneHero.tsx` | Unknown | ❓ UNCLEAR |
| **UnifiedSportsHero** | `components/sports/UnifiedSportsHero.tsx` | `/sports` page | ✅ CURRENT (Sports) |
| **SportsHero** | `components/sports/SportsHero.tsx` | Legacy sports hero | 🕰️ LEGACY |
| **PercyHero** | `app/PercyHero.tsx` | Unknown | ❓ UNCLEAR |
| **HeroSection** | `components/ui/HeroSection.tsx` | Generic hero UI component | 📦 UTILITY |

**Recommendation**: Hero component proliferation! Consolidate:
1. Keep: `HomeHeroScanFirst` (homepage), `UnifiedSportsHero` (sports)
2. Archive: All others to `components/legacy/home/`
3. Document: Add README explaining hero consolidation

---

## Summary Table

| Component | Location | Page | Flag | Gate Type | Status |
|-----------|----------|------|------|-----------|--------|
| **AgentLeaguePreview** | `components/home/` | `/` | `HP_GUIDE_STAR` | Partial | ✅ CURRENT |
| **AgentLeagueOrbit** | `components/agents/` | `/agents` | `ENABLE_ORBIT` | Full | 🆕 NEW-NOT-USED |
| **AgentConstellation** | N/A | N/A | N/A | N/A | 🗄️ ARCHIVED |
| **AttentionGrabberHero** | `components/home/` | None | None | N/A | 🆕 NEW-NOT-USED |
| **AgentLeagueCard** | `components/ui/` | `/agents` | None | None | ✅ CURRENT |
| **AgentOrbitCard** | `components/agents/` | `/agents` (if orbit on) | Indirect | Indirect | 🆕 NEW-NOT-USED |
| **AgentImage** | `components/shared/` | Multiple | None | None | ✅ CURRENT |
| **HomeHeroScanFirst** | `components/home/` | `/` | `HOMEPAGE_HERO_VARIANT='scan-first'` | Switch | ✅ CURRENT |
| **HomeHeroSplit** | `components/home/` | `/` | `HOMEPAGE_HERO_VARIANT='split'` | Switch | 🔀 VARIANT |
| **Hero** (legacy) | `components/home/` | `/` | `HOMEPAGE_HERO_VARIANT='legacy'` | Switch | 🕰️ LEGACY-ATTACHED |

---

## Recommendations

### 1. **Enable Orbit for Testing**
```bash
# .env
NEXT_PUBLIC_ENABLE_ORBIT=1
```
Run A/B test for 2 weeks, measure engagement vs. grid-only.

### 2. **Decide on AttentionGrabberHero**
Three options:
- **Option A**: Add as 4th hero variant: `HOMEPAGE_HERO_VARIANT='attention-grabber'`
- **Option B**: Replace `split` or `legacy` with AttentionGrabberHero
- **Option C**: Archive if not needed

### 3. **Consolidate Hero Components**
- Keep 2 heroes max: Homepage + Sports
- Archive all others to `components/legacy/home/`
- Document consolidation in README

### 4. **Clean Up Unclear Components**
Investigate and categorize:
- `SplitHero` - Duplicate of `HomeHeroSplit`?
- `SkillSmithHero` - Old sports hero?
- `SkillSmithStandaloneHero` - Duplicate of `UnifiedSportsHero`?
- `PercyHero` - Old Percy intro?

---

## Fix It Steps

1. **Audit hero components**: `find components -name "*Hero*.tsx" | wc -l` (Result: 12 heroes!)
2. **Test Orbit**: Enable `ENABLE_ORBIT`, deploy to staging, measure engagement
3. **Choose homepage hero**: A/B test variants, pick winner
4. **Archive unused**: Move 8+ unused heroes to `components/legacy/home/`
5. **Document**: Create `components/home/README.md` explaining hero strategy
