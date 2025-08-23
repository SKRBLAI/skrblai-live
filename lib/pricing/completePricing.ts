/**
 * Complete pricing configuration including sports-specific keys
 */

import type { BillingPeriod } from './types';

export interface DisplayPlan {
  name: string;
  blurb?: string;
  currency: 'USD';
  interval: BillingPeriod;
  amountCents: number;
  amount: number;
  intervalLabel: string;
  compareAtCents?: number;
  savingsCopy?: string;
  features: string[];
  mode: 'subscription' | 'payment';
  stripeProductKey: string;
}

export const PRICING_CATALOG: Record<string, { monthly?: DisplayPlan; annual?: DisplayPlan; one_time?: DisplayPlan }> = {
  BUS_STARTER: {
    monthly: {
      name: 'Business Starter',
      blurb: 'Perfect for creators & small teams',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 2900,
      amount: 29,
      intervalLabel: 'month',
      compareAtCents: 3900,
      savingsCopy: 'Save 25% annually',
      features: ['5 AI Agents', 'Core Automations', 'Email Support'],
      mode: 'subscription',
      stripeProductKey: 'BUS_STARTER',
    },
    annual: {
      name: 'Business Starter',
      blurb: 'Perfect for creators & small teams',
      currency: 'USD',
      interval: 'annual',
      amountCents: 29000,
      amount: 290,
      intervalLabel: 'year',
      compareAtCents: 39000,
      savingsCopy: '2 months free',
      features: ['5 AI Agents', 'Core Automations', 'Email Support'],
      mode: 'subscription',
      stripeProductKey: 'BUS_STARTER',
    },
  },
  BUS_PRO: {
    monthly: {
      name: 'Business Pro',
      blurb: 'Growth for scaling teams',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 4900,
      amount: 49,
      intervalLabel: 'month',
      compareAtCents: 5900,
      savingsCopy: 'Save 25% annually',
      features: ['10 AI Agents', 'Advanced Automations', 'Priority Support'],
      mode: 'subscription',
      stripeProductKey: 'BUS_PRO',
    },
    annual: {
      name: 'Business Pro',
      blurb: 'Growth for scaling teams',
      currency: 'USD',
      interval: 'annual',
      amountCents: 49000,
      amount: 490,
      intervalLabel: 'year',
      compareAtCents: 59000,
      savingsCopy: '2 months free',
      features: ['10 AI Agents', 'Advanced Automations', 'Priority Support'],
      mode: 'subscription',
      stripeProductKey: 'BUS_PRO',
    },
  },
  BUS_ELITE: {
    monthly: {
      name: 'Business Elite',
      blurb: 'All-access for enterprises',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 9900,
      amount: 99,
      intervalLabel: 'month',
      compareAtCents: 12900,
      savingsCopy: 'Save 30% annually',
      features: ['All AI Agents', 'Unlimited Automations', 'Dedicated Success Manager'],
      mode: 'subscription',
      stripeProductKey: 'BUS_ELITE',
    },
    annual: {
      name: 'Business Elite',
      blurb: 'All-access for enterprises',
      currency: 'USD',
      interval: 'annual',
      amountCents: 99000,
      amount: 990,
      intervalLabel: 'year',
      compareAtCents: 129000,
      savingsCopy: '2 months free',
      features: ['All AI Agents', 'Unlimited Automations', 'Dedicated Success Manager'],
      mode: 'subscription',
      stripeProductKey: 'BUS_ELITE',
    },
  },
  SPORTS_STARTER: {
    one_time: {
      name: 'Sports Starter',
      blurb: 'For new athletes',
      currency: 'USD',
      interval: 'one_time',
      amountCents: 1900,
      amount: 19,
      intervalLabel: 'one-time',
      features: ['AI Sports Analysis', 'Nutrition Basics'],
      mode: 'payment',
      stripeProductKey: 'SPORTS_STARTER',
    },
  },
  SPORTS_PRO: {
    one_time: {
      name: 'Sports Pro',
      blurb: 'For rising stars',
      currency: 'USD',
      interval: 'one_time',
      amountCents: 2900,
      amount: 29,
      intervalLabel: 'one-time',
      features: ['AI Sports Analysis', 'Nutrition + Mental Health'],
      mode: 'payment',
      stripeProductKey: 'SPORTS_PRO',
    },
  },
  SPORTS_ELITE: {
    one_time: {
      name: 'Sports Elite',
      blurb: 'Full mastery bundle',
      currency: 'USD',
      interval: 'one_time',
      amountCents: 4900,
      amount: 49,
      intervalLabel: 'one-time',
      features: ['All AI Sports Tools', 'Personalized Plans'],
      mode: 'payment',
      stripeProductKey: 'SPORTS_ELITE',
    },
  },
  BUNDLE_ALL_ACCESS: {
    one_time: {
      name: 'All Access Bundle',
      blurb: 'Unlock every tool & agent',
      currency: 'USD',
      interval: 'one_time',
      amountCents: 9900,
      amount: 99,
      intervalLabel: 'one-time',
      features: ['Everything included', 'Lifetime updates'],
      mode: 'payment',
      stripeProductKey: 'BUNDLE_ALL_ACCESS',
    },
  },
  // Sports-specific aliases
  starter: {
    one_time: {
      name: 'Sports Starter',
      blurb: 'For new athletes',
      currency: 'USD',
      interval: 'one_time',
      amountCents: 1900,
      amount: 19,
      intervalLabel: 'one-time',
      features: ['AI Sports Analysis', 'Nutrition Basics'],
      mode: 'payment',
      stripeProductKey: 'SPORTS_STARTER',
    },
  },
  star: {
    one_time: {
      name: 'Sports Elite',
      blurb: 'Full mastery bundle',
      currency: 'USD',
      interval: 'one_time',
      amountCents: 4900,
      amount: 49,
      intervalLabel: 'one-time',
      features: ['All AI Sports Tools', 'Personalized Plans'],
      mode: 'payment',
      stripeProductKey: 'SPORTS_ELITE',
    },
  },
  crusher: {
    one_time: {
      name: 'All Access Bundle',
      blurb: 'Unlock every tool & agent',
      currency: 'USD',
      interval: 'one_time',
      amountCents: 9900,
      amount: 99,
      intervalLabel: 'one-time',
      features: ['Everything included', 'Lifetime updates'],
      mode: 'payment',
      stripeProductKey: 'BUNDLE_ALL_ACCESS',
    },
  },
};

export type ProductKey = keyof typeof PRICING_CATALOG;

export function getDisplayPlan(key: ProductKey, period: BillingPeriod): DisplayPlan {
  const entry = PRICING_CATALOG[key];
  if (!entry) throw new Error(`No pricing catalog entry for key: ${key}`);
  
  const plan = entry[period];
  if (!plan) throw new Error(`No ${period} plan for key: ${key}`);
  
  return plan;
}

export const priceMap = Object.fromEntries(
  Object.entries(PRICING_CATALOG).map(([key, plans]) => {
    const plan = plans.one_time || plans.monthly;
    return [key, { amount: plan?.amount || 0, name: plan?.name || '' }];
  })
);

export const getAmount = (key: string): number => {
  return priceMap[key]?.amount || 0;
};
