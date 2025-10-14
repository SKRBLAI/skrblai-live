import { NextResponse } from 'next/server';
import { readEnvAny } from '@/lib/env/readEnvAny';
import { FEATURE_FLAGS } from '@/lib/config/featureFlags';

function fingerprint(value?: string | null) {
  if (!value) return { present: false } as const;
  const trimmed = value.trim();
  if (!trimmed) return { present: false } as const;
  const underscoreIdx = trimmed.indexOf('_');
  const prefix = underscoreIdx > 0 ? trimmed.slice(0, underscoreIdx + 1) : trimmed.slice(0, 8);
  const tail8 = trimmed.slice(-8);
  return { present: true, prefix, tail8 } as const;
}

function getProjectInfo(url?: string) {
  try {
    if (!url) return { projectHost: '', projectRef: '', assertLiveProject: false };
    const u = new URL(url);
    const host = u.hostname;
    const parts = host.split('.');
    const ref = parts[0] || '';
    const assertLive = host.includes('skrblai.io') || host.includes('auth.skrblai.io');
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

  const payload = {
    supabase: {
      urlPresent: !!supabaseUrl,
      anonPresent: !!anon,
      servicePresent: !!service,
      projectRef: notes.projectRef,
      urlFp: fingerprint(supabaseUrl),
      anonFp: fingerprint(anon),
      serviceFp: fingerprint(service),
    },
    stripe: {
      pkPresent: !!stripePk,
      skPresent: !!stripeSk,
      whPresent: !!stripeWh,
      pkFp: fingerprint(stripePk),
      skFp: fingerprint(stripeSk),
      whFp: fingerprint(stripeWh),
    },
    site: {
      siteUrlPresent: !!siteUrl,
      siteUrlFp: fingerprint(siteUrl),
    },
    featureFlags: FEATURE_FLAGS,
    notes,
  } as const;

  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
}
