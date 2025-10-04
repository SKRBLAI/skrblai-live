/**
 * Unified Stripe Price ID Resolver
 * 
 * Implements the exact resolution order specified:
 * - Sports: STARTER → SPORTS_STARTER → ROOKIE → _M fallbacks
 * - Business: Keep existing _BIZ + _M fallback
 * - Add-ons: ADDON_<SLUG> only, optional _M
 */

import { readEnvAny } from '@/lib/env/readEnvAny';

export interface ResolverResult {
  priceId: string | null;
  matchedEnvName: string | null;
}

/**
 * Unified resolver for both client and server
 * Guarantees consistent resolution order across all environments
 */
export function resolvePriceIdFromSku(sku: string): ResolverResult {
  const resolvers: Record<string, () => ResolverResult> = {
    // Sports plans with exact resolution order specified:
    // Starter → STARTER, then SPORTS_STARTER, then ROOKIE, then _M fallbacks
    sports_plan_starter: () => {
      const keys = [
        'NEXT_PUBLIC_STRIPE_PRICE_STARTER',
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER', 
        'NEXT_PUBLIC_STRIPE_PRICE_ROOKIE',
        'NEXT_PUBLIC_STRIPE_PRICE_STARTER_M',
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER_M',
        'NEXT_PUBLIC_STRIPE_PRICE_ROOKIE_M'
      ];
      return resolveWithKeys(keys);
    },
    
    // Pro → PRO, then SPORTS_PRO, then _M fallback
    sports_plan_pro: () => {
      const keys = [
        'NEXT_PUBLIC_STRIPE_PRICE_PRO',
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO',
        'NEXT_PUBLIC_STRIPE_PRICE_PRO_M',
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO_M'
      ];
      return resolveWithKeys(keys);
    },
    
    // Elite → ELITE, then SPORTS_ELITE, then ALLSTAR, then _M fallbacks
    sports_plan_elite: () => {
      const keys = [
        'NEXT_PUBLIC_STRIPE_PRICE_ELITE',
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE',
        'NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR',
        'NEXT_PUBLIC_STRIPE_PRICE_ELITE_M',
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE_M',
        'NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR_M'
      ];
      return resolveWithKeys(keys);
    },
    
    // Business plans - keep existing _BIZ + _M fallback
    biz_plan_starter: () => {
      const keys = [
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER',
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M'
      ];
      return resolveWithKeys(keys);
    },
    
    biz_plan_pro: () => {
      const keys = [
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO',
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M'
      ];
      return resolveWithKeys(keys);
    },
    
    biz_plan_elite: () => {
      const keys = [
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE',
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M'
      ];
      return resolveWithKeys(keys);
    },
    
    // Legacy _M only variants for backward compatibility
    biz_plan_starter_m: () => {
      const keys = [
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M',
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER'
      ];
      return resolveWithKeys(keys);
    },
    
    biz_plan_pro_m: () => {
      const keys = [
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M',
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO'
      ];
      return resolveWithKeys(keys);
    },
    
    biz_plan_elite_m: () => {
      const keys = [
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M',
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE'
      ];
      return resolveWithKeys(keys);
    }
  };

  // Add-ons: resolve NEXT_PUBLIC_STRIPE_PRICE_ADDON_<SLUG> only; allow _M optionally
  const addonMatch = sku.match(/^(sports_addon_|biz_addon_)(.+)$/);
  if (addonMatch) {
    const [, prefix, slug] = addonMatch;
    const slugUpper = slug.toUpperCase();
    
    if (prefix === 'sports_addon_') {
      // Sports add-ons: ADDON_<SLUG>, then ADDON_<SLUG>_M
      const keys = [
        `NEXT_PUBLIC_STRIPE_PRICE_ADDON_${slugUpper}`,
        `NEXT_PUBLIC_STRIPE_PRICE_ADDON_${slugUpper}_M`
      ];
      return resolveWithKeys(keys);
    } else if (prefix === 'biz_addon_') {
      // Business add-ons: BIZ_ADDON_<SLUG>, then BIZ_ADDON_<SLUG>_M
      const keys = [
        `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_${slugUpper}`,
        `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_${slugUpper}_M`
      ];
      return resolveWithKeys(keys);
    }
  }

  // Check if we have a specific resolver
  const resolver = resolvers[sku];
  if (resolver) {
    return resolver();
  }

  // No resolver found
  return { priceId: null, matchedEnvName: null };
}

/**
 * Helper function to resolve with a list of keys and return both value and matched key
 */
function resolveWithKeys(keys: string[]): ResolverResult {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return {
        priceId: value.trim(),
        matchedEnvName: key
      };
    }
  }
  return { priceId: null, matchedEnvName: null };
}

/**
 * Legacy compatibility function - returns just the price ID
 */
export function resolvePriceId(sku: string): string | null {
  const result = resolvePriceIdFromSku(sku);
  return result.priceId;
}

/**
 * Get all supported SKUs for diagnostics
 */
export function getSupportedSkus(): string[] {
  return [
    // Sports plans
    'sports_plan_starter',
    'sports_plan_pro', 
    'sports_plan_elite',
    
    // Business plans
    'biz_plan_starter',
    'biz_plan_pro',
    'biz_plan_elite',
    'biz_plan_starter_m',
    'biz_plan_pro_m',
    'biz_plan_elite_m',
    
    // Sports add-ons (examples)
    'sports_addon_scans10',
    'sports_addon_video',
    'sports_addon_emotion',
    'sports_addon_nutrition',
    'sports_addon_foundation',
    
    // Business add-ons (examples)
    'biz_addon_adv_analytics',
    'biz_addon_automation',
    'biz_addon_team_seat'
  ];
}

/**
 * Generate resolver parity report for diagnostics
 */
export function generateResolverParityReport(): Record<string, ResolverResult> {
  const report: Record<string, ResolverResult> = {};
  const skus = getSupportedSkus();
  
  for (const sku of skus) {
    report[sku] = resolvePriceIdFromSku(sku);
  }
  
  return report;
}