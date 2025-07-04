import { NextRequest, NextResponse } from 'next/server';

// This would be shared with send-verification in production
const verificationCodes = new Map<string, { code: string; expires: number; vipTier: string }>();

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code, vipTier } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' },
        { status: 400 }
      );
    }

    // Clean phone number
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanPhoneNumber.startsWith('1') 
      ? `+${cleanPhoneNumber}` 
      : `+1${cleanPhoneNumber}`;

    // Get stored verification data
    const storedData = verificationCodes.get(phoneNumber) || verificationCodes.get(formattedNumber);

    if (!storedData) {
      return NextResponse.json(
        { error: 'No verification code found for this number' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (Date.now() > storedData.expires) {
      verificationCodes.delete(phoneNumber);
      verificationCodes.delete(formattedNumber);
      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 400 }
      );
    }

    // Verify the code
    if (storedData.code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Clean up used code
    verificationCodes.delete(phoneNumber);
    verificationCodes.delete(formattedNumber);

    // Here you would typically:
    // 1. Update user's VIP status in database
    // 2. Enable SMS preferences
    // 3. Log the successful verification

    console.log(`SMS verification successful for ${formattedNumber} with VIP tier: ${storedData.vipTier}`);

    return NextResponse.json({
      success: true,
      phoneNumber: formattedNumber,
      vipTier: storedData.vipTier,
      message: 'SMS access activated successfully'
    });

  } catch (error) {
    console.error('Error verifying SMS code:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}