/** MMM: Stripe Payment Links fallback mapping */

/**
 * Stripe Payment Links - Safe fallback when Checkout Sessions fail
 * 
 * These are pre-created Payment Links in the Stripe Dashboard
 * Use FF_STRIPE_FALLBACK_LINKS=true to activate this fallback
 * 
 * To create Payment Links:
 * 1. Go to Stripe Dashboard > Payment Links
 * 2. Create a link for each product/price
 * 3. Copy the URL and add it here
 */

export interface PaymentLinkConfig {
  url: string;
  sku: string;
  name: string;
}

// MMM: Update these URLs with actual Payment Links from Stripe Dashboard
export const PAYMENT_LINKS: Record<string, string> = {
  // === SPORTS PLANS ===
  'SPORTS_STARTER': process.env.NEXT_PUBLIC_STRIPE_LINK_SPORTS_STARTER || '',
  'SPORTS_PRO': process.env.NEXT_PUBLIC_STRIPE_LINK_SPORTS_PRO || '',
  'SPORTS_ELITE': process.env.NEXT_PUBLIC_STRIPE_LINK_SPORTS_ELITE || '',
  
  // === BUSINESS PLANS ===
  'ROOKIE': process.env.NEXT_PUBLIC_STRIPE_LINK_BIZ_ROOKIE || '',
  'PRO': process.env.NEXT_PUBLIC_STRIPE_LINK_BIZ_PRO || '',
  'ALL_STAR': process.env.NEXT_PUBLIC_STRIPE_LINK_BIZ_ALL_STAR || '',
  'FRANCHISE': '', // Enterprise - contact sales
  
  // Aliases for backward compatibility
  'BIZ_STARTER': process.env.NEXT_PUBLIC_STRIPE_LINK_BIZ_ROOKIE || '',
  'BIZ_PRO': process.env.NEXT_PUBLIC_STRIPE_LINK_BIZ_PRO || '',
  'BIZ_ELITE': process.env.NEXT_PUBLIC_STRIPE_LINK_BIZ_ALL_STAR || '',
};

/**
 * Get Payment Link URL for a given SKU
 * Returns null if not configured
 */
export function getPaymentLink(sku: string): string | null {
  const link = PAYMENT_LINKS[sku];
  return link && link.length > 0 ? link : null;
}

/**
 * Check if Payment Links fallback is properly configured for a SKU
 */
export function hasPaymentLink(sku: string): boolean {
  return !!getPaymentLink(sku);
}

/**
 * Get all configured Payment Links
 */
export function getAllPaymentLinks(): PaymentLinkConfig[] {
  return Object.entries(PAYMENT_LINKS)
    .filter(([_, url]) => url && url.length > 0)
    .map(([sku, url]) => ({
      sku,
      url,
      name: sku.replace(/_/g, ' '),
    }));
}
