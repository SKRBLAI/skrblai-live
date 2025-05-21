import { NextResponse } from 'next/server';
import n8nClient from '@/lib/n8nClient';
import agentRegistry from '@/lib/agents/agentRegistry';
import { systemLog } from '@/utils/systemLog';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const meta: any = { ip: req.headers.get('x-forwarded-for') || 'unknown', timestamp: new Date().toISOString() };
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      await systemLog({ type: 'warning', message: 'Unauthorized /api/n8n/health access attempt', meta });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const agentCount = agentRegistry.length;
    const timestamp = new Date().toISOString();
    try {
      const res = await n8nClient.get('/healthz');
      if (res.status === 200) {
        await systemLog({ type: 'info', message: 'n8n health check: connected', meta: { agentCount, timestamp, userId: user.id, email: user.email } });
        return NextResponse.json({ status: 'connected', agentCount, timestamp });
      }
      await systemLog({ type: 'warning', message: 'n8n health check: offline', meta: { agentCount, timestamp, status: res.status, userId: user.id, email: user.email } });
      return NextResponse.json({ status: 'offline', agentCount, timestamp }, { status: 503 });
    } catch (error: any) {
      await systemLog({ type: 'error', message: 'n8n health check error', meta: { agentCount, timestamp, error: error.message, userId: user.id, email: user.email } });
      return NextResponse.json({ status: 'offline', agentCount, timestamp, error: error.message }, { status: 503 });
    }
  } catch (error: any) {
    await systemLog({ type: 'error', message: 'n8n health endpoint auth error', meta: { ...meta, error: error.message } });
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 