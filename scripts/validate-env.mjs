#!/usr/bin/env node
/**
 * SKRBL AI - Environment Variable Validator
 * Checks for required environment variables (Boost-first, legacy fallback allowed)
 */

const REQUIRED_VARS = {
  // Feature Flags
  'FF_BOOST': { description: 'Boost mode feature flag', required: true },
  'FF_CLERK': { description: 'Clerk auth feature flag', required: true },
  'FF_SITE_VERSION': { description: 'Site version flag', required: true },
  'FF_N8N_NOOP': { description: 'n8n no-op mode flag', required: true },
  
  // Pricing
  'NEXT_PUBLIC_PRICE_MAP_JSON': { description: 'Price map JSON', required: true, validate: validateJSON },
  
  // Supabase (Boost-first)
  'NEXT_PUBLIC_SUPABASE_URL_BOOST': { description: 'Supabase URL (Boost)', required: true },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST': { description: 'Supabase Anon Key (Boost)', required: true },
  'SUPABASE_SERVICE_ROLE_KEY_BOOST': { description: 'Supabase Service Role Key (Boost)', required: true },
  
  // Clerk Auth
  'CLERK_PUBLISHABLE_KEY': { description: 'Clerk Publishable Key', required: true },
  'CLERK_SECRET_KEY': { description: 'Clerk Secret Key', required: true },
  
  // Stripe
  'STRIPE_SECRET_KEY': { description: 'Stripe Secret Key', required: true },
  'STRIPE_WEBHOOK_SECRET': { description: 'Stripe Webhook Secret', required: false }
};

/**
 * Validate JSON string
 */
function validateJSON(value) {
  try {
    JSON.parse(value);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid JSON' };
  }
}

/**
 * Check environment variables and generate report
 */
function checkEnvironment() {
  const results = [];
  let hasErrors = false;

  console.log('\n📋 Environment Variable Check\n');
  console.log('┌─────────────────────────────────────────┬──────────┬─────────────────────┐');
  console.log('│ Variable                                │ Status   │ Notes               │');
  console.log('├─────────────────────────────────────────┼──────────┼─────────────────────┤');

  for (const [varName, config] of Object.entries(REQUIRED_VARS)) {
    const value = process.env[varName];
    const isPresent = !!value;
    
    let status = '✅ OK';
    let notes = config.description;

    if (!isPresent && config.required) {
      status = '❌ MISSING';
      notes = 'Required!';
      hasErrors = true;
    } else if (!isPresent && !config.required) {
      status = '⚠️  OPTIONAL';
      notes = 'Not set';
    } else if (isPresent && config.validate) {
      const validation = config.validate(value);
      if (!validation.valid) {
        status = '❌ INVALID';
        notes = validation.error;
        hasErrors = true;
      }
    }

    // Format row
    const varPadded = varName.padEnd(39);
    const statusPadded = status.padEnd(8);
    const notesPadded = notes.substring(0, 19).padEnd(19);
    
    console.log(`│ ${varPadded} │ ${statusPadded} │ ${notesPadded} │`);
    
    results.push({ varName, isPresent, status, notes });
  }

  console.log('└─────────────────────────────────────────┴──────────┴─────────────────────┘\n');

  return { results, hasErrors };
}

/**
 * Main execution
 */
function main() {
  const { results, hasErrors } = checkEnvironment();

  if (hasErrors) {
    console.error('❌ Environment validation failed! Missing or invalid required variables.\n');
    console.error('💡 Check your .env file or Railway environment variables.\n');
    process.exit(1);
  }

  console.log('✅ All required environment variables are present and valid.\n');
  process.exit(0);
}

main();
