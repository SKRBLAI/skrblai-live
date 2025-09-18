/**
 * Stripe Pricing Seeder
 * 
 * Run with: node scripts/seed-stripe-pricing.js
 * 
 * This script creates/updates Stripe products and prices using lookup_key
 * for the new Sports pricing structure. It outputs environment variables
 * that can be pasted into Railway Variables and .env.local files.
 * 
 * Usage:
 * - Set STRIPE_SECRET_KEY environment variable (test or live key)
 * - Run: node scripts/seed-stripe-pricing.js
 * - Copy the output to Railway Variables (and .env.local for dev)
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

// Sports pricing structure as specified
const SPORTS_PRODUCTS = [
  {
    name: 'Sports Starter Plan',
    description: '3 scans/month with AI Performance Analysis, 5 Quick Wins, Free eBook: Emotional Mastery in Athletics',
    lookup_key: 'plan.sports.starter.monthly.9_99',
    unit_amount: 999, // $9.99
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: {
      plan_type: 'sports_starter',
      scans_per_month: '3',
      quick_wins: '5',
      includes_analysis: 'true'
    }
  },
  {
    name: 'Sports Pro Plan (Beta Special)',
    description: '10 scans/month with AI Performance Analysis, Customized 4-week training plan (PDF), 10 SkillSmith Personalized Quick Wins',
    lookup_key: 'plan.sports.pro.monthly.beta_19_99',
    unit_amount: 1999, // $19.99 (Beta Special, originally $39)
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: {
      plan_type: 'sports_pro',
      scans_per_month: '10',
      quick_wins: '10',
      includes_analysis: 'true',
      beta_special: 'true',
      original_price: '3900'
    }
  },
  {
    name: 'Sports Elite Plan (Beta Special)',
    description: '30 scans/month with AI Performance Analysis, Unlimited SkillSmith chat access, 4-week Nutrition Plan + 4-week Training Program, 15 Quick Wins',
    lookup_key: 'plan.sports.elite.monthly.beta_59_99',
    unit_amount: 5999, // $59.99 (Beta Special, originally $79)
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: {
      plan_type: 'sports_elite',
      scans_per_month: '30',
      quick_wins: '15',
      includes_analysis: 'true',
      unlimited_chat: 'true',
      beta_special: 'true',
      original_price: '7900'
    }
  },
  {
    name: 'Sports Add-On: Flat 10 Scans',
    description: 'One-time purchase: 10 additional scans with basic analysis + 3 Quick Wins',
    lookup_key: 'addon.sports.scans10.onetime.9_99',
    unit_amount: 999, // $9.99
    currency: 'usd',
    recurring: null, // One-time payment
    metadata: {
      addon_type: 'sports_scans',
      scan_count: '10',
      quick_wins: '3',
      one_time: 'true'
    }
  }
];

async function upsertProduct(productData) {
  try {
    // Try to find existing product by lookup_key
    const prices = await stripe.prices.list({
      lookup_keys: [productData.lookup_key],
      limit: 1
    });

    let product;
    let price;

    if (prices.data.length > 0) {
      // Product exists, get it
      price = prices.data[0];
      product = await stripe.products.retrieve(price.product);
      console.log(`✅ Found existing product: ${product.name}`);
    } else {
      // Create new product
      product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: productData.metadata
      });
      console.log(`🆕 Created new product: ${product.name}`);
    }

    // Create or update price
    if (!price || price.unit_amount !== productData.unit_amount) {
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
    } else {
      console.log(`✅ Price up to date: ${price.id}`);
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
  console.log('\n🚀 Starting Stripe pricing seed...\n');

  const results = {};

  for (const productData of SPORTS_PRODUCTS) {
    console.log(`Processing: ${productData.name}...`);
    const result = await upsertProduct(productData);
    results[productData.lookup_key] = result.price.id;
    console.log('');
  }

  console.log('🎉 All products and prices created/updated successfully!\n');
  console.log('=' .repeat(80));
  console.log('📋 ENVIRONMENT VARIABLES');
  console.log('Copy and paste this into Railway Variables and .env.local:');
  console.log('=' .repeat(80));
  console.log('');

  // Generate environment variables
  console.log('# Sports Pricing - Stripe Price IDs');
  console.log(`NEXT_PUBLIC_STRIPE_PRICE_ROOKIE=${results['plan.sports.starter.monthly.9_99']}`);
  console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRO=${results['plan.sports.pro.monthly.beta_19_99']}`);
  console.log(`NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR=${results['plan.sports.elite.monthly.beta_59_99']}`);
  console.log('# Optional if code still references:');
  console.log('# NEXT_PUBLIC_STRIPE_PRICE_YEARLY=unset');
  console.log('');
  console.log('# Sports Add-Ons');
  console.log(`NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10=${results['addon.sports.scans10.onetime.9_99']}`);
  console.log('');
  console.log('# Required Stripe Configuration');
  console.log(`APP_BASE_URL=https://skrblai.io`);
  
  if (isLiveKey) {
    console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx`);
    console.log(`STRIPE_SECRET_KEY=${process.env.STRIPE_SECRET_KEY}`);
    console.log(`STRIPE_WEBHOOK_SECRET=whsec_xxx`);
  } else {
    console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx`);
    console.log(`STRIPE_SECRET_KEY=${process.env.STRIPE_SECRET_KEY}`);
    console.log(`STRIPE_WEBHOOK_SECRET=whsec_xxx`);
  }
  
  console.log('NEXT_PUBLIC_HP_GUIDE_STAR=1');
  console.log('');
  console.log('=' .repeat(80));
  console.log('');
  console.log('📌 Next Steps:');
  console.log('1. Copy the environment variables above');
  console.log('2. Paste into Railway → Variables (for production)');
  console.log('3. Paste into .env.local (for local development)');
  console.log('4. Update publishable key and webhook secret with your actual values');
  console.log('5. Save and redeploy in Railway');
  console.log('6. Test the pricing pages: /sports and /pricing');
  console.log('');
  console.log(`✨ Seed completed with ${isLiveKey ? 'LIVE' : 'TEST'} Stripe data`);
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