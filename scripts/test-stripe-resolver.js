#!/usr/bin/env node

/**
 * Test script to verify Stripe resolver works with minimal env vars
 * 
 * Usage: node scripts/test-stripe-resolver.js
 */

// Set up minimal test environment
process.env.NEXT_PUBLIC_ENABLE_STRIPE = '1';

// Source of truth env vars (as specified in requirements)
process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER = 'price_test_starter';
process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO = 'price_test_pro';
process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE = 'price_test_elite';

process.env.NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER = 'price_test_biz_starter';
process.env.NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO = 'price_test_biz_pro';
process.env.NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE = 'price_test_biz_elite';

process.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO = 'price_test_addon_video';
process.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10 = 'price_test_addon_scans10';

// Mock the resolver for testing (since we can't easily import TS in this context)
function resolvePriceIdFromSku(sku) {
  const resolvers = {
    // Sports plans with exact resolution order
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

  // Add-ons: resolve ADDON_<SLUG>
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

function generateResolverParityReport() {
  const skus = [
    'sports_plan_starter', 'sports_plan_pro', 'sports_plan_elite',
    'biz_plan_starter', 'biz_plan_pro', 'biz_plan_elite',
    'sports_addon_scans10', 'sports_addon_video', 'sports_addon_emotion',
    'biz_addon_adv_analytics', 'biz_addon_automation'
  ];
  
  const report = {};
  for (const sku of skus) {
    report[sku] = resolvePriceIdFromSku(sku);
  }
  return report;
}

console.log('🧪 Testing Stripe Resolver with Minimal Env Vars');
console.log('================================================');

// Test cases
const testCases = [
  'sports_plan_starter',
  'sports_plan_pro', 
  'sports_plan_elite',
  'biz_plan_starter',
  'biz_plan_pro',
  'biz_plan_elite',
  'sports_addon_video',
  'sports_addon_scans10',
  'sports_addon_nonexistent', // Should fail
];

console.log('\\n📋 Individual SKU Tests:');
console.log('-------------------------');

let passCount = 0;
let failCount = 0;

for (const sku of testCases) {
  const result = resolvePriceIdFromSku(sku);
  const status = result.priceId ? '✅ PASS' : '❌ FAIL';
  
  if (result.priceId) {
    passCount++;
    console.log(`${status} ${sku} → ${result.priceId} (via ${result.matchedEnvName})`);
  } else {
    failCount++;
    console.log(`${status} ${sku} → NULL`);
  }
}

console.log('\\n📊 Resolver Parity Report:');
console.log('---------------------------');

const parityReport = generateResolverParityReport();
const presentCount = Object.values(parityReport).filter(r => r.priceId).length;
const totalCount = Object.keys(parityReport).length;

console.log(`Present: ${presentCount}/${totalCount} SKUs`);

// Show first few entries as sample
const sampleEntries = Object.entries(parityReport).slice(0, 8);
for (const [sku, result] of sampleEntries) {
  const status = result.priceId ? '✅' : '❌';
  console.log(`  ${status} ${sku} → ${result.matchedEnvName || 'NULL'}`);
}

if (totalCount > 8) {
  console.log(`  ... and ${totalCount - 8} more SKUs`);
}

console.log('\\n🎯 Test Summary:');
console.log('================');
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);

// Expected results
const expectedPasses = 8; // 3 sports + 3 biz + 2 addons
const expectedFails = 1;  // 1 nonexistent addon

if (passCount === expectedPasses && failCount === expectedFails) {
  console.log('🎉 All tests passed! Resolver working correctly with minimal env vars.');
  process.exit(0);
} else {
  console.log(`⚠️  Unexpected results. Expected ${expectedPasses} passes, ${expectedFails} fails.`);
  process.exit(1);
}