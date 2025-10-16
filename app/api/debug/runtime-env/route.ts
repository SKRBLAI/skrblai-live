import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Runtime diagnostic endpoint to verify environment variables in production
 * Safe for production - only shows which vars are present/missing, not values
 */
export async function GET(request: NextRequest) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    
    // Stripe Configuration
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY ? '✅ Present' : '❌ Missing',
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Present' : '❌ Missing',
      apiVersion: process.env.STRIPE_API_VERSION || 'Using default',
      enableStripe: process.env.NEXT_PUBLIC_ENABLE_STRIPE || 'true (default)',
      fallbackLinks: process.env.NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS || 'false (default)',
    },
    
    // Sample Price IDs (check a few key ones)
    stripePrices: {
      bizStarter: process.env.NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M ? '✅ Present' : '❌ Missing',
      bizPro: process.env.NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M ? '✅ Present' : '❌ Missing',
      sportsRookie: process.env.NEXT_PUBLIC_STRIPE_PRICE_ROOKIE ? '✅ Present' : '❌ Missing',
      sportsPro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ? '✅ Present' : '❌ Missing',
    },
    
    // Supabase Configuration
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Present' : '❌ Missing',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing',
      serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing',
    },
    
    // Captcha Configuration
    captcha: {
      siteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ? '✅ Present' : '❌ Missing',
      secret: process.env.HCAPTCHA_SECRET ? '✅ Present' : '❌ Missing',
      status: (!process.env.HCAPTCHA_SECRET && !process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY) 
        ? '🟢 Disabled (as intended)' 
        : '⚠️ Partially configured',
    },
    
    // Build-time vs Runtime check
    buildInfo: {
      stripeEnabledAtBuildTime: process.env.NEXT_PUBLIC_ENABLE_STRIPE === undefined 
        ? '⚠️ Not set (using default: true)' 
        : `Set to: ${process.env.NEXT_PUBLIC_ENABLE_STRIPE}`,
      note: 'NEXT_PUBLIC_* vars are embedded at BUILD time. If you added them after the last build, trigger a new deployment.',
    }
  };
  
  return NextResponse.json(diagnostics, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  });
}

