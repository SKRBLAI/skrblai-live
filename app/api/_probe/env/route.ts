// MMM: Single-source env reads (no fallbacks)
import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/roles';

function presence(value: string | undefined | null): 'PRESENT' | 'MISSING' {
  return value && value.trim().length > 0 ? 'PRESENT' : 'MISSING';
}

function getProjectInfo(url?: string) {
  try {
    if (!url) return { projectHost: '', projectRef: '', assertLiveProject: false };
    const u = new URL(url);
    const host = u.hostname;
    const parts = host.split('.');
    // Typical pattern: <projectRef>.supabase.co
    const ref = parts[0] || '';
    // Basic assertion: ensure we're not hitting a stale/non-production project. Live known refs may include 'zpqavydsinrtaxhowmnb'
    const assertLive = host.includes('skrblai.io') || host.includes('zpqavydsinrtaxhowmnb');
    return { projectHost: host, projectRef: ref, assertLiveProject: assertLive };
  } catch {
    return { projectHost: '', projectRef: '', assertLiveProject: false };
  }
}

export async function GET() {
  // Lock down in production - admin/founder only
  if (process.env.NODE_ENV === 'production') {
    try {
      await requireRole(['admin', 'founder']);
    } catch {
      return new Response('Not found', { status: 404 });
    }
  }
  // MMM: Only canonical env vars (no dual lookups)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const stripePk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripeSk = process.env.STRIPE_SECRET_KEY;
  const stripeWh = process.env.STRIPE_WEBHOOK_SECRET;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const notes = getProjectInfo(supabaseUrl);

  const toBool = (v: string | undefined) => v === '1' || v?.toLowerCase() === 'true';
  const flags = {
    NEXT_PUBLIC_ENABLE_STRIPE: toBool(process.env.NEXT_PUBLIC_ENABLE_STRIPE ?? '1'),
    NEXT_PUBLIC_HP_GUIDE_STAR: toBool(process.env.NEXT_PUBLIC_HP_GUIDE_STAR ?? '1'),
    NEXT_PUBLIC_ENABLE_ORBIT: toBool(process.env.NEXT_PUBLIC_ENABLE_ORBIT ?? '0'),
    NEXT_PUBLIC_ENABLE_BUNDLES: toBool(process.env.NEXT_PUBLIC_ENABLE_BUNDLES ?? '0'),
    NEXT_PUBLIC_SHOW_PERCY_WIDGET: toBool(process.env.NEXT_PUBLIC_SHOW_PERCY_WIDGET ?? '0'),
    FF_N8N_NOOP: toBool(process.env.FF_N8N_NOOP ?? '1'),
  } as const;

  const payload = {
    supabase: {
      url: presence(supabaseUrl),
      anon: presence(anon),
      service: presence(service),
    },
    stripe: {
      pk: presence(stripePk),
      sk: presence(stripeSk),
      whsec: presence(stripeWh),
    },
    siteUrl: presence(siteUrl),
    flags,
    notes,
  } as const;

  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
}
