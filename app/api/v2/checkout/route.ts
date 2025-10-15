import { NextRequest, NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe/stripe";
import { resolvePriceIdFromSku } from "@/lib/stripe/priceResolver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { sku?: string };
    const sku = body?.sku || "";
    if (!sku) return bad("Missing sku", 400);

    const priceResolution = resolvePriceIdFromSku(sku);
    const priceId = priceResolution.priceId;
    if (!priceId) {
      return bad(`No price configured for sku=${sku}`, 400);
    }

    const stripe = requireStripe();

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_BASE_URL;
    if (!origin) {
      return bad("Missing NEXT_PUBLIC_SITE_URL or APP_BASE_URL", 500);
    }

    const success_url = `${origin}/v2/dashboard`;
    const cancel_url = `${origin}/v2/pricing`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url,
      cancel_url,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ ok: true, url: session.url, sessionId: session.id }, { status: 200 });
  } catch (e: any) {
    return bad(e?.message || "Checkout failed", 500);
  }
}
