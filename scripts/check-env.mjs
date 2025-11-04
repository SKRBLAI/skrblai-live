#!/usr/bin/env node

/**
 * Environment variable validation script
 * Exits with non-zero code if any required variables are missing
 */

const REQUIRED_KEYS = [
  // BASE
  'NODE_ENV',
  'NEXT_TELEMETRY_DISABLED',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_BASE_URL',
  'APP_BASE_URL',
  // AUTH - Clerk
  'NEXT_PUBLIC_FF_CLERK',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'CLERK_WEBHOOK_SECRET',
  // AUTH - Supabase Boost
  'NEXT_PUBLIC_FF_USE_BOOST',
  'NEXT_PUBLIC_SUPABASE_URL_BOOST',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST',
  'SUPABASE_SERVICE_ROLE_KEY_BOOST',
  // Encryption
  'ENCRYPTION_SECRET',
  // STRIPE
  'NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_API_VERSION',
  'NEXT_PUBLIC_PRICE_MAP_JSON',
  // N8N
  'NEXT_PUBLIC_FF_N8N',
  'N8N_BASE_URL',
  'N8N_API_KEY',
  // AI / CLOUD
  'OPENAI_API_KEY',
  'OPENAI_MODEL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  // ANALYTICS
  'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  // HCAPTCHA
  'NEXT_PUBLIC_HCAPTCHA_SITEKEY',
  'HCAPTCHA_SECRET',
  // EMAIL
  'RESEND_API_KEY',
  // PERFORMANCE
  'NEXT_PUBLIC_FF_PERCY_OPTIMIZED',
  // APP POLICY
  'NEXT_PUBLIC_DAILY_SCAN_LIMIT',
  'IRA_ALLOWED_EMAILS',
];

function main() {
  const missing = REQUIRED_KEYS.filter(key => !process.env[key] || process.env[key].trim() === '');
  let priceMapOk = true;
  try {
    JSON.parse(process.env['NEXT_PUBLIC_PRICE_MAP_JSON'] || '');
  } catch (e) {
    priceMapOk = false;
  }
  if (missing.length > 0) {
    console.error('\u274C Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    process.exit(1);
  }
  if (!priceMapOk) {
    console.error('\u274C NEXT_PUBLIC_PRICE_MAP_JSON is not valid JSON');
    process.exit(1);
  }
  console.log('\u2705 All required environment variables are present and valid.');
  process.exit(0);
}

main();


const missingVars = requiredVars.filter(varName => {
  const value = process.env[varName];
  return !value || value.trim() === '';
});

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1);
}

console.log('✅ All required environment variables are present');
process.exit(0);