import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { systemLog } from '@/utils/systemLog';

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
 * GET /api/analytics/agents
 * Returns agent usage stats: per user, per agent, most popular agents, and session counts.
 * Query params: userId (optional, for per-user stats)
 *
 * Response: {
 *   usage: { [agentId]: { count, lastUsed } },
 *   mostPopular: [{ agentId, count }],
 *   sessionCount: number
 * }
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (checkRateLimit(ip)) {
    await systemLog({ type: 'warning', message: 'Rate limit exceeded on /api/analytics/agents', meta: { ip } });
    return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    // Agent usage per user or global
    let usageQuery = supabase
      .from('agent_usage')
      .select('intent, count, updatedAt, userId');
    if (userId) usageQuery = usageQuery.eq('userId', userId);
    const { data: usageData, error: usageError } = await usageQuery;
    if (usageError) throw usageError;
    // Most popular agents (global)
    const { data: popularData, error: popularError } = await supabase
      .from('agent_usage')
      .select('intent, count')
      .order('count', { ascending: false })
      .limit(10);
    if (popularError) throw popularError;
    // Session count (unique user sessions in workflowLogs)
    const { data: sessionData, error: sessionError } = await supabase
      .from('workflowLogs')
      .select('userId', { count: 'exact', head: true });
    if (sessionError) throw sessionError;
    // Format usage
    const usage: Record<string, { count: number; lastUsed: string; userId?: string }> = {};
    (usageData || []).forEach(item => {
      if (item.intent) {
        usage[item.intent] = {
          count: item.count || 0,
          lastUsed: item.updatedAt || '',
          userId: item.userId
        };
      }
    });
    const mostPopular = (popularData || []).map(item => ({ agentId: item.intent, count: item.count }));
    const sessionCount = sessionData?.length || 0;
    await systemLog({ type: 'info', message: 'Agent analytics accessed', meta: { ip, userId } });
    return NextResponse.json({ success: true, usage, mostPopular, sessionCount });
  } catch (error: any) {
    await systemLog({ type: 'error', message: 'Agent analytics error', meta: { error: error.message } });
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 