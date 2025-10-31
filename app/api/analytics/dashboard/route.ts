import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/supabase";
import { withLogging } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleAnalyticsDashboard(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';
    
    // Convert range to days
    const days = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    }[range] || 7;

    const supabase = getServerSupabaseAdmin();
    
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: 'Supabase not configured' },
        { status: 503 }
      );
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get events from the analytics table
    const { data: events, error } = await supabase
      .from('user_journey_events')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Analytics query error:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Calculate metrics
    const metrics = calculateMetrics(events || []);

    return NextResponse.json({
      ok: true,
      events: events || [],
      metrics,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days
      }
    });

  } catch (error: any) {
    console.error('Analytics dashboard error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateMetrics(events: any[]) {
  const totalEvents = events.length;
  const uniqueUsers = new Set(events.map(e => e.user_id).filter(Boolean)).size;
  
  // Event types breakdown
  const eventTypes = events.reduce((acc, event) => {
    const type = event.event_type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Traffic sources
  const topSources = events.reduce((acc, event) => {
    const source = event.metadata?.source || 'direct';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate conversion rate (leads captured / total sessions)
  const leadEvents = events.filter(e => e.event_type === 'lead.captured').length;
  const sessionEvents = events.filter(e => e.event_type === 'session.started').length;
  const conversionRate = sessionEvents > 0 ? (leadEvents / sessionEvents) * 100 : 0;

  return {
    totalEvents,
    uniqueUsers,
    eventTypes,
    topSources,
    conversionRate
  };
}

export const GET = withLogging(handleAnalyticsDashboard);