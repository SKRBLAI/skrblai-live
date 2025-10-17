// Profile check probe - tests RLS and profile existence
import { NextResponse } from 'next/server';
import { getServerSupabaseAnon, getServerSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const anonClient = getServerSupabaseAnon();
    const adminClient = getServerSupabaseAdmin();
    
    if (!anonClient || !adminClient) {
      return NextResponse.json({
        anonClientAvailable: !!anonClient,
        adminClientAvailable: !!adminClient,
        error: 'Supabase clients not configured',
        timestamp: new Date().toISOString()
      }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }

    // Test anon client profile access
    let anonResult = null;
    let anonError = null;
    let anonRlsBlocked = false;

    try {
      const { data, error } = await anonClient
        .from('profiles')
        .select('*')
        .limit(1);
      
      anonResult = data;
      anonError = error?.message || null;
      anonRlsBlocked = !!error && (
        error.message?.toLowerCase().includes('permission denied') || 
        error.code === 'PGRST116' ||
        error.message?.toLowerCase().includes('row level security')
      );
    } catch (e: any) {
      anonError = e?.message || 'anon-query-exception';
    }

    // Test admin client profile access
    let adminResult = null;
    let adminError = null;

    try {
      const { data, error } = await adminClient
        .from('profiles')
        .select('*')
        .limit(1);
      
      adminResult = data;
      adminError = error?.message || null;
    } catch (e: any) {
      adminError = e?.message || 'admin-query-exception';
    }

    // Test user_roles table access
    let rolesAnonResult = null;
    let rolesAnonError = null;
    let rolesAnonRlsBlocked = false;

    try {
      const { data, error } = await anonClient
        .from('user_roles')
        .select('*')
        .limit(1);
      
      rolesAnonResult = data;
      rolesAnonError = error?.message || null;
      rolesAnonRlsBlocked = !!error && (
        error.message?.toLowerCase().includes('permission denied') || 
        error.code === 'PGRST116' ||
        error.message?.toLowerCase().includes('row level security')
      );
    } catch (e: any) {
      rolesAnonError = e?.message || 'roles-anon-query-exception';
    }

    let rolesAdminResult = null;
    let rolesAdminError = null;

    try {
      const { data, error } = await adminClient
        .from('user_roles')
        .select('*')
        .limit(1);
      
      rolesAdminResult = data;
      rolesAdminError = error?.message || null;
    } catch (e: any) {
      rolesAdminError = e?.message || 'roles-admin-query-exception';
    }

    return NextResponse.json({
      // Profile table access
      profiles: {
        anon: {
          success: !anonError,
          rlsBlocked: anonRlsBlocked,
          error: anonError,
          recordCount: anonResult?.length || 0
        },
        admin: {
          success: !adminError,
          error: adminError,
          recordCount: adminResult?.length || 0
        }
      },
      
      // User roles table access
      userRoles: {
        anon: {
          success: !rolesAnonError,
          rlsBlocked: rolesAnonRlsBlocked,
          error: rolesAnonError,
          recordCount: rolesAnonResult?.length || 0
        },
        admin: {
          success: !rolesAdminError,
          error: rolesAdminError,
          recordCount: rolesAdminResult?.length || 0
        }
      },
      
      // Summary
      anonClientAvailable: !!anonClient,
      adminClientAvailable: !!adminClient,
      timestamp: new Date().toISOString()
    }, { 
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return NextResponse.json({
      anonClientAvailable: false,
      adminClientAvailable: false,
      error: e?.message || 'profile-check-exception',
      timestamp: new Date().toISOString()
    }, { 
      status: 500, 
      headers: { 'Cache-Control': 'no-store' } 
    });
  }
}
