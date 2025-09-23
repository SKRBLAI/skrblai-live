import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { withLogging } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleQuickWinsAnalytics(req: NextRequest) {
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

    const supabase = createServerSupabaseClient();
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get Quick Wins events
    const { data: assignedEvents, error: assignedError } = await supabase
      .from('user_journey_events')
      .select('*')
      .eq('event_type', 'quickWins.assigned')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    const { data: usedEvents, error: usedError } = await supabase
      .from('user_journey_events')
      .select('*')
      .eq('event_type', 'quickWins.used')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    if (assignedError || usedError) {
      console.error('Quick Wins analytics error:', assignedError || usedError);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch Quick Wins data' },
        { status: 500 }
      );
    }

    // Calculate metrics
    const assigned = (assignedEvents || []).reduce((total, event) => {
      return total + (event.metadata?.count || 1);
    }, 0);

    const used = (usedEvents || []).length;
    const conversionRate = assigned > 0 ? (used / assigned) * 100 : 0;

    // Breakdown by vertical
    const businessAssigned = (assignedEvents || []).filter(e => e.vertical === 'business').length;
    const sportsAssigned = (assignedEvents || []).filter(e => e.vertical === 'sports').length;
    const businessUsed = (usedEvents || []).filter(e => e.vertical === 'business').length;
    const sportsUsed = (usedEvents || []).filter(e => e.vertical === 'sports').length;

    // Daily breakdown for chart
    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAssigned = (assignedEvents || []).filter(e => 
        e.timestamp.startsWith(dateStr)
      ).length;
      
      const dayUsed = (usedEvents || []).filter(e => 
        e.timestamp.startsWith(dateStr)
      ).length;

      dailyData.push({
        date: dateStr,
        assigned: dayAssigned,
        used: dayUsed
      });
    }

    return NextResponse.json({
      ok: true,
      assigned,
      used,
      conversionRate,
      breakdown: {
        business: {
          assigned: businessAssigned,
          used: businessUsed,
          conversionRate: businessAssigned > 0 ? (businessUsed / businessAssigned) * 100 : 0
        },
        sports: {
          assigned: sportsAssigned,
          used: sportsUsed,
          conversionRate: sportsAssigned > 0 ? (sportsUsed / sportsAssigned) * 100 : 0
        }
      },
      dailyData
    });

  } catch (error: any) {
    console.error('Quick Wins analytics error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withLogging(handleQuickWinsAnalytics);