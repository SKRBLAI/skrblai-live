#!/usr/bin/env node

/**
 * validate-env.mjs
 * Validates required environment variables (Boost-first approach)
 */

const REQUIRED_ENV_VARS = [
  // Feature flags
  'FF_BOOST',
  'FF_CLERK',
  'FF_SITE_VERSION',
  'FF_N8N_NOOP',
  
  // Pricing
  'NEXT_PUBLIC_PRICE_MAP_JSON',
  
  // Supabase (Boost)
  'NEXT_PUBLIC_SUPABASE_URL_BOOST',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST',
  'SUPABASE_SERVICE_ROLE_KEY_BOOST',
  
  // Clerk
  'CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  
  // Stripe
  'STRIPE_SECRET_KEY',
  // STRIPE_WEBHOOK_SECRET is optional
];

function validateEnv() {
  console.log('🔍 Validating environment variables...\n');
  
  const missing = [];
  const present = [];
  
  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    } else {
      present.push(key);
    }
  }
  
  // Check optional vars
  const optionalVars = ['STRIPE_WEBHOOK_SECRET'];
  const optionalPresent = optionalVars.filter(key => process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ FAIL: Missing required environment variables:\n');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('');
    process.exit(1);
  }
  
  // Validate NEXT_PUBLIC_PRICE_MAP_JSON can be parsed
  try {
    const priceMapJson = process.env.NEXT_PUBLIC_PRICE_MAP_JSON;
    const priceMap = JSON.parse(priceMapJson);
    
    if (!priceMap || typeof priceMap !== 'object') {
      throw new Error('NEXT_PUBLIC_PRICE_MAP_JSON must be a valid JSON object');
    }
    
    console.log('✅ NEXT_PUBLIC_PRICE_MAP_JSON is valid JSON');
  } catch (error) {
    console.error('❌ FAIL: NEXT_PUBLIC_PRICE_MAP_JSON validation failed');
    console.error(`   Error: ${error.message}\n`);
    process.exit(1);
  }
  
  console.log(`✅ PASS: All ${present.length} required environment variables present`);
  if (optionalPresent.length > 0) {
    console.log(`ℹ️  Optional vars present: ${optionalPresent.join(', ')}`);
  }
  console.log('');
}

// Run validation
validateEnv();
