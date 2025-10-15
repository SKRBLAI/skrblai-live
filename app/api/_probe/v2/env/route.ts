import { NextResponse } from "next/server";

function readEnvAny(...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = process.env[k];
    if (v && v.trim().length > 0) return v;
  }
  return undefined;
}

export async function GET() {
  const siteUrl = readEnvAny("NEXT_PUBLIC_SITE_URL", "APP_BASE_URL", "NEXT_PUBLIC_BASE_URL");

  const supabaseUrl = readEnvAny("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const supabaseAnon = readEnvAny("NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY");
  const supabaseService = readEnvAny("SUPABASE_SERVICE_ROLE_KEY");

  const stripePk = readEnvAny("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  const stripeSk = readEnvAny("STRIPE_SECRET_KEY");
  const stripeWh = readEnvAny("STRIPE_WEBHOOK_SECRET");

  const prices = {
    SPORTS_STARTER: !!readEnvAny("NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER"),
    SPORTS_PRO: !!readEnvAny("NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO"),
    SPORTS_ELITE: !!readEnvAny("NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE"),
    BIZ_STARTER: !!readEnvAny("NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER"),
    BIZ_PRO: !!readEnvAny("NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO"),
    BIZ_ELITE: !!readEnvAny("NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE"),
  };

  return NextResponse.json({
    ok: !!(siteUrl && supabaseUrl && supabaseAnon && supabaseService && stripePk && stripeSk && stripeWh),
    siteUrl: !!siteUrl,
    supabase: {
      url: !!supabaseUrl,
      anon: !!supabaseAnon,
      service: !!supabaseService,
    },
    stripe: {
      pk: !!stripePk,
      sk: !!stripeSk,
      webhook: !!stripeWh,
    },
    prices,
  });
}
