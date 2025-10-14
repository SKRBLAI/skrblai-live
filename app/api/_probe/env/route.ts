import { NextResponse } from 'next/server';

function readEnvAny(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) return value.trim();
  }
  return undefined;
}

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
    // Basic assertion: ensure we're not hitting Boost/staging. Live known refs may include 'zpqavydsinrtaxhowmnb' or custom domain auth.skrblai.io
    const assertLive = host.includes('skrblai.io') || host.includes('zpqavydsinrtaxhowmnb') || host.includes('auth.skrblai.io');
    return { projectHost: host, projectRef: ref, assertLiveProject: assertLive };
  } catch {
    return { projectHost: '', projectRef: '', assertLiveProject: false };
  }
}

export async function GET() {
  const supabaseUrl = readEnvAny('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
  const anon = readEnvAny('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ANON_KEY');
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const stripePk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripeSk = process.env.STRIPE_SECRET_KEY;
  const stripeWh = process.env.STRIPE_WEBHOOK_SECRET;

  const siteUrl = readEnvAny('NEXT_PUBLIC_SITE_URL', 'APP_BASE_URL', 'NEXT_PUBLIC_BASE_URL');

  const notes = getProjectInfo(supabaseUrl);

  const toBool = (v: string | undefined) => v === '1' || v === 'true';
  const flags = {
    NEXT_PUBLIC_ENABLE_STRIPE: toBool(process.env.NEXT_PUBLIC_ENABLE_STRIPE ?? '1'),
    NEXT_PUBLIC_HP_GUIDE_STAR: toBool(process.env.NEXT_PUBLIC_HP_GUIDE_STAR ?? '1'),
    NEXT_PUBLIC_ENABLE_ORBIT: toBool(process.env.NEXT_PUBLIC_ENABLE_ORBIT ?? '0'),
    NEXT_PUBLIC_ENABLE_BUNDLES: toBool(process.env.NEXT_PUBLIC_ENABLE_BUNDLES ?? '0'),
    NEXT_PUBLIC_ENABLE_LEGACY: toBool(process.env.NEXT_PUBLIC_ENABLE_LEGACY ?? '0'),
    NEXT_PUBLIC_ENABLE_ARR_DASH: toBool(process.env.NEXT_PUBLIC_ENABLE_ARR_DASH ?? '0'),
    NEXT_PUBLIC_SHOW_PERCY_WIDGET: toBool(process.env.NEXT_PUBLIC_SHOW_PERCY_WIDGET ?? '0'),
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
