import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Client-side Stripe instance
export const getStripePromise = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
  return loadStripe(key);
};

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export const createCheckoutSession = async (userId: string, priceId: string) => {
  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: {
        userId,
      },
    });

    return { success: true, sessionId: checkoutSession.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { success: false, error };
  }
};

export const createCustomerPortalLink = async (customerId: string) => {
  try {
    const response = await fetch('/api/create-customer-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const { url } = await response.json();
    return { success: true, url };
  } catch (error) {
    console.error('Error creating customer portal link:', error);
    return { success: false, error };
  }
};

// New utility functions for better Stripe integration
export const createCheckoutSessionCall = async (options: {
  priceId: string;
  userId: string;
  email: string;
  successUrl?: string;
  cancelUrl?: string;
}) => {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const { sessionId, url } = await response.json();
    return { success: true, sessionId, url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { success: false, error };
  }
};

export const redirectToCheckout = async (sessionId: string) => {
  const stripePromise = getStripePromise();
  const stripe = await stripePromise;
  
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  
  if (error) {
    throw error;
  }
}; 