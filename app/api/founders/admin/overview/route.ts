/**
 * Founder Admin Overview API (Creator Only)
 * GET /api/founders/admin/overview
 * Returns founder system overview and usage logs for creator oversight
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { validateCreatorAccess } from '@/lib/founders/roles';
import { getRecentFounderLogs, logFounderAction } from '@/lib/founders/codes';
import { getServerSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({
        error: 'Authentication required'
      }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Validate creator access
    const isCreator = await validateCreatorAccess(userId, userEmail);
    if (!isCreator) {
      // Log unauthorized access attempt
      await logFounderAction({
        userId,
        action: 'admin.unauthorized_access',
        meta: {
          endpoint: '/api/founders/admin/overview',
          email: userEmail,
          timestamp: new Date().toISOString()
        }
      });

      return NextResponse.json({
        error: 'Creator access required'
      }, { status: 403 });
    }

    // Get admin Supabase client for full access
    const adminSupabase = getServerSupabaseAdmin();
    if (!adminSupabase) {
      return NextResponse.json({
        error: 'Service temporarily unavailable'
      }, { status: 503 });
    }

    // Get founder codes overview
    const { data: founderOverview, error: overviewError } = await adminSupabase
      .from('v_founder_overview')
      .select('*')
      .order('created_at', { ascending: false });

    if (overviewError) {
      console.error('[FOUNDERS ADMIN] Error fetching founder overview:', overviewError);
    }

    // Get recent usage logs
    const recentLogs = await getRecentFounderLogs(50);

    // Get membership statistics
    const { data: membershipStats, error: statsError } = await adminSupabase
      .from('founder_memberships')
      .select('role, status')
      .eq('status', 'active');

    if (statsError) {
      console.error('[FOUNDERS ADMIN] Error fetching membership stats:', statsError);
    }

    // Calculate statistics
    const stats = {
      totalActiveMemberships: membershipStats?.length || 0,
      creatorCount: membershipStats?.filter(m => m.role === 'creator').length || 0,
      founderCount: membershipStats?.filter(m => m.role === 'founder').length || 0,
      heirCount: membershipStats?.filter(m => m.role === 'heir').length || 0,
      totalCodes: founderOverview?.length || 0,
      activeCodes: founderOverview?.filter(c => c.is_active).length || 0
    };

    // Log admin access
    await logFounderAction({
      userId,
      action: 'admin.overview_access',
      meta: {
        stats,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      overview: founderOverview || [],
      recentLogs,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[FOUNDERS ADMIN] Error in overview endpoint:', error);
    
    return NextResponse.json({
      error: 'An unexpected error occurred'
    }, { status: 500 });
  }
}