import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase';
import { getErrorMessage } from '../../../utils/errorHandling';

export async function GET(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    // Check if user is admin
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('userId', user.id)
      .single();

    if (userRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch email metrics
    const [
      { count: totalSequences },
      { count: activeSequences },
      { count: emailsSent },
      { data: emailStats }
    ] = await Promise.all([
      supabase.from('email_sequences').select('*', { count: 'exact', head: true }),
      supabase.from('email_sequences').select('*', { count: 'exact', head: true }).eq('active', true),
      supabase.from('email_logs').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
      supabase.from('email_logs').select('status').in('status', ['sent', 'delivered', 'opened', 'clicked'])
    ]);

    // Calculate rates
    const sentEmails = emailStats?.filter(e => e.status === 'sent').length || 0;
    const deliveredEmails = emailStats?.filter(e => e.status === 'delivered').length || 0;
    const openedEmails = emailStats?.filter(e => e.status === 'opened').length || 0;
    const clickedEmails = emailStats?.filter(e => e.status === 'clicked').length || 0;

    const deliveryRate = sentEmails > 0 ? (deliveredEmails / sentEmails) * 100 : 0;
    const openRate = deliveredEmails > 0 ? (openedEmails / deliveredEmails) * 100 : 0;
    const clickRate = openedEmails > 0 ? (clickedEmails / openedEmails) * 100 : 0;

    // Mock conversion rate calculation (would need actual conversion tracking)
    const conversionRate = clickRate * 0.15; // Approximate 15% of clicks convert

    const metrics = {
      totalSequences: totalSequences || 0,
      activeSequences: activeSequences || 0,
      emailsSent: emailsSent || 0,
      deliveryRate,
      openRate,
      clickRate,
      conversionRate
    };

    return NextResponse.json({ metrics });

  } catch (error) {
    console.error('Email analytics error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics' 
    }, { status: 500 });
  }
} 