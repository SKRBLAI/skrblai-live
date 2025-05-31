import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowIdForAgentTask } from '@/utils/agentAutomation';
import { triggerN8nWorkflow } from '@/lib/n8nClient';
import { systemLog } from '@/utils/systemLog';
import { createClient } from '@supabase/supabase-js';
import agentRegistry from '@/lib/agents/agentRegistry';
import { runAgentWorkflow } from '@/lib/agents/runAgentWorkflow';

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
 * POST /api/agents/automation
 * Triggers agent automation (n8n/webhook or internal workflow)
 * Body: { agentId: string, task: string, payload: object }
 * Returns: { success: boolean, result: string, status: string }
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (checkRateLimit(ip)) {
    await systemLog({ type: 'warning', message: 'Rate limit exceeded on /api/agents/automation', meta: { ip } });
    return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }

  try {
    const { agentId, task, payload } = await req.json();
    if (!agentId || !task) {
      return NextResponse.json({ success: false, error: 'Missing agentId or task' }, { status: 400 });
    }
    // --- Fetch user and role for premium gating ---
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      await systemLog({ type: 'warning', message: 'Unauthorized automation attempt', meta: { ip } });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('userId', user.id)
      .maybeSingle();
    const userRole = userRoleData?.role || 'client';
    // --- Automation stub for BrandingAgent (expand as needed) ---
    if (agentId === 'brandingAgent' && task === 'onboard') {
      const result = await runAgentWorkflow(agentId, { ...payload, task }, userRole);
      if (result.status === 'error' && result.result.includes('Access denied')) {
        await systemLog({ type: 'warning', message: 'Premium gating: unauthorized agent automation attempt', meta: { agentId, userId: user.id, userRole } });
        return NextResponse.json({ success: false, error: result.result }, { status: 403 });
      }
      await systemLog({ type: 'info', message: 'BrandingAgent onboarding automation triggered', meta: { agentId, task, userId: user.id } });
      return NextResponse.json({ success: true, result: result.result, status: result.status });
    }
    // --- Default: run agent workflow (n8n/webhook or internal) ---
    const result = await runAgentWorkflow(agentId, { ...payload, task }, userRole);
    if (result.status === 'error' && result.result.includes('Access denied')) {
      await systemLog({ type: 'warning', message: 'Premium gating: unauthorized agent automation attempt', meta: { agentId, userId: user.id, userRole } });
      return NextResponse.json({ success: false, error: result.result }, { status: 403 });
    }
    await systemLog({ type: 'info', message: 'Agent automation triggered', meta: { agentId, task, userId: user.id } });
    return NextResponse.json({ success: true, result: result.result, status: result.status });
  } catch (error: any) {
    await systemLog({ type: 'error', message: 'Automation API error', meta: { error: error.message } });
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 