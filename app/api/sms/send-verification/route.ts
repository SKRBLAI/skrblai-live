import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// Only initialize Twilio client when actually needed, not at build time
let client: any = null;

function getTwilioClient() {
  if (!client && accountSid && authToken) {
    try {
      client = twilio(accountSid, authToken);
    } catch (error) {
      console.error('Failed to initialize Twilio client:', error);
    }
  }
  return client;
}

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expires: number; vipTier: string }>();

// Generate 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, vipTier, message } = await request.json();

    if (!phoneNumber || !vipTier) {
      return NextResponse.json(
        { error: 'Phone number and VIP tier are required' },
        { status: 400 }
      );
    }

    if (!accountSid || !authToken || !fromNumber) {
      console.error('Twilio credentials not configured');
      return NextResponse.json(
        { error: 'SMS service not configured' },
        { status: 500 }
      );
    }

    // Generate verification code
    const code = generateCode();
    const expires = Date.now() + (10 * 60 * 1000); // 10 minutes

    // Store verification code
    verificationCodes.set(phoneNumber, { code, expires, vipTier });

    // Clean phone number for Twilio
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanPhoneNumber.startsWith('1') 
      ? `+${cleanPhoneNumber}` 
      : `+1${cleanPhoneNumber}`;

    // Prepare SMS message with VIP branding
    const smsMessage = message ? message.replace('{CODE}', code) : 
      `Welcome to SKRBL AI VIP ${vipTier.toUpperCase()}! Your verification code is: ${code}. Your exclusive AI empire awaits! 🚀`;

    // Send SMS via Twilio
    const twilioClient = getTwilioClient();
    if (!twilioClient) {
      throw new Error('Twilio client not available');
    }
    
    const twilioMessage = await twilioClient.messages.create({
      body: smsMessage,
      from: fromNumber,
      to: formattedNumber,
    });

    console.log(`SMS sent to ${formattedNumber}: ${twilioMessage.sid}`);

    return NextResponse.json({
      success: true,
      messageSid: twilioMessage.sid,
      phoneNumber: formattedNumber
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    
    // Handle specific Twilio errors
    if (error instanceof Error) {
      if (error.message.includes('phone number')) {
        return NextResponse.json(
          { error: 'Invalid phone number format' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

// Clean up expired codes periodically
setInterval(() => {
  const now = Date.now();
  verificationCodes.forEach((data, phone) => {
    if (data.expires < now) {
      verificationCodes.delete(phone);
    }
  });
}, 5 * 60 * 1000); // Clean every 5 minutes