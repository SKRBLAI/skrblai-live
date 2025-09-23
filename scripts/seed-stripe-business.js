/**
 * Stripe Business Pricing Seeder
 * 
 * Run with: node scripts/seed-stripe-business.js
 * 
 * This script creates/updates Stripe products and prices for Business plans
 * and add-ons. It outputs environment variables that can be pasted into 
 * Railway Variables and .env.local files.
 * 
 * Usage:
 * - Set STRIPE_SECRET_KEY environment variable (test or live key)
 * - Run: node scripts/seed-stripe-business.js
 * - Copy the output to Railway Variables (and .env.local for dev)
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.log('\nUsage:');
  console.log('  STRIPE_SECRET_KEY=sk_test_... node scripts/seed-stripe-business.js');
  console.log('  STRIPE_SECRET_KEY=sk_live_... node scripts/seed-stripe-business.js');
  process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  console.error('❌ STRIPE_SECRET_KEY must start with sk_');
  process.exit(1);
}

const isLiveKey = process.env.STRIPE_SECRET_KEY.startsWith('sk_live_');
console.log(`🔑 Using ${isLiveKey ? 'LIVE' : 'TEST'} Stripe key`);

// Business pricing structure as specified
const BUSINESS_PRODUCTS = [
  {
    name: 'Business Starter Plan',
    description: 'Essential business automation tools for growing companies',
    lookup_key: 'plan.business.starter.monthly.19_99',
    unit_amount: 1999, // $19.99
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: {
      plan_type: 'business_starter',
      vertical: 'business'
    }
  },
  {
    name: 'Business Pro Plan',
    description: 'Advanced business intelligence and automation features',
    lookup_key: 'plan.business.pro.monthly.39_99',
    unit_amount: 3999, // $39.99
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: {
      plan_type: 'business_pro',
      vertical: 'business'
    }
  },
  {
    name: 'Business Elite Plan',
    description: 'Complete business automation suite with premium features',
    lookup_key: 'plan.business.elite.monthly.59_99',
    unit_amount: 5999, // $59.99
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: {
      plan_type: 'business_elite',
      vertical: 'business'
    }
  },
  {
    name: 'Business Add-On: Advanced Analytics',
    description: 'One-time purchase: Advanced business analytics and reporting tools',
    lookup_key: 'addon.business.analytics.onetime.29_00',
    unit_amount: 2900, // $29.00
    currency: 'usd',
    recurring: null, // One-time payment
    metadata: {
      addon_type: 'business_analytics',
      vertical: 'business',
      one_time: 'true'
    }
  },
  {
    name: 'Business Add-On: Automation Workflows',
    description: 'One-time purchase: Advanced automation workflow templates and tools',
    lookup_key: 'addon.business.automations.onetime.49_00',
    unit_amount: 4900, // $49.00
    currency: 'usd',
    recurring: null, // One-time payment
    metadata: {
      addon_type: 'business_automations',
      vertical: 'business',
      one_time: 'true'
    }
  },
  {
    name: 'Business Add-On: Additional Team Seat',
    description: 'One-time purchase: Additional team member access and collaboration tools',
    lookup_key: 'addon.business.team_seat.onetime.13_00',
    unit_amount: 1300, // $13.00
    currency: 'usd',
    recurring: null, // One-time payment
    metadata: {
      addon_type: 'business_team_seat',
      vertical: 'business',
      one_time: 'true'
    }
  }
];

async function upsertProduct(productData) {
  try {
    // Try to find existing product by name first
    const products = await stripe.products.search({
      query: `name:"${productData.name}"`,
      limit: 1
    });

    let product;
    let price;

    if (products.data.length > 0) {
      // Product exists, get it
      product = products.data[0];
      console.log(`✅ Found existing product: ${product.name}`);
      
      // Check if we have a price with this lookup_key
      const prices = await stripe.prices.list({
        lookup_keys: [productData.lookup_key],
        limit: 1
      });
      
      if (prices.data.length > 0) {
        price = prices.data[0];
        console.log(`✅ Found existing price: ${price.id}`);
      }
    } else {
      // Create new product
      product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: productData.metadata
      });
      console.log(`🆕 Created new product: ${product.name}`);
    }

    // Create new price (always create new prices, don't mutate existing)
    if (!price) {
      const priceData = {
        product: product.id,
        unit_amount: productData.unit_amount,
        currency: productData.currency,
        lookup_key: productData.lookup_key,
        metadata: productData.metadata
      };

      if (productData.recurring) {
        priceData.recurring = productData.recurring;
      }

      price = await stripe.prices.create(priceData);
      console.log(`💰 Created new price: ${price.id} (${productData.unit_amount / 100} ${productData.currency.toUpperCase()})`);
    }

    return {
      product,
      price,
      lookup_key: productData.lookup_key
    };
  } catch (error) {
    console.error(`❌ Error with product ${productData.name}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('\n🚀 Starting Business Stripe pricing seed...\n');

  const results = {};

  for (const productData of BUSINESS_PRODUCTS) {
    console.log(`Processing: ${productData.name}...`);
    const result = await upsertProduct(productData);
    results[productData.lookup_key] = result.price.id;
    console.log('');
  }

  console.log('🎉 All Business products and prices created/updated successfully!\n');

  // Print only the ENV block as specified
  console.log('# Business Plans');
  console.log(`NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER=${results['plan.business.starter.monthly.19_99']}`);
  console.log(`NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO=${results['plan.business.pro.monthly.39_99']}`);
  console.log(`NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE=${results['plan.business.elite.monthly.59_99']}`);
  console.log('');
  console.log('# Business Add-Ons');
  console.log(`NEXT_PUBLIC_STRIPE_PRICE_ADDON_BIZ_ANALYTICS=${results['addon.business.analytics.onetime.29_00']}`);
  console.log(`NEXT_PUBLIC_STRIPE_PRICE_ADDON_BIZ_AUTOMATIONS=${results['addon.business.automations.onetime.49_00']}`);
  console.log(`NEXT_PUBLIC_STRIPE_PRICE_ADDON_BIZ_TEAM_SEAT=${results['addon.business.team_seat.onetime.13_00']}`);
  console.log('');
}

// Handle graceful shutdown
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the seeding
main().catch((error) => {
  console.error('❌ Business seeding failed:', error);
  process.exit(1);
});