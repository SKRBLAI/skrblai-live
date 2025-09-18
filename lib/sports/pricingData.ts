// Unified pricing data for sports page
// Supports both add-ons (one-time) and subscriptions (recurring)

export interface Plan {
  label: string;
  priceText?: string;         // fallback display
  displayPrice?: string;      // e.g. "$19.99"
  originalPriceText?: string; // e.g. "$39.00"
  promoLabel?: string;        // "Beta Special"
  sku?: string;               // Stripe Price ID (if missing => disabled CTA)
  isSubscription: boolean;
  includedVideoCount?: number; // scans per month included (AI Performance Analysis)
  quickWins?: number;
  perks: string[];
  ctaKind?: "contact" | "buy"; // Custom = contact
}

export interface AddOn {
  label: string;
  priceText: string;
  originalPriceText?: string;
  sku?: string;               // Stripe Price ID
  isSubscription: boolean;    // false (one-time)
  description?: string;
}

// Legacy interface for backward compatibility
export interface PricingItem {
  id: string;
  type: 'addon' | 'subscription';
  title: string;
  subtitle?: string;
  price: number;
  originalPrice?: number;
  period?: 'monthly' | 'annual' | 'one-time';
  sku: string;
  badge?: 'popular' | 'best-value' | 'new' | null;
  features: string[];
  description: string;
  icon?: string;
  category: string;
}

export const SPORTS_PLANS: Plan[] = [
  {
    label: "Starter",
    priceText: "$9.99/mo",
    sku: process.env.NEXT_PUBLIC_STRIPE_PRICE_ROOKIE,
    isSubscription: true,
    includedVideoCount: 3,     // scans per month (AI Analysis)
    quickWins: 5,
    perks: [
      "Includes SkillSmith AI Performance Analysis",
      "5 Quick Wins",
      "Free eBook: Emotional Mastery in Athletics",
    ],
  },
  {
    label: "Pro",
    displayPrice: "$19.99",
    originalPriceText: "$39.00",
    promoLabel: "Beta Special",
    sku: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    isSubscription: true,
    includedVideoCount: 10,
    quickWins: 10,
    perks: [
      "Includes SkillSmith AI Performance Analysis",
      "Customized 4-week training plan (PDF)",
      "10 SkillSmith Personalized Quick Wins",
    ],
  },
  {
    label: "Elite",
    displayPrice: "$59.99",
    originalPriceText: "$79.00",
    promoLabel: "Beta Special",
    sku: process.env.NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR,
    isSubscription: true,
    includedVideoCount: 30,
    quickWins: 15,
    perks: [
      "Includes SkillSmith AI Performance Analysis",
      "Unlimited SkillSmith chat access",
      "4-week Nutrition Plan",
      "4-week Training Program",
    ],
  },
  {
    label: "Custom",
    ctaKind: "contact",
    isSubscription: true,
    perks: [
      "UNLIMITED scans",
      "VIP access (Business + Sports)",
      "White-glove onboarding & support",
    ],
  },
];

export const SPORTS_ADDONS: AddOn[] = [
  {
    label: "Flat 10 Scans",
    priceText: "$9.99",
    sku: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10,
    isSubscription: false,
    description: "Basic analysis + 3 Quick Wins",
  },
];

// Legacy data for backward compatibility
export const addOns: PricingItem[] = [
  {
    id: 'scans10',
    type: 'addon',
    title: 'Flat 10 Scans',
    price: 9.99,
    period: 'one-time',
    sku: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10 || 'ADDON_SCANS10',
    badge: null,
    features: [
      'Basic analysis included',
      '3 Quick Wins',
      'Instant access'
    ],
    description: 'Basic analysis + 3 Quick Wins',
    icon: '⚡',
    category: 'Add-On'
  }
];

export const subscriptions: PricingItem[] = [
  {
    id: 'starter',
    type: 'subscription',
    title: 'Starter',
    subtitle: 'Perfect for beginners',
    price: 9.99,
    period: 'monthly',
    sku: process.env.NEXT_PUBLIC_STRIPE_PRICE_ROOKIE || 'SPORTS_STARTER',
    badge: null,
    features: [
      '3 scans/month (AI Performance Analysis included)',
      '5 Quick Wins',
      'Free eBook: Emotional Mastery in Athletics'
    ],
    description: 'Start your athletic journey with AI-powered coaching',
    icon: '🌟',
    category: 'Subscription'
  },
  {
    id: 'pro',
    type: 'subscription',
    title: 'Pro',
    subtitle: 'Beta Special',
    price: 19.99,
    originalPrice: 39.00,
    period: 'monthly',
    sku: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'SPORTS_PRO',
    badge: 'popular',
    features: [
      '10 scans/month (AI Performance Analysis included)',
      'Customized 4-week training plan (one-time PDF)',
      '10 SkillSmith Personalized Quick Wins'
    ],
    description: 'Comprehensive coaching for serious athletes',
    icon: '🏆',
    category: 'Subscription'
  },
  {
    id: 'elite',
    type: 'subscription',
    title: 'Elite',
    subtitle: 'Beta Special',
    price: 59.99,
    originalPrice: 79.00,
    period: 'monthly',
    sku: process.env.NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR || 'SPORTS_ELITE',
    badge: 'best-value',
    features: [
      '30 scans/month (AI Performance Analysis included)',
      'Unlimited SkillSmith chat access',
      '4-week Nutrition Plan + 4-week Training Program',
      '15 Quick Wins'
    ],
    description: 'Elite-level coaching for competitive athletes',
    icon: '👑',
    category: 'Subscription'
  }
];

// Combined pricing data
export const allPricingItems = [...addOns, ...subscriptions];

// Utility functions
export const getAddOns = () => addOns;
export const getSubscriptions = () => subscriptions;
export const getPricingItemById = (id: string) => allPricingItems.find(item => item.id === id);
export const getPricingItemsBySku = (sku: string) => allPricingItems.filter(item => item.sku === sku);
export const getPricingItemsByCategory = (category: string) => allPricingItems.filter(item => item.category === category);

// Price formatting
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Savings calculation
export const calculateSavings = (item: PricingItem): number => {
  if (item.originalPrice && item.price) {
    return item.originalPrice - item.price;
  }
  return 0;
};

// Badge text
export const getBadgeText = (badge: PricingItem['badge']): string => {
  switch (badge) {
    case 'popular':
      return 'Most Popular';
    case 'best-value':
      return 'Best Value';
    case 'new':
      return 'New';
    default:
      return '';
  }
};

// Category colors
export const getCategoryColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'analysis':
      return 'from-blue-500 to-cyan-500';
    case 'mental':
      return 'from-purple-500 to-pink-500';
    case 'nutrition':
      return 'from-green-500 to-emerald-500';
    case 'training':
      return 'from-orange-500 to-red-500';
    case 'subscription':
      return 'from-indigo-500 to-purple-500';
    default:
      return 'from-gray-500 to-slate-500';
  }
};