// Unified pricing data for sports page
// Supports both add-ons (one-time) and subscriptions (recurring)

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

// Add-On Products (One-time purchases)
export const addOns: PricingItem[] = [
  {
    id: 'video-analysis',
    type: 'addon',
    title: 'AI Video Analysis',
    price: 29,
    originalPrice: 49,
    period: 'one-time',
    sku: 'SPORTS_VIDEO_ANALYSIS',
    badge: 'popular',
    features: [
      'Upload unlimited videos',
      'AI technique analysis',
      'Improvement recommendations',
      'Performance metrics tracking'
    ],
    description: 'Get instant AI-powered analysis of your game footage',
    icon: '📹',
    category: 'Analysis'
  },
  {
    id: 'mental-coaching',
    type: 'addon',
    title: 'Mastery of Emotion (MOE)',
    price: 39,
    period: 'one-time',
    sku: 'SPORTS_MOE',
    badge: null,
    features: [
      'Mental toughness training',
      'Confidence building exercises',
      'Pre-game preparation',
      'Pressure management techniques'
    ],
    description: 'Master your mental game with proven psychological techniques',
    icon: '🧠',
    category: 'Mental'
  },
  {
    id: 'nutrition-guide',
    type: 'addon',
    title: 'Sports Nutrition Guide',
    price: 19,
    period: 'one-time',
    sku: 'SPORTS_NUTRITION',
    badge: null,
    features: [
      'Personalized meal plans',
      'Pre/post workout nutrition',
      'Hydration strategies',
      'Supplement recommendations'
    ],
    description: 'Fuel your performance with expert nutrition guidance',
    icon: '🥗',
    category: 'Nutrition'
  },
  {
    id: 'foundation-training',
    type: 'addon',
    title: 'Foundation Training Pack',
    price: 49,
    originalPrice: 79,
    period: 'one-time',
    sku: 'SPORTS_FOUNDATION',
    badge: 'best-value',
    features: [
      'Fundamental skills training',
      'Progressive workout plans',
      'Injury prevention protocols',
      'Equipment recommendations'
    ],
    description: 'Build a solid athletic foundation across all sports',
    icon: '🏗️',
    category: 'Training'
  }
];

// Subscription Plans
export const subscriptions: PricingItem[] = [
  {
    id: 'rookie',
    type: 'subscription',
    title: 'Rookie',
    subtitle: 'Perfect for beginners',
    price: 19,
    period: 'monthly',
    sku: 'SPORTS_STARTER',
    badge: null,
    features: [
      '5 AI video analyses/month',
      'Basic training plans',
      'Performance tracking',
      'Email support'
    ],
    description: 'Start your athletic journey with AI-powered coaching',
    icon: '🌟',
    category: 'Subscription'
  },
  {
    id: 'pro',
    type: 'subscription',
    title: 'Pro',
    subtitle: 'Most popular choice',
    price: 39,
    period: 'monthly',
    sku: 'SPORTS_PRO',
    badge: 'popular',
    features: [
      'Unlimited AI video analyses',
      'Advanced training plans',
      'Mental coaching modules',
      'Priority support',
      'Nutrition guidance'
    ],
    description: 'Comprehensive coaching for serious athletes',
    icon: '🏆',
    category: 'Subscription'
  },
  {
    id: 'elite',
    type: 'subscription',
    title: 'Elite',
    subtitle: 'Maximum performance',
    price: 79,
    period: 'monthly',
    sku: 'SPORTS_ELITE',
    badge: 'best-value',
    features: [
      'Everything in Pro',
      '1-on-1 coaching calls',
      'Custom training programs',
      'Competition preparation',
      'Recovery optimization',
      'Team collaboration tools'
    ],
    description: 'Elite-level coaching for competitive athletes',
    icon: '👑',
    category: 'Subscription'
  },
  {
    id: 'annual-pro',
    type: 'subscription',
    title: 'Pro Annual',
    subtitle: 'Save 40% with annual billing',
    price: 279, // $23.25/month when billed annually
    originalPrice: 468, // $39 * 12
    period: 'annual',
    sku: 'SPORTS_PRO_ANNUAL',
    badge: 'best-value',
    features: [
      'All Pro features',
      'Annual billing discount',
      'Priority feature access',
      'Exclusive training content',
      'Performance analytics'
    ],
    description: 'Best value for committed athletes',
    icon: '💎',
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