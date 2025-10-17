// Server-side profile sync endpoint - creates/updates user profile
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Lazy import to avoid build-time errors
    const { getServerSupabaseAnon, getServerSupabaseAdmin } = await import('@/lib/supabase');
    
    // Get user session using anon client (respects RLS)
    const anonClient = getServerSupabaseAnon();
    const adminClient = getServerSupabaseAdmin();
    
    if (!anonClient || !adminClient) {
      return NextResponse.json({
        success: false,
        error: 'Supabase clients not configured',
        timestamp: new Date().toISOString()
      }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }

    // Get current user session
    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'No authenticated user found',
        userError: userError?.message,
        timestamp: new Date().toISOString()
      }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    }

    // Check if profile already exists
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, user_id, email, created_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        profile: existingProfile,
        message: 'Profile already exists',
        timestamp: new Date().toISOString()
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // Create new profile using admin client (bypasses RLS)
    const newProfile = {
      id: user.id, // Use auth user ID as profile ID
      user_id: user.id,
      email: user.email || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create profile',
        profileError: profileError.message,
        timestamp: new Date().toISOString()
      }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }

    // Create default user role if it doesn't exist
    const { data: existingRole } = await adminClient
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingRole) {
      const { error: roleError } = await adminClient
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'user',
          created_at: new Date().toISOString()
        });

      if (roleError) {
        console.warn('[PROFILE_SYNC] Failed to create user role:', roleError.message);
        // Don't fail the profile creation if role creation fails
      }
    }

    return NextResponse.json({
      success: true,
      profile,
      message: 'Profile created successfully',
      timestamp: new Date().toISOString()
    }, { 
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e?.message || 'profile-sync-exception',
      timestamp: new Date().toISOString()
    }, { 
      status: 500, 
      headers: { 'Cache-Control': 'no-store' } 
    });
  }
}
