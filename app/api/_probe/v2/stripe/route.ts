import { NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe/stripe";

export async function GET() {
  try {
    const stripe = requireStripe();
    const prices = await stripe.prices.list({ limit: 1 });
    return NextResponse.json({ ok: true, count: prices.data.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "stripe-error" }, { status: 200 });
  }
}
