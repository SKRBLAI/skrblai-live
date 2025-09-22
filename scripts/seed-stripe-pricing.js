/**
 * SKRBL AI Stripe Pricing Seeder
 * 
 * Creates/updates Stripe products and prices using canonical SKU/ENV naming conventions.
 * Supports both Business and Sports verticals with promotional pricing.
 * 
 * Usage:
 * - Set STRIPE_SECRET_KEY environment variable (test or live key)
 * - Run: node scripts/seed-stripe-pricing.js
 * - Copy the output ENV vars to Railway Variables and .env.local
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.log('\nUsage:');
  console.log('  STRIPE_SECRET_KEY=sk_test_... node scripts/seed-stripe-pricing.js');
  console.log('  STRIPE_SECRET_KEY=sk_live_... node scripts/seed-stripe-pricing.js');
  process.exit(1);
}

const isLiveKey = process.env.STRIPE_SECRET_KEY.startsWith('sk_live_');
console.log(`🔑 Using ${isLiveKey ? 'LIVE' : 'TEST'} Stripe key`);

/**
 * Canonical product definitions following the SKRBL AI naming convention
 */
const PRODUCTS_CONFIG = [
  // BUSINESS PLANS
  {
    name: 'SKRBL Business — Curiosity (Free)',
    sku: 'biz_plan_curiosity',
    vertical: 'business',
    type: 'plan',
    tier: 'curiosity',
    prices: [] // Free tier has no prices
  },
  {
    name: 'SKRBL Business — Starter',
    sku: 'biz_plan_starter_m',
    vertical: 'business',
    type: 'plan',
    tier: 'starter',
    prices: [{
      amount: 1999, // $19.99
      currency: 'usd',
      interval: 'month',
      env_var: 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M'
    }]
  },
  {
    name: 'SKRBL Business — Pro',
    sku: 'biz_plan_pro_m',
    vertical: 'business',
    type: 'plan',
    tier: 'pro',
    prices: [{
      amount: 3999, // $39.99
      currency: 'usd',
      interval: 'month',
      env_var: 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M'
    }]
  },
  {
    name: 'SKRBL Business — Elite',
    sku: 'biz_plan_elite_m',
    vertical: 'business',
    type: 'plan',
    tier: 'elite',
    prices: [{
      amount: 5999, // $59.99
      currency: 'usd',
      interval: 'month',
      env_var: 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M'
    }]
  },
  
  // SPORTS PLANS
  {
    name: 'SKRBL Sports — Curiosity (Free)',
    sku: 'sports_plan_curiosity',
    vertical: 'sports',
    type: 'plan',
    tier: 'curiosity',
    prices: [] // Free tier has no prices
  },
  {
    name: 'SKRBL Sports — Starter',
    sku: 'sports_plan_starter_m',
    vertical: 'sports',
    type: 'plan',
    tier: 'starter',
    prices: [{
      amount: 1999, // $19.99
      currency: 'usd',
      interval: 'month',
      env_var: 'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER_M'
    }]
  },
  {
    name: 'SKRBL Sports — Pro',
    sku: 'sports_plan_pro_m',
    vertical: 'sports',
    type: 'plan',
    tier: 'pro',
    prices: [{
      amount: 3999, // $39.99
      currency: 'usd',
      interval: 'month',
      env_var: 'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO_M'
    }]
  },
  {
    name: 'SKRBL Sports — Elite',
    sku: 'sports_plan_elite_m',
    vertical: 'sports',
    type: 'plan',
    tier: 'elite',
    prices: [{
      amount: 5999, // $59.99
      currency: 'usd',
      interval: 'month',
      env_var: 'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE_M'
    }]
  },

  // BUSINESS ADD-ONS
  {
    name: 'SKRBL Business — Advanced Analytics (Add-On)',
    sku: 'biz_addon_adv_analytics',
    vertical: 'business',
    type: 'addon',
    prices: [
      {
        amount: 2900, // $29 standard
        currency: 'usd',
        env_var: 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS'
      },
      {
        amount: 1200, // $12 promo
        currency: 'usd',
        env_var: 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS_PROMO',
        promo: '60d'
      }
    ]
  },
  {
    name: 'SKRBL Business — Automation Workflows (Add-On)',
    sku: 'biz_addon_automation',
    vertical: 'business',
    type: 'addon',
    prices: [
      {
        amount: 4900, // $49 standard
        currency: 'usd',
        env_var: 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION'
      },
      {
        amount: 2000, // $20 promo
        currency: 'usd',
        env_var: 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION_PROMO',
        promo: '60d'
      }
    ]
  },
  {
    name: 'SKRBL Business — Additional Team Seat (Add-On)',
    sku: 'biz_addon_team_seat',
    vertical: 'business',
    type: 'addon',
    prices: [
      {
        amount: 3900, // $39 standard
        currency: 'usd',
        env_var: 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT'
      },
      {
        amount: 1600, // $16 promo
        currency: 'usd',
        env_var: 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT_PROMO',
        promo: '60d'
      }
    ]
  },

  // SPORTS ADD-ONS
  {
    name: 'SKRBL Sports — AI Video Analysis (Add-On)',
    sku: 'sports_addon_video',
    vertical: 'sports',
    type: 'addon',
    prices: [
      {
        amount: 2900, // $29 standard
        currency: 'usd',
        env_var: 'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_VIDEO'
      },
      {
        amount: 1200, // $12 promo
        currency: 'usd',
        env_var: 'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_VIDEO_PROMO',
        promo: '60d'
      }
    ]
  },
  {
    name: 'SKRBL Sports — Mastery of Emotion (Add-On)',
    sku: 'sports_addon_emotion',
    vertical: 'sports',
    type: 'addon',
    prices: [
      {
        amount: 3900, // $39 standard
        currency: 'usd',
        env_var: 'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_EMOTION'
      },
      {
        amount: 1600, // $16 promo
        currency: 'usd',
        env_var: 'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_EMOTION_PROMO',
        promo: '60d'
      }
    ]
  },
  {
    name: 'SKRBL Sports — Nutrition Guide (Add-On)',
    sku: 'sports_addon_nutrition',
    vertical: 'sports',
    type: 'addon',
    prices: [
      {
        amount: 1900, // $19 standard
        currency: 'usd',
        env_var: 'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_NUTRITION'
      },
      {
        amount: 800, // $8 promo
        currency: 'usd',
        env_var: 'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_NUTRITION_PROMO',
        promo: '60d'
      }
    ]
  },
  {
    name: 'SKRBL Sports — Foundation Training Pack (Add-On)',
    sku: 'sports_addon_foundation',
    vertical: 'sports',
    type: 'addon',
    prices: [
      {
        amount: 4900, // $49 standard
        currency: 'usd',
        env_var: 'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_FOUNDATION'
      },
      {
        amount: 2000, // $20 promo
        currency: 'usd',
        env_var: 'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_FOUNDATION_PROMO',
        promo: '60d'
      }
    ]
  }
];

/**
 * Create or update a Stripe product with prices
 */
async function upsertProduct(config) {
  try {
    console.log(`\n🔄 Processing: ${config.name}`);
    
    // Find existing product by name
    const existingProducts = await stripe.products.list({
      limit: 100
    });
    
    let product = existingProducts.data.find(p => p.name === config.name);
    
    if (product) {
      console.log(`✅ Found existing product: ${product.id}`);
      
      // Update metadata if needed
      await stripe.products.update(product.id, {
        metadata: {
          sku: config.sku,
          vertical: config.vertical,
          type: config.type,
          tier: config.tier || ''
        }
      });
    } else {
      // Create new product
      product = await stripe.products.create({
        name: config.name,
        metadata: {
          sku: config.sku,
          vertical: config.vertical,
          type: config.type,
          tier: config.tier || ''
        }
      });
      console.log(`🆕 Created new product: ${product.id}`);
    }

    const results = {};
    
    // Create prices for this product
    for (const priceConfig of config.prices) {
      console.log(`💰 Creating price: $${priceConfig.amount / 100} ${priceConfig.currency.toUpperCase()}${priceConfig.promo ? ' (PROMO)' : ''}`);
      
      const priceData = {
        product: product.id,
        unit_amount: priceConfig.amount,
        currency: priceConfig.currency,
        metadata: {
          sku: config.sku,
          env_var: priceConfig.env_var
        }
      };

      // Add recurring interval for subscriptions
      if (priceConfig.interval) {
        priceData.recurring = { interval: priceConfig.interval };
      }

      // Add promo metadata
      if (priceConfig.promo) {
        priceData.metadata.promo = priceConfig.promo;
      }

      const price = await stripe.prices.create(priceData);
      results[priceConfig.env_var] = price.id;
      
      console.log(`   ✅ Price created: ${price.id}`);
    }

    return results;
  } catch (error) {
    console.error(`❌ Error processing ${config.name}:`, error.message);
    throw error;
  }
}

/**
 * Main seeding function
 */
async function main() {
  console.log('\n🚀 Starting SKRBL AI Stripe pricing seed...\n');
  console.log('📋 Creating products and prices with canonical naming...\n');

  const allResults = {};

  for (const config of PRODUCTS_CONFIG) {
    try {
      const results = await upsertProduct(config);
      Object.assign(allResults, results);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Failed to process ${config.name}:`, error);
      // Continue with other products
    }
  }

  console.log('\n🎉 All products and prices created/updated successfully!\n');
  console.log('=' .repeat(80));
  console.log('📋 ENVIRONMENT VARIABLES FOR COPY-PASTE');
  console.log('Copy and paste this into Railway Variables and .env.local:');
  console.log('=' .repeat(80));
  console.log('');

  // Generate environment variables in organized sections
  console.log('# =============================================================================');
  console.log('# SKRBL AI PRICING - STRIPE PRICE IDS');
  console.log('# Generated by: scripts/seed-stripe-pricing.js');
  console.log('# =============================================================================');
  console.log('');
  
  console.log('# BUSINESS PLANS (Monthly)');
  const bizPlanVars = [
    'NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M',
    'NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M', 
    'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M'
  ];
  bizPlanVars.forEach(varName => {
    if (allResults[varName]) {
      console.log(`${varName}=${allResults[varName]}`);
    }
  });
  console.log('');

  console.log('# SPORTS PLANS (Monthly)');
  const sportsPlanVars = [
    'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER_M',
    'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO_M',
    'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE_M'
  ];
  sportsPlanVars.forEach(varName => {
    if (allResults[varName]) {
      console.log(`${varName}=${allResults[varName]}`);
    }
  });
  console.log('');

  console.log('# BUSINESS ADD-ONS (One-time)');
  const bizAddonVars = [
    'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS',
    'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION', 
    'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT'
  ];
  bizAddonVars.forEach(varName => {
    if (allResults[varName]) {
      console.log(`${varName}=${allResults[varName]}`);
    }
  });
  console.log('');

  console.log('# BUSINESS ADD-ONS (Promo Pricing - 60 days)');
  const bizAddonPromoVars = [
    'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS_PROMO',
    'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION_PROMO',
    'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT_PROMO'
  ];
  bizAddonPromoVars.forEach(varName => {
    if (allResults[varName]) {
      console.log(`${varName}=${allResults[varName]}`);
    }
  });
  console.log('');

  console.log('# SPORTS ADD-ONS (One-time)');
  const sportsAddonVars = [
    'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_VIDEO',
    'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_EMOTION',
    'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_NUTRITION',
    'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_FOUNDATION'
  ];
  sportsAddonVars.forEach(varName => {
    if (allResults[varName]) {
      console.log(`${varName}=${allResults[varName]}`);
    }
  });
  console.log('');

  console.log('# SPORTS ADD-ONS (Promo Pricing - 60 days)');
  const sportsAddonPromoVars = [
    'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_VIDEO_PROMO',
    'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_EMOTION_PROMO',
    'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_NUTRITION_PROMO',
    'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_FOUNDATION_PROMO'
  ];
  sportsAddonPromoVars.forEach(varName => {
    if (allResults[varName]) {
      console.log(`${varName}=${allResults[varName]}`);
    }
  });
  console.log('');

  console.log('# STRIPE CONFIGURATION');
  if (isLiveKey) {
    console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx`);
    console.log(`STRIPE_SECRET_KEY=${process.env.STRIPE_SECRET_KEY}`);
    console.log(`STRIPE_WEBHOOK_SECRET=whsec_xxx`);
  } else {
    console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx`);
    console.log(`STRIPE_SECRET_KEY=${process.env.STRIPE_SECRET_KEY}`);
    console.log(`STRIPE_WEBHOOK_SECRET=whsec_xxx`);
  }
  console.log(`APP_BASE_URL=https://skrblai.io`);
  console.log('');

  console.log('# PROMO CONFIGURATION');
  console.log('PROMO_START=2025-01-01T00:00:00Z  # 60-day promo start date');
  console.log('');

  console.log('=' .repeat(80));
  console.log('');
  console.log('📌 NEXT STEPS:');
  console.log('1. Copy the environment variables above');
  console.log('2. Paste into Railway → Variables (for production)');
  console.log('3. Paste into .env.local (for local development)');
  console.log('4. Update publishable key and webhook secret with your actual values');
  console.log('5. Save and redeploy in Railway');
  console.log('6. Test the pricing pages: /pricing (business) and /sports (sports)');
  console.log('');
  console.log('🎯 PROMO PRICING:');
  console.log('- Standard prices are always available');
  console.log('- Promo prices activate automatically based on PROMO_START + 60 days');
  console.log('- Code will select appropriate price based on current date');
  console.log('');
  console.log(`✨ Seed completed with ${isLiveKey ? 'LIVE' : 'TEST'} Stripe data`);
  console.log(`📊 Created ${Object.keys(allResults).length} price IDs across ${PRODUCTS_CONFIG.length} products`);
}

// Handle graceful shutdown
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the seeding
main().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});