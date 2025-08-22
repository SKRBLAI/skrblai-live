import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '../../lib/supabase/server';
import { systemLog } from '../../utils/systemLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper to fetch internal endpoints
async function fetchInternal(url: string, token: string) {
  const res = await fetch(url, {
    headers: { 'authorization': `Bearer ${token}` },
    cache: 'no-store',
  });
  return res.json();
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const meta: any = { ip: req.headers.get('x-forwarded-for') || 'unknown', timestamp: new Date().toISOString() };
  try {
    // Auth check
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 });
    }
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      await systemLog({ type: 'warning', message: 'Unauthorized /api/status access attempt', meta });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    // Aggregate health checks
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const [n8n, agents] = await Promise.all([
      fetchInternal(`${baseUrl}/api/n8n/health`, token ?? ''),
      fetchInternal(`${baseUrl}/api/agents/featured`, token ?? ''),
    ]);
    // Compose status
    const status = {
      n8n: n8n.status,
      n8nAgentCount: n8n.agentCount,
      agentsCount: Array.isArray(agents.agents) ? agents.agents.length : 0,
      timestamp: new Date().toISOString(),
      goNogo: n8n.status === 'connected' && Array.isArray(agents.agents) && agents.agents.length > 0 ? 'GO' : 'NOGO',
      details: {
        n8n,
        agents,
      },
    };
    await systemLog({ type: 'info', message: 'Status check', meta: { ...meta, userId: user.id, email: user.email, goNogo: status.goNogo } });
    return NextResponse.json({ success: true, ...status });
  } catch (error: any) {
    await systemLog({ type: 'error', message: 'Status endpoint error', meta: { ...meta, error: error.message } });
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 