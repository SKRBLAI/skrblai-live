import { promises as fs } from 'fs';
import path from 'path';

import { NextResponse } from 'next/server';

import { flagsSnapshot, getFlagBool, isBoost, isClerk, siteVersion } from '@/lib/config/featureFlags';

export const runtime = 'nodejs';

const AUDIT_JSON_PATH = path.join(process.cwd(), 'docs/FEATURE_FLAGS_AUDIT.json');

type AuditCounts = {
  total: number;
  active: number;
  unused: number;
  danger: number;
  shadow?: number;
};

type AuditFile = {
  counts?: AuditCounts;
  summary?: { counts?: AuditCounts };
};

async function readAuditCounts(): Promise<AuditCounts | null> {
  try {
    const raw = await fs.readFile(AUDIT_JSON_PATH, 'utf8');
    const data = JSON.parse(raw) as AuditFile;
    return data.counts ?? data.summary?.counts ?? null;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[ops/diag] Unable to read feature flag audit snapshot:', error);
    }
    return null;
  }
}

function computeCountsFromSnapshot(snapshot: Record<string, string | boolean>): AuditCounts {
  const keys = Object.keys(snapshot);
  const total = keys.length;
  let active = 0;
  let danger = 0;

  const normalizedCounts = new Map<string, number>();

  for (const key of keys) {
    const value = snapshot[key];
    const normalizedKey = key.replace(/^NEXT_PUBLIC_/, '');
    normalizedCounts.set(normalizedKey, (normalizedCounts.get(normalizedKey) ?? 0) + 1);

    if (typeof value === 'boolean') {
      if (value) active += 1;
    } else {
      const trimmed = value.trim();
      if (trimmed && trimmed !== 'legacy' && trimmed !== '0') {
        active += 1;
      }
    }

    if (/AUTH|PAY|STRIPE|CHECKOUT|CLERK|BOOST|PAYMENT/i.test(key)) {
      danger += 1;
    }
  }

  let shadow = 0;
  for (const count of normalizedCounts.values()) {
    if (count > 1) {
      shadow += 1;
    }
  }

  const unused = Math.max(total - active, 0);

  return { total, active, unused, danger, shadow: shadow || undefined };
}

function buildStripeDiagnostics() {
  const raw = process.env.NEXT_PUBLIC_PRICE_MAP_JSON;
  if (!raw) {
    return { priceMapPresent: false, priceKeys: 0 };
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { priceMapPresent: true, priceKeys: Object.keys(parsed).length };
    }
    return { priceMapPresent: true, priceKeys: 0 };
  } catch {
    return { priceMapPresent: true, priceKeys: 0 };
  }
}

function buildBoostPresence() {
  return {
    url: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL_BOOST ?? process.env.SUPABASE_URL_BOOST),
    anon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST ?? process.env.SUPABASE_ANON_KEY_BOOST),
    service: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY_BOOST),
  };
}

function buildClerkPresence() {
  return {
    pub: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_CLERK_PUBLIC_KEY),
    sec: Boolean(process.env.CLERK_SECRET_KEY ?? process.env.CLERK_API_KEY),
  };
}

export async function GET() {
  const snapshot = flagsSnapshot();
  const counts = (await readAuditCounts()) ?? computeCountsFromSnapshot(snapshot);

  const payload = {
    ok: true,
    version: 'relaunch-boost-clerk',
    flags: {
      FF_BOOST: isBoost() ? '1' : '0',
      FF_CLERK: isClerk() ? '1' : '0',
      FF_N8N_NOOP: getFlagBool('FF_N8N_NOOP', true) ? '1' : '0',
      FF_SITE_VERSION: siteVersion(),
      counts,
    },
    stripe: buildStripeDiagnostics(),
    boost: buildBoostPresence(),
    clerk: buildClerkPresence(),
    ts: new Date().toISOString(),
  };

  return NextResponse.json(payload);
}
