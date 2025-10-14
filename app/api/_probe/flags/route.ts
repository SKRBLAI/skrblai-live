import { NextResponse } from 'next/server';
import { FEATURE_FLAGS } from '@/lib/config/featureFlags';

function rawInputs() {
  const keys = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'));
  const rec: Record<string, string | undefined> = {};
  for (const k of keys) rec[k] = process.env[k];
  return rec;
}

export async function GET() {
  return NextResponse.json({ parsed: FEATURE_FLAGS, raw: rawInputs() }, { headers: { 'Cache-Control': 'no-store' } });
}
