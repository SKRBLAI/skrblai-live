import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabase';
import { Resend } from 'resend';
import twilio from 'twilio';

// Initialize services
const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Enhanced Twilio SMS integration
async function sendTwilioSMS(phone: string, message: string) {
  console.log(`[Percy Contact] Attempting SMS to ${phone.slice(0, 6)}***`);
  
  if (!twilioClient) {
    console.warn('[Percy Contact] Twilio not configured - using mock mode');
    return { 
      success: true, 
      messageId: `mock_sms_${Date.now()}`,
      status: 'mock_sent',
      provider: 'twilio_mock'
    };
  }
  
  try {
    // Use Twilio sandbox number for development/testing
    const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_SANDBOX_NUMBER;
    
    if (!fromNumber) {
      throw new Error('No Twilio phone number configured');
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: phone
    });
    
    console.log(`[Percy Contact] SMS sent successfully - SID: ${result.sid}`);
    
    return { 
      success: true, 
      messageId: result.sid,
      status: result.status,
      provider: 'twilio_live'
    };
  } catch (error: any) {
    console.error('[Percy Contact] Twilio SMS failed:', error.message);
    
    // Fallback to mock for testing if real Twilio fails
    return { 
      success: false, 
      error: error.message,
      messageId: `failed_sms_${Date.now()}`,
      status: 'failed',
      provider: 'twilio_error'
    };
  }
}

// Enhanced Twilio Voice integration
async function sendTwilioVoice(phone: string, message: string) {
  console.log(`[Percy Contact] Attempting voice call to ${phone.slice(0, 6)}***`);
  
  if (!twilioClient) {
    console.warn('[Percy Contact] Twilio not configured - using mock mode');
    return { 
      success: true, 
      messageId: `mock_voice_${Date.now()}`,
      status: 'mock_scheduled',
      provider: 'twilio_mock'
    };
  }
  
  try {
    const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_SANDBOX_NUMBER;
    
    if (!fromNumber) {
      throw new Error('No Twilio phone number configured');
    }

    // Create TwiML for voice message
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="Polly.Amy-Neural">
          ${message.replace(/[<>&"']/g, '')} // Sanitize for TwiML
        </Say>
      </Response>`;

    const call = await twilioClient.calls.create({
      twiml: twiml,
      to: phone,
      from: fromNumber
    });
    
    console.log(`[Percy Contact] Voice call initiated - SID: ${call.sid}`);
    
    return { 
      success: true, 
      messageId: call.sid,
      status: call.status,
      provider: 'twilio_live'
    };
  } catch (error: any) {
    console.error('[Percy Contact] Twilio Voice failed:', error.message);
    
    return { 
      success: false, 
      error: error.message,
      messageId: `failed_voice_${Date.now()}`,
      status: 'failed',
      provider: 'twilio_error'
    };
  }
}

// Enhanced Resend Email integration
async function sendResendEmail(email: string, subject: string, message: string) {
  console.log(`[Percy Contact] Attempting email to ${email.replace(/(.{3}).*@/, '$1***@')}`);
  
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Percy Contact] Resend API key not configured - using mock mode');
    return { 
      success: true, 
      messageId: `mock_email_${Date.now()}`,
      status: 'mock_sent',
      provider: 'resend_mock'
    };
  }
  
  try {
    // Create Percy-branded HTML email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1E90FF, #30D5C8); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px 20px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
          .percy-avatar { width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 10px; }
          .catchphrase { font-style: italic; color: #30D5C8; margin-top: 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="percy-avatar">🌟</div>
            <h1>Percy, Your AI Concierge</h1>
            <p class="catchphrase">Your wish is my command protocol!</p>
          </div>
          <div class="content">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <div class="footer">
            <p>This message was sent by Percy from SKRBL AI<br>
            <a href="https://skrbl.ai" style="color: #1E90FF;">Visit SKRBL AI</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: process.env.PERCY_FROM_EMAIL || 'Percy <percy@skrbl.ai>',
      to: [email],
      subject: subject,
      html: htmlContent,
      text: message // Fallback plain text
    });
    
    console.log(`[Percy Contact] Email sent successfully - ID: ${result.data?.id}`);
    
    return { 
      success: true, 
      messageId: result.data?.id || `resend_${Date.now()}`,
      status: 'sent',
      provider: 'resend_live'
    };
  } catch (error: any) {
    console.error('[Percy Contact] Resend email failed:', error.message);
    
    return { 
      success: false, 
      error: error.message,
      messageId: `failed_email_${Date.now()}`,
      status: 'failed',
      provider: 'resend_error'
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { 
      userId, 
      contactMethod, 
      contactInfo, 
      message, 
      messageType = 'welcome',
      urgency = 'normal',
      testMode = false
    } = await req.json();

    if (!userId || !contactMethod || !contactInfo) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, contactMethod, contactInfo' },
        { status: 400 }
      );
    }

    // Percy's enhanced superhero personality
    const percyCatchphrase = "Your wish is my command protocol!";
    const percyGreeting = `🌟 Hello! I'm Percy, your Cosmic Concierge at SKRBL AI. ${percyCatchphrase}`;
    
    // Enhanced message customization based on type and urgency
    let finalMessage = message;
    if (messageType === 'welcome') {
      finalMessage = `${percyGreeting}\n\n${message || "Welcome to SKRBL AI! I'm here to help you navigate our superhero league of AI agents. What amazing project can we bring to life together?"}\n\n🚀 Ready to get started? Just reply and I'll guide you to the perfect AI solution!`;
    } else if (messageType === 'onboarding') {
      finalMessage = `${percyGreeting}\n\nI've prepared a personalized onboarding experience just for you! ${message || "Let's unlock the full potential of our AI superhero team."}\n\n✨ Your personalized dashboard is ready at https://skrbl.ai/dashboard`;
    } else if (messageType === 'followup') {
      finalMessage = `Hello from Percy! 🚀 ${message || 'Just checking in to see how your SKRBL AI experience is going. Need any assistance from our superhero team?'}\n\n💬 Hit reply if you need anything - I'm always here to help!`;
    }

    // Add urgency indicators
    if (urgency === 'high') {
      finalMessage = `🚨 PRIORITY MESSAGE ${finalMessage}`;
    }

    // Add test mode indicator
    if (testMode) {
      finalMessage = `[TEST MODE] ${finalMessage}`;
    }

    let contactResult;
    
    // Handle different contact methods with real integrations
    switch (contactMethod) {
      case 'sms':
        if (!contactInfo.phone) {
          return NextResponse.json(
            { success: false, error: 'Phone number required for SMS contact' },
            { status: 400 }
          );
        }
        contactResult = await sendTwilioSMS(contactInfo.phone, finalMessage);
        break;
        
      case 'email': {
        if (!contactInfo.email) {
          return NextResponse.json(
            { success: false, error: 'Email address required for email contact' },
            { status: 400 }
          );
        }
        let subject = '🌟 Percy from SKRBL AI';
        switch (messageType) {
          case 'welcome':
            subject = '🌟 Welcome to SKRBL AI - Percy is here to help!';
            break;
          case 'onboarding':
            subject = '🚀 Your SKRBL AI journey begins now!';
            break;
          case 'followup':
            subject = '💫 Quick check-in from your AI Concierge';
            break;
          default:
            subject = `🌟 Percy here from SKRBL AI - ${messageType}`;
        }
        
        if (urgency === 'high') {
          subject = `🚨 PRIORITY: ${subject}`;
        }
        
        contactResult = await sendResendEmail(contactInfo.email, subject, finalMessage);
        break;
      }
        
      case 'voice': {
        if (!contactInfo.phone) {
          return NextResponse.json(
            { success: false, error: 'Phone number required for voice contact' },
            { status: 400 }
          );
        }
        // Simplify message for voice (remove emojis and formatting)
        const voiceMessage = finalMessage
          .replace(/[\u2600-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '') // Remove emojis
          .replace(/\n+/g, ' ') // Replace line breaks with spaces
          .replace(/https?:\/\/[^\s]+/g, 'Visit our website') // Replace URLs
          .trim();
        contactResult = await sendTwilioVoice(contactInfo.phone, voiceMessage);
        break;
      }
        
      case 'chat':
      default:
        console.log(`[Percy Contact] Chat message logged: ${finalMessage}`);
        contactResult = { 
          success: true, 
          messageId: `chat_${Date.now()}`,
          status: 'logged',
          provider: 'internal_chat'
        };
    }

    // Enhanced logging to Supabase with more details
    const { error: logError } = await supabase
      .from('percy_contacts')
      .insert({
        user_id: userId,
        contact_method: contactMethod,
        message_type: messageType,
        urgency,
        test_mode: testMode,
        provider: contactResult.provider,
        message_id: contactResult.messageId,
        status: contactResult.status,
        success: contactResult.success,
        error_message: contactResult.error || null,
        contact_info_hash: contactInfo.email 
          ? Buffer.from(contactInfo.email).toString('base64').slice(0, 10)
          : contactInfo.phone 
            ? Buffer.from(contactInfo.phone).toString('base64').slice(0, 10)
            : null,
        timestamp: new Date().toISOString(),
      });

    if (logError) {
      console.error('[Percy Contact] Failed to log contact attempt:', logError);
    }

    return NextResponse.json({
      success: contactResult.success,
      message: `Percy contact attempt via ${contactMethod}`,
      data: {
        contactMethod,
        messageType,
        messageId: contactResult.messageId,
        status: contactResult.status,
        provider: contactResult.provider,
        percyCatchphrase,
        urgency,
        testMode,
        timestamp: new Date().toISOString()
      },
      error: contactResult.error || null
    });

  } catch (error: any) {
    console.error('[Percy Contact] API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Enhanced GET endpoint with service status
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const testConnection = searchParams.get('test');
  
  // Test service connections
  if (testConnection === 'true') {
    const serviceStatus = {
      twilio: {
        configured: !!twilioClient,
        sandbox: !!process.env.TWILIO_SANDBOX_NUMBER,
        phone: !!process.env.TWILIO_PHONE_NUMBER
      },
      resend: {
        configured: !!process.env.RESEND_API_KEY,
        fromEmail: !!process.env.PERCY_FROM_EMAIL
      }
    };
    
    return NextResponse.json({
      success: true,
      percy: {
        name: 'Percy the Cosmic Concierge',
        catchphrase: 'Your wish is my command protocol!',
        version: '2.0.0'
      },
      services: serviceStatus,
      timestamp: new Date().toISOString()
    });
  }
  
  return NextResponse.json({
    success: true,
    percy: {
      name: 'Percy the Cosmic Concierge',
      catchphrase: 'Your wish is my command protocol!',
      availableContactMethods: ['email', 'sms', 'voice', 'chat'],
      supportedMessageTypes: ['welcome', 'onboarding', 'followup', 'custom'],
      urgencyLevels: ['low', 'normal', 'high'],
      features: ['real-twilio-sms', 'real-twilio-voice', 'real-resend-email', 'enhanced-logging']
    },
    timestamp: new Date().toISOString()
  });
} 