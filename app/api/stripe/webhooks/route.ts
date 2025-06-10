import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: any) {
  const userId = session.client_reference_id;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  try {
    // Update user's profile with Stripe customer ID
    await supabase
      .from('profiles')
      .update({
        stripe_customer_id: customerId,
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // Create subscription record
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

    console.log(`Checkout completed for user: ${userId}`);
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

async function handleSubscriptionCreated(subscription: any) {
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

async function handleSubscriptionUpdated(subscription: any) {
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

async function handleSubscriptionDeleted(subscription: any) {
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

async function handleInvoicePaymentSucceeded(invoice: any) {
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
  // Handle failed payment - could trigger retry logic, notifications, etc.
} 