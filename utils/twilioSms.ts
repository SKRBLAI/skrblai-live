// Windsurf: Skill Smith/Percy SMS Agent Flows [2025-07-02]
// Utility helpers for sending SMS via Twilio and basic VIP verification
// -------------------------------------------------------------------
// NOTE: Twilio credentials must be present in environment variables:
//  - TWILIO_ACCOUNT_SID
//  - TWILIO_AUTH_TOKEN
//  - TWILIO_PHONE_NUMBER (the verified / purchased From number)
//  - VIP_SMS_WHITELIST (comma-separated E.164 numbers, optional)

import twilio from 'twilio';

// Twilio configuration - lazy loaded to avoid build-time errors
let client: any = null;
let clientInitialized = false;

function getTwilioClient() {
  if (clientInitialized) return client;
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (accountSid && authToken) {
    try {
      client = twilio(accountSid, authToken);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to initialize Twilio client:', error);
      }
    }
  }
  
  clientInitialized = true;
  return client;
}

function getFromNumber() {
  return process.env.TWILIO_PHONE_NUMBER;
}

export interface SendSmsOptions {
  to: string;
  /**
   * Preferred field for SMS content. If not provided, `message` will be used for backward-compatibility.
   */
  body?: string;
  /**
   * Deprecated: use `body` moving forward. Still supported so existing callers keep working.
   */
  message?: string;
  vipTier?: 'gold' | 'platinum' | 'diamond';
}

export async function sendSms({ to, body, message, vipTier = 'gold' }: SendSmsOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const twilioClient = getTwilioClient();
  const fromNumber = getFromNumber();
  
  if (!twilioClient || !fromNumber) {
    return {
      success: false,
      error: 'Twilio not configured'
    };
  }

  try {
    // Format phone number
    const formattedNumber = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;

    // VIP-specific message formatting
    const vipEmojis = {
      gold: '🥇',
      platinum: '🔥', 
      diamond: '💎'
    };

    const smsText = body ?? message;
    if (!smsText) {
      return { success: false, error: 'SMS body is required' };
    }
    const formattedMessage = vipTier
      ? `${vipEmojis[vipTier]} SKRBL AI VIP ${vipTier.toUpperCase()}: ${smsText}`
      : `🚀 SKRBL AI: ${smsText}`;

    const result = await twilioClient.messages.create({
      body: formattedMessage,
      from: fromNumber,
      to: formattedNumber,
    });

    return {
      success: true,
      messageId: result.sid
    };
  } catch (error: any) {
    console.error('Twilio SMS Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS'
    };
  }
}

export async function sendVerificationCode(phoneNumber: string, code: string, vipTier: 'gold' | 'platinum' | 'diamond' = 'gold'): Promise<{ success: boolean; error?: string }> {
  const vipMessages = {
    gold: `Your VIP Gold verification code: ${code}. Welcome to exclusive AI dominance! 🥇`,
    platinum: `Your VIP Platinum verification code: ${code}. Premium AI mastery awaits! 🔥`, 
    diamond: `Your VIP Diamond verification code: ${code}. Ultimate AI power unlocked! 💎`
  };

  return sendSms({
    to: phoneNumber,
    message: vipMessages[vipTier],
    vipTier
  });
}

export async function sendWelcomeSms(phoneNumber: string, vipTier: 'gold' | 'platinum' | 'diamond'): Promise<{ success: boolean; error?: string }> {
  const welcomeMessages = {
    gold: "🥇 VIP Gold activated! You now have priority access to SKRBL AI's most powerful features. Your competitors won't know what hit them!",
    platinum: "🔥 VIP Platinum unlocked! White-glove AI service is now yours. Experience automation beyond imagination!", 
    diamond: "💎 VIP Diamond achieved! Ultimate AI mastery with unlimited access. You're now operating at the highest level of digital dominance!"
  };

  return sendSms({
    to: phoneNumber,
    message: welcomeMessages[vipTier],
    vipTier
  });
}

/**
 * Basic whitelist check. VIP_SMS_WHITELIST can be comma-separated numbers in E.164 format.
 */
export function isVipNumber(phone: string): boolean {
  const whitelist = (process.env.VIP_SMS_WHITELIST || '').split(',').map(p => p.trim()).filter(Boolean);
  if (whitelist.length === 0) return true; // fallback – allow all if no whitelist defined
  return whitelist.includes(phone);
}

/**
 * Percy introductory SMS template
 */
export async function sendPercyIntroSms(to: string, firstName?: string) {
  const greeting = firstName ? `Hey ${firstName}!` : 'Hey there!';
  const body = `${greeting} I'm Percy – your dedicated AI Growth partner at SKRBL AI. I'll analyse your business & socials and send quick wins directly here. Reply with your website or social link to begin 🚀`;
  return sendSms({ to, body });
}
