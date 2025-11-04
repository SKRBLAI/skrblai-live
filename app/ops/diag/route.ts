import { NextRequest, NextResponse } from 'next/server';
import { getBoostClientAdmin } from '@/lib/supabase/server';
import { getPriceId } from '@/lib/stripe/priceResolver';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse(null, { status: 404 });
  }

  // Clerk check
  let clerk = 'ok';
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) clerk = 'error';

  // Boost check
  let boost = 'ok';
  try {
    getBoostClientAdmin();
  } catch {
    boost = 'error';
  }

  // Stripe check
  let stripe = 'ok';
  try {
    getPriceId('biz_basic');
  } catch {
    stripe = 'error';
  }

  // N8N check
  let n8n = process.env.N8N_API_KEY && process.env.N8N_BASE_URL ? 'ok' : 'noop';

  // Price map check
  let priceMap = 'ok';
  try {
    const raw = process.env.NEXT_PUBLIC_PRICE_MAP_JSON;
    if (!raw) throw new Error();
    JSON.parse(raw);
  } catch {
    priceMap = 'error';
  }

  // Flags
  const flags = {
    clerk: process.env.NEXT_PUBLIC_FF_CLERK === '1',
    boost: process.env.NEXT_PUBLIC_FF_USE_BOOST === '1',
    n8n: process.env.NEXT_PUBLIC_FF_N8N === '1',
    percyOptimized: process.env.NEXT_PUBLIC_FF_PERCY_OPTIMIZED === '1',
  };

  return NextResponse.json({ clerk, boost, stripe, n8n, priceMap, flags });
}
