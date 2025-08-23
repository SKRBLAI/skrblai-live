import React from 'react';

export interface PricingFeature {
  name: string;
  included: boolean;
  tooltip?: string;
}

export interface PricingPlan {
  id: string;
  title: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number; // Already discounted (20% off monthly * 12)
  features: PricingFeature[];
  gradient: string;
  cta: {
    monthly: string;
    annual: string;
  };
  href: {
    monthly: string;
    annual: string;
  };
  stripePriceIds?: {
    monthly?: string;
    annual?: string;
  };
  badges?: {
    primary?: string;
    secondary?: string;
  };
  agentCount: number;
  icon: string;
  taskLimit: string;
  support: string;
  // Badge conditions
  isPopular?: boolean;
  isBestValue?: boolean;
  isEnterprise?: boolean;
  isFree?: boolean;
}

// Calculate annual savings (20% discount)
const calculateAnnualPrice = (monthlyPrice: number): number => {
  return Math.round(monthlyPrice * 12 * 0.8); // 20% discount
};

export const pricingPlans: PricingPlan[] = [
  {
    id: 'gateway',
    title: 'Gateway',
    description: 'Taste the power. See what domination feels like.',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      { name: '3 Strategic Agents', included: true },
      { name: 'Percy Concierge Access', included: true },
      { name: '10 Tasks/Agent/Month', included: true },
      { name: 'Community Support', included: true },
      { name: 'Basic Analytics', included: true },
      { name: 'N8N Workflows', included: false, tooltip: 'Available in paid plans' },
      { name: 'Priority Support', included: false, tooltip: 'Available in paid plans' },
      { name: 'Custom Agents', included: false, tooltip: 'Available in Enterprise plans' }
    ],
    gradient: 'from-gray-600 to-gray-500',
    cta: {
      monthly: 'Start Your Domination',
      annual: 'Start Your Domination'
    },
    href: {
      monthly: '/sign-up?plan=gateway&billing=monthly',
      annual: '/sign-up?plan=gateway&billing=annual'
    },
    badges: {
      primary: 'Get Addicted',
      secondary: 'Risk Free'
    },
    agentCount: 3,
    icon: '🎯',
    taskLimit: '10/agent/month',
    support: 'Community',
    isFree: true
  },
  {
    id: 'starter',
    title: 'Starter Hustler',
    description: 'Content creators & entrepreneurs: automation empire starts here.',
    monthlyPrice: 27,
    annualPrice: calculateAnnualPrice(27), // $259.20 (save $64.80)
    features: [
      { name: '6 Content Creator Agents', included: true },
      { name: 'Percy Basic Access', included: true },
      { name: '50 Tasks/Agent/Month', included: true },
      { name: 'Social Media Automation', included: true },
      { name: 'Priority Support', included: true },
      { name: 'N8N Workflows', included: true },
      { name: 'Analytics Dashboard', included: true },
      { name: 'Custom Agents', included: false, tooltip: 'Available in Enterprise plans' }
    ],
    gradient: 'from-blue-600 to-cyan-500',
    cta: {
      monthly: 'Become a Hustler',
      annual: 'Become a Hustler & Save 20%'
    },
    href: {
      monthly: '/sign-up?plan=starter&billing=monthly',
      annual: '/sign-up?plan=starter&billing=annual'
    },
    stripePriceIds: {
      monthly: 'price_starter_monthly', // Replace with actual Stripe price ID
      annual: 'price_starter_annual'   // Replace with actual Stripe price ID
    },
    badges: {
      primary: 'Perfect for Creators',
      secondary: 'Most Popular'
    },
    agentCount: 6,
    icon: '⚡',
    taskLimit: '50/agent/month',
    support: 'Priority',
    isPopular: true
  },
  {
    id: 'business',
    title: 'Business Dominator',
    description: 'Growing businesses: deploy the arsenal that makes competitors cry.',
    monthlyPrice: 69,
    annualPrice: calculateAnnualPrice(69), // $662.40 (save $165.60)
    features: [
      { name: '10 Growth Business Agents', included: true },
      { name: 'Percy + Advanced Analytics', included: true },
      { name: '200 Tasks/Agent/Month', included: true },
      { name: 'Client Success Automation', included: true },
      { name: 'Video Content Machine', included: true },
      { name: 'White-label Options', included: true },
      { name: 'Advanced N8N Workflows', included: true },
      { name: 'Custom Agents', included: false, tooltip: 'Available in Enterprise plans' }
    ],
    gradient: 'from-yellow-500 to-orange-500',
    cta: {
      monthly: 'Dominate Your Market',
      annual: 'Dominate & Save $165'
    },
    href: {
      monthly: '/sign-up?plan=business&billing=monthly',
      annual: '/sign-up?plan=business&billing=annual'
    },
    stripePriceIds: {
      monthly: 'price_business_monthly', // Replace with actual Stripe price ID
      annual: 'price_business_annual'    // Replace with actual Stripe price ID
    },
    badges: {
      primary: 'Revenue Multiplier',
      secondary: 'Best Value'
    },
    agentCount: 10,
    icon: '🔥',
    taskLimit: '200/agent/month',
    support: 'Priority + Phone',
    isBestValue: true
  },
  {
    id: 'enterprise',
    title: 'Industry Crusher',
    description: 'Enterprise: complete arsenal for market domination.',
    monthlyPrice: 269,
    annualPrice: calculateAnnualPrice(269), // $2,580.80 (save $645.20)
    features: [
      { name: 'Complete Agent Arsenal (14+)', included: true },
      { name: 'Percy + Predictive Intelligence', included: true },
      { name: 'Unlimited Tasks & Processing', included: true },
      { name: 'Custom Agent Builder', included: true },
      { name: 'White-label Options', included: true },
      { name: 'Dedicated Success Manager', included: true },
      { name: 'API Access & Integrations', included: true },
      { name: 'Enterprise SLA', included: true }
    ],
    gradient: 'from-purple-600 to-pink-600',
    cta: {
      monthly: 'Crush Your Industry',
      annual: 'Crush Industry & Save $645'
    },
    href: {
      monthly: '/sign-up?plan=enterprise&billing=monthly',
      annual: '/sign-up?plan=enterprise&billing=annual'
    },
    stripePriceIds: {
      monthly: 'price_enterprise_monthly', // Replace with actual Stripe price ID
      annual: 'price_enterprise_annual'    // Replace with actual Stripe price ID
    },
    badges: {
      primary: 'Complete Annihilation',
      secondary: 'Enterprise Arsenal'
    },
    agentCount: 14,
    icon: '👑',
    taskLimit: 'Unlimited',
    support: 'Dedicated Manager',
    isEnterprise: true
  }
];

// Utility functions
export const getPlanById = (id: string): PricingPlan | undefined => {
  return pricingPlans.find(plan => plan.id === id);
};

import { BillingPeriod } from '../pricing/catalog';

export const getPrice = (plan: PricingPlan, period: BillingPeriod): number => {
  return period === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
};

export const getFormattedPrice = (plan: PricingPlan, period: BillingPeriod): string => {
  const price = getPrice(plan, period);
  
  if (price === 0) {
    return 'FREE';
  }
  
  if (period === 'annual') {
    const monthlyEquivalent = price / 12;
    return `$${monthlyEquivalent.toFixed(0)}/mo`;
  }
  
  return `$${price}`;
};

export const getSavingsAmount = (plan: PricingPlan): number => {
  if (plan.monthlyPrice === 0) return 0;
  const annualCost = plan.monthlyPrice * 12;
  return annualCost - plan.annualPrice;
};

export const getSavingsPercentage = (): number => {
  return 20; // Fixed 20% savings for annual billing
};

export const getBadgeText = (plan: PricingPlan, period: BillingPeriod): string => {
  if (plan.isPopular && period === 'monthly') return 'Most Popular';
  if (plan.isBestValue && period === 'annual') return 'Best Value';
  if (plan.isEnterprise) return 'Enterprise';
  if (plan.isFree) return 'Risk Free';
  return plan.badges?.primary || '';
};

function isLegacyPeriod(period: BillingPeriod): period is 'monthly' | 'annual' {
  return period === 'monthly' || period === 'annual';
}

export const getCTAText = (plan: PricingPlan, period: BillingPeriod): string => {
  if (isLegacyPeriod(period)) {
    return plan.cta[period];
  }
  // fallback or error for 'one_time'
  return plan.cta['monthly'];
};

export const getHref = (plan: PricingPlan, period: BillingPeriod): string => {
  if (isLegacyPeriod(period)) {
    return plan.href[period];
  }
  // fallback or error for 'one_time'
  return plan.href['monthly'];
};

// Live metrics for engagement (moved from pricing page)
export interface LiveMetric {
  label: string;
  value: number;
  increment: number;
  formatter?: (value: number) => string;
}

export const liveMetrics: LiveMetric[] = [
  { 
    label: 'Businesses Automated Today', 
    value: 1247, 
    increment: 3 
  },
  { 
    label: 'Competitors Eliminated', 
    value: 89, 
    increment: 1 
  },
  { 
    label: 'Revenue Generated', 
    value: 2847291, 
    increment: 1500,
    formatter: (value: number) => `$${value.toLocaleString()}`
  }
];

// Pricing page constants
export const URGENCY_TIMER_INITIAL = 23 * 60 + 47; // 23:47 minutes
export const METRICS_UPDATE_INTERVAL = 3000; // 3 seconds
export const TIMER_UPDATE_INTERVAL = 1000; // 1 second