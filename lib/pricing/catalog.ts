/** MMM: Canonical source for pricing catalog. Do not duplicate. */

import { ProductKey, BillingPeriod } from './types';

// === Legacy Key Aliases and Safe Accessors ===
const KEY_ALIASES: Record<string, string> = {
  // Map legacy/marketing keys to new unified keys
  'SPORTS_STARTER': 'ROOKIE',
  'sports_starter': 'ROOKIE',
  'BUS_STARTER': 'ROOKIE',
  'starter': 'ROOKIE',
  'SPORTS_PRO': 'PRO',
  'BUS_PRO': 'PRO',
  'star': 'PRO',
  'SPORTS_ELITE': 'ALL_STAR',
  'BUS_ELITE': 'ALL_STAR',
  'crusher': 'ALL_STAR',
  'BUNDLE_ALL_ACCESS': 'ALL_STAR',
  'sports_rookie_monthly': 'ROOKIE',
  'sports_all_star_one_time': 'ALL_STAR',
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

// Enhanced DisplayPlan interface for unified pricing
export interface UnifiedDisplayPlan extends DisplayPlan {
  subtitle?: string;           // Additional subtitle for cards
  allowances?: {
    scans_per_month?: number;
    projects?: number;
    seats?: number;
  };
  verticals?: ('business' | 'sports')[];  // Which verticals this plan applies to
  lookupKey?: string;          // Stripe lookup key for easy resolution
}

// Unified 4-tier catalog (shared by Business + Sports)
export const PRICING_CATALOG: Record<ProductKey, {
  monthly?: UnifiedDisplayPlan;
  annual?: UnifiedDisplayPlan;
  one_time?: UnifiedDisplayPlan;
}> = {
  // === UNIFIED 4-TIER PLANS ===
  ROOKIE: {
    monthly: {
      name: 'Rookie',
      subtitle: 'Perfect for getting started',
      blurb: 'Essential tools for individuals and small teams',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 999,
      amount: 9.99,
      intervalLabel: 'month',
      features: [
        '5 scans per month',
        '1 project workspace', 
        'Basic AI agents access',
        'Community support'
      ],
      allowances: {
        scans_per_month: 5,
        projects: 1,
        seats: 1
      },
      verticals: ['business', 'sports'],
      lookupKey: 'plan.ROOKIE.monthly',
      mode: 'subscription',
      stripeProductKey: 'ROOKIE',
    },
  },
  PRO: {
    monthly: {
      name: 'Pro',
      subtitle: 'Most popular choice',
      blurb: 'Advanced features for growing teams',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 1699,
      amount: 16.99,
      intervalLabel: 'month',
      features: [
        '25 scans per month',
        '5 project workspaces',
        'Advanced AI agents',
        'Priority support'
      ],
      allowances: {
        scans_per_month: 25,
        projects: 5,
        seats: 3
      },
      verticals: ['business', 'sports'],
      lookupKey: 'plan.PRO.monthly',
      mode: 'subscription',
      stripeProductKey: 'PRO',
    },
  },
  ALL_STAR: {
    monthly: {
      name: 'All-Star',
      subtitle: 'Everything you need',
      blurb: 'Complete access for serious users',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 2999,
      amount: 29.99,
      intervalLabel: 'month',
      features: [
        '100 scans per month',
        'Unlimited projects',
        'All AI agents & tools',
        'Dedicated support'
      ],
      allowances: {
        scans_per_month: 100,
        projects: -1, // unlimited
        seats: 10
      },
      verticals: ['business', 'sports'],
      lookupKey: 'plan.ALL_STAR.monthly',
      mode: 'subscription',
      stripeProductKey: 'ALL_STAR',
    },
  },
  FRANCHISE: {
    monthly: {
      name: 'Franchise',
      subtitle: 'Enterprise solution',
      blurb: 'Custom solution for large organizations',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 0, // Contact for pricing
      amount: 0,
      intervalLabel: 'month',
      features: [
        'Custom scan limits',
        'White-label options',
        'Custom integrations',
        'Dedicated success manager'
      ],
      allowances: {
        scans_per_month: -1, // unlimited
        projects: -1, // unlimited
        seats: -1 // unlimited
      },
      verticals: ['business', 'sports'],
      // lookupKey: undefined, // No checkout, contact only
      mode: 'subscription',
      stripeProductKey: 'FRANCHISE',
    },
  },

  // === ADD-ONS (RECURRING) ===
  ADDON_SCANS_10: {
    monthly: {
      name: '+10 Scans',
      blurb: 'Additional scans per month',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 500,
      amount: 5.00,
      intervalLabel: 'month',
      features: ['10 additional scans per month'],
      verticals: ['business', 'sports'],
      lookupKey: 'addon.SCANS_10.monthly',
      mode: 'subscription',
      stripeProductKey: 'ADDON_SCANS_10',
    },
  },
  ADDON_MOE: {
    monthly: {
      name: 'Mastery of Emotion (MOE)',
      blurb: 'Mental performance training',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 900,
      amount: 9.00,
      intervalLabel: 'month',
      features: ['Mental performance training', 'Emotion regulation tools'],
      verticals: ['sports'],
      lookupKey: 'addon.MOE.monthly',
      mode: 'subscription',
      stripeProductKey: 'ADDON_MOE',
    },
  },
  ADDON_NUTRITION: {
    monthly: {
      name: 'Nutrition Guidance',
      blurb: 'Personalized nutrition plans',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 700,
      amount: 7.00,
      intervalLabel: 'month',
      features: ['Custom meal plans', 'Nutrition tracking'],
      verticals: ['sports'],
      lookupKey: 'addon.NUTRITION.monthly',
      mode: 'subscription',
      stripeProductKey: 'ADDON_NUTRITION',
    },
  },
  ADDON_ADV_ANALYTICS: {
    monthly: {
      name: 'Advanced Analytics',
      blurb: 'Deep performance insights',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 900,
      amount: 9.00,
      intervalLabel: 'month',
      features: ['Advanced reporting', 'Performance trends'],
      verticals: ['business', 'sports'],
      lookupKey: 'addon.ADV_ANALYTICS.monthly',
      mode: 'subscription',
      stripeProductKey: 'ADDON_ADV_ANALYTICS',
    },
  },
  ADDON_AUTOMATION: {
    monthly: {
      name: 'Automation Suite',
      blurb: 'Advanced workflow automation',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 1900,
      amount: 19.00,
      intervalLabel: 'month',
      features: ['Custom workflows', 'API integrations'],
      verticals: ['business'],
      lookupKey: 'addon.AUTOMATION.monthly',
      mode: 'subscription',
      stripeProductKey: 'ADDON_AUTOMATION',
    },
  },
  ADDON_SEAT: {
    monthly: {
      name: 'Additional Seat',
      blurb: 'Per additional team member',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 300,
      amount: 3.00,
      intervalLabel: 'month',
      features: ['1 additional team member'],
      verticals: ['business', 'sports'],
      lookupKey: 'addon.SEAT.monthly',
      mode: 'subscription',
      stripeProductKey: 'ADDON_SEAT',
    },
  },

  // === LEGACY COMPATIBILITY (maintain existing structure for backward compatibility) ===
  BUS_STARTER: {
    monthly: {
      name: 'Business Starter',
      blurb: 'For solopreneurs & small teams',
      currency: 'USD',
      interval: 'monthly',
      amountCents: 2900,
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
      amountCents: 29000,
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
export function getDisplayPlanOrNull(key: string, period: string): UnifiedDisplayPlan | null {
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
