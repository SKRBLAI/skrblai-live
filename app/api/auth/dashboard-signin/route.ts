import { NextRequest, NextResponse } from 'next/server';
import { 
  authenticateForDashboard, 
  validatePromoCode,
  logAuthEvent,
  type DashboardAuthRequest 
} from '@/lib/auth/dashboardAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, promoCode, vipCode }: DashboardAuthRequest = body;

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

    // Log the authentication attempt
    console.log('[API] Dashboard sign-in attempt:', { 
      email, 
      hasPromoCode: !!promoCode, 
      hasVipCode: !!vipCode 
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

    // Authenticate user
    const authResult = await authenticateForDashboard({
      email,
      password,
      promoCode,
      vipCode
    });

    if (!authResult.success) {
      // Log failed authentication
      console.error('[API] Authentication failed:', { email, error: authResult.error });
      
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
        'dashboard_signin',
        {
          accessLevel: authResult.accessLevel,
          promoRedeemed: authResult.promoRedeemed,
          vipStatus: authResult.vipStatus?.isVIP || false,
          hasPromoCode: !!promoCode,
          hasVipCode: !!vipCode
        }
      );
    }

    console.log('[API] Dashboard sign-in successful:', {
      userId: authResult.user?.id,
      email: authResult.user?.email,
      accessLevel: authResult.accessLevel,
      promoRedeemed: authResult.promoRedeemed
    });

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
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[API] Dashboard sign-in error:', error);
    
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