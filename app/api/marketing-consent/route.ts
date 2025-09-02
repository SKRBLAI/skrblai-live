import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase/server';

// Initialize Supabase client with service role
// GET - Retrieve user's current marketing consent status
export async function GET(req: NextRequest) {
  
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
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get marketing consent status
    const consentResult = await supabase.rpc('get_marketing_consent', {
      p_user_id: user.id
    });

    if (consentResult.error) {
      console.error('[Marketing Consent API] Error retrieving consent:', consentResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve consent status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ...consentResult.data
    });

  } catch (error: any) {
    console.error('[Marketing Consent API] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Update user's marketing consent
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

    const body = await req.json();
    const { consentGiven } = body;

    if (typeof consentGiven !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'consentGiven must be a boolean value' },
        { status: 400 }
      );
    }

    // Verify token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Extract request metadata
    const requestMetadata = {
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
      userAgent: req.headers.get('user-agent') || null
    };

    console.log('[Marketing Consent API] Updating consent for user:', {
      userId: user.id,
      email: user.email,
      consentGiven,
      ip: requestMetadata.ip
    });

    // Update marketing consent
    const consentResult = await supabase.rpc('update_marketing_consent', {
      p_user_id: user.id,
      p_email: user.email!,
      p_consent_given: consentGiven,
      p_source: 'profile_update',
      p_ip_address: requestMetadata.ip,
      p_user_agent: requestMetadata.userAgent
    });

    if (consentResult.error) {
      console.error('[Marketing Consent API] Error updating consent:', consentResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to update consent' },
        { status: 500 }
      );
    }

    console.log('[Marketing Consent API] Consent updated successfully');

    return NextResponse.json({
      success: true,
      message: consentGiven 
        ? 'Marketing consent granted successfully' 
        : 'Marketing consent withdrawn successfully',
      ...consentResult.data
    });

  } catch (error: any) {
    console.error('[Marketing Consent API] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 