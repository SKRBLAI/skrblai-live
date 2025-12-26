/** MMM: Canonical source for feature flags. Do not duplicate. */

/**
 * Unified Feature Flag Configuration - DE-CURSED VERSION
 * 
 * CANONICAL FLAGS ONLY (4 total):
 * - FF_CLERK: Clerk auth toggle (v2 only, quarantined for v1)
 * - FF_SITE_VERSION: Legacy/new split (v1 only)
 * - FF_N8N_NOOP: N8N workflow kill switch
 * - ENABLE_STRIPE: Global Stripe kill switch
 * 
 * All other flags have been converted to constants or removed.
 */

import { readBooleanFlag } from './flags';

// Re-export the enhanced flag parser
export { readBooleanFlag };

/**
 * CANONICAL FLAGS - The only flags that should be read from environment
 */
export const FLAGS = {
  // === AUTH FLAGS ===
  /** Clerk auth toggle. Default: false (Supabase-only for v1) */
  FF_CLERK: readBooleanFlag('FF_CLERK', false),
  
  // === SYSTEM FLAGS ===
  /** Site version for legacy/new split. Default: 'v1' */
  FF_SITE_VERSION: (process.env.FF_SITE_VERSION ?? 'v1') as 'v1' | 'v2',
  
  /** N8N NOOP mode - prevents n8n downtime from blocking user flows. Default: true */
  FF_N8N_NOOP: readBooleanFlag('FF_N8N_NOOP', true),
  
  // === PAYMENT FLAGS ===
  /** Global Stripe kill switch. Default: true (enabled) */
  ENABLE_STRIPE:
    process.env.ENABLE_STRIPE === undefined
      ? readBooleanFlag('NEXT_PUBLIC_ENABLE_STRIPE', false)
      : readBooleanFlag('ENABLE_STRIPE', false),
} as const;

/**
 * CONSTANTS - Former flags that are now always on/off
 * These are NOT read from environment - they're compile-time constants
 */
export const CONSTANTS = {
  // Always ON (progressive enhancement, always enabled)
  HP_GUIDE_STAR: true,
  AI_AUTOMATION_HOMEPAGE: true,
  ENHANCED_BUSINESS_SCAN: true,
  URGENCY_BANNERS: true,
  LIVE_METRICS: true,
  ENABLE_PERCY_ANIMATIONS: true,
  ENABLE_PERCY_AVATAR: true,
  ENABLE_PERCY_CHAT: true,
  ENABLE_PERCY_SOCIAL_PROOF: true,
  
  // Always OFF (dead/deprecated features)
  ENABLE_ORBIT: false,
  ENABLE_BUNDLES: false,
  ENABLE_LEGACY: false,
  FF_STRIPE_FALLBACK_LINKS: false,
  SHOW_PERCY_WIDGET: false,
  USE_OPTIMIZED_PERCY: false,
  PERCY_PERFORMANCE_MONITORING: false,
  PERCY_AUTO_FALLBACK: false,
  PERCY_LOG_SWITCHES: false,
  
  // Homepage variant is always 'scan-first' now
  HOMEPAGE_HERO_VARIANT: 'scan-first' as const,
} as const;

/**
 * FEATURE_FLAGS - Legacy compatibility export
 * Maps old flag names to new canonical flags or constants
 * @deprecated Use FLAGS for canonical flags, CONSTANTS for fixed values
 */
export const FEATURE_FLAGS = {
  // Canonical flags (read from env)
  FF_N8N_NOOP: FLAGS.FF_N8N_NOOP,
  ENABLE_STRIPE: FLAGS.ENABLE_STRIPE,
  
  // Constants (always on)
  HP_GUIDE_STAR: CONSTANTS.HP_GUIDE_STAR,
  AI_AUTOMATION_HOMEPAGE: CONSTANTS.AI_AUTOMATION_HOMEPAGE,
  ENHANCED_BUSINESS_SCAN: CONSTANTS.ENHANCED_BUSINESS_SCAN,
  URGENCY_BANNERS: CONSTANTS.URGENCY_BANNERS,
  LIVE_METRICS: CONSTANTS.LIVE_METRICS,
  ENABLE_PERCY_ANIMATIONS: CONSTANTS.ENABLE_PERCY_ANIMATIONS,
  ENABLE_PERCY_AVATAR: CONSTANTS.ENABLE_PERCY_AVATAR,
  ENABLE_PERCY_CHAT: CONSTANTS.ENABLE_PERCY_CHAT,
  ENABLE_PERCY_SOCIAL_PROOF: CONSTANTS.ENABLE_PERCY_SOCIAL_PROOF,
  
  // Constants (always off)
  ENABLE_ORBIT: CONSTANTS.ENABLE_ORBIT,
  ENABLE_BUNDLES: CONSTANTS.ENABLE_BUNDLES,
  ENABLE_LEGACY: CONSTANTS.ENABLE_LEGACY,
  FF_STRIPE_FALLBACK_LINKS: CONSTANTS.FF_STRIPE_FALLBACK_LINKS,
  SHOW_PERCY_WIDGET: CONSTANTS.SHOW_PERCY_WIDGET,
  USE_OPTIMIZED_PERCY: CONSTANTS.USE_OPTIMIZED_PERCY,
  PERCY_PERFORMANCE_MONITORING: CONSTANTS.PERCY_PERFORMANCE_MONITORING,
  PERCY_AUTO_FALLBACK: CONSTANTS.PERCY_AUTO_FALLBACK,
  PERCY_LOG_SWITCHES: CONSTANTS.PERCY_LOG_SWITCHES,
  
  // Fixed values
  HOMEPAGE_HERO_VARIANT: CONSTANTS.HOMEPAGE_HERO_VARIANT,
} as const;

// Helper types for strong typing
type FeatureFlags = typeof FEATURE_FLAGS;
type BooleanFlagKeys = { [K in keyof FeatureFlags]: FeatureFlags[K] extends boolean ? K : never }[keyof FeatureFlags];

/** Check if a feature flag is enabled */
export const isFeatureEnabled = (flag: BooleanFlagKeys): boolean => {
  return FEATURE_FLAGS[flag] as boolean;
};

/** Get any feature flag value with proper typing */
export const getFeatureFlag = <K extends keyof FeatureFlags>(flag: K, fallback?: FeatureFlags[K]): FeatureFlags[K] => {
  const value = FEATURE_FLAGS[flag];
  return (value ?? fallback) as FeatureFlags[K];
};

/**
 * Percy config - now returns constants only
 * @deprecated Percy component is deprecated
 */
export const getPercyConfig = () => ({
  USE_OPTIMIZED_PERCY: CONSTANTS.USE_OPTIMIZED_PERCY,
  ENABLE_PERCY_AVATAR: CONSTANTS.ENABLE_PERCY_AVATAR,
  ENABLE_PERCY_CHAT: CONSTANTS.ENABLE_PERCY_CHAT,
  ENABLE_PERCY_SOCIAL_PROOF: CONSTANTS.ENABLE_PERCY_SOCIAL_PROOF,
  ENABLE_PERCY_ANIMATIONS: CONSTANTS.ENABLE_PERCY_ANIMATIONS,
  PERCY_PERFORMANCE_MONITORING: CONSTANTS.PERCY_PERFORMANCE_MONITORING,
  PERCY_AUTO_FALLBACK: CONSTANTS.PERCY_AUTO_FALLBACK,
  PERCY_LOG_SWITCHES: CONSTANTS.PERCY_LOG_SWITCHES,
});

/**
 * @deprecated Percy logging is disabled
 */
export const logPercySwitch = (_component: string, _version: 'legacy' | 'optimized') => {
  // No-op: Percy logging disabled
};

/**
 * @deprecated Percy performance warning is disabled
 */
export const showPerformanceWarning = () => {
  // No-op: Percy performance monitoring disabled
};