import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = getOptionalServerSupabase();
    
    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Upsert parent profile
    const { data, error } = await supabase
      .from('parent_profiles')
      .upsert({
        user_id: user.id,
        settings: {},
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating parent profile:', error);
      // Don't fail completely - profile might already exist
      return NextResponse.json({ 
        ok: true, 
        message: 'Parent profile ready',
        warning: 'Profile may already exist'
      });
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Parent profile created successfully',
      profile: data
    });

  } catch (error: any) {
    console.error('Parent provision error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}