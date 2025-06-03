import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { 
      testType = 'sms', // 'sms', 'email', 'voice'
      targetContact, // phone number or email
      customMessage 
    } = await req.json();

    if (!targetContact) {
      return NextResponse.json(
        { success: false, error: 'Missing targetContact (phone number or email)' },
        { status: 400 }
      );
    }

    // Prepare test payload for Percy contact API
    const testPayload = {
      userId: 'test-user-percy',
      contactMethod: testType,
      contactInfo: testType === 'email' 
        ? { email: targetContact }
        : { phone: targetContact },
      message: customMessage || `This is a test message from Percy! 🌟 Testing ${testType} integration at ${new Date().toLocaleString()}. Your wish is my command protocol!`,
      messageType: 'custom',
      urgency: 'normal',
      testMode: true
    };

    console.log(`[Percy Test] Initiating ${testType} test to ${targetContact.slice(0, 6)}***`);

    // Call the Percy contact API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/percy/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();

    return NextResponse.json({
      success: result.success,
      testType,
      targetContact: targetContact.replace(/(.{3}).*(@|$)/, '$1***$2'), // Mask for privacy
      message: `Percy ${testType} test completed`,
      data: result.data,
      error: result.error,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Percy Test] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint with test instructions
export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Percy Contact Test API',
    instructions: {
      sms: 'POST with { "testType": "sms", "targetContact": "+1234567890" }',
      email: 'POST with { "testType": "email", "targetContact": "test@example.com" }',
      voice: 'POST with { "testType": "voice", "targetContact": "+1234567890" }',
      customMessage: 'Add "customMessage": "Your test message" for custom content'
    },
    examples: {
      sms_test: {
        method: 'POST',
        body: {
          testType: 'sms',
          targetContact: '+1234567890',
          customMessage: 'Hello from Percy! Testing SMS integration.'
        }
      },
      email_test: {
        method: 'POST', 
        body: {
          testType: 'email',
          targetContact: 'your-email@example.com',
          customMessage: 'Hello from Percy! Testing email integration.'
        }
      },
      voice_test: {
        method: 'POST',
        body: {
          testType: 'voice',
          targetContact: '+1234567890',
          customMessage: 'Hello! This is Percy testing voice integration.'
        }
      }
    },
    notes: [
      'For SMS/Voice: Use your phone number in E.164 format (+1234567890)',
      'For Twilio sandbox: Your number must be verified in Twilio console',
      'For Email: Use any valid email address',
      'All tests will be marked with [TEST MODE] prefix'
    ],
    timestamp: new Date().toISOString()
  });
} 