/**
 * Business Add-Ons Data
 * 
 * Separate file for Business add-ons with promotional pricing
 */

import { AddOnItem, isPromoActive, getCurrentPrice, STANDARD_PROMO_CONFIG } from '../pricing/catalogShared';

/**
 * Business Add-Ons with 60-day promotional pricing
 */
export const BUSINESS_ADDONS: AddOnItem[] = [
  {
    sku: "biz_addon_adv_analytics",
    vertical: "business",
    type: "addon",
    billingInterval: "one_time",
    priceUsd: 29,
    promoPrice: 12,
    includes: [
      "Advanced reporting dashboard",
      "Custom KPI tracking", 
      "Competitor benchmarking",
      "ROI calculation tools",
      "Export capabilities (CSV, PDF)"
    ],
    description: "Enhanced reporting and insights for data-driven business decisions",
    envPriceVar: "NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS",
    originalPrice: 29
  },
  {
    sku: "biz_addon_automation",
    vertical: "business",
    type: "addon", 
    billingInterval: "one_time",
    priceUsd: 49,
    promoPrice: 20,
    includes: [
      "50+ pre-built workflow templates",
      "Custom workflow builder",
      "Multi-platform integrations (Zapier, Make, N8N)",
      "Automated lead nurturing sequences",
      "Performance monitoring & optimization"
    ],
    description: "Advanced automation workflows to scale your business operations",
    envPriceVar: "NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION",
    originalPrice: 49
  },
  {
    sku: "biz_addon_team_seat",
    vertical: "business",
    type: "addon",
    billingInterval: "one_time", 
    priceUsd: 39,
    promoPrice: 16,
    includes: [
      "Additional team member access",
      "Shared workspace & assets",
      "Real-time collaboration tools",
      "Role-based permissions",
      "Team activity tracking & reporting"
    ],
    description: "Add team members with full collaboration and permission management",
    envPriceVar: "NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT",
    originalPrice: 39
  }
];

/**
 * Get Business add-ons with current pricing
 */
export function getBusinessAddons(): AddOnItem[] {
  return BUSINESS_ADDONS.map(addon => ({
    ...addon,
    isPromoActive: addon.promoPrice ? isPromoActive(STANDARD_PROMO_CONFIG) : false
  }));
}

/**
 * Get add-on by SKU
 */
export function getBusinessAddonBySku(sku: string): AddOnItem | undefined {
  return getBusinessAddons().find(addon => addon.sku === sku);
}

/**
 * Get current price for an add-on
 */
export function getBusinessAddonPrice(sku: string): number {
  const addon = getBusinessAddonBySku(sku);
  return addon ? getCurrentPrice(addon) : 0;
}

/**
 * Check if any add-on has active promo
 */
export function hasActiveBusinessPromos(): boolean {
  return getBusinessAddons().some(addon => addon.isPromoActive);
}

/**
 * Get add-ons grouped by category
 */
export function getBusinessAddonsByCategory(): Record<string, AddOnItem[]> {
  const addons = getBusinessAddons();
  
  return {
    analytics: addons.filter(addon => addon.sku.includes('analytics')),
    automation: addons.filter(addon => addon.sku.includes('automation')),
    team: addons.filter(addon => addon.sku.includes('team'))
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
export function getBusinessAddonsLegacy(): LegacyAddOn[] {
  return getBusinessAddons().map(addon => {
    const currentPrice = getCurrentPrice(addon);
    
    return {
      label: addon.sku.split('_').slice(2).join(' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim(),
      priceText: `$${currentPrice}`,
      originalPriceText: addon.isPromoActive && addon.originalPrice ? 
        `$${addon.originalPrice.toFixed(2)}` : undefined,
      sku: addon.envPriceVar ? process.env[addon.envPriceVar] : undefined,
      isSubscription: addon.billingInterval === 'month',
      description: addon.description
    };
  });
}