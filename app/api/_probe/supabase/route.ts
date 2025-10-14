import { NextResponse } from 'next/server';
import { getServerSupabaseAnon } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getServerSupabaseAnon();
    if (!supabase) {
      return NextResponse.json({ ok: false, rlsBlocked: 'unknown', errorCode: 'config-missing', errorMessage: 'supabase-not-configured' }, { status: 503 });
    }

    try {
      // Prefer a super-light call; fall back to a tiny table if present
      const { error } = await supabase.rpc('now');
      if (!error) {
        return NextResponse.json({ ok: true, rlsBlocked: false }, { headers: { 'Cache-Control': 'no-store' } });
      }
      const permissionDenied = error.message?.toLowerCase().includes('permission denied') || error.code === 'PGRST116';
      if (permissionDenied) {
        return NextResponse.json({ ok: false, rlsBlocked: true, errorCode: error.code, errorMessage: error.message?.slice(0, 160) }, { headers: { 'Cache-Control': 'no-store' } });
      }
      // Try a second minimal selector against a common tiny table if rpc not available
      const { error: tableErr } = await supabase.from('profiles').select('id').limit(1);
      const denied = !!tableErr && (tableErr.message?.toLowerCase().includes('permission denied') || tableErr.code === 'PGRST116');
      if (denied) {
        return NextResponse.json({ ok: false, rlsBlocked: true, errorCode: tableErr.code, errorMessage: tableErr.message?.slice(0, 160) }, { headers: { 'Cache-Control': 'no-store' } });
      }
      if (tableErr) {
        return NextResponse.json({ ok: false, rlsBlocked: false, errorCode: tableErr.code, errorMessage: tableErr.message?.slice(0, 160) }, { headers: { 'Cache-Control': 'no-store' } });
      }
      return NextResponse.json({ ok: true, rlsBlocked: false }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (e: any) {
      const msg = e?.message?.slice(0, 160) || 'query-exception';
      return NextResponse.json({ ok: false, rlsBlocked: 'unknown', errorMessage: msg }, { headers: { 'Cache-Control': 'no-store' } });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, rlsBlocked: 'unknown', errorMessage: e?.message?.slice(0, 160) || 'init-error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
