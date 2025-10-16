/** MMM: Canonical source for feature flags. Do not duplicate. */

/**
 * Unified Feature Flag Configuration
 * Single source of truth for all feature flags with progressive enhancement approach
 * Base UI always renders; enhanced pieces toggle based on flags
 */

import { readEnvAny } from '@/lib/env/readEnvAny';

// Helper function to read boolean flags with fallback
function readBooleanFlag(envKey: string, defaultValue: boolean = false): boolean {
  const value = process.env[envKey];
  if (value === undefined) return defaultValue;
  return value === '1' || value === 'true';
}

export const FEATURE_FLAGS = {
  // === CORE FEATURE FLAGS ===
  
  // Homepage & UI Features
  HP_GUIDE_STAR: readBooleanFlag('NEXT_PUBLIC_HP_GUIDE_STAR', true), // Default enabled for progressive enhancement
  HOMEPAGE_HERO_VARIANT: (process.env.NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT ?? 'scan-first') as 'scan-first' | 'split' | 'legacy',
  
  // Payment & Stripe Features
  ENABLE_STRIPE: readBooleanFlag('NEXT_PUBLIC_ENABLE_STRIPE', true), // Global Stripe toggle
  
  // Legacy System Control
  ENABLE_BUNDLES: readBooleanFlag('NEXT_PUBLIC_ENABLE_BUNDLES', false), // Legacy bundle pricing
  ENABLE_ORBIT: readBooleanFlag('NEXT_PUBLIC_ENABLE_ORBIT', false), // Orbit League visualization
  
  // === N8N INTEGRATION CONTROL ===
  // MMM: Default true to prevent n8n downtime from blocking user flows.
  // Set FF_N8N_NOOP=false to re-enable n8n webhooks when ready.
  FF_N8N_NOOP: readBooleanFlag('FF_N8N_NOOP', true), // n8n NOOP mode (safe default)
  
  // === PROGRESSIVE ENHANCEMENT FLAGS ===
  // These flags enhance base functionality but don't break the UI when disabled
  
  AI_AUTOMATION_HOMEPAGE: readBooleanFlag('NEXT_PUBLIC_AI_AUTOMATION_HOMEPAGE', true),
  ENHANCED_BUSINESS_SCAN: readBooleanFlag('NEXT_PUBLIC_ENHANCED_BUSINESS_SCAN', true),
  URGENCY_BANNERS: readBooleanFlag('NEXT_PUBLIC_URGENCY_BANNERS', true),
  LIVE_METRICS: readBooleanFlag('NEXT_PUBLIC_LIVE_METRICS', true),
  
  // Percy Component Flags (consolidated from percyFeatureFlags.ts)
  USE_OPTIMIZED_PERCY: readBooleanFlag('NEXT_PUBLIC_USE_OPTIMIZED_PERCY', false),
  ENABLE_PERCY_ANIMATIONS: readBooleanFlag('NEXT_PUBLIC_ENABLE_PERCY_ANIMATIONS', true),
  ENABLE_PERCY_AVATAR: readBooleanFlag('NEXT_PUBLIC_ENABLE_PERCY_AVATAR', true),
  ENABLE_PERCY_CHAT: readBooleanFlag('NEXT_PUBLIC_ENABLE_PERCY_CHAT', true),
  ENABLE_PERCY_SOCIAL_PROOF: readBooleanFlag('NEXT_PUBLIC_ENABLE_PERCY_SOCIAL_PROOF', true),
  PERCY_PERFORMANCE_MONITORING: readBooleanFlag('NEXT_PUBLIC_PERCY_PERFORMANCE_MONITORING', true),
  PERCY_AUTO_FALLBACK: readBooleanFlag('NEXT_PUBLIC_PERCY_AUTO_FALLBACK', true),
  PERCY_LOG_SWITCHES: readBooleanFlag('NEXT_PUBLIC_PERCY_LOG_SWITCHES', true),
  
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

// Percy-specific helper functions (consolidated from percyFeatureFlags.ts)
export const getPercyConfig = () => {
  return {
    USE_OPTIMIZED_PERCY: FEATURE_FLAGS.USE_OPTIMIZED_PERCY,
    ENABLE_PERCY_AVATAR: FEATURE_FLAGS.ENABLE_PERCY_AVATAR,
    ENABLE_PERCY_CHAT: FEATURE_FLAGS.ENABLE_PERCY_CHAT,
    ENABLE_PERCY_SOCIAL_PROOF: FEATURE_FLAGS.ENABLE_PERCY_SOCIAL_PROOF,
    ENABLE_PERCY_ANIMATIONS: FEATURE_FLAGS.ENABLE_PERCY_ANIMATIONS,
    PERCY_PERFORMANCE_MONITORING: FEATURE_FLAGS.PERCY_PERFORMANCE_MONITORING,
    PERCY_AUTO_FALLBACK: FEATURE_FLAGS.PERCY_AUTO_FALLBACK,
    PERCY_LOG_SWITCHES: FEATURE_FLAGS.PERCY_LOG_SWITCHES,
  };
};

export const logPercySwitch = (component: string, version: 'legacy' | 'optimized') => {
  if (FEATURE_FLAGS.PERCY_LOG_SWITCHES) {
    console.log(`🔄 Percy ${component}: Using ${version} version`);
  }
};

export const showPerformanceWarning = () => {
  if (FEATURE_FLAGS.PERCY_PERFORMANCE_MONITORING) {
    console.warn(`
🔥 PERFORMANCE WARNING: Using Legacy Percy Component
   - 2,827 lines of code with 25+ useState hooks
   - Multiple intervals causing potential CPU overheating
   - Consider enabling optimized version: FEATURE_FLAGS.USE_OPTIMIZED_PERCY = true
   
📍 Configuration: lib/config/featureFlags.ts
    `);
  }
};

// Usage examples:
// const showNewHomepage = isFeatureEnabled('AI_AUTOMATION_HOMEPAGE');
// const useUrgencyBanners = getFeatureFlag('URGENCY_BANNERS', false);
// const percyConfig = getPercyConfig();