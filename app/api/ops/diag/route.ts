import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function asBool(v: string | undefined): boolean {
  if (!v) return false;
  const n = v.toLowerCase();
  return n === '1' || n === 'true' || n === 'yes' || n === 'on';
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'Not available in production' }, { status: 404 });
  }

  // Flags snapshot (minimal)
  const flags = {
    clerk: asBool(process.env.NEXT_PUBLIC_FF_CLERK),
    boost: asBool(process.env.NEXT_PUBLIC_FF_USE_BOOST),
    n8n: asBool(process.env.NEXT_PUBLIC_FF_N8N),
    percyOptimized: asBool(process.env.NEXT_PUBLIC_FF_PERCY_OPTIMIZED),
  };

  // Service checks
  const clerkOk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;
  const boostOk = !!process.env.NEXT_PUBLIC_SUPABASE_URL_BOOST && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST && !!process.env.SUPABASE_SERVICE_ROLE_KEY_BOOST;

  let priceMapOk = false;
  try {
    const parsed = JSON.parse(process.env.NEXT_PUBLIC_PRICE_MAP_JSON || '{}');
    priceMapOk = !!parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0;
  } catch {}

  const stripeOk = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !!process.env.STRIPE_SECRET_KEY;
  const n8nState = flags.n8n ? 'ok' : 'noop';

  const payload = {
    ok: true,
    diag: {
      clerk: clerkOk ? 'ok' : 'error',
      boost: boostOk ? 'ok' : 'error',
      stripe: stripeOk ? 'ok' : 'error',
      n8n: n8nState,
      priceMap: priceMapOk ? 'ok' : 'error',
      flags,
    },
    ts: new Date().toISOString(),
  };

  return NextResponse.json(payload);
}
