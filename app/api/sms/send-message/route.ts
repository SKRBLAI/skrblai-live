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

// GET handler for health check
export async function GET() {
  const isConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  return NextResponse.json({
    service: 'SMS Send Message',
    status: isConfigured ? 'configured' : 'not_configured',
    message: isConfigured 
      ? 'SMS send service is ready' 
      : 'SMS service requires Twilio credentials'
  });
}

export async function POST(request: NextRequest) {
  // Check if Twilio is configured
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return NextResponse.json(
      { error: 'SMS service not configured' },
      { status: 503 }
    );
  }

  try {
    const { phoneNumber, message } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
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

    // Clean phone number for Twilio
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanPhoneNumber.startsWith('1') 
      ? `+${cleanPhoneNumber}` 
      : `+1${cleanPhoneNumber}`;

    // Send SMS via Twilio
    const twilioClient = getTwilioClient();
    if (!twilioClient) {
      throw new Error('Twilio client not available');
    }
    
    const twilioMessage = await twilioClient.messages.create({
      body: message,
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
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
