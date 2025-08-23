import { requireStripe } from "./stripe";
import { ProductKey } from '../pricing/types';

export async function priceForSku(lookupKey: ProductKey): Promise<string> {
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
