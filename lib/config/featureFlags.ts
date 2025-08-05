// Feature Flag Configuration
// This allows easy toggling of features without code changes

export const FEATURE_FLAGS = {
  // Homepage AI Automation transformation
  AI_AUTOMATION_HOMEPAGE: process.env.NEXT_PUBLIC_AI_AUTOMATION_HOMEPAGE === 'true' || true, // Default to true
  
  // Business scan enhancements
  ENHANCED_BUSINESS_SCAN: process.env.NEXT_PUBLIC_ENHANCED_BUSINESS_SCAN === 'true' || true,
  
  // Urgency banners and conversion optimizations
  URGENCY_BANNERS: process.env.NEXT_PUBLIC_URGENCY_BANNERS === 'true' || true,
  
  // Real-time metrics and social proof
  LIVE_METRICS: process.env.NEXT_PUBLIC_LIVE_METRICS === 'true' || true,
} as const;

// Helper function to check feature flags
export const isFeatureEnabled = (flag: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[flag];
};

// Helper function to get feature flag with fallback
export const getFeatureFlag = (flag: keyof typeof FEATURE_FLAGS, fallback: boolean = false): boolean => {
  return FEATURE_FLAGS[flag] ?? fallback;
};

// Usage examples:
// const showNewHomepage = isFeatureEnabled('AI_AUTOMATION_HOMEPAGE');
// const useUrgencyBanners = getFeatureFlag('URGENCY_BANNERS', false);