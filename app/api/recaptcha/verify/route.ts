import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 400 }
      );
    }

    // Check if hCaptcha is configured
    const hCaptchaSecret = process.env.HCAPTCHA_SECRET;
    if (!hCaptchaSecret) {
      console.warn('[RECAPTCHA] hCaptcha not configured, allowing request');
      return NextResponse.json({ success: true, bypass: true });
    }

    // Verify with hCaptcha
    const verifyUrl = 'https://hcaptcha.com/siteverify';
    const verifyData = new URLSearchParams({
      secret: hCaptchaSecret,
      response: token,
    });

    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: verifyData,
    });

    const result: RecaptchaResponse = await verifyResponse.json();

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      console.error('[RECAPTCHA] Verification failed:', result['error-codes']);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Captcha verification failed',
          codes: result['error-codes'] 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('[RECAPTCHA] Verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}