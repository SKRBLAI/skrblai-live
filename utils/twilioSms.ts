// Windsurf: Skill Smith/Percy SMS Agent Flows [2025-07-02]
// Utility helpers for sending SMS via Twilio and basic VIP verification
// -------------------------------------------------------------------
// NOTE: Twilio credentials must be present in environment variables:
//  - TWILIO_ACCOUNT_SID
//  - TWILIO_AUTH_TOKEN
//  - TWILIO_PHONE_NUMBER (the verified / purchased From number)
//  - VIP_SMS_WHITELIST (comma-separated E.164 numbers, optional)

import twilio, { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID as string | undefined;
const authToken = process.env.TWILIO_AUTH_TOKEN as string | undefined;
const fromNumber = process.env.TWILIO_PHONE_NUMBER as string | undefined;

if (!accountSid || !authToken || !fromNumber) {
  console.warn('[twilioSms] – Twilio env vars missing; SMS functionality will be disabled.');
}

// Export a shared Twilio client instance – lazily initialised so tests/builds without creds don’t crash
let _client: Twilio | null = null;
function getClient(): Twilio {
  if (_client) return _client;
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured.');
  }
  _client = twilio(accountSid, authToken);
  return _client;
}

export interface SendSmsOptions {
  to: string;
  body: string;
}

/**
 * Send an SMS using Twilio REST API
 */
export async function sendSms({ to, body }: SendSmsOptions) {
  const client = getClient();
  return client.messages.create({
    from: fromNumber,
    to,
    body,
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
