/**
 * Business Pricing Data - Plans and Add-Ons
 * 
 * Implements the new unified pricing structure with 5 tiers:
 * Curiosity (Free), Starter ($19.99), Pro ($39.99), Elite ($59.99), Contact Us
 */

import { 
  PricingItem, 
  AddOnItem, 
  PlanDisplayConfig, 
  getTierIncludes,
  generateEnvPriceVar,
  STANDARD_PROMO_CONFIG,
  isPromoActive,
  getCurrentPrice
} from '../pricing/catalogShared';

/**
 * Business Plans - 5 tiers with parallel value to Sports
 */
export const BUSINESS_PLANS: PricingItem[] = [
  {
    sku: "biz_plan_curiosity",
    vertical: "business",
    type: "plan",
    tier: "curiosity",
    billingInterval: "month",
    priceUsd: 0,
    quickWinsIncluded: 3,
    scansOrUploads: 3, // "scans" for business
    includes: [
      "3 Business Scans per month",
      "3 Quick Wins (Business Intelligence)",
      "Basic Percy AI Concierge",
      "Community Support",
      "Email Templates Library"
    ],
    envPriceVar: undefined // Free tier has no Stripe price
  },
  {
    sku: "biz_plan_starter_m",
    vertical: "business",
    type: "plan", 
    tier: "starter",
    billingInterval: "month",
    priceUsd: 19.99,
    quickWinsIncluded: 10,
    scansOrUploads: 10,
    includes: [
      ...getTierIncludes("starter"),
      "10 Business Scans per month",
      "10 Quick Wins (Strategic Growth)",
      "Percy AI Concierge (Standard)",
      "Basic Automation Workflows",
      "Priority Email Support",
      "Social Media Templates"
    ],
    envPriceVar: "NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M"
  },
  {
    sku: "biz_plan_pro_m",
    vertical: "business",
    type: "plan",
    tier: "pro", 
    billingInterval: "month",
    priceUsd: 39.99,
    quickWinsIncluded: 25,
    scansOrUploads: 25,
    includes: [
      ...getTierIncludes("pro"),
      "25 Business Scans per month",
      "25 Quick Wins (Advanced Strategy)",
      "Percy AI Concierge (Pro)",
      "Advanced Automation Workflows",
      "Multi-channel Marketing Suite",
      "Competitor Analysis Tools",
      "White-label Options",
      "Priority Chat Support"
    ],
    envPriceVar: "NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M"
  },
  {
    sku: "biz_plan_elite_m",
    vertical: "business", 
    type: "plan",
    tier: "elite",
    billingInterval: "month",
    priceUsd: 59.99,
    quickWinsIncluded: 50,
    scansOrUploads: 50,
    includes: [
      ...getTierIncludes("elite"),
      "50 Business Scans per month",
      "50 Quick Wins (Enterprise Strategy)",
      "Percy AI Concierge (Elite)",
      "Complete Agent Arsenal (14+ agents)",
      "Custom Agent Builder",
      "API Access & Integrations",
      "Advanced Analytics Dashboard",
      "Dedicated Success Manager",
      "Custom Workflows & Automations"
    ],
    envPriceVar: "NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M"
  },
  {
    sku: "biz_plan_contact",
    vertical: "business",
    type: "plan",
    tier: "contact",
    billingInterval: "month",
    priceUsd: undefined, // Contact for pricing
    quickWinsIncluded: 999, // Unlimited
    scansOrUploads: 999, // Unlimited
    includes: [
      "Unlimited Business Scans",
      "Unlimited Quick Wins",
      "Percy AI Concierge (VIP)",
      "Complete Platform Access",
      "Custom Integration Development",
      "White-glove Onboarding",
      "24/7 Dedicated Support",
      "Custom SLA & Contracts",
      "Multi-tenant Architecture"
    ],
    envPriceVar: undefined // Contact sales, no Stripe price
  }
];

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
      "Export capabilities"
    ],
    description: "Enhanced reporting and insights for data-driven decisions",
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
      "Multi-platform integrations",
      "Automated lead nurturing",
      "Performance monitoring"
    ],
    description: "Advanced N8N workflow templates and automation tools",
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
      "Shared workspace",
      "Collaboration tools",
      "Role-based permissions",
      "Team activity tracking"
    ],
    description: "Add team members to your plan with full collaboration features",
    envPriceVar: "NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT",
    originalPrice: 39
  }
];

/**
 * Display configuration for Business plans
 */
export const BUSINESS_PLAN_DISPLAY: Record<string, PlanDisplayConfig> = {
  curiosity: {
    label: "Curiosity",
    icon: "🎯",
    ctaText: "Start Free",
    gradient: "from-gray-500 to-slate-600"
  },
  starter: {
    label: "Starter", 
    icon: "⚡",
    badge: "Most Popular",
    ctaText: "Start Trial",
    gradient: "from-blue-500 to-cyan-500"
  },
  pro: {
    label: "Pro",
    icon: "🔥",
    badge: "Best Value", 
    ctaText: "Upgrade Now",
    gradient: "from-purple-500 to-pink-500"
  },
  elite: {
    label: "Elite",
    icon: "👑",
    badge: "Enterprise",
    ctaText: "Go Elite",
    gradient: "from-yellow-500 to-orange-500"
  },
  contact: {
    label: "Contact Us",
    icon: "🤝",
    ctaText: "Contact Sales",
    ctaKind: "contact",
    gradient: "from-green-500 to-emerald-500"
  }
};

/**
 * Get Business plans with current pricing
 */
export function getBusinessPlans(): PricingItem[] {
  return BUSINESS_PLANS.map(plan => ({
    ...plan,
    isPromoActive: plan.promoPrice ? isPromoActive(STANDARD_PROMO_CONFIG) : false
  }));
}

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
 * Get plan by SKU
 */
export function getBusinessPlanBySku(sku: string): PricingItem | undefined {
  return getBusinessPlans().find(plan => plan.sku === sku);
}

/**
 * Get add-on by SKU
 */
export function getBusinessAddonBySku(sku: string): AddOnItem | undefined {
  return getBusinessAddons().find(addon => addon.sku === sku);
}

/**
 * Get display config for a tier
 */
export function getBusinessDisplayConfig(tier: string): PlanDisplayConfig | undefined {
  return BUSINESS_PLAN_DISPLAY[tier];
}

/**
 * Get current price for any business item
 */
export function getBusinessItemPrice(sku: string): number {
  const plan = getBusinessPlanBySku(sku);
  if (plan) {
    return getCurrentPrice(plan);
  }
  
  const addon = getBusinessAddonBySku(sku);
  if (addon) {
    return getCurrentPrice(addon);
  }
  
  return 0;
}

/**
 * Legacy compatibility - map to old interface
 */
export interface LegacyPlan {
  label: string;
  priceText?: string;
  displayPrice?: string;
  originalPriceText?: string;
  promoLabel?: string;
  sku?: string;
  isSubscription: boolean;
  perks: string[];
  ctaKind?: "contact" | "buy";
}

/**
 * Convert to legacy format for backward compatibility
 */
export function getBusinessPlansLegacy(): LegacyPlan[] {
  return getBusinessPlans().map(plan => {
    const displayConfig = getBusinessDisplayConfig(plan.tier || '');
    const currentPrice = getCurrentPrice(plan);
    
    return {
      label: displayConfig?.label || plan.tier || 'Unknown',
      priceText: currentPrice === 0 ? 'FREE' : `$${currentPrice}/mo`,
      displayPrice: currentPrice === 0 ? '$0' : `$${currentPrice}`,
      originalPriceText: plan.promoPrice && plan.priceUsd ? `$${plan.priceUsd.toFixed(2)}` : undefined,
      promoLabel: plan.isPromoActive ? 'Limited Time' : undefined,
      sku: plan.sku,
      isSubscription: plan.billingInterval === 'month',
      perks: plan.includes,
      ctaKind: displayConfig?.ctaKind || 'buy'
    };
  });
}

/**
 * Get plan badge text for display (new PricingItem interface)
 */
export function getPlanBadge(plan: PricingItem): string | undefined {
  switch (plan.tier) {
    case "starter":
      return "Most Popular";
    case "pro": 
      return "Best Value";
    case "elite":
      return "Enterprise";
    default:
      return undefined;
  }
}

/**
 * Get plan badge text for display (legacy compatibility)
 */
export function getPlanBadgeLegacy(plan: LegacyPlan): string | undefined {
  switch (plan.label) {
    case "Starter":
      return "Most Popular";
    case "Pro": 
      return "Best Value";
    case "Elite":
      return "Enterprise";
    default:
      return undefined;
  }
}

/**
 * Get plan icon for display (new PricingItem interface)
 */
export function getPlanIcon(plan: PricingItem): string {
  switch (plan.tier) {
    case "curiosity":
      return "🎯";
    case "starter":
      return "⚡";
    case "pro":
      return "🔥"; 
    case "elite":
      return "👑";
    default:
      return "📊";
  }
}

/**
 * Get plan icon for display (legacy compatibility)
 */
export function getPlanIconLegacy(plan: LegacyPlan): string {
  switch (plan.label) {
    case "Curiosity":
      return "🎯";
    case "Starter":
      return "⚡";
    case "Pro":
      return "🔥"; 
    case "Elite":
      return "👑";
    default:
      return "📊";
  }
}