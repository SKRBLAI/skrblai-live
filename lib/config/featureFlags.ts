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
  
  // Agent & Service Features  
  ENABLE_ORBIT: readBooleanFlag('NEXT_PUBLIC_ENABLE_ORBIT', false), // Orbit animation on /agents
  ENABLE_ARR_DASH: readBooleanFlag('NEXT_PUBLIC_ENABLE_ARR_DASH', false), // ARR dashboard features
  
  // Payment & Stripe Features
  ENABLE_STRIPE: readBooleanFlag('NEXT_PUBLIC_ENABLE_STRIPE', true), // Global Stripe toggle
  
  // Legacy System Control
  ENABLE_LEGACY: readBooleanFlag('NEXT_PUBLIC_ENABLE_LEGACY', false), // Gate legacy code paths
  ENABLE_BUNDLES: readBooleanFlag('NEXT_PUBLIC_ENABLE_BUNDLES', false), // Legacy bundle pricing
  
  // === PROGRESSIVE ENHANCEMENT FLAGS ===
  // These flags enhance base functionality but don't break the UI when disabled
  
  AI_AUTOMATION_HOMEPAGE: readBooleanFlag('NEXT_PUBLIC_AI_AUTOMATION_HOMEPAGE', true),
  ENHANCED_BUSINESS_SCAN: readBooleanFlag('NEXT_PUBLIC_ENHANCED_BUSINESS_SCAN', true),
  URGENCY_BANNERS: readBooleanFlag('NEXT_PUBLIC_URGENCY_BANNERS', true),
  LIVE_METRICS: readBooleanFlag('NEXT_PUBLIC_LIVE_METRICS', true),
  
  // Percy Component Flags (from percyFeatureFlags.ts)
  USE_OPTIMIZED_PERCY: readBooleanFlag('NEXT_PUBLIC_USE_OPTIMIZED_PERCY', false),
  ENABLE_PERCY_ANIMATIONS: readBooleanFlag('NEXT_PUBLIC_ENABLE_PERCY_ANIMATIONS', true),
  
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