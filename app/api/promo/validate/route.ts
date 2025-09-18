import { NextRequest, NextResponse } from 'next/server';

interface PromoCodeRequest {
  code: string;
  userEmail?: string;
}

interface PromoCodeResponse {
  valid: boolean;
  discount?: number;
  tier?: 'VIP50' | 'PREMIUM25' | 'LAUNCH10';
  message?: string;
  expiresAt?: string;
}

// Mock promo codes for demonstration
const VALID_PROMO_CODES: Record<string, PromoCodeResponse> = {
  'VIP50': {
    valid: true,
    discount: 50,
    tier: 'VIP50',
    message: '🎉 VIP50 Applied! 50% off all premium features',
    expiresAt: '2025-12-31'
  },
  'PREMIUM25': {
    valid: true,
    discount: 25,
    tier: 'PREMIUM25',
    message: '✨ PREMIUM25 Applied! 25% off premium features',
    expiresAt: '2025-06-30'
  },
  'LAUNCH10': {
    valid: true,
    discount: 10,
    tier: 'LAUNCH10',
    message: '🚀 LAUNCH10 Applied! 10% off your first month',
    expiresAt: '2025-03-31'
  },
  'SKRBLAI2025': {
    valid: true,
    discount: 30,
    tier: 'PREMIUM25',
    message: '🎊 New Year Special! 30% off all services',
    expiresAt: '2025-02-28'
  }
};

export async function POST(req: NextRequest) {
  try {
    const { code, userEmail }: PromoCodeRequest = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      );
    }

    // Validate promo code format
    const codePattern = /^[A-Z0-9_]{4,20}$/;
    if (!codePattern.test(code.toUpperCase())) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid promo code format'
      });
    }

    const upperCode = code.toUpperCase();
    const promoData = VALID_PROMO_CODES[upperCode];

    if (promoData) {
      // Check if code has expired
      const now = new Date();
      const expiresAt = new Date(promoData.expiresAt || '2025-12-31');
      
      if (now > expiresAt) {
        return NextResponse.json({
          valid: false,
          message: 'This promo code has expired'
        });
      }

      // Log successful validation (in production, save to database)
      console.log('[Promo Validation] Success:', {
        code: upperCode,
        userEmail,
        discount: promoData.discount,
        timestamp: now.toISOString()
      });

      return NextResponse.json({
        valid: true,
        discount: promoData.discount,
        tier: promoData.tier,
        message: promoData.message,
        expiresAt: promoData.expiresAt
      });
    }

    // Invalid promo code
    return NextResponse.json({
      valid: false,
      message: 'Invalid promo code. Please check and try again.'
    });

  } catch (error) {
    console.error('[Promo Validation] Error:', error);
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}

// GET method for testing
export async function GET() {
  return NextResponse.json({
    message: 'Promo code validation endpoint',
    validCodes: Object.keys(VALID_PROMO_CODES),
    format: 'POST with { code: string, userEmail?: string }'
  });
}