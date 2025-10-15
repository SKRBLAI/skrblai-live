import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getServerSupabaseAdmin } from "@/lib/supabase";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = headers().get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ ok: false, error: "Missing STRIPE_WEBHOOK_SECRET or signature" }, { status: 400 });
  }

  const buf = Buffer.from(await req.arrayBuffer());

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2023-10-16" });
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    const admin = getServerSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ ok: false, error: "Supabase admin not configured" }, { status: 500 });
    }

    const type = event.type;
    const payload = event.data?.object || null;

    // Ensure billing_events table exists (guarded best-effort)
    try {
      await admin.rpc("ensure_billing_events_table");
    } catch {}

    try {
      await admin.from("billing_events").insert({
        id: (payload as any)?.id || null,
        type,
        payload,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      // swallow insert error; still return 200 to Stripe
      console.warn("billing_events insert failed", e);
    }

    switch (type) {
      case "checkout.session.completed":
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        break;
      default:
        break;
    }

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "handler-error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
