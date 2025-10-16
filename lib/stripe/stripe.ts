import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getOptionalStripe(options?: { apiVersion?: Stripe.LatestApiVersion }): Stripe | null {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;
    
    // Use env-driven API version with fallback to latest stable
    const apiVersion = 
      (options?.apiVersion ?? 
       (process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion)) || 
      '2025-09-30.clover';
    
    stripe = new Stripe(key, { apiVersion });
  }
  return stripe;
}

export function requireStripe(options?: { apiVersion?: Stripe.LatestApiVersion }): Stripe {
  const s = getOptionalStripe(options);
  if (!s) throw new Error('STRIPE_SECRET_KEY missing');
  return s;
}
