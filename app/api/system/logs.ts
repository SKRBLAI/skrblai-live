import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '../../../lib/supabase/server';
import { systemLog } from '../../../utils/systemLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Strong type for log event
interface SystemLogEvent {
  id: number;
  type: 'error' | 'warning' | 'info';
  message: string;
  meta: any;
  timestamp: string;
}

// Helper: Check if user is admin/superadmin
async function isAdminUser(token: string | undefined): Promise<{ isAdmin: boolean; userId?: string; email?: string }> {
  if (!token) return { isAdmin: false };
  const supabaseAdmin = getOptionalServerSupabase();
  if (!supabaseAdmin) {
    return { isAdmin: false };
  }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (!user) return { isAdmin: false };
  // Check user_roles table for admin/superadmin
  const { data, error: roleError } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('userId', user.id)
    .maybeSingle();
  const isAdmin = data?.role === 'admin' || data?.role === 'superadmin' || (user.email?.endsWith('@skrbl.ai') ?? false) || (user.email?.endsWith('@skrblai.io') ?? false);
  return { isAdmin, userId: user.id, email: user.email };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const meta: any = { ip: req.headers.get('x-forwarded-for') || 'unknown', timestamp: new Date().toISOString() };
  try {
    const { isAdmin, userId, email } = await isAdminUser(token);
    meta.userId = userId;
    meta.email = email;
    if (!isAdmin) {
      await systemLog('warning', 'Unauthorized system log access attempt', meta);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    // Fetch recent system logs (limit 100, newest first)
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    if (error) throw error;
    const logs: SystemLogEvent[] = (data || []).map((row: any) => ({
      id: row.id,
      type: row.type,
      message: row.message,
      meta: row.meta ? JSON.parse(row.meta) : null,
      timestamp: row.timestamp,
    }));
    await systemLog('info', 'System logs accessed', meta);
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    await systemLog('error', 'System log fetch error', { ...meta, error: error.message });
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 