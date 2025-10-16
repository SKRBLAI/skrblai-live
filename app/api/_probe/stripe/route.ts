// MMM: use canonical helper; fail safely with redacted output
import { requireStripe } from '@/lib/stripe/stripe';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stripe = requireStripe({ apiVersion: '2023-10-16' });
    const account = await stripe.accounts.retrieve();
    return NextResponse.json({ 
      ok: true, 
      mode: account?.details_submitted ? 'live_or_test' : 'unknown', 
      hasPk: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
    }, { headers: { 'Cache-Control': 'no-store' }});
  } catch (e: any) {
    return NextResponse.json({ 
      ok: false, 
      error: 'stripe-init-failed' 
    }, { headers: { 'Cache-Control': 'no-store' }});
  }
}

