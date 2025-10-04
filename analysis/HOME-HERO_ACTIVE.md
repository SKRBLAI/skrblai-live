# Active Home Heroes

This document lists which hero components are currently active on the homepage and which have been archived.

## Active Heroes (Currently Used)

### Homepage Hero Variants
The homepage (`/`) dynamically loads one of three hero variants based on `FEATURE_FLAGS.HOMEPAGE_HERO_VARIANT`:

1. **HomeHeroScanFirst** (`components/home/HomeHeroScanFirst.tsx`)
   - **Status**: ✅ **DEFAULT** - Active when `HOMEPAGE_HERO_VARIANT='scan-first'`
   - **Purpose**: Modern homepage hero with business scan focus
   - **Usage**: Default variant, most commonly used

2. **HomeHeroSplit** (`components/home/HomeHeroSplit.tsx`)
   - **Status**: ✅ **ACTIVE** - Available when `HOMEPAGE_HERO_VARIANT='split'`
   - **Purpose**: Alternative homepage layout with split design
   - **Usage**: Alternative variant option

3. **Hero** (`components/home/Hero.tsx`)
   - **Status**: ✅ **ACTIVE** - Available when `HOMEPAGE_HERO_VARIANT='legacy'`
   - **Purpose**: Legacy homepage hero for backward compatibility
   - **Usage**: Legacy variant option

### Percy Onboarding Component
4. **PercyOnboardingRevolution** (`components/home/PercyOnboardingRevolution.tsx`)
   - **Status**: ✅ **ACTIVE** - Used when `?scan={agentId}` parameter is present
   - **Purpose**: Interactive Percy onboarding flow
   - **Usage**: Conditional rendering based on URL parameters

## Archived Heroes (No Longer Used)

The following hero components have been moved to `archived-app/home/` and are not imported by any active routes:

### Deprecated Hero Components
- **SplitHero.tsx** - Deprecated (2025-09-26), superseded by HomeHeroScanFirst
- **SkillSmithHero.tsx** - Deprecated (2025-09-26), superseded by HomeHeroScanFirst  
- **SkillSmithStandaloneHero.tsx** - Deprecated (2025-09-26), superseded by HomeHeroScanFirst
- **PercyHero.tsx** - Deprecated (2025-09-26), superseded by HomeHeroScanFirst

### Deprecated Homepage Components
- **UrgencyBanner.tsx** - Deprecated (2025-09-26), superseded by HomeHeroScanFirst
- **Spotlight.tsx** - Deprecated (2025-09-26), superseded by HomeHeroScanFirst
- **SuperAgentPowers.tsx** - Deprecated (2025-09-26), superseded by HomeHeroScanFirst
- **BusinessResultsShowcase.tsx** - Deprecated (2025-09-26), superseded by HomeHeroScanFirst
- **AgentPreviewSection.tsx** - Deprecated (2025-09-26), superseded by HomeHeroScanFirst

## Configuration

### Environment Variables
```bash
# Homepage hero variant selection
NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT=scan-first  # Options: scan-first, split, legacy
```

### Feature Flags
```typescript
// lib/config/featureFlags.ts
FEATURE_FLAGS.HOMEPAGE_HERO_VARIANT  // Controls which hero variant to use
```

## Usage Examples

### Homepage Implementation
```typescript
// app/page.tsx
const variant = FEATURE_FLAGS.HOMEPAGE_HERO_VARIANT;
const Hero = variant === 'split'
  ? require('@/components/home/HomeHeroSplit').default
  : variant === 'legacy'
    ? require('@/components/home/Hero').default
    : require('@/components/home/HomeHeroScanFirst').default;

// Conditional Percy onboarding
if (analysisIntent) {
  return <PercyOnboardingRevolution />;
}

return (
  <>
    <Hero />
    <AgentLeaguePreview />
    <MetricsStrip />
    <FooterCTAs />
  </>
);
```

## Migration Notes

- All deprecated components have been moved to `archived-app/home/`
- The Percy onboarding component has been moved from `components/legacy/home/` to `components/home/`
- No breaking changes to existing functionality
- All active heroes remain fully functional

## Recommendations

1. **Consolidate Hero Variants**: Consider choosing one hero variant as canonical and deprecating others to reduce maintenance burden
2. **A/B Testing**: Use the variant system for A/B testing, then consolidate to the winning variant
3. **Archive Cleanup**: The archived components can be safely deleted after confirming no external references exist