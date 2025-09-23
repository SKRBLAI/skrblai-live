import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { withLogging } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handlePopupAnalytics(req: NextRequest) {
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

    // Get popup-related events
    const { data: events, error } = await supabase
      .from('user_journey_events')
      .select('*')
      .in('event_type', [
        'percy.popup.opened',
        'percy.popup.engagement',
        'skillsmith.popup.opened',
        'skillsmith.popup.engagement',
        'exitIntent.opened',
        'lead.captured'
      ])
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    if (error) {
      console.error('Popup analytics error:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch popup data' },
        { status: 500 }
      );
    }

    const eventsData = events || [];

    // Calculate metrics
    const percy_opened = eventsData.filter(e => e.event_type === 'percy.popup.opened').length;
    const percy_engaged = eventsData.filter(e => e.event_type === 'percy.popup.engagement').length;
    const skillsmith_opened = eventsData.filter(e => e.event_type === 'skillsmith.popup.opened').length;
    const skillsmith_engaged = eventsData.filter(e => e.event_type === 'skillsmith.popup.engagement').length;
    const exit_intent_opened = eventsData.filter(e => e.event_type === 'exitIntent.opened').length;
    const leads_captured = eventsData.filter(e => e.event_type === 'lead.captured').length;

    // Conversion rates
    const percy_conversion = percy_opened > 0 ? (percy_engaged / percy_opened) * 100 : 0;
    const skillsmith_conversion = skillsmith_opened > 0 ? (skillsmith_engaged / skillsmith_opened) * 100 : 0;
    const exit_intent_conversion = exit_intent_opened > 0 ? 
      (eventsData.filter(e => e.event_type === 'lead.captured' && e.metadata?.source === 'exit_intent').length / exit_intent_opened) * 100 : 0;

    // Daily breakdown
    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEvents = eventsData.filter(e => e.timestamp.startsWith(dateStr));
      
      dailyData.push({
        date: dateStr,
        percy_opened: dayEvents.filter(e => e.event_type === 'percy.popup.opened').length,
        percy_engaged: dayEvents.filter(e => e.event_type === 'percy.popup.engagement').length,
        skillsmith_opened: dayEvents.filter(e => e.event_type === 'skillsmith.popup.opened').length,
        skillsmith_engaged: dayEvents.filter(e => e.event_type === 'skillsmith.popup.engagement').length,
        exit_intent_opened: dayEvents.filter(e => e.event_type === 'exitIntent.opened').length,
        leads_captured: dayEvents.filter(e => e.event_type === 'lead.captured').length
      });
    }

    // Breakdown by page
    const pageBreakdown = eventsData.reduce((acc, event) => {
      const page = event.page_path || '/';
      if (!acc[page]) {
        acc[page] = {
          percy_opened: 0,
          percy_engaged: 0,
          skillsmith_opened: 0,
          skillsmith_engaged: 0,
          exit_intent_opened: 0,
          leads_captured: 0
        };
      }
      
      if (event.event_type === 'percy.popup.opened') acc[page].percy_opened++;
      if (event.event_type === 'percy.popup.engagement') acc[page].percy_engaged++;
      if (event.event_type === 'skillsmith.popup.opened') acc[page].skillsmith_opened++;
      if (event.event_type === 'skillsmith.popup.engagement') acc[page].skillsmith_engaged++;
      if (event.event_type === 'exitIntent.opened') acc[page].exit_intent_opened++;
      if (event.event_type === 'lead.captured') acc[page].leads_captured++;
      
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      ok: true,
      percy_opened,
      percy_engaged,
      skillsmith_opened,
      skillsmith_engaged,
      exit_intent_opened,
      leads_captured,
      conversions: {
        percy_conversion,
        skillsmith_conversion,
        exit_intent_conversion
      },
      dailyData,
      pageBreakdown
    });

  } catch (error: any) {
    console.error('Popup analytics error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withLogging(handlePopupAnalytics);