import { NextRequest, NextResponse } from 'next/server';
import { 
  authenticateForDashboard, 
  validatePromoCode,
  logAuthEvent,
  registerUserForDashboard,
  type DashboardAuthRequest 
} from '@/lib/auth/dashboardAuth';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      email, 
      password, 
      promoCode, 
      vipCode, 
      mode, 
      confirm 
    }: DashboardAuthRequest & { mode?: string; confirm?: string } = body;

    // Extract request metadata for audit logging
    const requestMetadata = {
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    };

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and password are required' 
        },
        { status: 400 }
      );
    }

    // Additional validation for signup mode
    if (mode === 'signup') {
      if (!confirm || password !== confirm) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Password confirmation does not match' 
          },
          { status: 400 }
        );
      }

      // Validate password strength
      if (password.length < 8) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Password must be at least 8 characters long' 
          },
          { status: 400 }
        );
      }
    }

    // Log the authentication attempt with enhanced metadata
    console.log('[API] Dashboard auth attempt:', { 
      email, 
      mode: mode || 'signin',
      hasPromoCode: !!promoCode, 
      hasVipCode: !!vipCode,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent
    });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format' 
        },
        { status: 400 }
      );
    }

    // Validate promo code format if provided
    const codeToValidate = promoCode || vipCode;
    if (codeToValidate) {
      // Basic format validation
      if (codeToValidate.length < 3 || codeToValidate.length > 50) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid code format' 
          },
          { status: 400 }
        );
      }

      // Pre-validate the code (optional - helps with UX)
      const codeValidation = await validatePromoCode(codeToValidate);
      if (!codeValidation.isValid) {
        // Log invalid code attempt but don't fail auth
        console.warn('[API] Invalid promo code attempted:', codeToValidate);
      }
    }

    let authResult;

    // Handle signup vs signin
    if (mode === 'signup') {
      // Register new user
      authResult = await registerUserForDashboard({
        email,
        password,
        promoCode,
        vipCode
      }, requestMetadata);
    } else {
      // Authenticate existing user
      authResult = await authenticateForDashboard({
        email,
        password,
        promoCode,
        vipCode
      }, requestMetadata);
    }

    if (!authResult.success) {
      // Log failed authentication
      console.error('[API] Authentication failed:', { 
        email, 
        mode: mode || 'signin',
        error: authResult.error 
      });
      
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || 'Authentication failed'
        },
        { status: 401 }
      );
    }

    // Log successful authentication
    if (authResult.user) {
      await logAuthEvent(
        authResult.user.id,
        authResult.user.email,
        mode === 'signup' ? 'dashboard_signup' : 'dashboard_signin',
        {
          accessLevel: authResult.accessLevel,
          promoRedeemed: authResult.promoRedeemed,
          vipStatus: authResult.vipStatus?.isVIP || false,
          hasPromoCode: !!promoCode,
          hasVipCode: !!vipCode
        }
      );
    }

    console.log('[API] Dashboard auth successful:', {
      userId: authResult.user?.id,
      email: authResult.user?.email,
      mode: mode || 'signin',
      accessLevel: authResult.accessLevel,
      promoRedeemed: authResult.promoRedeemed
    });

    // Determine if VIP or promo mode based on redemption and access level
    const isVipMode = authResult.accessLevel === 'vip' || authResult.vipStatus?.isVIP;
    const isPromoMode = authResult.accessLevel === 'promo' && authResult.promoRedeemed;

    // Return successful authentication
    return NextResponse.json({
      success: true,
      user: {
        id: authResult.user?.id,
        email: authResult.user?.email,
        user_metadata: authResult.user?.user_metadata
      },
      accessLevel: authResult.accessLevel,
      promoRedeemed: authResult.promoRedeemed,
      vipStatus: authResult.vipStatus,
      benefits: authResult.benefits,
      message: authResult.message,
      sessionToken: authResult.user?.access_token,
      vipMode: isVipMode,
      promoMode: isPromoMode,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[API] Dashboard auth error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication service temporarily unavailable',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint for validating codes without authentication
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const checkAccess = searchParams.get('checkAccess');
    
    // If checking user access level
    if (checkAccess === 'true') {
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'No authorization token provided' 
          },
          { status: 401 }
        );
      }

      try {
        // Verify token and get user
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !user) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Invalid or expired token' 
            },
            { status: 401 }
          );
        }

        // Get user's dashboard access
        const { data: accessData, error: accessError } = await supabase
          .from('user_dashboard_access')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (accessError) {
          console.error('[API] Access check error:', accessError);
          return NextResponse.json(
            { 
              success: false, 
              error: 'Failed to check user access' 
            },
            { status: 500 }
          );
        }

        // Get VIP status
        const { data: vipData, error: vipError } = await supabase
          .from('vip_users')
          .select('*')
          .eq('email', user.email!.toLowerCase())
          .maybeSingle();

        const vipStatus = vipData ? {
          isVIP: vipData.is_vip || vipData.vip_level !== 'standard',
          vipLevel: vipData.vip_level,
          vipScore: vipData.vip_score,
          companyName: vipData.company_name
        } : { isVIP: false, vipLevel: 'standard' };

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata
          },
          accessLevel: accessData?.access_level || 'free',
          isVIP: accessData?.is_vip || false,
          vipStatus,
          benefits: accessData?.benefits || {},
          promoCodeUsed: accessData?.promo_code_used || null,
          metadata: accessData?.metadata || {},
          timestamp: new Date().toISOString()
        });

      } catch (error: any) {
        console.error('[API] Access check error:', error);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Access check failed' 
          },
          { status: 500 }
        );
      }
    }
    
    // Original code validation functionality
    if (!code) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Code parameter is required' 
        },
        { status: 400 }
      );
    }

    console.log('[API] Validating promo code:', code);

    // Validate the code
    const validation = await validatePromoCode(code);

    return NextResponse.json({
      success: true,
      isValid: validation.isValid,
      type: validation.type,
      benefits: validation.benefits,
      error: validation.error,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[API] Code validation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Code validation service unavailable',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 