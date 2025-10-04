/**
 * @deprecated This file has been consolidated into lib/config/featureFlags.ts
 * 
 * Percy Component Feature Flags
 * 
 * Controls migration between Legacy Percy (2,827 lines) and Optimized Percy (modular)
 * 
 * ROLLBACK INSTRUCTIONS:
 * - Set USE_OPTIMIZED_PERCY to false to revert to legacy version
 * - Set SHOW_PERFORMANCE_WARNING to true to monitor legacy performance
 * - Legacy component is archived at: components/percy/archive/PercyOnboardingRevolution_LEGACY_v1.tsx
 */

interface PercyFeatureFlags {
  // Main toggle between old and new Percy
  USE_OPTIMIZED_PERCY: boolean;
  
  // Performance monitoring
  SHOW_PERFORMANCE_WARNING: boolean;
  ENABLE_PERFORMANCE_MONITORING: boolean;
  
  // Gradual rollout flags
  ENABLE_PERCY_AVATAR: boolean;
  ENABLE_PERCY_CHAT: boolean;
  ENABLE_PERCY_SOCIAL_PROOF: boolean;
  ENABLE_PERCY_ANIMATIONS: boolean;
  
  // Safety flags
  AUTO_FALLBACK_ON_ERROR: boolean;
  LOG_COMPONENT_SWITCHES: boolean;
}

export const PERCY_FEATURE_FLAGS: PercyFeatureFlags = {
  // 🚨 MAIN SWITCH: Change this to false to revert to legacy Percy
  USE_OPTIMIZED_PERCY: false, // Start with false for safety
  
  // Performance monitoring
  SHOW_PERFORMANCE_WARNING: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  
  // Individual component toggles (for gradual testing)
  ENABLE_PERCY_AVATAR: true,
  ENABLE_PERCY_CHAT: true,
  ENABLE_PERCY_SOCIAL_PROOF: true,
  ENABLE_PERCY_ANIMATIONS: true,
  
  // Safety features
  AUTO_FALLBACK_ON_ERROR: true,
  LOG_COMPONENT_SWITCHES: true,
};

/**
 * Get current Percy configuration
 */
export const getPercyConfig = () => {
  // Allow environment variable override
  const envOverride = process.env.NEXT_PUBLIC_USE_OPTIMIZED_PERCY;
  if (envOverride !== undefined) {
    PERCY_FEATURE_FLAGS.USE_OPTIMIZED_PERCY = envOverride === 'true';
  }
  
  return PERCY_FEATURE_FLAGS;
};

/**
 * Log feature flag usage for debugging
 */
export const logPercySwitch = (component: string, version: 'legacy' | 'optimized') => {
  if (PERCY_FEATURE_FLAGS.LOG_COMPONENT_SWITCHES) {
    console.log(`🔄 Percy ${component}: Using ${version} version`);
  }
};

/**
 * Performance warning for legacy component
 */
export const showPerformanceWarning = () => {
  if (PERCY_FEATURE_FLAGS.SHOW_PERFORMANCE_WARNING) {
    console.warn(`
🔥 PERFORMANCE WARNING: Using Legacy Percy Component
   - 2,827 lines of code with 25+ useState hooks
   - Multiple intervals causing potential CPU overheating
   - Consider enabling optimized version: PERCY_FEATURE_FLAGS.USE_OPTIMIZED_PERCY = true
   
📍 Rollback instructions: lib/config/percyFeatureFlags.ts
    `);
  }
};