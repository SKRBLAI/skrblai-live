import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { systemLog } from '@/utils/systemLog';

/**
 * POST /api/onboarding
 * Body: { userId: string, agentId: string, onboarding: object }
 * Stores onboarding state for a specific agent and user in Supabase user_settings.onboarding (JSONB)
 *
 * GET /api/onboarding?userId=...&agentId=...
 * Retrieves onboarding state for a specific agent and user
 */

// --- Simple in-memory rate limiter (per IP) ---
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX = 20;
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    entry = { count: 1, reset: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(ip, entry);
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (checkRateLimit(ip)) {
    await systemLog({ type: 'warning', message: 'Rate limit exceeded on /api/onboarding POST', meta: { ip } });
    return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }
  try {
    const { userId, agentId, onboarding } = await req.json();
    if (!userId || !agentId || !onboarding) {
      return NextResponse.json({ success: false, error: 'Missing userId, agentId, or onboarding data' }, { status: 400 });
    }
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    // Fetch current onboarding JSON
    const { data, error } = await supabase
      .from('user_settings')
      .select('onboarding')
      .eq('userId', userId)
      .maybeSingle();
    if (error) throw error;
    let onboardingState = data?.onboarding || {};
    onboardingState[agentId] = onboarding;
    // Upsert onboarding JSON
    const { error: upsertError } = await supabase
      .from('user_settings')
      .upsert({ userId, onboarding: onboardingState, updatedAt: new Date().toISOString() }, { onConflict: 'userId' });
    if (upsertError) throw upsertError;
    await systemLog({ type: 'info', message: 'Onboarding state updated', meta: { userId, agentId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    await systemLog({ type: 'error', message: 'Onboarding API error', meta: { error: error.message } });
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (checkRateLimit(ip)) {
    await systemLog({ type: 'warning', message: 'Rate limit exceeded on /api/onboarding GET', meta: { ip } });
    return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');
    if (!userId || !agentId) {
      return NextResponse.json({ success: false, error: 'Missing userId or agentId' }, { status: 400 });
    }
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data, error } = await supabase
      .from('user_settings')
      .select('onboarding')
      .eq('userId', userId)
      .maybeSingle();
    if (error) throw error;
    const onboardingState = data?.onboarding || {};
    return NextResponse.json({ success: true, onboarding: onboardingState[agentId] || null });
  } catch (error: any) {
    await systemLog({ type: 'error', message: 'Onboarding API error', meta: { error: error.message } });
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 