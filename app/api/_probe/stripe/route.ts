// MMM: Comprehensive Stripe probe - uses canonical helper with env-driven version
import { requireStripe } from '@/lib/stripe/stripe';
import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  // Lock down in production - admin/founder only
  if (process.env.NODE_ENV === 'production') {
    try {
      await requireRole(['admin', 'founder']);
    } catch {
      return new Response('Not found', { status: 404 });
    }
  }
  const headers = { 'Cache-Control': 'no-store' };
  
  // Check environment variables
  const hasSk = !!process.env.STRIPE_SECRET_KEY;
  const hasPk = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;
  const apiVersion = process.env.STRIPE_API_VERSION || 'not-set';
  
  if (!hasSk) {
    return NextResponse.json({ 
      ok: false, 
      error: 'STRIPE_SECRET_KEY missing',
      hasSk,
      hasPk,
      apiVersion,
      webhookConfigured: false
    }, { status: 503, headers });
  }
  
  try {
    // Use canonical helper - will use env-driven version
    const stripe = requireStripe();
    
    // Test API connectivity
    const account = await stripe.accounts.retrieve();
    
    // Check webhook endpoints (gracefully handle permissions issues)
    let webhookConfigured: boolean | 'unknown' = 'unknown';
    try {
      const endpoints = await stripe.webhookEndpoints.list({ limit: 1 });
      const prodUrl = 'https://skrblai.io/api/stripe/webhook';
      webhookConfigured = endpoints.data.some(ep => ep.url === prodUrl);
    } catch (webhookError: any) {
      // Permissions may not allow listing webhooks - that's ok
      console.log('Webhook listing skipped (permissions):', webhookError.message);
      webhookConfigured = 'unknown';
    }
    
    return NextResponse.json({ 
      ok: true, 
      hasSk: true,
      hasPk,
      apiVersion,
      webhookConfigured,
      webhookSecretSet: hasWebhookSecret,
      mode: account?.details_submitted ? 'live' : 'test',
      accountId: account?.id ? `${account.id.substring(0, 8)}...` : 'unknown'
    }, { headers });
  } catch (e: any) {
    return NextResponse.json({ 
      ok: false, 
      error: 'stripe-api-failed',
      errorMessage: e?.message || 'unknown',
      hasSk: true,
      hasPk,
      apiVersion,
      webhookConfigured: 'error'
    }, { status: 500, headers });
  }
}

