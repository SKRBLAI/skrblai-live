import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabase';
import { sendSms } from '../../../../utils/twilioSms';

// GET handler for health check
export async function GET() {
  const isConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  return NextResponse.json({
    service: 'SMS Verification',
    status: isConfigured ? 'configured' : 'not_configured',
    message: isConfigured 
      ? 'SMS verification service is ready' 
      : 'SMS service requires Twilio credentials'
  });
}

export async function POST(req: NextRequest) {
  // Check if Twilio is configured
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return NextResponse.json(
      { success: false, error: 'SMS service not configured' },
      { status: 503 }
    );
  }

  try {
    const { phoneNumber, vipTier = 'gold', message } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store verification code in database with expiration
    const { error: dbError } = await supabase
      .from('sms_verifications')
      .insert({
        phone_number: phoneNumber,
        verification_code: verificationCode,
        vip_tier: vipTier,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        verified: false
      });

    if (dbError) {
      console.error('Failed to store verification code:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to store verification code' },
        { status: 500 }
      );
    }

    // Send SMS with verification code
    const smsMessage = message 
      ? message.replace('{CODE}', verificationCode)
      : `Your SKRBL AI VIP verification code is: ${verificationCode}. Valid for 5 minutes.`;

    const smsResult = await sendSms({
      to: phoneNumber,
      body: smsMessage
    });

    if (!smsResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to send SMS verification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      messageId: smsResult.messageId
    });

  } catch (error: any) {
    console.error('SMS verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'SMS verification failed' },
      { status: 500 }
    );
  }
}