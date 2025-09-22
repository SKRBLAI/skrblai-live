/**
 * Sports Add-Ons Data
 * 
 * Separate file for Sports add-ons with promotional pricing
 */

import { AddOnItem, isPromoActive, getCurrentPrice, STANDARD_PROMO_CONFIG } from '../pricing/catalogShared';

/**
 * Sports Add-Ons with 60-day promotional pricing
 */
export const SPORTS_ADDONS: AddOnItem[] = [
  {
    sku: "sports_addon_video",
    vertical: "sports",
    type: "addon",
    billingInterval: "one_time",
    priceUsd: 29,
    promoPrice: 12,
    includes: [
      "Advanced video analysis algorithms",
      "Frame-by-frame technical breakdown",
      "Motion tracking & biomechanics",
      "Comparison with professional athletes",
      "Detailed improvement recommendations"
    ],
    description: "AI-powered video analysis for technical skill improvement and performance optimization",
    envPriceVar: "NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_VIDEO",
    originalPrice: 29
  },
  {
    sku: "sports_addon_emotion",
    vertical: "sports",
    type: "addon",
    billingInterval: "one_time",
    priceUsd: 39,
    promoPrice: 16,
    includes: [
      "Mental performance assessment",
      "Emotional regulation techniques",
      "Pressure situation training protocols",
      "Confidence building exercises",
      "Competition mindset development"
    ],
    description: "Master your mental game with advanced emotional intelligence and psychological training",
    envPriceVar: "NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_EMOTION",
    originalPrice: 39
  },
  {
    sku: "sports_addon_nutrition",
    vertical: "sports",
    type: "addon",
    billingInterval: "one_time",
    priceUsd: 19,
    promoPrice: 8,
    includes: [
      "Personalized nutrition plans",
      "Pre/post workout meal optimization",
      "Hydration & electrolyte strategies",
      "Sport-specific supplement recommendations",
      "Performance fuel timing protocols"
    ],
    description: "Optimize your nutrition for peak athletic performance and faster recovery",
    envPriceVar: "NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_NUTRITION",
    originalPrice: 19
  },
  {
    sku: "sports_addon_foundation",
    vertical: "sports",
    type: "addon",
    billingInterval: "one_time",
    priceUsd: 49,
    promoPrice: 20,
    includes: [
      "Complete foundation training system",
      "Progressive skill development pathways",
      "Strength & conditioning protocols",
      "Injury prevention exercise library",
      "Athletic movement pattern optimization"
    ],
    description: "Build unshakeable athletic foundations with comprehensive training protocols and skill development",
    envPriceVar: "NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_FOUNDATION",
    originalPrice: 49
  }
];

/**
 * Get Sports add-ons with current pricing
 */
export function getSportsAddons(): AddOnItem[] {
  return SPORTS_ADDONS.map(addon => ({
    ...addon,
    isPromoActive: addon.promoPrice ? isPromoActive(STANDARD_PROMO_CONFIG) : false
  }));
}

/**
 * Get add-on by SKU
 */
export function getSportsAddonBySku(sku: string): AddOnItem | undefined {
  return getSportsAddons().find(addon => addon.sku === sku);
}

/**
 * Get current price for an add-on
 */
export function getSportsAddonPrice(sku: string): number {
  const addon = getSportsAddonBySku(sku);
  return addon ? getCurrentPrice(addon) : 0;
}

/**
 * Check if any add-on has active promo
 */
export function hasActiveSportsPromos(): boolean {
  return getSportsAddons().some(addon => addon.isPromoActive);
}

/**
 * Get add-ons grouped by category
 */
export function getSportsAddonsByCategory(): Record<string, AddOnItem[]> {
  const addons = getSportsAddons();
  
  return {
    analysis: addons.filter(addon => addon.sku.includes('video')),
    mental: addons.filter(addon => addon.sku.includes('emotion')),
    nutrition: addons.filter(addon => addon.sku.includes('nutrition')),
    training: addons.filter(addon => addon.sku.includes('foundation'))
  };
}

/**
 * Legacy interface for backward compatibility
 */
export interface LegacyAddOn {
  label: string;
  priceText: string;
  originalPriceText?: string;
  sku?: string;
  isSubscription: boolean;
  description?: string;
}

/**
 * Convert to legacy format
 */
export function getSportsAddonsLegacy(): LegacyAddOn[] {
  return getSportsAddons().map(addon => {
    const currentPrice = getCurrentPrice(addon);
    
    // Create readable label from SKU
    let label = '';
    if (addon.sku.includes('video')) label = 'AI Video Analysis';
    else if (addon.sku.includes('emotion')) label = 'Mastery of Emotion';
    else if (addon.sku.includes('nutrition')) label = 'Nutrition Guide';
    else if (addon.sku.includes('foundation')) label = 'Foundation Training Pack';
    else {
      label = addon.sku.split('_').slice(2).join(' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    }
    
    return {
      label,
      priceText: `$${currentPrice}`,
      originalPriceText: addon.isPromoActive && addon.originalPrice ? 
        `$${addon.originalPrice.toFixed(2)}` : undefined,
      sku: addon.envPriceVar ? process.env[addon.envPriceVar] : undefined,
      isSubscription: addon.billingInterval === 'month',
      description: addon.description
    };
  });
}

/**
 * Get add-on display names
 */
export const SPORTS_ADDON_LABELS: Record<string, string> = {
  'sports_addon_video': 'AI Video Analysis',
  'sports_addon_emotion': 'Mastery of Emotion', 
  'sports_addon_nutrition': 'Nutrition Guide',
  'sports_addon_foundation': 'Foundation Training Pack'
};

/**
 * Get readable label for add-on SKU
 */
export function getSportsAddonLabel(sku: string): string {
  return SPORTS_ADDON_LABELS[sku] || 
    sku.split('_').slice(2).join(' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
}