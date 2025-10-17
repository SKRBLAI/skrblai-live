// MMM: Enhanced feature flags probe - shows resolved values with debugging info
import { NextResponse } from 'next/server';
import { FEATURE_FLAGS } from '@/lib/config/featureFlags';
import { getFlagsSnapshot } from '@/lib/config/flags';

export async function GET() {
  const flags = {
    NEXT_PUBLIC_ENABLE_STRIPE: FEATURE_FLAGS.ENABLE_STRIPE,
    NEXT_PUBLIC_HP_GUIDE_STAR: FEATURE_FLAGS.HP_GUIDE_STAR,
    NEXT_PUBLIC_ENABLE_ORBIT: FEATURE_FLAGS.ENABLE_ORBIT,
    NEXT_PUBLIC_ENABLE_BUNDLES: FEATURE_FLAGS.ENABLE_BUNDLES,
    NEXT_PUBLIC_ENABLE_LEGACY: FEATURE_FLAGS.ENABLE_LEGACY,
    NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS: FEATURE_FLAGS.FF_STRIPE_FALLBACK_LINKS,
    NEXT_PUBLIC_SHOW_PERCY_WIDGET: FEATURE_FLAGS.SHOW_PERCY_WIDGET,
    NEXT_PUBLIC_USE_OPTIMIZED_PERCY: FEATURE_FLAGS.USE_OPTIMIZED_PERCY,
    FF_N8N_NOOP: FEATURE_FLAGS.FF_N8N_NOOP,
  };

  // Get detailed flag information for debugging
  const detailedFlags = getFlagsSnapshot();

  return NextResponse.json({ 
    ok: true, 
    flags,
    detailedFlags,
    warnings: getWarnings(flags),
    timestamp: new Date().toISOString()
  }, { headers: { 'Cache-Control': 'no-store' } });
}

function getWarnings(flags: Record<string, any>): string[] {
  const warnings: string[] = [];
  
  // Check for critical flags that might be misconfigured
  if (!flags.NEXT_PUBLIC_ENABLE_STRIPE) {
    warnings.push('NEXT_PUBLIC_ENABLE_STRIPE is disabled - all payment buttons will be disabled');
  }
  
  if (flags.NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS) {
    warnings.push('NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS is enabled - using Payment Links instead of Checkout Sessions');
  }
  
  if (flags.FF_N8N_NOOP) {
    warnings.push('FF_N8N_NOOP is enabled - n8n webhooks are disabled');
  }
  
  return warnings;
}
