/**
 * Founder Code Redemption API
 * POST /api/founders/redeem
 * Securely redeems founder codes and sets access cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redeemFounderCode, logFounderAction } from '@/lib/founders/codes';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({
        ok: false,
        error: 'Code is required'
      }, { status: 400 });
    }

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({
        ok: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Attempt to redeem the founder code
    const redemptionResult = await redeemFounderCode({
      userId,
      plainCode: code
    });

    if (!redemptionResult.success) {
      // Log failed attempt
      await logFounderAction({
        userId,
        action: 'redeem.attempt.failed',
        meta: { 
          error: redemptionResult.error,
          timestamp: new Date().toISOString()
        }
      });

      return NextResponse.json({
        ok: false,
        error: redemptionResult.error
      }, { status: 400 });
    }

    // Success - set founder access cookie
    const response = NextResponse.json({
      ok: true,
      role: redemptionResult.role,
      access: 'all',
      codeLabel: redemptionResult.codeLabel,
      agentLikeness: redemptionResult.agentLikeness
    });

    // Set secure, short-lived founder access cookie
    // This cookie indicates founder access without storing sensitive data
    response.cookies.set('skrbl_founder', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    // Also set role-specific cookie for routing
    response.cookies.set('skrbl_founder_role', redemptionResult.role!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    // Log successful redemption
    await logFounderAction({
      userId,
      action: 'redeem.success',
      meta: {
        role: redemptionResult.role,
        codeLabel: redemptionResult.codeLabel,
        agentLikeness: redemptionResult.agentLikeness,
        timestamp: new Date().toISOString()
      }
    });

    return response;

  } catch (error) {
    console.error('[FOUNDERS API] Error in redeem endpoint:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'An unexpected error occurred'
    }, { status: 500 });
  }
}

// Rate limiting could be added here with a middleware or library like upstash/ratelimit
// For now, relying on Supabase RLS and bcrypt timing to prevent brute force