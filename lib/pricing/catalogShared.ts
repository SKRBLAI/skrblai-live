/**
 * SKRBL AI Unified Pricing Schema
 * 
 * Canonical pricing structure that supports both Business and Sports verticals
 * with standardized SKU naming conventions and promotional pricing.
 */

export type Vertical = "business" | "sports";
export type PlanTier = "curiosity" | "starter" | "pro" | "elite" | "contact";
export type BillingInterval = "month" | "one_time";
export type ItemType = "plan" | "addon";

/**
 * Core pricing item interface used across both verticals
 */
export interface PricingItem {
  sku: string;                        // Canonical SKU (e.g., biz_plan_starter_m)
  vertical: Vertical;                 // business | sports
  type: ItemType;                     // plan | addon
  tier?: PlanTier;                    // Only for plans
  billingInterval?: BillingInterval;  // month | one_time
  priceUsd?: number;                  // Display price (e.g., 19.99)
  quickWinsIncluded: number;          // Number of Quick Wins included
  scansOrUploads: number;            // Scans (business) or Uploads (sports)
  includes: string[];                 // Feature bullets
  envPriceVar?: string;              // ENV variable name for Stripe Price ID
  promoPrice?: number;               // Promotional price (if applicable)
  promoEndDate?: string;             // ISO date when promo expires
  isPromoActive?: boolean;           // Computed field for current promo status
}

/**
 * Add-on specific interface
 */
export interface AddOnItem extends Omit<PricingItem, 'tier' | 'quickWinsIncluded' | 'scansOrUploads'> {
  type: "addon";
  description: string;               // Short description of the add-on
  originalPrice?: number;            // Original price before promo
}

/**
 * Plan display configuration
 */
export interface PlanDisplayConfig {
  label: string;                     // Display name (e.g., "Curiosity", "Starter")
  badge?: string;                    // Optional badge text (e.g., "Most Popular")
  ctaText?: string;                  // Custom CTA text
  ctaKind?: "contact" | "buy";       // CTA behavior
  icon?: string;                     // Emoji or icon
  gradient?: string;                 // CSS gradient for styling
}

/**
 * Promo pricing configuration
 */
export interface PromoConfig {
  startDate: string;                 // ISO date
  durationDays: number;              // How long promo lasts
  autoRevert: boolean;               // Whether to auto-revert after duration
}

/**
 * Standard promo configuration: 60-day promo that auto-reverts
 */
export const STANDARD_PROMO_CONFIG: PromoConfig = {
  startDate: "2025-01-01T00:00:00Z", // Hardcoded start date
  durationDays: 60,
  autoRevert: true
};

/**
 * Check if promotional pricing is currently active
 */
export function isPromoActive(promoConfig: PromoConfig = STANDARD_PROMO_CONFIG): boolean {
  const now = new Date();
  const startDate = new Date(promoConfig.startDate);
  const endDate = new Date(startDate.getTime() + promoConfig.durationDays * 24 * 60 * 60 * 1000);
  
  return now >= startDate && now <= endDate;
}

/**
 * Get the appropriate price (promo or standard) based on current date
 */
export function getCurrentPrice(item: PricingItem | AddOnItem, promoConfig?: PromoConfig): number {
  if (item.promoPrice && isPromoActive(promoConfig)) {
    return item.promoPrice;
  }
  return item.priceUsd || 0;
}

/**
 * Format price for display
 */
export function formatPrice(price: number, showCents: boolean = true): string {
  if (price === 0) return "FREE";
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0
  }).format(price);
}

/**
 * Calculate savings amount and percentage
 */
export function calculateSavings(originalPrice: number, promoPrice: number): {
  amount: number;
  percentage: number;
} {
  const amount = originalPrice - promoPrice;
  const percentage = Math.round((amount / originalPrice) * 100);
  return { amount, percentage };
}

/**
 * Generate Stripe Product name using canonical convention
 */
export function generateStripeProductName(item: PricingItem): string {
  const verticalName = item.vertical === "business" ? "Business" : "Sports";
  const typeLabel = item.type === "plan" ? "" : " (Add-On)";
  
  if (item.type === "plan") {
    const tierName = item.tier ? 
      item.tier.charAt(0).toUpperCase() + item.tier.slice(1) : 
      "Unknown";
    return `SKRBL ${verticalName} — ${tierName}${item.tier === "curiosity" ? " (Free)" : ""}`;
  } else {
    // For add-ons, derive name from SKU
    const skuParts = item.sku.split('_');
    const addonName = skuParts.slice(2).join(' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
    return `SKRBL ${verticalName} — ${addonName}${typeLabel}`;
  }
}

/**
 * Generate ENV variable name for Stripe Price ID
 */
export function generateEnvPriceVar(item: PricingItem): string {
  const verticalPrefix = item.vertical === "business" ? "BIZ" : "SPORTS";
  const typePrefix = item.type === "plan" ? "PLAN" : "ADDON";
  
  if (item.type === "plan") {
    const tierSuffix = item.tier?.toUpperCase() || "UNKNOWN";
    const intervalSuffix = item.billingInterval === "month" ? "_M" : "";
    return `NEXT_PUBLIC_STRIPE_PRICE_${verticalPrefix}_${tierSuffix}${intervalSuffix}`;
  } else {
    // For add-ons, use the SKU suffix
    const skuSuffix = item.sku.split('_').slice(2).join('_').toUpperCase();
    return `NEXT_PUBLIC_STRIPE_PRICE_${verticalPrefix}_${typePrefix}_${skuSuffix}`;
  }
}

/**
 * Validate pricing item structure
 */
export function validatePricingItem(item: PricingItem): boolean {
  // Required fields
  if (!item.sku || !item.vertical || !item.type) {
    return false;
  }
  
  // Plans must have tier and billing interval
  if (item.type === "plan" && (!item.tier || !item.billingInterval)) {
    return false;
  }
  
  // Paid items must have price
  if (item.tier !== "curiosity" && !item.priceUsd && item.priceUsd !== 0) {
    return false;
  }
  
  return true;
}

/**
 * Get all tiers for a vertical in order
 */
export function getTierOrder(): PlanTier[] {
  return ["curiosity", "starter", "pro", "elite", "contact"];
}

/**
 * Check if a tier includes everything from previous tiers
 */
export function getTierIncludes(currentTier: PlanTier, previousTiers?: PlanTier[]): string[] {
  const tierOrder = getTierOrder();
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex <= 0) {
    return []; // Curiosity doesn't include anything from previous tiers
  }
  
  const previousTier = tierOrder[currentIndex - 1];
  return [`Includes everything in ${previousTier.charAt(0).toUpperCase() + previousTier.slice(1)} plus...`];
}