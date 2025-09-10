import { NextRequest, NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe/stripe";
import { priceForSku } from "@/lib/stripe/prices";
import { ProductKey } from "@/lib/pricing/types";
import { withLogging } from "@/lib/observability/logger";
import crypto from 'crypto';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(msg: string, status = 400) {
  console.error("[/api/checkout]", msg);
  return NextResponse.json({ error: msg }, { status });
}

function generateIdempotencyKey(userId: string, plan: string, timestamp: string): string {
  const data = `${userId}-${plan}-${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
}

async function handleCheckout(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      sku?: string;
      priceId?: string;
      mode?: "subscription" | "payment";
      customerEmail?: string;
      metadata?: Record<string, string>;
      successPath?: string;
      cancelPath?: string;
      vertical?: "sports" | "business";
      addons?: ProductKey[]; // Add-on product keys
      userId?: string; // For idempotency
    };

    const mode = body.mode || "subscription";
    const stripe = requireStripe();

    // Generate idempotency key for duplicate prevention
    const timestamp = Math.floor(Date.now() / 1000).toString(); // 1-second precision
    const userId = body.userId || body.customerEmail || 'anonymous';
    const plan = body.sku || body.priceId || 'unknown';
    const idempotencyKey = generateIdempotencyKey(userId, plan, timestamp);

    const price =
      (body.priceId && body.priceId.startsWith("price_")) ? body.priceId :
      (body.sku ? await priceForSku(body.sku as ProductKey) : null);

    if (!price) return bad("Provide priceId (price_…) or sku (lookup_key)");

    // Build line items array starting with main plan
    const lineItems = [{ price, quantity: 1 }];

    // Add line items for add-ons if provided
    if (body.addons && body.addons.length > 0) {
      for (const addon of body.addons) {
        try {
          const addonPrice = await priceForSku(addon);
          if (addonPrice) {
            lineItems.push({ price: addonPrice, quantity: 1 });
          }
        } catch (e) {
          console.warn(`[checkout] Failed to resolve addon price for ${addon}:`, e);
        }
      }
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const success_url = `${origin}${body.successPath || "/thanks"}?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url  = `${origin}${body.cancelPath  || "/pricing"}`;

    const metadata = {
      source: "web",
      vertical: body.vertical || (body.sku?.includes("skill") ? "sports" : "business"),
      plan: body.sku || body.priceId || "unknown",
      addons: body.addons ? body.addons.join(',') : '',
      ...(body.metadata || {}),
    };

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      success_url,
      cancel_url,
      allow_promotion_codes: true,
      customer_email: body.customerEmail,
      metadata,
      payment_method_types: ["card"],
    }, {
      idempotencyKey // Add idempotency key to prevent duplicate sessions
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: any) {
    console.error("[/api/checkout] ERROR", e?.message || e);
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}

export const POST = withLogging(handleCheckout);
