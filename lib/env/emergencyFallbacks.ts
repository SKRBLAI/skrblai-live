/**
 * Emergency environment variable fallbacks
 * 
 * IMPORTANT: This should ONLY be used as a last resort for production emergencies
 * when environment variables are not loading properly in Railway/Vercel.
 * 
 * The correct approach is to properly set environment variables in the deployment platform.
 */

// If environment variables suddenly disappear, use these as fallbacks
const EMERGENCY_ENV_FALLBACKS: Record<string, string> = {
  // Supabase (no keys included for security)
  NEXT_PUBLIC_SUPABASE_URL: 'https://zpqavydsinrtaxhowmnb.supabase.co',
  
  // Base URLs
  NEXT_PUBLIC_BASE_URL: 'https://skrblai.io',
  NEXT_PUBLIC_SITE_URL: 'https://skrblai.io',
  
  // Feature flags
  NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT: 'scan-first',
  NEXT_PUBLIC_ENABLE_STRIPE: 'true',
  NEXT_PUBLIC_HP_GUIDE_STAR: 'true',
  NEXT_PUBLIC_ENABLE_ORBIT: 'false',
  NEXT_PUBLIC_ENABLE_LEGACY: 'false',
  NEXT_PUBLIC_URGENCY_BANNERS: 'true',
  NEXT_PUBLIC_ENABLE_BUNDLES: 'true',
  NEXT_PUBLIC_ENABLE_FREEMIUM: 'true',
  
  // Used by image optimization
  NEXT_DISABLE_IMAGE_OPTIMIZATION: '1'
};

/**
 * Get an environment variable with emergency fallback
 * Only used when the primary environment variable is missing
 * @param key Environment variable key
 * @returns Value from process.env or emergency fallback
 */
export function getEnvWithFallback(key: string): string | undefined {
  const value = process.env[key];
  
  // If the value exists, use it
  if (value !== undefined && value !== null && value !== '') {
    return value;
  }
  
  // Otherwise, try the emergency fallback
  if (EMERGENCY_ENV_FALLBACKS[key]) {
    console.warn(`⚠️ [ENV EMERGENCY] Using fallback for ${key} - check environment variables!`);
    return EMERGENCY_ENV_FALLBACKS[key];
  }
  
  // No fallback exists
  console.warn(`❌ [ENV MISSING] No value or fallback for ${key}`);
  return undefined;
}

/**
 * Explicitly loads emergency Supabase URL fallback
 * For use in Supabase client initialization only
 */
export function getSupabaseUrlFallback(): string {
  return EMERGENCY_ENV_FALLBACKS.NEXT_PUBLIC_SUPABASE_URL;
}
