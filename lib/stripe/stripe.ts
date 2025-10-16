import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getOptionalStripe(options?: { apiVersion?: Stripe.LatestApiVersion }): Stripe | null {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;
    stripe = new Stripe(key, { apiVersion: options?.apiVersion || '2023-10-16' });
  }
  return stripe;
}

export function requireStripe(options?: { apiVersion?: Stripe.LatestApiVersion }): Stripe {
  const s = getOptionalStripe(options);
  if (!s) throw new Error('STRIPE_SECRET_KEY missing');
  return s;
}
