// MMM: Canonical feature flags probe - shows only canonical flags
import { NextResponse } from 'next/server';
import { FLAGS, CONSTANTS } from '@/lib/config/featureFlags';
import { getFlagsSnapshot } from '@/lib/config/flags';
import { requireRole } from '@/lib/auth/roles';

export async function GET() {
  // Lock down in production - admin/founder only
  if (process.env.NODE_ENV === 'production') {
    try {
      await requireRole(['admin', 'founder']);
    } catch {
      return new Response('Not found', { status: 404 });
    }
  }

  // Only show canonical flags (5 total)
  const canonicalFlags = {
    FF_BOOST: FLAGS.FF_BOOST,
    FF_CLERK: FLAGS.FF_CLERK,
    FF_SITE_VERSION: FLAGS.FF_SITE_VERSION,
    FF_N8N_NOOP: FLAGS.FF_N8N_NOOP,
    ENABLE_STRIPE: FLAGS.ENABLE_STRIPE,
  };

  // Get detailed flag information for debugging
  const detailedFlags = getFlagsSnapshot();

  return NextResponse.json({ 
    ok: true, 
    canonicalFlags,
    constants: CONSTANTS,
    detailedFlags,
    warnings: getWarnings(canonicalFlags),
    timestamp: new Date().toISOString()
  }, { headers: { 'Cache-Control': 'no-store' } });
}

function getWarnings(flags: Record<string, any>): string[] {
  const warnings: string[] = [];
  
  if (!flags.ENABLE_STRIPE) {
    warnings.push('ENABLE_STRIPE is disabled - all payment buttons will be disabled');
  }
  
  if (flags.FF_N8N_NOOP) {
    warnings.push('FF_N8N_NOOP is enabled - n8n webhooks are disabled');
  }
  
  if (flags.FF_CLERK) {
    warnings.push('FF_CLERK is enabled - using Clerk auth instead of Supabase');
  }
  
  if (flags.FF_BOOST) {
    warnings.push('FF_BOOST is enabled - using Supabase Boost instead of legacy');
  }
  
  return warnings;
}
