// app/api/stripe/webhook/route.ts (canonical endpoint: singular)
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getServerSupabaseAdmin } from '@/lib/supabase';
import { requireStripe } from '@/lib/stripe/stripe';
import { withSafeJson } from '@/lib/api/safe';
import { logger } from '@/lib/observability/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withSafeJson(async (req: Request) => {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    const stripe = requireStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  logger?.info?.('Stripe webhook received', {
    eventType: event.type,
    eventId: event.id,
    livemode: event.livemode,
  });

  const supabase = getServerSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(supabase, (event as any).data.object);
      break;
    case 'customer.subscription.created':
      await handleSubscriptionCreated(supabase, (event as any).data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(supabase, (event as any).data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(supabase, (event as any).data.object);
      break;
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(supabase, (event as any).data.object);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed((event as any).data.object);
      break;
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(supabase, (event as any).data.object);
      break;
    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
});

async function handleCheckoutCompleted(supabase: SupabaseClient, session: any) {
  const userId = session.client_reference_id;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  console.log('Processing checkout completion:', {
    sessionId: session.id,
    category: session.metadata?.category, // 'sports' | 'business'
    source: session.metadata?.source,
    sku: session.metadata?.sku,
    amount: session.amount_total,
  });

  try {
    // Sports one-time or plan purchases recorded as orders
    if (session.metadata?.category === 'sports') {
      await handleSkillSmithPurchase(supabase, session);
    }

    // For subscriptions (business or sports monthly tiers)
    if (subscriptionId && userId) {
      await supabase
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      await supabase.from('subscriptions').insert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

async function handleSkillSmithPurchase(supabase: SupabaseClient, session: any) {
  const { sku, productSku, source, category } = session.metadata || {};
  const resolvedSku = sku || productSku;

  try {
    const { data: orderData, error: orderError } = await supabase
      .from('skillsmith_orders')
      .insert({
        stripe_session_id: session.id,
        product_sku: resolvedSku,
        amount: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name,
        source,
        category,
        status: 'completed',
        metadata: {
          session_id: session.id,
          payment_intent: session.payment_intent,
          mode: session.mode,
        },
        fulfilled_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error inserting SkillSmith order:', orderError);
      return;
    }

    // optional: forward to n8n
    if (process.env.N8N_STRIPE_WEBHOOK_URL) {
      try {
        const r = await fetch(process.env.N8N_STRIPE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'skillsmith_purchase',
            session,
            order: orderData,
            timestamp: new Date().toISOString(),
          }),
        });
        if (!r.ok) console.warn('N8N webhook failed:', r.status, r.statusText);
      } catch (e) {
        console.warn('Error forwarding to n8n:', e);
      }
    }
  } catch (error) {
    console.error('Error handling SkillSmith purchase:', error);
  }
}

async function handleSubscriptionCreated(supabase: SupabaseClient, subscription: any) {
  const customerId = subscription.customer;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          subscription_status: subscription.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      await supabase.from('subscriptions').insert({
        user_id: profile.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
}

async function handleSubscriptionUpdated(supabase: SupabaseClient, subscription: any) {
  const customerId = subscription.customer;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          subscription_status: subscription.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(supabase: SupabaseClient, subscription: any) {
  const customerId = subscription.customer;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
    }
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

async function handleInvoicePaymentSucceeded(supabase: SupabaseClient, invoice: any) {
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (profile) {
      await supabase.from('payment_events').insert({
        user_id: profile.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        event_type: 'payment_succeeded',
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        created_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error handling invoice payment success:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  console.log(`Invoice payment failed: ${invoice.id}`);
}

async function handlePaymentIntentSucceeded(supabase: SupabaseClient, pi: any) {
  // Optional: record successful one-time add-ons that bypass Checkout Session
  try {
    await supabase.from('payment_events').insert({
      user_id: null,
      stripe_customer_id: pi.customer || null,
      stripe_subscription_id: null,
      event_type: 'payment_intent_succeeded',
      amount: pi.amount_received,
      currency: pi.currency,
      status: 'succeeded',
      created_at: new Date().toISOString(),
      metadata: pi.metadata ?? {},
    });
  } catch (e) {
    console.error('Error handling payment_intent.succeeded:', e);
  }
}
