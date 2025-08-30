import { ProductKey, BillingPeriod } from './types';

// === Legacy Key Aliases and Safe Accessors ===
const KEY_ALIASES: Record<string, string> = {
  // Map legacy/marketing keys to real catalog keys
  'SPORTS_STARTER': 'SPORTS_STARTER',
  'sports_starter': 'SPORTS_STARTER',
  'starter': 'starter',
  'crusher': 'crusher',
  'sports_rookie_monthly': 'SPORTS_STARTER',
  'sports_all_star_one_time': 'SPORTS_ELITE',
  // Add any other legacy keys found in code
};

function normalizeKey(input: string): string {
  if (!input) return input;
  const k = input.trim();
  return KEY_ALIASES[k] ?? k;
}

type Period = 'monthly' | 'annual' | 'one_time';
function normalizePeriod(p: string): Period {
  const x = p.replace('-', '_').toLowerCase();
  if (x === 'one_time' || x === 'onetime') return 'one_time';
  if (x === 'monthly') return 'monthly';
  if (x === 'annual' || x === 'yearly') return 'annual';
  return x as Period;
}

export interface DisplayPlan {
  name: string;                 // "Starter", "Pro", etc
  blurb?: string;               // short marketing blurb
  currency: 'USD';
  interval: BillingPeriod;      // monthly | annual | one_time
  amountCents: number;          // what we show in UI
  amount: number;               // dollar amount for convenience
  intervalLabel: string;        // "month", "year", "one-time" etc
  compareAtCents?: number;      // optional “was $X” or anchor
  savingsCopy?: string;         // e.g., "Save 20% annually"
  features?: string[];          // bullets for the card
  mode: 'subscription'|'payment';
  stripeProductKey: ProductKey; // maps to Stripe price ID via lib/stripe/prices.ts
}

// Seeded with current SKUs and placeholders where unknown
export const PRICING_CATALOG: Record<ProductKey, {
  monthly?: DisplayPlan;
  annual?: DisplayPlan;
  one_time?: DisplayPlan;
}> = {
  BUS_STARTER: {
    monthly: {
      name: 'Business Starter',
      blurb: 'For solopreneurs & small teams',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 2900, // TODO: verify
      amount: 29,
      intervalLabel: 'month',
      compareAtCents: 3900,
      savingsCopy: 'Save 20% annually',
      features: ['3 AI Agents', 'Basic Automations', 'Email Support'],
      mode: 'subscription',
      stripeProductKey: 'BUS_STARTER',
    },
    annual: {
      name: 'Business Starter',
      blurb: 'For solopreneurs & small teams',
      currency: 'USD',
      interval: 'annual',
      amountCents: 29000, // TODO: verify
      amount: 290,
      intervalLabel: 'year',
      compareAtCents: 39000,
      savingsCopy: '2 months free',
      features: ['3 AI Agents', 'Basic Automations', 'Email Support'],
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
      amountCents: 4900, // TODO: verify
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
      amountCents: 49000, // TODO: verify
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
      amountCents: 9900, // TODO: verify
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
      amountCents: 99000, // TODO: verify
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
      amountCents: 1900, // TODO: verify
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
      amountCents: 2900, // TODO: verify
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
      amountCents: 4900, // TODO: verify
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
      amountCents: 9900, // TODO: verify
      amount: 99,
      intervalLabel: 'one-time',
      features: ['Everything included', 'Lifetime updates'],
      mode: 'payment',
      stripeProductKey: 'BUNDLE_ALL_ACCESS',
    },
  },
  SPORTS_VIDEO_PACK: {
    one_time: {
      name: 'Sports Video Pack',
      blurb: 'AI-powered video analysis tools',
      currency: 'USD',
      interval: 'one_time',
      amountCents: 1900, // TODO: verify
      amount: 19,
      intervalLabel: 'one-time',
      features: ['Video Analysis AI', 'Performance Metrics', 'Training Insights'],
      mode: 'payment',
      stripeProductKey: 'SPORTS_VIDEO_PACK',
    },
  },
  SPORTS_PLAYBOOK_PACK: {
    one_time: {
      name: 'Sports Playbook Pack',
      blurb: 'Strategic playbook & analysis',
      currency: 'USD',
      interval: 'one_time',
      amountCents: 2900, // TODO: verify
      amount: 29,
      intervalLabel: 'one-time',
      features: ['Strategic Analysis', 'Custom Playbooks', 'Game Planning'],
      mode: 'payment',
      stripeProductKey: 'SPORTS_PLAYBOOK_PACK',
    },
  },
  starter: {
    monthly: {
      name: 'Starter',
      blurb: 'For individuals',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 1000, 
      amount: 10,
      intervalLabel: 'month',
      features: ['Basic Features'],
      mode: 'subscription',
      stripeProductKey: 'starter',
    },
    annual: {
      name: 'Starter',
      blurb: 'For individuals',
      currency: 'USD',
      interval: 'annual',
      amountCents: 10000, 
      amount: 100,
      intervalLabel: 'year',
      features: ['Basic Features'],
      mode: 'subscription',
      stripeProductKey: 'starter',
    },
  },
  star: {
    monthly: {
      name: 'Star',
      blurb: 'For growing teams',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 2000, 
      amount: 20,
      intervalLabel: 'month',
      features: ['Advanced Features'],
      mode: 'subscription',
      stripeProductKey: 'star',
    },
    annual: {
      name: 'Star',
      blurb: 'For growing teams',
      currency: 'USD',
      interval: 'annual',
      amountCents: 20000, 
      amount: 200,
      intervalLabel: 'year',
      features: ['Advanced Features'],
      mode: 'subscription',
      stripeProductKey: 'star',
    },
  },
  crusher: {
    monthly: {
      name: 'Crusher',
      blurb: 'For large teams',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 3000, 
      amount: 30,
      intervalLabel: 'month',
      features: ['Premium Features'],
      mode: 'subscription',
      stripeProductKey: 'crusher',
    },
    annual: {
      name: 'Crusher',
      blurb: 'For large teams',
      currency: 'USD',
      interval: 'annual',
      amountCents: 30000, 
      amount: 300,
      intervalLabel: 'year',
      features: ['Premium Features'],
      mode: 'subscription',
      stripeProductKey: 'crusher',
    },
  },
};

export function getDisplayPlan(key: ProductKey, period: BillingPeriod): DisplayPlan {
  const entry = PRICING_CATALOG[key];
  if (!entry) throw new Error(`No pricing catalog entry for key: ${key}`);
  const plan = entry[period];
  if (!plan) throw new Error(`No display plan for key ${key} and period ${period}`);
  return plan;
}

// === New safe accessor (non-throwing) ===
export function getDisplayPlanOrNull(key: string, period: string): DisplayPlan | null {
  const k = normalizeKey(key);
  const p = normalizePeriod(period);
  const entry = (PRICING_CATALOG as any)?.[k];
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[catalog] missing catalog entry for key=${key}→${k}`);
    }
    return null;
  }
  const plan = entry[p];
  if (!plan) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[catalog] missing plan for key=${key}→${k}, period=${period}→${p}`);
    }
    return null;
  }
  return plan;
}

export function formatMoney(cents: number, currency: 'USD' = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents/100);
}
