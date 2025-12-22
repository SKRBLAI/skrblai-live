// Windsurf: Skill Smith/Percy SMS Agent Flows [2025-07-02]
// NOTE: SMS is disabled (Twilio removed). This file remains as a compatibility shim.

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
  void to;
  void body;
  void message;
  void vipTier;
  return { success: false, error: 'SMS disabled (Twilio removed)' };
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
