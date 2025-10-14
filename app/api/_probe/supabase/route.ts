import { NextResponse } from 'next/server';
import { getServerSupabaseAnon } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getServerSupabaseAnon();
    if (!supabase) {
      return NextResponse.json({ ok: false, authConfigured: false, rlsBlocked: false, error: 'supabase-not-configured' }, { status: 503 });
    }

    // Do a minimal RLS-respecting query: select 1 from a safe table
    // We'll try a simple RPC-less ping by querying a likely public table; if unavailable, catch and classify
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      const rlsBlocked = !!error && (error.message?.toLowerCase().includes('permission denied') || error.code === 'PGRST116');
      if (error && !rlsBlocked) {
        return NextResponse.json({ ok: false, authConfigured: true, rlsBlocked: false, error: error.message?.slice(0, 120) || 'query-error' }, { headers: { 'Cache-Control': 'no-store' } });
      }
      return NextResponse.json({ ok: true, authConfigured: true, rlsBlocked, error: null }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (e: any) {
      return NextResponse.json({ ok: false, authConfigured: true, rlsBlocked: false, error: e?.message?.slice(0, 120) || 'query-exception' }, { headers: { 'Cache-Control': 'no-store' } });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, authConfigured: false, rlsBlocked: false, error: e?.message?.slice(0, 120) || 'init-error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
