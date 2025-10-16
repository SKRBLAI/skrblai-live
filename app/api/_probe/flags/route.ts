// MMM: Feature flags probe - shows resolved boolean values
import { NextResponse } from 'next/server';
import { FEATURE_FLAGS } from '@/lib/config/featureFlags';

export async function GET() {
  const flags = {
    NEXT_PUBLIC_ENABLE_STRIPE: FEATURE_FLAGS.ENABLE_STRIPE,
    NEXT_PUBLIC_HP_GUIDE_STAR: FEATURE_FLAGS.HP_GUIDE_STAR,
    NEXT_PUBLIC_ENABLE_ORBIT: FEATURE_FLAGS.ENABLE_ORBIT,
    NEXT_PUBLIC_ENABLE_BUNDLES: FEATURE_FLAGS.ENABLE_BUNDLES,
    NEXT_PUBLIC_SHOW_PERCY_WIDGET: FEATURE_FLAGS.USE_OPTIMIZED_PERCY,
    FF_N8N_NOOP: FEATURE_FLAGS.FF_N8N_NOOP,
  };

  return NextResponse.json({ 
    ok: true, 
    flags,
    timestamp: new Date().toISOString()
  }, { headers: { 'Cache-Control': 'no-store' } });
}
