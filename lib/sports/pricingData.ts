/**
 * Sports Pricing Data - Plans and Add-Ons
 * 
 * Implements the new unified pricing structure with 5 tiers:
 * Curiosity (Free), Starter ($19.99), Pro ($39.99), Elite ($59.99), Contact Us
 * 
 * Sports vertical uses "uploads" instead of "scans" but provides parallel value
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
 * Sports Plans - 5 tiers with parallel value to Business
 */
export const SPORTS_PLANS: PricingItem[] = [
  {
    sku: "sports_plan_curiosity",
    vertical: "sports",
    type: "plan",
    tier: "curiosity",
    billingInterval: "month",
    priceUsd: 0,
    quickWinsIncluded: 3,
    scansOrUploads: 3, // "uploads" for sports
    includes: [
      "3 Video Uploads per month",
      "3 Quick Wins (Athletic Performance)",
      "Basic SkillSmith AI Analysis",
      "Community Support",
      "Free eBook: Athletic Mindset Fundamentals"
    ],
    envPriceVar: undefined // Free tier has no Stripe price
  },
  {
    sku: "sports_plan_starter_m",
    vertical: "sports",
    type: "plan", 
    tier: "starter",
    billingInterval: "month",
    priceUsd: 19.99,
    quickWinsIncluded: 10,
    scansOrUploads: 10,
    includes: [
      ...getTierIncludes("starter"),
      "10 Video Uploads per month",
      "10 Quick Wins (Performance Optimization)",
      "SkillSmith AI Analysis (Standard)",
      "Basic Training Plans",
      "Priority Email Support",
      "Nutrition Basics Guide"
    ],
    envPriceVar: "NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER_M"
  },
  {
    sku: "sports_plan_pro_m",
    vertical: "sports",
    type: "plan",
    tier: "pro", 
    billingInterval: "month",
    priceUsd: 39.99,
    quickWinsIncluded: 25,
    scansOrUploads: 25,
    includes: [
      ...getTierIncludes("pro"),
      "25 Video Uploads per month",
      "25 Quick Wins (Advanced Performance)",
      "SkillSmith AI Analysis (Pro)",
      "Customized Training Programs",
      "Mental Performance Coaching",
      "Nutrition Planning Tools",
      "Injury Prevention Protocols",
      "Priority Chat Support"
    ],
    envPriceVar: "NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO_M"
  },
  {
    sku: "sports_plan_elite_m",
    vertical: "sports", 
    type: "plan",
    tier: "elite",
    billingInterval: "month",
    priceUsd: 59.99,
    quickWinsIncluded: 50,
    scansOrUploads: 50,
    includes: [
      ...getTierIncludes("elite"),
      "50 Video Uploads per month",
      "50 Quick Wins (Elite Performance)",
      "SkillSmith AI Analysis (Elite)",
      "Complete Athletic Development Suite",
      "Personal Performance Coach",
      "Advanced Biomechanics Analysis",
      "Recovery & Sleep Optimization",
      "Competition Preparation Plans",
      "Dedicated Success Manager"
    ],
    envPriceVar: "NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE_M"
  },
  {
    sku: "sports_plan_contact",
    vertical: "sports",
    type: "plan",
    tier: "contact",
    billingInterval: "month",
    priceUsd: undefined, // Contact for pricing
    quickWinsIncluded: 999, // Unlimited
    scansOrUploads: 999, // Unlimited
    includes: [
      "Unlimited Video Uploads",
      "Unlimited Quick Wins",
      "SkillSmith AI Analysis (VIP)",
      "Complete Platform Access",
      "Custom Training Integration",
      "White-glove Onboarding",
      "24/7 Dedicated Support",
      "Custom SLA & Contracts",
      "Multi-athlete Management"
    ],
    envPriceVar: undefined // Contact sales, no Stripe price
  }
];

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
      "Frame-by-frame breakdown",
      "Motion tracking & metrics",
      "Comparison with pro athletes",
      "Detailed improvement recommendations"
    ],
    description: "AI-powered video analysis for technical skill improvement",
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
      "Pressure situation training",
      "Confidence building exercises",
      "Competition mindset development"
    ],
    description: "Master your mental game with advanced emotional intelligence training",
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
      "Pre/post workout meals",
      "Hydration optimization",
      "Supplement recommendations",
      "Performance fuel timing"
    ],
    description: "Optimize your nutrition for peak athletic performance",
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
      "Progressive skill development",
      "Strength & conditioning protocols",
      "Injury prevention exercises",
      "Athletic movement patterns"
    ],
    description: "Build unshakeable athletic foundations with comprehensive training protocols",
    envPriceVar: "NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_FOUNDATION",
    originalPrice: 49
  }
];

/**
 * Display configuration for Sports plans
 */
export const SPORTS_PLAN_DISPLAY: Record<string, PlanDisplayConfig> = {
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
    badge: "Elite Performance",
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
 * Get Sports plans with current pricing
 */
export function getSportsPlans(): PricingItem[] {
  return SPORTS_PLANS.map(plan => ({
    ...plan,
    isPromoActive: plan.promoPrice ? isPromoActive(STANDARD_PROMO_CONFIG) : false
  }));
}

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
 * Get plan by SKU
 */
export function getSportsPlanBySku(sku: string): PricingItem | undefined {
  return getSportsPlans().find(plan => plan.sku === sku);
}

/**
 * Get add-on by SKU
 */
export function getSportsAddonBySku(sku: string): AddOnItem | undefined {
  return getSportsAddons().find(addon => addon.sku === sku);
}

/**
 * Get display config for a tier
 */
export function getSportsDisplayConfig(tier: string): PlanDisplayConfig | undefined {
  return SPORTS_PLAN_DISPLAY[tier];
}

/**
 * Get current price for any sports item
 */
export function getSportsItemPrice(sku: string): number {
  const plan = getSportsPlanBySku(sku);
  if (plan) {
    return getCurrentPrice(plan);
  }
  
  const addon = getSportsAddonBySku(sku);
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
  includedVideoCount?: number;
  quickWins?: number;
  perks: string[];
  ctaKind?: "contact" | "buy";
}

/**
 * Convert to legacy format for backward compatibility
 */
export function getSportsPlansLegacy(): LegacyPlan[] {
  return getSportsPlans().map(plan => {
    const displayConfig = getSportsDisplayConfig(plan.tier || '');
    const currentPrice = getCurrentPrice(plan);
    
    return {
      label: displayConfig?.label || plan.tier || 'Unknown',
      priceText: currentPrice === 0 ? 'FREE' : `$${currentPrice}/mo`,
      displayPrice: currentPrice === 0 ? '$0' : `$${currentPrice}`,
      originalPriceText: plan.promoPrice && plan.priceUsd ? `$${plan.priceUsd.toFixed(2)}` : undefined,
      promoLabel: plan.isPromoActive ? 'Limited Time' : undefined,
      sku: plan.envPriceVar ? process.env[plan.envPriceVar] : undefined,
      isSubscription: plan.billingInterval === 'month',
      includedVideoCount: plan.scansOrUploads,
      quickWins: plan.quickWinsIncluded,
      perks: plan.includes,
      ctaKind: displayConfig?.ctaKind || 'buy'
    };
  });
}

/**
 * Get a display label for a sports add-on SKU
 */
function getSportsAddonLabel(sku: string): string {
  return sku.replace('sports_addon_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Legacy compatibility exports
 */
export const getAddOns = () => getSportsAddons().map(addon => ({
  id: addon.sku,
  type: 'addon' as const,
  title: getSportsAddonLabel(addon.sku),
  price: getCurrentPrice(addon),
  originalPrice: addon.originalPrice,
  period: 'one-time' as const,
  sku: addon.envPriceVar ? process.env[addon.envPriceVar] || addon.sku : addon.sku,
  badge: addon.isPromoActive ? 'new' as const : null,
  features: addon.includes,
  description: addon.description,
  icon: '⚡',
  category: 'Add-On'
}));

export const getSubscriptions = () => getSportsPlansLegacy().map(plan => ({
  id: plan.label.toLowerCase(),
  type: 'subscription' as const,
  title: plan.label,
  subtitle: plan.promoLabel,
  price: parseFloat(plan.displayPrice?.replace('$', '') || '0'),
  originalPrice: plan.originalPriceText ? parseFloat(plan.originalPriceText.replace('$', '')) : undefined,
  period: 'monthly' as const,
  sku: plan.sku || plan.label.toUpperCase(),
  badge: plan.label === 'Pro' ? 'popular' as const : plan.label === 'Elite' ? 'best-value' as const : null,
  features: plan.perks,
  description: `${plan.label} plan for athletic performance`,
  icon: plan.label === 'Starter' ? '🌟' : plan.label === 'Pro' ? '🏆' : '👑',
  category: 'Subscription'
}));