import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function POST(request: NextRequest) {
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
    const twilioMessage = await client.messages.create({
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