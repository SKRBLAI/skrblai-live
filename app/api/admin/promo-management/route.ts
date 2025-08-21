import { NextResponse } from 'next/server';
import { logAuthEvent } from '../../../../lib/auth/dashboardAuth';
import { withSafeJson } from '@/lib/api/safe';
import { getOptionalServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper function to check admin access
async function checkAdminAccess(req: Request): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      return { success: false, error: 'Service unavailable' };
    }
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return { success: false, error: 'No authorization token provided' };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return { success: false, error: 'Invalid or expired token' };
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('userId', user.id)
      .maybeSingle();

    if (roleError || !roleData || roleData.role !== 'admin') {
      return { success: false, error: 'Admin access required' };
    }

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: 'Authentication check failed' };
  }
}

/**
 * POST /api/admin/promo-management
 * Create new promo/VIP codes or manage existing ones
 */
export const POST = withSafeJson(async (req: Request) => {
  try {
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase not configured' },
        { status: 503 }
      );
    }
    const adminCheck = await checkAdminAccess(req);
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const { action, data } = await req.json();

    switch (action) {
      case 'create_promo_code': {
        const {
          code,
          type,
          usageLimit,
          benefits,
          metadata,
          expiresAt
        } = data;

        if (!code || !type || !benefits) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: code, type, benefits' },
            { status: 400 }
          );
        }

        const { data: promoCode, error } = await supabase
          .from('promo_codes')
          .insert({
            code: code.toUpperCase(),
            type,
            usage_limit: usageLimit || null,
            benefits,
            metadata: metadata || {},
            expires_at: expiresAt || null,
            status: 'active'
          })
          .select()
          .single();

        if (error) {
          console.error('[Admin] Promo code creation error:', error);
          return NextResponse.json(
            { success: false, error: 'Failed to create promo code' },
            { status: 500 }
          );
        }

        // Log admin action
        await logAuthEvent(
          adminCheck.user.id,
          adminCheck.user.email,
          'admin_promo_code_created',
          { promoCode: code, type, benefits }
        );

        return NextResponse.json({
          success: true,
          promoCode,
          message: 'Promo code created successfully'
        });
      }

      case 'create_vip_user': {
        const {
          email,
          domain,
          companyName,
          vipLevel,
          vipScore,
          benefits
        } = data;

        if (!email) {
          return NextResponse.json(
            { success: false, error: 'Email is required' },
            { status: 400 }
          );
        }

        const { data: vipUser, error } = await supabase
          .from('vip_users')
          .insert({
            email: email.toLowerCase(),
            domain: domain || email.split('@')[1],
            company_name: companyName,
            vip_level: vipLevel || 'gold',
            vip_score: vipScore || 0,
            is_vip: true,
            recognition_count: 1,
            scoring_breakdown: {
              manual_admin_assignment: true,
              assigned_by: adminCheck.user.email,
              assigned_at: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (error) {
          console.error('[Admin] VIP user creation error:', error);
          return NextResponse.json(
            { success: false, error: 'Failed to create VIP user' },
            { status: 500 }
          );
        }

        // Log admin action
        await logAuthEvent(
          adminCheck.user.id,
          adminCheck.user.email,
          'admin_vip_user_created',
          { vipEmail: email, vipLevel, companyName }
        );

        return NextResponse.json({
          success: true,
          vipUser,
          message: 'VIP user created successfully'
        });
      }

      case 'deactivate_promo_code': {
        const { codeId } = data;

        if (!codeId) {
          return NextResponse.json(
            { success: false, error: 'Code ID is required' },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from('promo_codes')
          .update({ 
            status: 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('id', codeId);

        if (error) {
          console.error('[Admin] Promo code deactivation error:', error);
          return NextResponse.json(
            { success: false, error: 'Failed to deactivate promo code' },
            { status: 500 }
          );
        }

        // Log admin action
        await logAuthEvent(
          adminCheck.user.id,
          adminCheck.user.email,
          'admin_promo_code_deactivated',
          { codeId }
        );

        return NextResponse.json({
          success: true,
          message: 'Promo code deactivated successfully'
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('[Admin] Promo management error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * GET /api/admin/promo-management
 * Get promo codes and VIP users for admin dashboard
 */
export const GET = withSafeJson(async (req: Request) => {
  try {
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase not configured' },
        { status: 503 }
      );
    }
    const adminCheck = await checkAdminAccess(req);
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (type === 'promo_codes') {
      let query = supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq('status', status);
      }

      const { data: promoCodes, error } = await query;

      if (error) {
        console.error('[Admin] Promo codes fetch error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch promo codes' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        promoCodes,
        count: promoCodes?.length || 0
      });
    }

    if (type === 'vip_users') {
      const { data: vipUsers, error } = await supabase
        .from('vip_users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[Admin] VIP users fetch error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch VIP users' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        vipUsers,
        count: vipUsers?.length || 0
      });
    }

    if (type === 'analytics') {
      const { data: analyticsData, error } = await supabase.rpc('get_auth_analytics', {
        p_hours_back: parseInt(searchParams.get('hours') || '24')
      });

      if (error) {
        console.error('[Admin] Analytics fetch error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch analytics' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        analytics: analyticsData
      });
    }

    // Default: return summary
    const [promoResult, vipResult] = await Promise.all([
      supabase
        .from('promo_codes')
        .select('id, code, type, status, current_usage, usage_limit')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('vip_users')
        .select('id, email, company_name, vip_level, is_vip')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    return NextResponse.json({
      success: true,
      summary: {
        recentPromoCodes: promoResult.data || [],
        recentVipUsers: vipResult.data || []
      }
    });

  } catch (error: any) {
    console.error('[Admin] Promo management GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});