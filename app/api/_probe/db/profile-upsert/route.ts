// Profile upsert probe - dev-only endpoint for testing profile creation
import { NextResponse } from 'next/server';
import { getServerSupabaseAdmin } from '@/lib/supabase';

export async function POST() {
  // Only allow in development or with explicit flag
  if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_PROFILE_UPSERT_PROBE) {
    return NextResponse.json({
      success: false,
      error: 'Profile upsert probe disabled in production',
      timestamp: new Date().toISOString()
    }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    const adminClient = getServerSupabaseAdmin();
    
    if (!adminClient) {
      return NextResponse.json({
        success: false,
        error: 'Admin client not configured',
        timestamp: new Date().toISOString()
      }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }

    // Create a test profile using service role
    const testProfile = {
      id: 'test-profile-' + Date.now(),
      user_id: 'test-user-' + Date.now(),
      email: 'test@example.com',
      created_at: new Date().toISOString()
    };

    const { data, error } = await adminClient
      .from('profiles')
      .upsert(testProfile, { onConflict: 'id' })
      .select();

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        errorCode: error.code,
        timestamp: new Date().toISOString()
      }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({
      success: true,
      profile: data?.[0],
      message: 'Test profile created successfully',
      timestamp: new Date().toISOString()
    }, { 
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e?.message || 'profile-upsert-exception',
      timestamp: new Date().toISOString()
    }, { 
      status: 500, 
      headers: { 'Cache-Control': 'no-store' } 
    });
  }
}
