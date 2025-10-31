import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase';
import { TrialManager } from '../../../../lib/trial/trialManager';

/**
 * GET /api/trial/status
 * Get current trial status for authenticated user
 */
export async function GET(request: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get trial status
    const trialStatus = await TrialManager.getTrialStatus(user.id);

    return NextResponse.json({
      success: true,
      trialStatus,
    });

  } catch (error: any) {
    console.error('[Trial Status] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get trial status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trial/status
 * Initialize trial for new user
 */
export async function POST(request: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token'
      }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    // Initialize trial
    const result = await TrialManager.initializeTrial(user.id, email || user.email);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }

    // Get updated trial status
    const trialStatus = await TrialManager.getTrialStatus(user.id);

    return NextResponse.json({
      success: true,
      trialStatus,
      initialized: true
    });

  } catch (error: any) {
    console.error('[Trial Initialize] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to initialize trial'
    }, { status: 500 });
  }
} 