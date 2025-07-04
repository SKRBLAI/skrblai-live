import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for audit logs
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json'; // 'json' or 'csv'
    const timeframe = searchParams.get('timeframe') || '30d';
    const agentId = searchParams.get('agentId');
    const eventType = searchParams.get('eventType');
    const limit = parseInt(searchParams.get('limit') || '1000');

    // Calculate time range
    const timeRanges = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };

    const days = timeRanges[timeframe as keyof typeof timeRanges] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build query for analytics data
    let analyticsQuery = supabase
      .from('agent_analytics')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (agentId) {
      analyticsQuery = analyticsQuery.eq('agent_id', agentId);
    }

    if (eventType) {
      analyticsQuery = analyticsQuery.eq('event_type', eventType);
    }

    // Get analytics data
    const { data: analyticsData, error: analyticsError } = await analyticsQuery;

    if (analyticsError) {
      console.error('[Audit Export] Failed to fetch analytics:', analyticsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch audit data' },
        { status: 500 }
      );
    }

    // Get usage stats
    let usageQuery = supabase
      .from('agent_usage_stats')
      .select('*')
      .order('total_calls', { ascending: false });

    if (agentId) {
      usageQuery = usageQuery.eq('agent_id', agentId);
    }

    const { data: usageData, error: usageError } = await usageQuery;

    if (usageError) {
      console.error('[Audit Export] Failed to fetch usage stats:', usageError);
    }

    // Get N8N execution logs
    let n8nQuery = supabase
      .from('n8n_executions')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (agentId) {
      n8nQuery = n8nQuery.eq('agent_id', agentId);
    }

    const { data: n8nData, error: n8nError } = await n8nQuery;

    if (n8nError) {
      console.error('[Audit Export] Failed to fetch N8N logs:', n8nError);
    }

    // Get Percy contact logs
    const { data: percyData, error: percyError } = await supabase
      .from('percy_contacts')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (percyError) {
      console.error('[Audit Export] Failed to fetch Percy logs:', percyError);
    }

    // Prepare export data
    const exportData = {
      metadata: {
        exportTimestamp: new Date().toISOString(),
        timeframe,
        agentId: agentId || 'all',
        eventType: eventType || 'all',
        totalRecords: (analyticsData?.length || 0) + (usageData?.length || 0) + (n8nData?.length || 0) + (percyData?.length || 0),
        format
      },
      analytics: analyticsData || [],
      usageStats: usageData || [],
      n8nExecutions: n8nData || [],
      percyContacts: percyData || []
    };

    if (format === 'csv') {
      // Generate CSV format
      const csvContent = generateAuditCSV(exportData);
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="skrbl-ai-audit-${timeframe}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      // Return JSON format
      return NextResponse.json({
        success: true,
        data: exportData,
        summary: {
          totalAnalyticsEvents: analyticsData?.length || 0,
          totalUsageStats: usageData?.length || 0,
          totalN8nExecutions: n8nData?.length || 0,
          totalPercyContacts: percyData?.length || 0,
          exportedAt: new Date().toISOString(),
          timeframe,
          filters: { agentId, eventType, limit }
        }
      });
    }

  } catch (error: any) {
    console.error('[Audit Export] Export error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to export audit logs',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Generate CSV content from audit data
function generateAuditCSV(exportData: any): string {
  const headers = [
    'Category',
    'Timestamp',
    'Agent ID',
    'Agent Name',
    'Event Type',
    'User ID',
    'Session ID',
    'Success',
    'Execution Time (ms)',
    'Error Message',
    'Details'
  ];

  const rows = [];
  
  // Add header row
  rows.push(headers.join(','));

  // Process analytics data
  exportData.analytics.forEach((item: any) => {
    rows.push([
      'Analytics',
      item.timestamp,
      item.agent_id || '',
      item.agent_name || '',
      item.event_type || '',
      item.user_id || '',
      item.session_id || '',
      item.success !== null ? item.success : '',
      item.execution_time_ms || '',
      item.error_message ? `"${item.error_message.replace(/"/g, '""')}"` : '',
      item.user_prompt ? `"${item.user_prompt.substring(0, 100).replace(/"/g, '""')}"` : ''
    ].join(','));
  });

  // Process usage stats
  exportData.usageStats.forEach((item: any) => {
    rows.push([
      'Usage Stats',
      item.updated_at || item.created_at,
      item.agent_id || '',
      '',
      'usage_summary',
      '',
      '',
      '',
      item.avg_execution_time || '',
      '',
      `"Total: ${item.total_calls}, Success: ${item.successful_calls}, Failed: ${item.failed_calls}"`
    ].join(','));
  });

  // Process N8N executions
  exportData.n8nExecutions.forEach((item: any) => {
    rows.push([
      'N8N Execution',
      item.timestamp,
      item.agent_id || '',
      '',
      'n8n_workflow',
      '',
      '',
      item.success !== null ? item.success : '',
      '',
      item.error_message ? `"${item.error_message.replace(/"/g, '""')}"` : '',
      `"Workflow: ${item.workflow_id}, Execution: ${item.execution_id}"`
    ].join(','));
  });

  // Process Percy contacts
  exportData.percyContacts.forEach((item: any) => {
    rows.push([
      'Percy Contact',
      item.timestamp,
      'percy',
      'Percy',
      'contact_' + item.contact_method,
      item.user_id || '',
      '',
      item.success !== null ? item.success : '',
      '',
      item.error_message ? `"${item.error_message.replace(/"/g, '""')}"` : '',
      `"Method: ${item.contact_method}, Type: ${item.message_type}, Provider: ${item.provider}"`
    ].join(','));
  });

  return rows.join('\n');
}

// POST endpoint to trigger audit cleanup
export async function POST(req: NextRequest) {
  try {
    const { action, days = 90 } = await req.json();

    if (action === 'cleanup') {
      // Clean up old audit logs older than specified days
      const cleanupDate = new Date();
      cleanupDate.setDate(cleanupDate.getDate() - days);

      const cleanupResults = {
        analytics: 0,
        n8nExecutions: 0,
        percyContacts: 0
      };

      // Cleanup analytics data
      const { count: analyticsCount } = await supabase
        .from('agent_analytics')
        .delete()
        .lt('timestamp', cleanupDate.toISOString());

      cleanupResults.analytics = analyticsCount || 0;

      // Cleanup N8N execution logs
      const { count: n8nCount } = await supabase
        .from('n8n_executions')
        .delete()
        .lt('timestamp', cleanupDate.toISOString());

      cleanupResults.n8nExecutions = n8nCount || 0;

      // Cleanup Percy contact logs
      const { count: percyCount } = await supabase
        .from('percy_contacts')
        .delete()
        .lt('timestamp', cleanupDate.toISOString());

      cleanupResults.percyContacts = percyCount || 0;

      return NextResponse.json({
        success: true,
        message: `Audit logs cleanup completed`,
        cleanupResults,
        cutoffDate: cleanupDate.toISOString(),
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use "cleanup" to clean old logs.',
    }, { status: 400 });

  } catch (error: any) {
    console.error('[Audit Export] Cleanup error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to cleanup audit logs',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 