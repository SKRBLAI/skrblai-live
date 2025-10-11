// Temporary diagnostic script to test Stripe price resolver
const path = require('path');

// Set up basic environment for testing
process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER = 'price_test_starter';
process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO = 'price_test_pro';
process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE = 'price_test_elite';
process.env.NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER = 'price_test_biz_starter';
process.env.NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO = 'price_test_biz_pro';
process.env.NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE = 'price_test_biz_elite';
process.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO = 'price_test_addon_video';
process.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10 = 'price_test_addon_scans10';

console.log('=== STRIPE SKU DIAGNOSTICS ===');
console.log('Testing price resolution with mock environment variables...\n');

// Test the resolver logic manually
function resolvePriceIdFromSku(sku) {
  const resolvers = {
    // Sports plans with exact resolution order specified:
    sports_plan_starter: () => {
      const keys = [
        'NEXT_PUBLIC_STRIPE_PRICE_STARTER',
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER',
        'NEXT_PUBLIC_STRIPE_PRICE_ROOKIE',
        'NEXT_PUBLIC_STRIPE_PRICE_STARTER_M',
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER_M',
        'NEXT_PUBLIC_STRIPE_PRICE_ROOKIE_M'
      ];
      return resolveWithKeys(keys);
    },

    sports_plan_pro: () => {
      const keys = [
        'NEXT_PUBLIC_STRIPE_PRICE_PRO',
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO',
        'NEXT_PUBLIC_STRIPE_PRICE_PRO_M',
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO_M'
      ];
      return resolveWithKeys(keys);
    },

    sports_plan_elite: () => {
      const keys = [
        'NEXT_PUBLIC_STRIPE_PRICE_ELITE',
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE',
        'NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR',
        'NEXT_PUBLIC_STRIPE_PRICE_ELITE_M',
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE_M',
        'NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR_M'
      ];
      return resolveWithKeys(keys);
    },

    // Business plans
    biz_plan_starter: () => {
      const keys = [
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER',
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M'
      ];
      return resolveWithKeys(keys);
    },

    biz_plan_pro: () => {
      const keys = [
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO',
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M'
      ];
      return resolveWithKeys(keys);
    },

    biz_plan_elite: () => {
      const keys = [
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE',
        'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M'
      ];
      return resolveWithKeys(keys);
    }
  };

  // Add-ons: resolve NEXT_PUBLIC_STRIPE_PRICE_ADDON_<SLUG> only; allow _M optionally
  const addonMatch = sku.match(/^(sports_addon_|biz_addon_)(.+)$/);
  if (addonMatch) {
    const [, prefix, slug] = addonMatch;
    const slugUpper = slug.toUpperCase();

    if (prefix === 'sports_addon_') {
      const keys = [
        `NEXT_PUBLIC_STRIPE_PRICE_ADDON_${slugUpper}`,
        `NEXT_PUBLIC_STRIPE_PRICE_ADDON_${slugUpper}_M`
      ];
      return resolveWithKeys(keys);
    } else if (prefix === 'biz_addon_') {
      const keys = [
        `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_${slugUpper}`,
        `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_${slugUpper}_M`
      ];
      return resolveWithKeys(keys);
    }
  }

  const resolver = resolvers[sku];
  if (resolver) {
    return resolver();
  }

  return { priceId: null, matchedEnvName: null };
}

function resolveWithKeys(keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return {
        priceId: value.trim(),
        matchedEnvName: key
      };
    }
  }
  return { priceId: null, matchedEnvName: null };
}

function getSupportedSkus() {
  return [
    // Sports plans
    'sports_plan_starter',
    'sports_plan_pro',
    'sports_plan_elite',

    // Business plans
    'biz_plan_starter',
    'biz_plan_pro',
    'biz_plan_elite',
    'biz_plan_starter_m',
    'biz_plan_pro_m',
    'biz_plan_elite_m',

    // Sports add-ons (examples)
    'sports_addon_scans10',
    'sports_addon_video',
    'sports_addon_emotion',
    'sports_addon_nutrition',
    'sports_addon_foundation',

    // Business add-ons (examples)
    'biz_addon_adv_analytics',
    'biz_addon_automation',
    'biz_addon_team_seat'
  ];
}

console.log('Supported SKUs:');
const skus = getSupportedSkus();
skus.forEach(sku => console.log('  -', sku));

console.log('\nResolver Results:');
skus.forEach(sku => {
  const result = resolvePriceIdFromSku(sku);
  console.log(`${sku}: ${result.priceId ? '✅ ' + result.priceId : '❌ MISSING'} (matched: ${result.matchedEnvName || 'none'})`);
});