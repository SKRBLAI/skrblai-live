import { NextResponse } from 'next/server';

const SMS_DISABLED_RESPONSE = { ok: false, error: 'SMS disabled (Twilio removed)' };

export async function GET() {
  return NextResponse.json(SMS_DISABLED_RESPONSE, { status: 410 });
}

export async function POST() {
  return NextResponse.json(SMS_DISABLED_RESPONSE, { status: 410 });
}
