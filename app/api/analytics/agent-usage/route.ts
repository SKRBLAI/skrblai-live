import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable' },
        { status: 503 }
      );
    }
    
    const {
      eventType, // 'agent_call', 'agent_error', 'agent_selection', 'agent_success', 'agent_timeout'
      agentId,
      agentName,
      userId,
      sessionId,
      userPrompt,
      executionTime,
      errorMessage,
      success,
      metadata = {}
    } = await req.json();

    if (!eventType || !agentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: eventType, agentId' },
        { status: 400 }
      );
    }

    // Create analytics entry
    const analyticsEntry = {
      event_type: eventType,
      agent_id: agentId,
      agent_name: agentName,
      user_id: userId,
      session_id: sessionId,
      user_prompt: userPrompt?.substring(0, 1000), // Limit prompt length
      execution_time_ms: executionTime,
      success: success,
      error_message: errorMessage,
      metadata: JSON.stringify(metadata),
      timestamp: new Date().toISOString(),
      user_agent: req.headers.get('user-agent'),
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    };

    // Insert into analytics table
    const { data, error } = await supabase
      .from('agent_analytics')
      .insert(analyticsEntry)
      .select()
      .single();

    if (error) {
      console.error('[Analytics] Failed to log analytics:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to log analytics event' },
        { status: 500 }
      );
    }

    // Update agent usage counters
    if (eventType === 'agent_call') {
      await updateAgentUsageCounters(supabase, agentId, success, executionTime);
    }

    console.log(`[Analytics] Logged ${eventType} for agent ${agentId}`);

    return NextResponse.json({
      success: true,
      message: 'Analytics event logged',
      data: {
        analyticsId: data.id,
        eventType,
        agentId,
        timestamp: data.timestamp
      }
    });

  } catch (error: any) {
    console.error('[Analytics] Error logging event:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to log analytics',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint for analytics data
export async function GET(req: NextRequest) {
  try {
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable' },
        { status: 503 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');
    const timeframe = searchParams.get('timeframe') || '7d'; // 1d, 7d, 30d, 90d
    const eventType = searchParams.get('eventType');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Calculate time range
    const timeRanges = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };

    const days = timeRanges[timeframe as keyof typeof timeRanges] || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build query
    let query = supabase
      .from('agent_analytics')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Analytics] Failed to fetch analytics:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    // Generate summary statistics
    const summary = generateAnalyticsSummary(data);

    return NextResponse.json({
      success: true,
      data: data,
      summary: summary,
      filters: {
        agentId,
        timeframe,
        eventType,
        limit
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Analytics] Error fetching analytics:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch analytics',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Helper function to update agent usage counters
async function updateAgentUsageCounters(supabase: any, agentId: string, success: boolean, executionTime?: number) {
  try {
    // Get or create agent usage record
    const { data: existingRecord } = await supabase
      .from('agent_usage_stats')
      .select('*')
      .eq('agent_id', agentId)
      .single();

    if (existingRecord) {
      // Update existing record
      const updates = {
        total_calls: existingRecord.total_calls + 1,
        successful_calls: success ? existingRecord.successful_calls + 1 : existingRecord.successful_calls,
        failed_calls: success ? existingRecord.failed_calls : existingRecord.failed_calls + 1,
        avg_execution_time: executionTime 
          ? Math.round((existingRecord.avg_execution_time * existingRecord.total_calls + executionTime) / (existingRecord.total_calls + 1))
          : existingRecord.avg_execution_time,
        last_used: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await supabase
        .from('agent_usage_stats')
        .update(updates)
        .eq('agent_id', agentId);
    } else {
      // Create new record
      await supabase
        .from('agent_usage_stats')
        .insert({
          agent_id: agentId,
          total_calls: 1,
          successful_calls: success ? 1 : 0,
          failed_calls: success ? 0 : 1,
          avg_execution_time: executionTime || 0,
          first_used: new Date().toISOString(),
          last_used: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('[Analytics] Failed to update usage counters:', error);
  }
}

// Helper function to generate analytics summary
function generateAnalyticsSummary(data: any[]) {
  if (!data || data.length === 0) {
    return {
      totalEvents: 0,
      successRate: 0,
      avgExecutionTime: 0,
      topAgents: [],
      eventTypes: {},
      errors: []
    };
  }

  const summary = {
    totalEvents: data.length,
    successfulEvents: data.filter(d => d.success === true).length,
    failedEvents: data.filter(d => d.success === false).length,
    successRate: 0,
    avgExecutionTime: 0,
    topAgents: [] as any[],
    eventTypes: {} as Record<string, number>,
    errors: [] as any[]
  };

  // Calculate success rate
  summary.successRate = summary.totalEvents > 0 
    ? Math.round((summary.successfulEvents / summary.totalEvents) * 100) 
    : 0;

  // Calculate average execution time
  const executionTimes = data.filter(d => d.execution_time_ms).map(d => d.execution_time_ms);
  summary.avgExecutionTime = executionTimes.length > 0
    ? Math.round(executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length)
    : 0;

  // Count events by type
  data.forEach(item => {
    summary.eventTypes[item.event_type] = (summary.eventTypes[item.event_type] || 0) + 1;
  });

  // Top agents by usage
  const agentCounts = data.reduce((acc, item) => {
    if (item.agent_id) {
      acc[item.agent_id] = (acc[item.agent_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  summary.topAgents = Object.entries(agentCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([agentId, count]) => ({ agentId, count }));

  // Recent errors
  summary.errors = data
    .filter(d => d.error_message)
    .slice(0, 10)
    .map(d => ({
      agentId: d.agent_id,
      error: d.error_message,
      timestamp: d.timestamp
    }));

  return summary;
} 