import { NextRequest, NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe/stripe";
import { priceForSku } from "@/lib/stripe/prices";
import { ProductKey } from "@/lib/pricing/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(msg: string, status = 400) {
  console.error("[/api/checkout]", msg);
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: NextRequest) {
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
    };

    const mode = body.mode || "subscription";
    const stripe = requireStripe();

    const price =
      (body.priceId && body.priceId.startsWith("price_")) ? body.priceId :
      (body.sku ? await priceForSku(body.sku as ProductKey) : null);

    if (!price) return bad("Provide priceId (price_…) or sku (lookup_key)");

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const success_url = `${origin}${body.successPath || "/thanks"}?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url  = `${origin}${body.cancelPath  || "/pricing"}`;

    const metadata = {
      source: "web",
      vertical: body.vertical || (body.sku?.includes("skill") ? "sports" : "business"),
      plan: body.sku || body.priceId || "unknown",
      ...(body.metadata || {}),
    };

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price, quantity: 1 }],
      success_url,
      cancel_url,
      allow_promotion_codes: true,
      customer_email: body.customerEmail,
      metadata,
      payment_method_types: ["card"],
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: any) {
    console.error("[/api/checkout] ERROR", e?.message || e);
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
