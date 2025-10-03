import { NextRequest, NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe/stripe";
import { withLogging } from "@/lib/observability/logger";
import { 
  getBusinessPlanBySku, 
  getBusinessAddonBySku 
} from "@/lib/business/pricingData";
import { 
  getSportsPlanBySku, 
  getSportsAddonBySku 
} from "@/lib/sports/pricingData";
import { 
  isPromoActive, 
  STANDARD_PROMO_CONFIG 
} from "@/lib/pricing/catalogShared";
import { readEnvAny } from "@/lib/env/readEnvAny";
import crypto from 'crypto';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(msg: string, status = 400) {
  console.error("[/api/checkout]", msg);
  return NextResponse.json({ ok: false, error: msg }, { status });
}

function generateIdempotencyKey(userId: string, plan: string, timestamp: string): string {
  const data = `${userId}-${plan}-${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
}

/**
 * Resilient SKU to Stripe Price ID resolver with current env names preferred
 * Removes bundle/package logic and prefers canonical naming
 */
function resolvePriceIdFromSku(sku: string): string | null {
  // Hard-disable bundle/package logic unless explicitly enabled
  if ((sku.includes('bundle') || sku.includes('package')) && !process.env.NEXT_PUBLIC_ENABLE_BUNDLES) {
    console.warn(`[checkout] Bundle SKU ${sku} disabled (NEXT_PUBLIC_ENABLE_BUNDLES not set)`);
    return null;
  }

  const resolvers: Record<string, () => string | undefined> = {
    // === CURRENT ENV NAMES (PREFERRED) ===
    
    // Sports plans - prefer STARTER/PRO/ELITE naming
    sports_plan_starter: () => readEnvAny(
      'NEXT_PUBLIC_STRIPE_PRICE_STARTER',      // Current preferred
      'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER', // Legacy fallback
      'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER_M',
      'NEXT_PUBLIC_STRIPE_PRICE_ROOKIE',
      'NEXT_PUBLIC_STRIPE_PRICE_ROOKIE_M'
    ),
    sports_plan_pro: () => readEnvAny(
      'NEXT_PUBLIC_STRIPE_PRICE_PRO',          // Current preferred
      'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO',   // Legacy fallback
      'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO_M',
      'NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR',
      'NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR_M'
    ),
    sports_plan_elite: () => readEnvAny(
      'NEXT_PUBLIC_STRIPE_PRICE_ELITE',        // Current preferred
      'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE', // Legacy fallback
      'NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE_M'
    ),
    
    // Business plans - prefer BIZ_STARTER/PRO/ELITE naming
    biz_plan_starter: () => readEnvAny(
      'NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER',   // Current preferred
      'NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M'  // Legacy _M fallback
    ),
    biz_plan_pro: () => readEnvAny(
      'NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO',       // Current preferred
      'NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M'      // Legacy _M fallback
    ),
    biz_plan_elite: () => readEnvAny(
      'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE',     // Current preferred
      'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M'    // Legacy _M fallback
    ),
    
    // Add-ons - prefer ADDON_* naming (no _M required)
    sports_addon_scans10: () => readEnvAny(
      'NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10',
      'NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10_M'
    ),
    sports_addon_video: () => readEnvAny(
      'NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO',
      'NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO_M'
    ),
    sports_addon_emotion: () => readEnvAny(
      'NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION',
      'NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION_M'
    ),
    sports_addon_nutrition: () => readEnvAny(
      'NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION',
      'NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION_M'
    ),
    sports_addon_foundation: () => readEnvAny(
      'NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION',
      'NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION_M'
    ),
    
    // Business add-ons
    biz_addon_adv_analytics: () => readEnvAny(
      'NEXT_PUBLIC_STRIPE_PRICE_ADDON_ADV_ANALYTICS',
      'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS',
      'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS_M'
    ),
    biz_addon_automation: () => readEnvAny(
      'NEXT_PUBLIC_STRIPE_PRICE_ADDON_AUTOMATION',
      'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION',
      'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION_M'
    ),
    biz_addon_team_seat: () => readEnvAny(
      'NEXT_PUBLIC_STRIPE_PRICE_ADDON_SEAT',
      'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT',
      'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT_M'
    ),
    
    // === LEGACY COMPATIBILITY ===
    // Keep for backward compatibility but prefer current names above
    biz_plan_starter_m: () => readEnvAny('NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER'),
    biz_plan_pro_m: () => readEnvAny('NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO'),
    biz_plan_elite_m: () => readEnvAny('NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M', 'NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE'),
  };

  const resolver = resolvers[sku];
  if (!resolver) {
    console.info(`[checkout] sku=${sku}, priceId=NULL (no resolver)`);
    return null;
  }

  const resolvedPriceId = resolver();
  console.info(`[checkout] sku=${sku}, priceId=${resolvedPriceId || 'NULL'}`);
  
  return resolvedPriceId || null;
}

/**
 * Legacy resolver for backward compatibility with existing pricing data system
 */
function resolvePriceId(sku: string, vertical?: string): string | null {
  // First try the new resilient resolver
  const directResolution = resolvePriceIdFromSku(sku);
  if (directResolution) {
    return directResolution;
  }

  // Fallback to legacy system for complex pricing logic (promos, etc.)
  const businessPlan = getBusinessPlanBySku(sku);
  const businessAddon = getBusinessAddonBySku(sku);
  const sportsPlan = getSportsPlanBySku(sku);
  const sportsAddon = getSportsAddonBySku(sku);
  
  const item = businessPlan || businessAddon || sportsPlan || sportsAddon;
  
  if (!item || !item.envPriceVar) {
    console.warn(`[checkout] No ENV price variable found for SKU: ${sku}`);
    return null;
  }
  
  // Check if we should use promo pricing for add-ons
  if (item.type === 'addon' && 'promoPrice' in item && item.promoPrice) {
    const isPromoCurrentlyActive = isPromoActive(STANDARD_PROMO_CONFIG);
    if (isPromoCurrentlyActive) {
      // Try promo price first
      const promoEnvVar = `${item.envPriceVar}_PROMO`;
      const promoPriceId = process.env[promoEnvVar];
      if (promoPriceId) {
        console.log(`[checkout] Using promo price for ${sku}: ${promoEnvVar}`);
        return promoPriceId;
      }
    }
  }
  
  // Use standard price with resilient fallback
  const standardPriceId = readEnvAny(item.envPriceVar, `${item.envPriceVar}_M`);
  if (!standardPriceId) {
    console.warn(`[checkout] ENV variable ${item.envPriceVar} not set for SKU: ${sku}`);
    return null;
  }
  
  return standardPriceId;
}

async function handleCheckout(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      sku?: string;
      priceId?: string;
      mode?: "subscription" | "payment" | "trial" | "contact";
      vertical?: "business" | "sports";
      customerEmail?: string;
      metadata?: Record<string, string>;
      successPath?: string;
      cancelPath?: string;
      addons?: string[]; // Array of addon SKUs
      userId?: string;
    };

    console.log('[checkout] Request body:', JSON.stringify(body, null, 2));

    // Handle special modes first
    if (body.mode === "trial" && body.sku === "sports_trial_curiosity") {
      console.log('[checkout] Trial mode - redirecting to onboarding wizard');
      const preferred = "/onboarding?mode=sports&trial=1";
      const fallback = "/#percy?trial=1&mode=sports";
      return NextResponse.json({ ok: true, url: preferred, mode: "trial", fallback });
    }

    if (body.mode === "contact") {
      console.log('[checkout] Contact mode - redirecting to contact page');
      return NextResponse.json({ 
        ok: true, 
        url: "/contact",
        mode: "contact"
      });
    }

    // Validate required fields
    if (!body.sku && !body.priceId) {
      return bad("Either 'sku' or 'priceId' is required");
    }

    const stripe = requireStripe();

    // Generate idempotency key for duplicate prevention
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const userId = body.userId || body.customerEmail || 'anonymous';
    const plan = body.sku || body.priceId || 'unknown';
    const idempotencyKey = generateIdempotencyKey(userId, plan, timestamp);

    // Resolve main item price
    let mainPriceId: string | null = null;
    
    if (body.priceId && body.priceId.startsWith("price_")) {
      mainPriceId = body.priceId;
      console.log(`[checkout] Using provided price ID: ${mainPriceId}`);
    } else if (body.sku) {
      mainPriceId = resolvePriceIdFromSku(body.sku);
      if (!mainPriceId) {
        // Fallback to legacy resolver for complex pricing logic
        mainPriceId = resolvePriceId(body.sku, body.vertical);
      }
      console.log(`[checkout] Resolved SKU "${body.sku}" to price ID: ${mainPriceId || 'NULL'}`);
    }

    if (!mainPriceId) {
      console.error(`[checkout] Failed to resolve price ID for SKU: ${body.sku}, vertical: ${body.vertical}`);
      return bad("Could not resolve price ID. Check that the SKU exists and ENV variables are configured.", 422);
    }

    // Build line items array starting with main item
    const lineItems = [{ price: mainPriceId, quantity: 1 }];

    // Add line items for add-ons if provided
    if (body.addons && body.addons.length > 0) {
      console.log(`[checkout] Processing ${body.addons.length} add-ons`);
      
      for (const addonSku of body.addons) {
        try {
          let addonPriceId = resolvePriceIdFromSku(addonSku);
          if (!addonPriceId) {
            // Fallback to legacy resolver for complex pricing logic
            addonPriceId = resolvePriceId(addonSku, body.vertical);
          }
          if (addonPriceId) {
            lineItems.push({ price: addonPriceId, quantity: 1 });
            console.log(`[checkout] Added add-on: ${addonSku} -> ${addonPriceId}`);
          } else {
            console.warn(`[checkout] Could not resolve add-on price for: ${addonSku}`);
          }
        } catch (e) {
          console.warn(`[checkout] Failed to resolve addon price for ${addonSku}:`, e);
        }
      }
    }

    // Determine mode based on SKU if not provided
    let stripeMode: "subscription" | "payment" = body.mode === "payment" ? "payment" : "subscription";
    if (!body.mode) {
      if (body.sku) {
        // Plans are subscriptions, add-ons are one-time payments
        stripeMode = body.sku.includes('_plan_') ? 'subscription' : 'payment';
      } else {
        stripeMode = 'subscription'; // Default fallback
      }
    }
    
    console.log(`[checkout] Final Stripe mode: ${stripeMode} (original: ${body.mode})`);

    const origin = req.headers.get("origin") || 
                   process.env.APP_BASE_URL || 
                   process.env.NEXT_PUBLIC_BASE_URL || 
                   "http://localhost:3000";
    
    const success_url = `${origin}${body.successPath || "/thanks"}?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${origin}${body.cancelPath || "/pricing"}`;

    const metadata = {
      source: "web",
      vertical: body.vertical || (body.sku?.includes("sports") ? "sports" : "business"),
      plan: body.sku || body.priceId || "unknown",
      addons: body.addons ? body.addons.join(',') : '',
      timestamp: new Date().toISOString(),
      originalMode: body.mode || 'auto',
      ...(body.metadata || {}),
    };

    console.log(`[checkout] Creating Stripe session with ${lineItems.length} items`);
    console.log(`[checkout] Mode: ${stripeMode}, Success: ${success_url}, Cancel: ${cancel_url}`);
    console.log(`[checkout] Metadata:`, JSON.stringify(metadata, null, 2));

    const session = await stripe.checkout.sessions.create({
      mode: stripeMode,
      line_items: lineItems,
      success_url,
      cancel_url,
      allow_promotion_codes: true,
      customer_email: body.customerEmail,
      metadata,
      payment_method_types: ["card"],
      // Enable automatic tax calculation if configured
      automatic_tax: { enabled: false }, // Can be enabled if tax settings are configured
    }, {
      idempotencyKey
    });

    console.log(`[checkout] Session created successfully: ${session.id}`);

    return NextResponse.json({ 
      ok: true, 
      url: session.url,
      sessionId: session.id 
    }, { status: 200 });

  } catch (e: any) {
    console.error("[/api/checkout] ERROR", e?.message || e);
    
    // Return more specific error messages
    let errorMessage = "Checkout failed";
    if (e?.message?.includes("No such price")) {
      errorMessage = "Invalid price ID. Please contact support.";
    } else if (e?.message?.includes("stripe_price_missing")) {
      errorMessage = "Pricing not configured. Please contact support.";
    } else if (e?.message) {
      errorMessage = e.message;
    }

    return NextResponse.json({ 
      ok: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? e?.message : undefined
    }, { status: 500 });
  }
}

export const POST = withLogging(handleCheckout);