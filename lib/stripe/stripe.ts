import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getOptionalStripe(): Stripe | null {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;
    stripe = new Stripe(key, { apiVersion: '2023-10-16' });
  }
  return stripe;
}

export function requireStripe(): Stripe {
  const s = getOptionalStripe();
  if (!s) throw new Error('STRIPE_SECRET_KEY missing');
  return s;
}
