import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '../../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface IntakeData {
  name: string;
  email: string;
  age: string;
  gender: string;
  sport: string;
  sport_other: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as IntakeData;
    
    // Basic validation
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Get optional Supabase client
    const supabase = getOptionalServerSupabase();
    
    if (!supabase) {
      // No Supabase available - return local-only mode
      return NextResponse.json({
        saved: false,
        localOnly: true,
        message: 'Profile saved locally'
      });
    }

    try {
      // Get user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get client IP for tracking
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

      // Prepare data for database
      const intakeRecord = {
        name: body.name.trim(),
        email: body.email?.trim() || null,
        age: body.age || null,
        gender: body.gender || null,
        sport: body.sport || null,
        sport_other: body.sport_other?.trim() || null,
        ip: ip,
        user_id: user?.id || null,
        source: 'sports_page',
        created_at: new Date().toISOString()
      };

      // Upsert into sports_intake table
      const { data, error } = await supabase
        .from('sports_intake')
        .upsert(intakeRecord, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select('id')
        .single();

      if (error) {
        console.error('Supabase intake error:', error);
        // Fall back to local-only mode
        return NextResponse.json({
          saved: false,
          localOnly: true,
          message: 'Profile saved locally'
        });
      }

      return NextResponse.json({
        saved: true,
        intakeId: data.id,
        message: 'Profile saved successfully'
      });

    } catch (supabaseError) {
      console.error('Supabase operation failed:', supabaseError);
      // Graceful fallback to local-only
      return NextResponse.json({
        saved: false,
        localOnly: true,
        message: 'Profile saved locally'
      });
    }

  } catch (error) {
    console.error('Intake API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process intake',
        saved: false 
      },
      { status: 503 }
    );
  }
}