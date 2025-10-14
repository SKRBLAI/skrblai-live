import { NextResponse } from 'next/server';
import { requireStripe } from '@/lib/stripe/stripe';

export async function GET() {
  try {
    const pk = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const stripe = requireStripe();
    try {
      const account = await stripe.accounts.retrieve();
      const mode: 'live' | 'test' | 'unknown' = typeof account.livemode === 'boolean' ? (account.livemode ? 'live' : 'test') : 'unknown';
      return NextResponse.json({ ok: true, mode, hasPk: pk, error: null }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (e: any) {
      return NextResponse.json({ ok: false, mode: 'unknown', hasPk: pk, error: e?.message?.slice(0, 160) || 'stripe-error' }, { headers: { 'Cache-Control': 'no-store' } });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, mode: 'unknown', hasPk: false, error: e?.message?.slice(0, 160) || 'init-error' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
