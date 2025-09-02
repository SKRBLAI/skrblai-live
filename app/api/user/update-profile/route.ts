import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authorization token' },
        { status: 401 }
      );
    }

    const { name } = await req.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Name is required and must be a string' },
        { status: 400 }
      );
    }

    // Update user metadata in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          full_name: name.trim(),
          name: name.trim()
        }
      }
    );

    if (updateError) {
      console.error('[Profile Update] Error updating user metadata:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Also update in user_dashboard_access table if it exists
    try {
      const { error: dashboardUpdateError } = await supabase
        .from('user_dashboard_access')
        .update({
          metadata: {
            ...user.user_metadata,
            full_name: name.trim(),
            name: name.trim(),
            updated_at: new Date().toISOString()
          }
        })
        .eq('user_id', user.id);

      if (dashboardUpdateError) {
        console.warn('[Profile Update] Warning updating dashboard access metadata:', dashboardUpdateError);
        // Don't fail the request if this fails
      }
    } catch (dashboardError) {
      console.warn('[Profile Update] Warning with dashboard access update:', dashboardError);
    }

    console.log('[Profile Update] Successfully updated profile for user:', user.id);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        name: name.trim()
      }
    });

  } catch (error: any) {
    console.error('[Profile Update] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 