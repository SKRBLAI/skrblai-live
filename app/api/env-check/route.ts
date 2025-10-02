import { NextResponse } from "next/server";
import { readEnvAny } from "@/lib/env/readEnvAny";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface EnvStatus {
  [key: string]: 'PRESENT' | 'MISSING';
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
  notes: string[];
}

function checkEnvVar(key: string): 'PRESENT' | 'MISSING' {
  const value = process.env[key];
  return (value && value.trim().length > 0) ? 'PRESENT' : 'MISSING';
}

function checkEnvAny(...keys: string[]): 'PRESENT' | 'MISSING' {
  const value = readEnvAny(...keys);
  return value ? 'PRESENT' : 'MISSING';
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

    // Supabase configuration (with dual-key support)
    const supabase: EnvStatus = {
      NEXT_PUBLIC_SUPABASE_URL: checkEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
      SUPABASE_ANON_OR_PUBLISHABLE: checkEnvAny('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
      SUPABASE_SERVICE_ROLE_KEY: checkEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
    };

    // General configuration
    const general: EnvStatus = {
      APP_BASE_URL: checkEnvVar('APP_BASE_URL'),
      NEXT_PUBLIC_BASE_URL: checkEnvVar('NEXT_PUBLIC_BASE_URL'),
      NEXT_PUBLIC_SITE_URL: checkEnvVar('NEXT_PUBLIC_SITE_URL'),
      NEXT_DISABLE_IMAGE_OPTIMIZATION: checkEnvVar('NEXT_DISABLE_IMAGE_OPTIMIZATION'),
      NEXT_PUBLIC_ENABLE_ORBIT: checkEnvVar('NEXT_PUBLIC_ENABLE_ORBIT'),
    };

    // hCaptcha configuration (optional)
    const captcha: EnvStatus = {
      NEXT_PUBLIC_HCAPTCHA_SITEKEY: checkEnvVar('NEXT_PUBLIC_HCAPTCHA_SITEKEY'),
      HCAPTCHA_SECRET: checkEnvVar('HCAPTCHA_SECRET'),
    };

    // Sports plan price IDs with new naming + legacy fallbacks
    const sportsPlans: EnvStatus = {
      // New canonical names
      SPORTS_STARTER: checkEnvAny(
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER', 
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER_M'
      ),
      SPORTS_PRO: checkEnvAny(
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO', 
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO_M'
      ),
      SPORTS_ELITE: checkEnvAny(
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE', 
        'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE_M'
      ),
      // Legacy names (kept for backward compatibility)
      ROOKIE: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_ROOKIE', 'NEXT_PUBLIC_STRIPE_PRICE_ROOKIE_M'),
      PRO: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_PRO', 'NEXT_PUBLIC_STRIPE_PRICE_PRO_M'),
      ALLSTAR: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR', 'NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR_M'),
    };

    // Business plan price IDs (canonical and _M variants)
    const businessPlans: EnvStatus = {
      BIZ_STARTER: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M'),
      BIZ_PRO: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M'),
      BIZ_ELITE: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M'),
    };

    // Add-on price IDs (both sports and business)
    const addons: EnvStatus = {
      // Sports add-ons
      ADDON_SCANS10: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10', 'NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10_M'),
      ADDON_VIDEO: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO', 'NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO_M'),
      ADDON_EMOTION: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION', 'NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION_M'),
      ADDON_NUTRITION: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION', 'NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION_M'),
      ADDON_FOUNDATION: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION', 'NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION_M'),
      // Business add-ons
      BIZ_ADDON_ADV_ANALYTICS: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS_M'),
      BIZ_ADDON_AUTOMATION: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION_M'),
      BIZ_ADDON_TEAM_SEAT: checkEnvAny('NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT_M'),
    };

    // Generate diagnostic notes
    const notes: string[] = [];
    
    // === SUPABASE AUTH DIAGNOSTICS ===
    if (supabase.NEXT_PUBLIC_SUPABASE_URL === 'MISSING') {
      notes.push("❌ NEXT_PUBLIC_SUPABASE_URL is MISSING - auth will fail entirely");
    } else {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      if (!supabaseUrl.includes('.supabase.co')) {
        notes.push(`⚠️ NEXT_PUBLIC_SUPABASE_URL does not appear to be a valid Supabase project URL (should end with .supabase.co). Current: ${supabaseUrl.substring(0, 30)}...`);
        if (supabaseUrl.includes('auth.')) {
          notes.push("💡 If you have a custom auth domain (e.g., auth.skrblai.io), the browser SDK still requires the Supabase project URL (.supabase.co)");
        }
      } else {
        notes.push("✅ NEXT_PUBLIC_SUPABASE_URL appears valid (.supabase.co)");
      }
    }

    if (supabase.SUPABASE_ANON_OR_PUBLISHABLE === 'MISSING') {
      notes.push("❌ Neither NEXT_PUBLIC_SUPABASE_ANON_KEY nor NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY found - auth will fail");
    } else {
      notes.push("✅ Supabase anon/publishable key is present (dual-key support active)");
    }

    if (supabase.SUPABASE_SERVICE_ROLE_KEY === 'MISSING') {
      notes.push("⚠️ SUPABASE_SERVICE_ROLE_KEY is missing - server-side admin operations will fail");
    } else {
      notes.push("✅ SUPABASE_SERVICE_ROLE_KEY is present for server operations");
    }

    // Check for Google OAuth config
    const hasGoogleClient = checkEnvVar('NEXT_PUBLIC_GOOGLE_CLIENT_ID') === 'PRESENT';
    const hasGoogleSecret = checkEnvVar('GOOGLE_CLIENT_SECRET') === 'PRESENT';
    if (hasGoogleClient && hasGoogleSecret) {
      notes.push("✅ Google OAuth credentials detected - Google sign-in button will appear");
    } else if (hasGoogleClient || hasGoogleSecret) {
      notes.push("⚠️ Partial Google OAuth config - both NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET required");
    } else {
      notes.push("ℹ️ Google OAuth not configured (optional) - sign-in will use email/password and magic links only");
    }

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

    // === GENERAL DIAGNOSTICS ===
    if (general.NEXT_PUBLIC_SITE_URL === 'MISSING') {
      notes.push("❌ NEXT_PUBLIC_SITE_URL is missing - REQUIRED for auth callbacks, webhooks, and magic links");
    } else {
      notes.push(`✅ NEXT_PUBLIC_SITE_URL is present: ${process.env.NEXT_PUBLIC_SITE_URL}`);
    }

    if (general.APP_BASE_URL === 'MISSING' && general.NEXT_PUBLIC_BASE_URL === 'MISSING') {
      notes.push("⚠️ Missing base URL configuration - redirects may not work properly");
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
      supabase.NEXT_PUBLIC_SUPABASE_URL,
      supabase.SUPABASE_ANON_OR_PUBLISHABLE,
      general.NEXT_PUBLIC_SITE_URL
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