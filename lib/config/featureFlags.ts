// Feature Flag Configuration
// This allows easy toggling of features without code changes

export const FEATURE_FLAGS = {
  // New homepage flags (env-driven)
  HP_GUIDE_STAR: (process.env.NEXT_PUBLIC_HP_GUIDE_STAR ?? '1') === '1',
  HOMEPAGE_HERO_VARIANT: ((process.env.NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT ?? 'scan-first') as 'scan-first' | 'split' | 'legacy'),

  // Existing flags preserved for backward compatibility (defaults kept to avoid behavior changes)
  AI_AUTOMATION_HOMEPAGE: process.env.NEXT_PUBLIC_AI_AUTOMATION_HOMEPAGE === 'true' || true,
  ENHANCED_BUSINESS_SCAN: process.env.NEXT_PUBLIC_ENHANCED_BUSINESS_SCAN === 'true' || true,
  URGENCY_BANNERS: process.env.NEXT_PUBLIC_URGENCY_BANNERS === 'true' || true,
  LIVE_METRICS: process.env.NEXT_PUBLIC_LIVE_METRICS === 'true' || true,
} as const;

// Helper types for strong typing of boolean vs non-boolean flags
type FeatureFlags = typeof FEATURE_FLAGS;
type BooleanFlagKeys = { [K in keyof FeatureFlags]: FeatureFlags[K] extends boolean ? K : never }[keyof FeatureFlags];

// Helper function to check boolean feature flags
export const isFeatureEnabled = (flag: BooleanFlagKeys): boolean => {
  return FEATURE_FLAGS[flag] as boolean;
};

// Helper function to get any feature flag with proper typing
export const getFeatureFlag = <K extends keyof FeatureFlags>(flag: K, fallback?: FeatureFlags[K]): FeatureFlags[K] => {
  const value = FEATURE_FLAGS[flag];
  return (value ?? fallback) as FeatureFlags[K];
};

// Usage examples:
// const showNewHomepage = isFeatureEnabled('AI_AUTOMATION_HOMEPAGE');
// const useUrgencyBanners = getFeatureFlag('URGENCY_BANNERS', false);