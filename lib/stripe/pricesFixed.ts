import { requireStripe } from "./stripe";

export async function priceForSku(lookupKey: string): Promise<string> {
  const stripe = requireStripe();
  const res = await stripe.prices.list({
    lookup_keys: [lookupKey],
    expand: ["data.product"],
    limit: 1,
  });
  const price = res.data?.[0];
  if (!price) throw new Error(`No Stripe price for lookup_key "${lookupKey}"`);
  return price.id; // "price_..."
}
