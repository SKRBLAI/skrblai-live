import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = {
    flags: {
      ffUseBoost: process.env.NEXT_PUBLIC_FF_USE_BOOST,
      ffClerk: process.env.NEXT_PUBLIC_FF_CLERK,
    },
    boost: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL_BOOST,
      anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST,
      service: !!process.env.SUPABASE_SERVICE_ROLE_KEY_BOOST,
    },
    clerk: {
      pub: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      sec: !!process.env.CLERK_SECRET_KEY,
    },
    stripe: {
      priceMap: !!process.env.NEXT_PUBLIC_PRICE_MAP_JSON,
      pk: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      sk: !!process.env.STRIPE_SECRET_KEY,
    },
    n8n: {
      noop: process.env.FF_N8N_NOOP === '1',
    },
    env: process.env.NODE_ENV,
  };

  return NextResponse.json({ ok: true, status, ts: new Date().toISOString() });
}
