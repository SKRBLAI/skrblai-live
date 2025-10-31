import { NextResponse } from 'next/server';
import n8nClient from '../../../lib/n8nClient';
import agentRegistry from '../../../lib/agents/agentRegistry';
import { systemLog } from '../../../utils/systemLog';
import { getOptionalServerSupabase } from '@/lib/supabase';

export async function GET(req: Request) {
  
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable' },
        { status: 503 }
      );
    }
const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const meta: any = { ip: req.headers.get('x-forwarded-for') || 'unknown', timestamp: new Date().toISOString() };
  try {
    
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      await systemLog('warning', 'Unauthorized /api/n8n/health access attempt', meta);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const agentCount = agentRegistry.length;
    const timestamp = new Date().toISOString();
    try {
      const res = await n8nClient.get('/healthz');
      if (res.status === 200) {
        await systemLog('info', 'n8n health check: connected', { agentCount, timestamp, userId: user.id, email: user.email });
        return NextResponse.json({ status: 'connected', agentCount, timestamp });
      }
      await systemLog('warning', 'n8n health check: offline', { agentCount, timestamp, status: res.status, userId: user.id, email: user.email });
      return NextResponse.json({ status: 'offline', agentCount, timestamp }, { status: 503 });
    } catch (error: any) {
      await systemLog('error', 'N8n health check error', { ip: meta.ip, error: (error as Error).message, userId: user.id, email: user.email });
      return NextResponse.json({ status: 'offline', agentCount, timestamp, error: error.message }, { status: 503 });
    }
  } catch (error: any) {
    await systemLog('error', 'n8n health endpoint auth error', { ...meta, error: error.message });
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 