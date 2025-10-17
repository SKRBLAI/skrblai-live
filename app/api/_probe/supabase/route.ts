// Enhanced Supabase probe with comprehensive diagnosis
import { NextResponse } from 'next/server';
import { getServerSupabaseAnon, getServerSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonPresent = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const servicePresent = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    let dnsHost = '';
    let customAuthDomain = false;
    try {
      if (url) {
        const u = new URL(url);
        dnsHost = u.hostname;
        customAuthDomain = false; // Removed custom auth domain support
      }
    } catch {}

    // Test anon client
    const anonClient = getServerSupabaseAnon();
    let anonConnectOk = false;
    let anonRlsBlocked = false;
    let anonError = null;
    let schemaTables: string[] = [];

    if (anonClient) {
      try {
        // Test basic connectivity
        const { error } = await anonClient.from('profiles').select('id').limit(1);
        anonRlsBlocked = !!error && (error.message?.toLowerCase().includes('permission denied') || error.code === 'PGRST116');
        anonConnectOk = !error || anonRlsBlocked;
        anonError = error?.message?.slice(0, 120) || null;
      } catch (e: any) {
        anonError = e?.message?.slice(0, 120) || 'anon-query-exception';
      }
    }

    // Test admin client and get schema info
    const adminClient = getServerSupabaseAdmin();
    let adminConnectOk = false;
    let adminError = null;

    if (adminClient) {
      try {
        // Test admin connectivity
        const { error } = await adminClient.from('profiles').select('id').limit(1);
        adminConnectOk = !error;
        adminError = error?.message?.slice(0, 120) || null;

        // Get schema tables list
        if (adminConnectOk) {
          const { data: tables } = await adminClient
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', ['profiles', 'user_roles', 'auth_events', 'leads', 'scheduled_posts']);
          
          schemaTables = (tables || []).map((t: any) => t.table_name);
        }
      } catch (e: any) {
        adminError = e?.message?.slice(0, 120) || 'admin-query-exception';
      }
    }

    // Classify error types
    let errorClass = 'Unknown';
    if (!anonPresent || !servicePresent) {
      errorClass = 'ConfigError';
    } else if (!anonConnectOk && !adminConnectOk) {
      errorClass = 'ConnectionError';
    } else if (anonRlsBlocked) {
      errorClass = 'RLSError';
    } else if (anonConnectOk || adminConnectOk) {
      errorClass = 'Success';
    }

    return NextResponse.json({
      // Basic config
      url: dnsHost,
      customAuthDomain,
      anonPresent,
      servicePresent,
      
      // Connection status
      anonConnectOk,
      adminConnectOk,
      anonRlsBlocked,
      
      // Errors
      anonError,
      adminError,
      errorClass,
      
      // Schema info
      schemaTables,
      
      // Timestamp
      timestamp: new Date().toISOString()
    }, { 
      headers: { 'Cache-Control': 'no-store' },
      status: anonConnectOk || adminConnectOk ? 200 : 503
    });
  } catch (e: any) {
    return NextResponse.json({ 
      url: '', 
      customAuthDomain: false,
      anonPresent: false, 
      servicePresent: false, 
      anonConnectOk: false,
      adminConnectOk: false,
      anonRlsBlocked: false,
      anonError: null,
      adminError: e?.message?.slice(0, 120) || 'init-error',
      errorClass: 'InitError',
      schemaTables: [],
      timestamp: new Date().toISOString()
    }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
