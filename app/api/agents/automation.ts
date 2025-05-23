import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowIdForAgentTask } from '@/utils/agentAutomation';
import { triggerN8nWorkflow } from '@/lib/n8nClient';
import { systemLog } from '@/utils/systemLog';
import { createClient } from '@supabase/supabase-js';
import agentRegistry from '@/lib/agents/agentRegistry';

// Simple in-memory rate limit (per IP, 10/min)
const rateLimitMap = new Map<string, { count: number; last: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const rl = rateLimitMap.get(ip) || { count: 0, last: now };
  if (now - rl.last > RATE_WINDOW) {
    rl.count = 0;
    rl.last = now;
  }
  rl.count++;
  rateLimitMap.set(ip, rl);
  if (rl.count > RATE_LIMIT) {
    await systemLog({ type: 'warning', message: 'Rate limit exceeded', meta: { ip } });
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { agentId, task, payload } = await req.json();
    if (!agentId || !task) {
      return NextResponse.json({ success: false, error: 'Missing agentId or task' }, { status: 400 });
    }
    // Supabase Auth check
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!user) {
      await systemLog({ type: 'warning', message: 'Unauthorized automation attempt', meta: { agentId, task, ip } });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    // --- Role-based gating ---
    const agent = agentRegistry.find(a => a.id === agentId || a.intent === agentId);
    if (agent && agent.roleRequired) {
      // Fetch user role from Supabase (assume user_roles table: userId, role)
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('userId', user.id)
        .maybeSingle();
      const userRole = userRoleData?.role || 'client';
      if (userRole !== agent.roleRequired) {
        await systemLog({ type: 'warning', message: 'Forbidden: insufficient role for agent', meta: { agentId, task, userId: user.id, userRole, required: agent.roleRequired } });
        return NextResponse.json({ success: false, error: `Forbidden: This agent requires role '${agent.roleRequired}'` }, { status: 403 });
      }
    }
    // Map agent+task to workflow
    const workflowId = getWorkflowIdForAgentTask(agentId, task);
    if (!workflowId) {
      await systemLog({ type: 'error', message: 'No workflow mapped for agent/task', meta: { agentId, task } });
      return NextResponse.json({ success: false, error: 'No workflow mapped for this agent/task' }, { status: 400 });
    }
    // Trigger n8n
    const result = await triggerN8nWorkflow(workflowId, payload);
    await systemLog({ type: result.success ? 'info' : 'error', message: 'Automation triggered', meta: { agentId, task, workflowId, userId: user.id, result } });
    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ success: false, error: result.error || result.message }, { status: 500 });
    }
  } catch (error: any) {
    await systemLog({ type: 'error', message: 'Automation endpoint error', meta: { error: error.message } });
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 