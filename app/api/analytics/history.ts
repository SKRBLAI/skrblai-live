import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase';
import { systemLog } from '../../../utils/systemLog';

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

/**
 * GET /api/analytics/history
 * Returns agent usage history: recent activity, by user/agent/workflow.
 * Query params: userId (optional), agentId (optional), workflow (optional), limit (optional)
 *
 * Response: {
 *   history: [ { id, userId, agentId, workflow, result, status, timestamp } ]
 * }
 */
export async function GET(req: NextRequest) {
  
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable' },
        { status: 503 }
      );
    }
const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (checkRateLimit(ip)) {
    await systemLog('warning', 'Rate limit exceeded on /api/analytics/history', { ip });
    return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');
    const workflow = searchParams.get('workflow');
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    
    let query = supabase
      .from('workflowLogs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    if (userId) query = query.eq('userId', userId);
    if (agentId) query = query.eq('agentId', agentId);
    if (workflow) query = query.eq('workflow', workflow);
    const { data: historyData, error: historyError } = await query;
    if (historyError) throw historyError;
    await systemLog('info', 'Agent usage history accessed', { ip, userId, agentId, workflow });
    return NextResponse.json({ success: true, history: historyData || [] });
  } catch (error: any) {
    await systemLog('error', 'Agent usage history error', { error: error.message });
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 