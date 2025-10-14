import { NextResponse } from 'next/server';
import { getServerSupabaseAnon } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const supabase = getServerSupabaseAnon();
    if (!supabase) {
      return NextResponse.json({ ok: false, sawUser: false, error: 'supabase-not-configured' }, { status: 503 });
    }

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        return NextResponse.json({ ok: false, sawUser: false, error: error.message?.slice(0, 120) || 'auth-error' }, { headers: { 'Cache-Control': 'no-store' } });
      }
      return NextResponse.json({ ok: true, sawUser: !!data?.user, error: null }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (e: any) {
      return NextResponse.json({ ok: false, sawUser: false, error: e?.message?.slice(0, 120) || 'auth-exception' }, { headers: { 'Cache-Control': 'no-store' } });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, sawUser: false, error: e?.message?.slice(0, 120) || 'init-error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
