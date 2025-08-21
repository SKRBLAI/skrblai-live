import { NextResponse } from 'next/server';
import { 
  authenticateForDashboard, 
  validatePromoCode,
  logAuthEvent,
  registerUserForDashboard,
  type DashboardAuthRequest 
} from '../../../../lib/auth/dashboardAuth';
import { withSafeJson } from '@/lib/api/safe';
import { getOptionalServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withSafeJson(async (req: Request) => {
  try {
    // Get Supabase client inside handler with proper null checking
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Service temporarily unavailable' 
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { 
      email, 
      password, 
      promoCode, 
      vipCode, 
      mode, 
      confirm,
      marketingConsent 
    }: DashboardAuthRequest & { mode?: string; confirm?: string } = body;

    // Extract request metadata for audit logging
    const requestMetadata = {
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    };

    console.log('[AUTH API] Processing request:', {
      mode,
      email,
      hasPromoCode: !!promoCode,
      hasVipCode: !!vipCode,
      marketingConsent,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent.substring(0, 50)
    });

    // Validate required fields
    if (!email || !password) {
      console.log('[AUTH API] Missing required fields');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and password are required' 
        },
        { status: 400 }
      );
    }

    // Handle signup mode
    if (mode === 'signup') {
      if (!confirm) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Password confirmation is required for signup' 
          },
          { status: 400 }
        );
      }

      if (password !== confirm) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Passwords do not match' 
          },
          { status: 400 }
        );
      }

      console.log('[AUTH API] Processing signup');
      const result = await registerUserForDashboard(
        { email, password, promoCode, vipCode, marketingConsent },
        requestMetadata
      );

      console.log('[AUTH API] Signup result:', {
        success: result.success,
        accessLevel: result.accessLevel,
        isVIP: result.vipStatus?.isVIP,
        rateLimited: result.rateLimited
      });

      return NextResponse.json(result, { 
        status: result.success ? 200 : (result.rateLimited ? 429 : 400) 
      });
    }

    // Handle signin mode (default)
    console.log('[AUTH API] Processing signin');
    const result = await authenticateForDashboard(
      { email, password, promoCode, vipCode, marketingConsent },
      requestMetadata
    );

    console.log('[AUTH API] Signin result:', {
      success: result.success,
      accessLevel: result.accessLevel,
      isVIP: result.vipStatus?.isVIP,
      rateLimited: result.rateLimited
    });

    return NextResponse.json(result, { 
      status: result.success ? 200 : (result.rateLimited ? 429 : 400) 
    });

  } catch (error: any) {
    console.error('[AUTH API] Unexpected error:', error);
    
    // Log the error for debugging
    await logAuthEvent('unknown', 'unknown', 'error', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }).catch(logError => {
      console.error('[AUTH API] Failed to log error:', logError);
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again later.' 
      },
      { status: 500 }
    );
  }
});

// GET endpoint for validating codes without authentication  
export const GET = withSafeJson(async (req: Request) => {
  try {
    // Get Supabase client inside handler with proper null checking
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Service temporarily unavailable' 
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const checkAccess = searchParams.get('checkAccess');
    
    // If checking user access level
    if (checkAccess === 'true') {
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        console.log('[AUTH API] GET: No authorization token provided');
        // Instead of returning an error, provide fallback access
        return NextResponse.json({
          success: true,
          accessLevel: 'free',
          isVIP: false,
          vipStatus: { isVIP: false, vipLevel: 'none' },
          benefits: { features: [] },
          promoCodeUsed: null,
          metadata: {}
        });
      }

      try {
        // Get Supabase client inside handler with proper null checking
        const supabase = getOptionalServerSupabase();
        if (!supabase) {
          // Fallback to free access if Supabase is not configured
          return NextResponse.json({
            success: true,
            accessLevel: 'free',
            isVIP: false,
            vipStatus: { isVIP: false, vipLevel: 'none' },
            benefits: { features: [] },
            promoCodeUsed: null,
            metadata: {}
          });
        }

        // Verify token and get user
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !user) {
          console.log('[AUTH API] GET: Invalid token');
          // Instead of returning an error, provide fallback access
          return NextResponse.json({
            success: true,
            accessLevel: 'free',
            isVIP: false,
            vipStatus: { isVIP: false, vipLevel: 'none' },
            benefits: { features: [] },
            promoCodeUsed: null,
            metadata: {}
          });
        }

        // Get user's dashboard access
        const { data: accessData, error: accessError } = await supabase
          .from('user_dashboard_access')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (accessError) {
          console.error('[AUTH API] GET: Error fetching user access:', accessError);
          // Instead of returning an error, provide fallback access
          return NextResponse.json({
            success: true,
            user: {
              id: user.id,
              email: user.email
            },
            accessLevel: 'free',
            isVIP: false,
            vipStatus: { isVIP: false, vipLevel: 'none' },
            benefits: { features: [] },
            promoCodeUsed: null,
            metadata: {}
          });
        }

        // Get VIP status if user is VIP
        let vipStatus: {
          isVIP: boolean;
          vipLevel: string;
          vipScore?: number;
          companyName?: string;
        } = { isVIP: false, vipLevel: 'none' };
        
        if (accessData?.is_vip) {
          const { data: vipData } = await supabase
            .from('vip_users')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (vipData) {
            vipStatus = {
              isVIP: true,
              vipLevel: vipData.vip_level,
              vipScore: vipData.vip_score,
              companyName: vipData.company_name
            };
          }
        }

        console.log('[AUTH API] GET: User access check successful');
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email
          },
          accessLevel: accessData?.access_level || 'free',
          isVIP: accessData?.is_vip || false,
          vipStatus,
          benefits: accessData?.benefits || {},
          promoCodeUsed: accessData?.promo_code_used,
          metadata: accessData?.metadata || {}
        });

      } catch (error: any) {
        console.error('[AUTH API] GET: Error checking access:', error);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to verify access' 
          },
          { status: 500 }
        );
      }
    }

    // If validating a promo/VIP code without auth
    if (code) {
      try {
        const result = await validatePromoCode(code);
        console.log('[AUTH API] GET: Code validation result:', { code, isValid: result.isValid });
        return NextResponse.json(result);
      } catch (error: any) {
        console.error('[AUTH API] GET: Code validation error:', error);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to validate code' 
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid request parameters' 
      },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('[AUTH API] GET: Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
});