import map from "./skillsmithPriceMap.json";

export interface SkillSmithPrice {
  lookup_key: string;
  price_id: string;
  amount: number;
}

export const priceMap = map as Record<string, SkillSmithPrice>;

// Helper function to get price ID by tier
export function getPriceId(tier: string): string {
  const price = priceMap[tier];
  if (!price) {
    throw new Error(`Unknown SkillSmith tier: ${tier}`);
  }
  return price.price_id;
}

// Helper function to get amount by tier
export function getAmount(tier: string): number {
  const price = priceMap[tier];
  if (!price) {
    throw new Error(`Unknown SkillSmith tier: ${tier}`);
  }
  return price.amount;
}
