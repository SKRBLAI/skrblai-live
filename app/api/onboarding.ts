import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '../../lib/supabase/server';
import { systemLog } from '../../utils/systemLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    await systemLog('warning', 'Rate limit exceeded on /api/onboarding POST', { ip });
    return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }

  let userId: string | undefined;
  try {
    const body = await req.json();
    userId = body.userId;
    const { agentId, onboarding } = body;
    if (!userId || !agentId || !onboarding) {
      return NextResponse.json({ success: false, error: 'Missing userId, agentId, or onboarding data' }, { status: 400 });
    }
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 });
    }
    // Fetch current onboarding JSON
    const { data, error } = await supabase
      .from('user_settings')
      .select('onboarding')
      .eq('userId', userId)
      .maybeSingle();
    if (error) throw error;
    let onboardingState = data?.onboarding || {};
    const existingOnboarding = onboardingState[agentId];
    onboardingState[agentId] = onboarding;
    // Upsert onboarding JSON
    const { error: upsertError } = await supabase
      .from('user_settings')
      .upsert({ userId, onboarding: onboardingState, updatedAt: new Date().toISOString() }, { onConflict: 'userId' });
    if (upsertError) throw upsertError;
    if (!existingOnboarding) {
      await systemLog('info', 'New onboarding created', { userId, agentId });
    } else {
      await systemLog('info', 'Onboarding state updated', { userId, agentId });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    await systemLog('error', 'Onboarding API error', { error: error.message, userId });
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (checkRateLimit(ip)) {
    await systemLog('warning', 'Rate limit exceeded on /api/onboarding GET', { ip });
    return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');
    if (!userId || !agentId) {
      return NextResponse.json({ success: false, error: 'Missing userId or agentId' }, { status: 400 });
    }
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 });
    }
    const { data, error } = await supabase
      .from('user_settings')
      .select('onboarding')
      .eq('userId', userId)
      .maybeSingle();
    if (error) throw error;
    const onboardingState = data?.onboarding || {};
    const onboarding = onboardingState[agentId];
    if (!onboarding) {
      await systemLog('info', 'No onboarding state found', { userId, agentId });
      return NextResponse.json({ success: true, onboarding: null });
    }
    await systemLog('info', 'Onboarding state retrieved', { userId, agentId });
    return NextResponse.json({ success: true, onboarding });
  } catch (error: any) {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    await systemLog('error', 'Onboarding GET error', { error: error.message, userId: searchParams.get('userId') });
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
}