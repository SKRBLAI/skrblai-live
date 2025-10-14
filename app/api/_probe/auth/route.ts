import { NextResponse } from 'next/server';
import { getServerSupabaseAnon } from '@/lib/supabase';
import { readEnvAny } from '@/lib/env/readEnvAny';

export async function GET() {
  try {
    const supabase = getServerSupabaseAnon();
    if (!supabase) {
      return NextResponse.json({ ok: false, sessionPresent: false, redirectConfigured: false, error: 'supabase-not-configured' }, { status: 503 });
    }

    try {
      const { data, error } = await supabase.auth.getUser();
      const sessionPresent = !!data?.user && !error;
      const siteUrl = readEnvAny('NEXT_PUBLIC_SITE_URL', 'APP_BASE_URL', 'NEXT_PUBLIC_BASE_URL');
      const redirectConfigured = typeof siteUrl === 'string' && siteUrl.includes('http');
      if (error) {
        return NextResponse.json({ ok: false, sessionPresent, redirectConfigured, error: error.message?.slice(0, 120) || 'auth-error' }, { headers: { 'Cache-Control': 'no-store' } });
      }
      return NextResponse.json({ ok: true, sessionPresent, redirectConfigured, error: null }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (e: any) {
      const siteUrl = readEnvAny('NEXT_PUBLIC_SITE_URL', 'APP_BASE_URL', 'NEXT_PUBLIC_BASE_URL');
      const redirectConfigured = typeof siteUrl === 'string' && siteUrl.includes('http');
      return NextResponse.json({ ok: false, sessionPresent: false, redirectConfigured, error: e?.message?.slice(0, 120) || 'auth-exception' }, { headers: { 'Cache-Control': 'no-store' } });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, sessionPresent: false, redirectConfigured: false, error: e?.message?.slice(0, 120) || 'init-error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
