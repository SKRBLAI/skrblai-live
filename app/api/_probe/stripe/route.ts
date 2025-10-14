import { NextResponse } from 'next/server';
import { requireStripe } from '@/lib/stripe/stripe';
import { resolvePriceIdFromSku } from '@/lib/stripe/priceResolver';

export async function GET() {
  try {
    const publishableKeyPresent = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const secretKeyPresent = !!process.env.STRIPE_SECRET_KEY;
    const webhookSecretPresent = !!process.env.STRIPE_WEBHOOK_SECRET;

    let mode: 'live' | 'test' | 'unknown' = 'unknown';
    let ok = false;
    let error: string | null = null;
    if (secretKeyPresent) {
      try {
        const stripe = requireStripe();
        const account = await stripe.accounts.retrieve();
        mode = typeof account.livemode === 'boolean' ? (account.livemode ? 'live' : 'test') : 'unknown';
        ok = true;
      } catch (e: any) {
        ok = false;
        error = e?.message?.slice(0, 160) || 'stripe-error';
      }
    }

    const candidateSkus = ['sports_plan_starter', 'biz_plan_starter'];
    const resolvableSkus: string[] = [];
    const unresolvedSkus: string[] = [];
    for (const sku of candidateSkus) {
      const { priceId } = resolvePriceIdFromSku(sku);
      if (priceId) resolvableSkus.push(sku); else unresolvedSkus.push(sku);
    }

    return NextResponse.json(
      {
        ok,
        mode,
        publishableKeyPresent,
        secretKeyPresent,
        webhookSecretPresent,
        resolvableSkus,
        unresolvedSkus,
        error,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        mode: 'unknown',
        publishableKeyPresent: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        secretKeyPresent: !!process.env.STRIPE_SECRET_KEY,
        webhookSecretPresent: !!process.env.STRIPE_WEBHOOK_SECRET,
        resolvableSkus: [],
        unresolvedSkus: ['sports_plan_starter', 'biz_plan_starter'],
        error: e?.message?.slice(0, 160) || 'init-error',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
