// MMM: Supabase probe with URL fingerprint and single-source env reads
import { NextResponse } from 'next/server';
import { getServerSupabaseAnon } from '@/lib/supabase';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonPresent = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const servicePresent = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    let dnsHost = '';
    try {
      if (url) {
        const u = new URL(url);
        dnsHost = u.hostname;
      }
    } catch {}

    const supabase = getServerSupabaseAnon();
    if (!supabase) {
      return NextResponse.json({ 
        url: dnsHost, 
        anonPresent, 
        servicePresent, 
        connectOk: false, 
        error: 'supabase-not-configured',
        errorClass: 'ConfigError'
      }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }

    // Do a minimal RLS-respecting query: select 1 from a safe table
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      const rlsBlocked = !!error && (error.message?.toLowerCase().includes('permission denied') || error.code === 'PGRST116');
      if (error && !rlsBlocked) {
        return NextResponse.json({ 
          url: dnsHost, 
          anonPresent, 
          servicePresent, 
          connectOk: false, 
          rlsBlocked: false, 
          error: error.message?.slice(0, 120) || 'query-error',
          errorClass: error.code || 'QueryError'
        }, { headers: { 'Cache-Control': 'no-store' } });
      }
      return NextResponse.json({ 
        url: dnsHost, 
        anonPresent, 
        servicePresent, 
        connectOk: true, 
        rlsBlocked, 
        error: null 
      }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (e: any) {
      return NextResponse.json({ 
        url: dnsHost, 
        anonPresent, 
        servicePresent, 
        connectOk: false, 
        rlsBlocked: false, 
        error: e?.message?.slice(0, 120) || 'query-exception',
        errorClass: e?.constructor?.name || 'Exception'
      }, { headers: { 'Cache-Control': 'no-store' } });
    }
  } catch (e: any) {
    return NextResponse.json({ 
      url: '', 
      anonPresent: false, 
      servicePresent: false, 
      connectOk: false, 
      error: e?.message?.slice(0, 120) || 'init-error',
      errorClass: e?.constructor?.name || 'InitError'
    }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
