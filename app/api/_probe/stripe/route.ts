import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function GET() {
  if (!stripeSecretKey) {
    return NextResponse.json({ ok: false, mode: 'unknown', hasPk: false, error: 'no-stripe-secret-key' }, { headers: { 'Cache-Control': 'no-store' } });
  }
  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
  const pk = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  try {
    const account = await stripe.accounts.retrieve();
    // Handle both direct Account object and Response<Account> wrapper
    const accountData = 'lastResponse' in account ? account : account;
    const livemode = (accountData as any)?.livemode;
    const mode: 'live' | 'test' | 'unknown' = typeof livemode === 'boolean' ? (livemode ? 'live' : 'test') : 'unknown';
    return NextResponse.json({ ok: true, mode, hasPk: pk, error: null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, mode: 'unknown', hasPk: pk, error: e?.message?.slice(0, 160) || 'stripe-error' }, { headers: { 'Cache-Control': 'no-store' } });
  }
}

