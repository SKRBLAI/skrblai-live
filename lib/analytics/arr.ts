import Stripe from "stripe";
import { readEnvAny } from "@/lib/env/readEnvAny";
import { requireStripe } from "@/lib/stripe/stripe";

type ArrResult =
  | { ok: true; sportsARR: number; businessARR: number; totalARR: number; counts: { sportsSubs: number; businessSubs: number; unknownSubs: number } }
  | { ok: false; reason: string };

function getStripe(): Stripe | null {
  return requireStripe();
}

function resolvedPriceIds() {
  // Resolve canonical and *_M fallbacks using readEnvAny
  const sports = {
    ROOKIE: readEnvAny("NEXT_PUBLIC_STRIPE_PRICE_ROOKIE", "NEXT_PUBLIC_STRIPE_PRICE_ROOKIE_M") || "",
    PRO: readEnvAny("NEXT_PUBLIC_STRIPE_PRICE_PRO", "NEXT_PUBLIC_STRIPE_PRICE_PRO_M") || "",
    ALLSTAR: readEnvAny("NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR", "NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR_M") || "",
  };

  const biz = {
    STARTER: readEnvAny("NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER", "NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M") || "",
    PRO: readEnvAny("NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO", "NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M") || "",
    ELITE: readEnvAny("NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE", "NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M") || "",
  };

  const sportsSet = new Set(Object.values(sports).filter(Boolean));
  const bizSet = new Set(Object.values(biz).filter(Boolean));

  return { sportsSet, bizSet };
}

export async function calculateARR(): Promise<ArrResult> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, reason: "stripe_unavailable" };

  const { sportsSet, bizSet } = resolvedPriceIds();

  let sportsARR = 0;
  let businessARR = 0;
  let sportsSubs = 0;
  let businessSubs = 0;
  let unknownSubs = 0;

  // Fetch active subs (paginate defensively)
  let startingAfter: string | undefined = undefined;
  do {
    const page: Stripe.ApiList<Stripe.Subscription> = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
      starting_after: startingAfter,
      expand: ["data.items.data.price.product"],
    });

    for (const sub of page.data) {
      // Identify sub by its first item's price (typical for single-plan subs)
      const item = sub.items.data[0];
      const price = item?.price;
      const unit = price?.unit_amount ?? null;
      const interval = price?.recurring?.interval ?? null;
      const priceId = price?.id ?? "";

      if (!priceId || !unit || interval !== "month") {
        unknownSubs++;
        continue;
      }

      const mrr = unit / 100; // USD per month
      if (sportsSet.has(priceId)) {
        sportsARR += mrr * 12;
        sportsSubs++;
      } else if (bizSet.has(priceId)) {
        businessARR += mrr * 12;
        businessSubs++;
      } else {
        unknownSubs++;
      }
    }

    startingAfter = page.has_more ? page.data[page.data.length - 1].id : undefined;
  } while (startingAfter);

  return {
    ok: true,
    sportsARR: Math.round(sportsARR),
    businessARR: Math.round(businessARR),
    totalARR: Math.round(sportsARR + businessARR),
    counts: { sportsSubs, businessSubs, unknownSubs },
  };
}
