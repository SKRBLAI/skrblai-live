import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// This would be shared with send-verification in production
const verificationCodes = new Map<string, { code: string; expires: number; vipTier: string }>();

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, code, vipTier } = await req.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { success: false, error: 'Phone number and verification code are required' },
        { status: 400 }
      );
    }

    // Look up verification code in database
    const { data: verificationData, error: lookupError } = await supabase
      .from('sms_verifications')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('verification_code', code)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lookupError || !verificationData) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('sms_verifications')
      .update({ 
        verified: true, 
        verified_at: new Date().toISOString() 
      })
      .eq('id', verificationData.id);

    if (updateError) {
      console.error('Failed to update verification status:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to complete verification' },
        { status: 500 }
      );
    }

    // Store verified phone number for VIP user
    const { error: vipError } = await supabase
      .from('vip_phone_numbers')
      .upsert({
        phone_number: phoneNumber,
        vip_tier: vipTier || verificationData.vip_tier,
        verified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (vipError) {
      console.error('Failed to store VIP phone number:', vipError);
      // Continue anyway - verification was successful
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      vipTier: verificationData.vip_tier
    });

  } catch (error: any) {
    console.error('SMS verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}