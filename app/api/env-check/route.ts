import { NextResponse } from "next/server";
import { readEnvAny } from "@/lib/env/readEnvAny";
import { 
  resolvePriceIdFromSku, 
  getSupportedSkus, 
  generateResolverParityReport 
} from "@/lib/stripe/priceResolver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface EnvStatus {
  [key: string]: string; // Now supports "PRESENT via KEY_NAME" or "MISSING"
}

interface EnvCheckResponse {
  ok: boolean;
  stripe: EnvStatus;
  supabase: EnvStatus;
  general: EnvStatus;
  captcha: EnvStatus;
  priceIds: {
    sports: EnvStatus;
    business: EnvStatus;
    addons: EnvStatus;
  };
  resolverParity: Record<string, {
    priceId: string | null;
    matchedEnvName: string | null;
    status: 'PRESENT' | 'MISSING';
  }>;
  notes: string[];
}

function checkEnvVar(key: string): 'PRESENT' | 'MISSING' {
  const value = process.env[key];
  return (value && value.trim().length > 0) ? 'PRESENT' : 'MISSING';
}

function checkEnvAny(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return `PRESENT via ${key}`;
    }
  }
  return 'MISSING';
}

export async function GET() {
  try {
    // Core Stripe configuration
    const stripe: EnvStatus = {
      NEXT_PUBLIC_ENABLE_STRIPE: checkEnvVar('NEXT_PUBLIC_ENABLE_STRIPE'),
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: checkEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
      STRIPE_SECRET_KEY: checkEnvVar('STRIPE_SECRET_KEY'),
      STRIPE_WEBHOOK_SECRET: checkEnvVar('STRIPE_WEBHOOK_SECRET'),
    };

    // Supabase configuration with dual key lookup
    const supabase: EnvStatus = {
      SUPABASE_URL: checkEnvAny('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'),
      SUPABASE_ANON_KEY: checkEnvAny('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ANON_KEY'),
      SUPABASE_SERVICE_ROLE_KEY: checkEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
    };

    // General configuration with site URL fallbacks
    const general: EnvStatus = {
      SITE_URL: checkEnvAny('NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_BASE_URL', 'APP_BASE_URL'),
      APP_BASE_URL: checkEnvVar('APP_BASE_URL'),
      NEXT_PUBLIC_BASE_URL: checkEnvVar('NEXT_PUBLIC_BASE_URL'),
      NEXT_DISABLE_IMAGE_OPTIMIZATION: checkEnvVar('NEXT_DISABLE_IMAGE_OPTIMIZATION'),
      NEXT_PUBLIC_ENABLE_ORBIT: checkEnvVar('NEXT_PUBLIC_ENABLE_ORBIT'),
      NEXT_PUBLIC_ENABLE_LEGACY: checkEnvVar('NEXT_PUBLIC_ENABLE_LEGACY'),
      NEXT_PUBLIC_ENABLE_BUNDLES: checkEnvVar('NEXT_PUBLIC_ENABLE_BUNDLES'),
    };

    // hCaptcha configuration (optional)
    const captcha: EnvStatus = {
      NEXT_PUBLIC_HCAPTCHA_SITEKEY: checkEnvVar('NEXT_PUBLIC_HCAPTCHA_SITEKEY'),
      HCAPTCHA_SECRET: checkEnvVar('HCAPTCHA_SECRET'),
    };

    // Sports plan price IDs with current preferred names + legacy fallbacks
    const sportsPlans: EnvStatus = {
      // Current preferred names (STARTER/PRO/ELITE)
      STARTER: checkEnvAny(
        'NEXT_PUBLIC_STRIPE_PRICE_STARTER',
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER', 
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER_M',
        'NEXT_PUBLIC_STRIPE_PRICE_ROOKIE',
        'NEXT_PUBLIC_STRIPE_PRICE_ROOKIE_M'
      ),
      PRO: checkEnvAny(
        'NEXT_PUBLIC_STRIPE_PRICE_PRO',
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO', 
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO_M',
        'NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR',
        'NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR_M'
      ),
      ELITE: checkEnvAny(
        'NEXT_PUBLIC_STRIPE_PRICE_ELITE',
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE', 
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE_M',
        'NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR',
        'NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR_M'
      ),
    };

    // Business plan price IDs (canonical and _M variants)
    const businessPlans: EnvStatus = {
      BIZ_STARTER: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M'),
      BIZ_PRO: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M'),
      BIZ_ELITE: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M'),
    };

    // Add-on price IDs with current preferred names
    const addons: EnvStatus = {
      // Current preferred add-on names (ADDON_*)
      ADDON_SCANS10: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10', 'NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10_M'),
      ADDON_VIDEO: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO', 'NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO_M'),
      ADDON_EMOTION: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION', 'NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION_M'),
      ADDON_NUTRITION: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION', 'NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION_M'),
      ADDON_FOUNDATION: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION', 'NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION_M'),
      ADDON_ADV_ANALYTICS: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_ADDON_ADV_ANALYTICS', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS_M'),
      ADDON_AUTOMATION: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_ADDON_AUTOMATION', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION_M'),
      ADDON_SEAT: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_ADDON_SEAT', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT_M'),
    };

    // Generate resolver parity report
    const resolverReport = generateResolverParityReport();
    const resolverParity: Record<string, {
      priceId: string | null;
      matchedEnvName: string | null;
      status: 'PRESENT' | 'MISSING';
    }> = {};
    
    for (const [sku, result] of Object.entries(resolverReport)) {
      resolverParity[sku] = {
        priceId: result.priceId,
        matchedEnvName: result.matchedEnvName,
        status: result.priceId ? 'PRESENT' : 'MISSING'
      };
    }

    // Generate diagnostic notes
    const notes: string[] = [];

    // === STRIPE DIAGNOSTICS ===
    if (stripe.NEXT_PUBLIC_ENABLE_STRIPE === 'MISSING') {
      notes.push("⚠️ NEXT_PUBLIC_ENABLE_STRIPE is missing - Stripe functionality will be disabled");
    } else if (process.env.NEXT_PUBLIC_ENABLE_STRIPE !== '1') {
      notes.push("ℹ️ NEXT_PUBLIC_ENABLE_STRIPE is not set to '1' - Stripe functionality may be disabled");
    }

    if (stripe.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === 'MISSING' || stripe.STRIPE_SECRET_KEY === 'MISSING') {
      notes.push("❌ Missing core Stripe keys - payment processing will fail");
    }

    const missingPriceIds = [
      ...Object.entries(sportsPlans).filter(([, status]) => status === 'MISSING').map(([key]) => `Sports ${key}`),
      ...Object.entries(businessPlans).filter(([, status]) => status === 'MISSING').map(([key]) => `Business ${key}`),
      ...Object.entries(addons).filter(([, status]) => status === 'MISSING').map(([key]) => `Addon ${key}`),
    ];

    if (missingPriceIds.length > 0) {
      notes.push(`⚠️ Missing price IDs: ${missingPriceIds.join(', ')} - related buttons will be disabled`);
    }

    if (supabase.SUPABASE_URL === 'MISSING' || supabase.SUPABASE_ANON_KEY === 'MISSING') {
      notes.push("Missing Supabase configuration - database operations may fail");
    }

    if (general.SITE_URL === 'MISSING') {
      notes.push("Site URL is missing - required for auth callbacks and webhooks");
    }

    if (general.NEXT_DISABLE_IMAGE_OPTIMIZATION === 'PRESENT') {
      notes.push("ℹ️ Image optimization is disabled - optional for environments with cache permission issues");
    }

    // === FEATURE FLAGS ===
    if (general.NEXT_PUBLIC_ENABLE_ORBIT === 'PRESENT' && process.env.NEXT_PUBLIC_ENABLE_ORBIT === '1') {
      notes.push("✅ Orbit League is enabled - /agents will display orbit view above grid");
    } else {
      notes.push("ℹ️ Orbit League is disabled - /agents shows grid only (set NEXT_PUBLIC_ENABLE_ORBIT=1 to enable)");
    }

    // === CAPTCHA ===
    if (captcha.NEXT_PUBLIC_HCAPTCHA_SITEKEY === 'MISSING' || captcha.HCAPTCHA_SECRET === 'MISSING') {
      notes.push("ℹ️ hCaptcha not configured (optional) - /api/recaptcha/verify will bypass verification");
    }

    // Determine overall status
    const criticalMissing = [
      stripe.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      stripe.STRIPE_SECRET_KEY,
      supabase.SUPABASE_URL,
      supabase.SUPABASE_ANON_KEY,
      general.SITE_URL
    ].some(status => status === 'MISSING');

    const ok = !criticalMissing;

    const response: EnvCheckResponse = {
      ok,
      stripe,
      supabase,
      general,
      captcha,
      priceIds: {
        sports: sportsPlans,
        business: businessPlans,
        addons,
      },
      resolverParity,
      notes,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("[/api/env-check] Error:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to check environment variables",
      notes: ["Internal error occurred during environment check"]
    }, { status: 500 });
  }
}