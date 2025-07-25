import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase';
import { systemLog } from '../../../utils/systemLog';
import { createClient } from '@supabase/supabase-js';

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
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
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
      await systemLog({ type: 'warning', message: 'Unauthorized system log access attempt', meta });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    // Fetch recent system logs (limit 100, newest first)
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
    await systemLog({ type: 'info', message: 'System logs accessed', meta });
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    await systemLog({ type: 'error', message: 'System log fetch error', meta: { ...meta, error: error.message } });
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 