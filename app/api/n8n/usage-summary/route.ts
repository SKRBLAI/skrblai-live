import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase';
import { getQuotaStatus } from '../../../../lib/n8nClient';

// Initialize Supabase client
export async function GET(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';
    const days = parseInt(searchParams.get('days') || '7');
    const includeAlerts = searchParams.get('alerts') === 'true';

    // Get current quota status
    const quotaStatus = getQuotaStatus();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch execution data from Supabase
    const { data: executions, error } = await supabase
      .from('n8n_executions')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('[N8N Usage Summary] Database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch execution data'
      }, { status: 500 });
    }

    // Process execution data
    const summary = processExecutionData(executions || [], days);
    
    // Add current quota status
    const summaryWithQuota = {
      ...summary,
      quotaStatus: {
        current: quotaStatus,
        alerts: includeAlerts ? generateAlerts(quotaStatus, summary) : []
      }
    };

    // Format response based on requested format
    if (format === 'slack') {
      return NextResponse.json({
        success: true,
        data: formatForSlack(summaryWithQuota),
        timestamp: new Date().toISOString()
      });
    } else if (format === 'email') {
      return NextResponse.json({
        success: true,
        data: formatForEmail(summaryWithQuota),
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: true,
        data: summaryWithQuota,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    console.error('[N8N Usage Summary] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate usage summary'
    }, { status: 500 });
  }
}

// POST endpoint to trigger alerts manually
export async function POST(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    const { alertType, recipients, customMessage } = await req.json();

    if (!alertType || !recipients) {
      return NextResponse.json({
        success: false,
        error: 'alertType and recipients are required'
      }, { status: 400 });
    }

    const quotaStatus = getQuotaStatus();
    const summary = await generateDailySummary(supabase);

    let alertSent = false;
    let alertMessage = '';

    // Send alerts based on type
    switch (alertType) {
      case 'slack':
        alertSent = await sendSlackAlert(summary, recipients, customMessage);
        alertMessage = 'Slack alert sent successfully';
        break;
      case 'email':
        alertSent = await sendEmailAlert(summary, recipients, customMessage);
        alertMessage = 'Email alert sent successfully';
        break;
      case 'webhook':
        alertSent = await sendWebhookAlert(summary, recipients, customMessage);
        alertMessage = 'Webhook alert sent successfully';
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid alert type. Supported: slack, email, webhook'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: alertSent,
      message: alertMessage,
      data: {
        alertType,
        recipients: Array.isArray(recipients) ? recipients.length : 1,
        summary: summary.overview,
        quotaStatus
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[N8N Usage Summary] Alert error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send alert'
    }, { status: 500 });
  }
}

// Process execution data into summary
function processExecutionData(executions: any[], days: number) {
  const dailyStats: Record<string, any> = {};
  const agentStats: Record<string, any> = {};
  const workflowStats: Record<string, any> = {};

  let totalExecutions = 0;
  let successfulExecutions = 0;
  let failedExecutions = 0;
  let totalExecutionTime = 0;

  executions.forEach(exec => {
    const date = exec.timestamp.split('T')[0];
    const agentId = exec.agent_id || 'unknown';
    const workflowId = exec.workflow_id || 'unknown';

    // Daily stats
    if (!dailyStats[date]) {
      dailyStats[date] = { total: 0, success: 0, failed: 0, agents: new Set() };
    }
    dailyStats[date].total++;
    dailyStats[date].agents.add(agentId);
    
    if (exec.success) {
      dailyStats[date].success++;
      successfulExecutions++;
    } else {
      dailyStats[date].failed++;
      failedExecutions++;
    }

    // Agent stats
    if (!agentStats[agentId]) {
      agentStats[agentId] = { total: 0, success: 0, failed: 0 };
    }
    agentStats[agentId].total++;
    if (exec.success) {
      agentStats[agentId].success++;
    } else {
      agentStats[agentId].failed++;
    }

    // Workflow stats
    if (!workflowStats[workflowId]) {
      workflowStats[workflowId] = { total: 0, success: 0, failed: 0 };
    }
    workflowStats[workflowId].total++;
    if (exec.success) {
      workflowStats[workflowId].success++;
    } else {
      workflowStats[workflowId].failed++;
    }

    totalExecutions++;
  });

  // Convert daily stats
  const dailyBreakdown = Object.entries(dailyStats).map(([date, stats]: [string, any]) => ({
    date,
    total: stats.total,
    success: stats.success,
    failed: stats.failed,
    successRate: stats.total > 0 ? (stats.success / stats.total * 100).toFixed(1) : '0',
    uniqueAgents: stats.agents.size
  }));

  // Top agents by usage
  const topAgents = Object.entries(agentStats)
    .map(([agentId, stats]: [string, any]) => ({
      agentId,
      ...stats,
      successRate: stats.total > 0 ? (stats.success / stats.total * 100).toFixed(1) : '0'
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Top workflows by usage
  const topWorkflows = Object.entries(workflowStats)
    .map(([workflowId, stats]: [string, any]) => ({
      workflowId,
      ...stats,
      successRate: stats.total > 0 ? (stats.success / stats.total * 100).toFixed(1) : '0'
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions * 100).toFixed(1) : '0';
  const averageDaily = (totalExecutions / days).toFixed(1);

  return {
    overview: {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      successRate: `${successRate}%`,
      averageDaily: parseFloat(averageDaily),
      periodDays: days
    },
    dailyBreakdown,
    topAgents,
    topWorkflows,
    trends: {
      trending: totalExecutions > 0 ? 'up' : 'stable',
      healthScore: parseFloat(successRate),
      recommendation: generateRecommendation(parseFloat(successRate), totalExecutions)
    }
  };
}

// Generate alerts based on quota status and usage patterns
function generateAlerts(quotaStatus: any, summary: any) {
  const alerts = [];

  // Quota warnings
  const dailyUsagePercent = (quotaStatus.dailyExecutions / quotaStatus.dailyLimit) * 100;
  const monthlyUsagePercent = (quotaStatus.monthlyExecutions / quotaStatus.monthlyLimit) * 100;

  if (dailyUsagePercent >= 90) {
    alerts.push({
      type: 'critical',
      message: `Daily quota at ${dailyUsagePercent.toFixed(1)}% (${quotaStatus.dailyExecutions}/${quotaStatus.dailyLimit})`,
      action: 'Consider upgrading plan or reducing executions'
    });
  } else if (dailyUsagePercent >= 75) {
    alerts.push({
      type: 'warning',
      message: `Daily quota at ${dailyUsagePercent.toFixed(1)}% (${quotaStatus.dailyExecutions}/${quotaStatus.dailyLimit})`,
      action: 'Monitor usage closely'
    });
  }

  if (monthlyUsagePercent >= 90) {
    alerts.push({
      type: 'critical',
      message: `Monthly quota at ${monthlyUsagePercent.toFixed(1)}% (${quotaStatus.monthlyExecutions}/${quotaStatus.monthlyLimit})`,
      action: 'Plan upgrade required'
    });
  }

  // Concurrent execution warnings
  const concurrentUsagePercent = (quotaStatus.currentConcurrent / quotaStatus.concurrentLimit) * 100;
  if (concurrentUsagePercent >= 80) {
    alerts.push({
      type: 'warning',
      message: `High concurrent usage: ${quotaStatus.currentConcurrent}/${quotaStatus.concurrentLimit}`,
      action: 'Consider increasing concurrent limit'
    });
  }

  // Success rate warnings
  const successRate = parseFloat(summary.overview.successRate);
  if (successRate < 70) {
    alerts.push({
      type: 'critical',
      message: `Low success rate: ${summary.overview.successRate}`,
      action: 'Review failed workflows and error patterns'
    });
  } else if (successRate < 85) {
    alerts.push({
      type: 'warning',
      message: `Success rate below optimal: ${summary.overview.successRate}`,
      action: 'Investigate workflow reliability'
    });
  }

  return alerts;
}

// Format summary for Slack
function formatForSlack(summary: any) {
  const overview = summary.overview;
  const alerts = summary.quotaStatus.alerts;

  let text = `?? *N8N Daily Execution Summary*\n\n`;
  text += `? Total Executions: ${overview.totalExecutions}\n`;
  text += `? Success Rate: ${overview.successRate}\n`;
  text += `? Average Daily: ${overview.averageDaily}\n`;
  text += `? Period: ${overview.periodDays} days\n\n`;

  if (alerts.length > 0) {
    text += `?? *Alerts:*\n`;
    alerts.forEach((alert: any) => {
      const emoji = alert.type === 'critical' ? '??' : '??';
      text += `${emoji} ${alert.message}\n`;
    });
    text += `\n`;
  }

  text += `?? *Top Agents:*\n`;
  summary.topAgents.slice(0, 3).forEach((agent: any, idx: number) => {
    text += `${idx + 1}. ${agent.agentId}: ${agent.total} executions (${agent.successRate}% success)\n`;
  });

  return {
    text,
    attachments: [
      {
        color: alerts.some((a: any) => a.type === 'critical') ? 'danger' : 
               alerts.some((a: any) => a.type === 'warning') ? 'warning' : 'good',
        fields: [
          {
            title: 'Health Score',
            value: `${summary.trends.healthScore}%`,
            short: true
          },
          {
            title: 'Quota Usage',
            value: `${summary.quotaStatus.current.dailyExecutions}/${summary.quotaStatus.current.dailyLimit}`,
            short: true
          }
        ]
      }
    ]
  };
}

// Format summary for email
function formatForEmail(summary: any) {
  return {
    subject: `N8N Execution Summary - ${new Date().toLocaleDateString()}`,
    html: generateEmailHTML(summary),
    text: generateEmailText(summary)
  };
}

// Generate email HTML
function generateEmailHTML(summary: any) {
  const overview = summary.overview;
  const alerts = summary.quotaStatus.alerts;

  return `
    <h2>?? N8N Execution Summary</h2>
    <p><strong>Period:</strong> Last ${overview.periodDays} days</p>
    
    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3>?? Overview</h3>
      <ul>
        <li><strong>Total Executions:</strong> ${overview.totalExecutions}</li>
        <li><strong>Success Rate:</strong> ${overview.successRate}</li>
        <li><strong>Average Daily:</strong> ${overview.averageDaily}</li>
        <li><strong>Health Score:</strong> ${summary.trends.healthScore}%</li>
      </ul>
    </div>

    ${alerts.length > 0 ? `
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107;">
        <h3>?? Alerts</h3>
        <ul>
          ${alerts.map((alert: any) => `
            <li style="color: ${alert.type === 'critical' ? '#dc3545' : '#856404'};">
              <strong>${alert.message}</strong><br>
              <small>${alert.action}</small>
            </li>
          `).join('')}
        </ul>
      </div>
    ` : ''}

    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3>?? Top Performing Agents</h3>
      <ol>
        ${summary.topAgents.slice(0, 5).map((agent: any) => `
          <li><strong>${agent.agentId}:</strong> ${agent.total} executions (${agent.successRate}% success)</li>
        `).join('')}
      </ol>
    </div>

    <p><strong>Recommendation:</strong> ${summary.trends.recommendation}</p>
  `;
}

// Generate email text
function generateEmailText(summary: any) {
  const overview = summary.overview;
  let text = `N8N Execution Summary - ${new Date().toLocaleDateString()}\n\n`;
  text += `Overview:\n`;
  text += `- Total Executions: ${overview.totalExecutions}\n`;
  text += `- Success Rate: ${overview.successRate}\n`;
  text += `- Average Daily: ${overview.averageDaily}\n\n`;
  
  if (summary.quotaStatus.alerts.length > 0) {
    text += `Alerts:\n`;
    summary.quotaStatus.alerts.forEach((alert: any) => {
      text += `- ${alert.message}\n`;
    });
    text += `\n`;
  }

  text += `Top Agents:\n`;
  summary.topAgents.slice(0, 5).forEach((agent: any, idx: number) => {
    text += `${idx + 1}. ${agent.agentId}: ${agent.total} executions (${agent.successRate}% success)\n`;
  });

  return text;
}

// Generate recommendation based on metrics
function generateRecommendation(successRate: number, totalExecutions: number) {
  if (successRate >= 95 && totalExecutions > 100) {
    return 'Excellent performance! Consider scaling up workflows.';
  } else if (successRate >= 85) {
    return 'Good performance. Monitor for optimization opportunities.';
  } else if (successRate >= 70) {
    return 'Moderate performance. Review error patterns and optimize workflows.';
  } else {
    return 'Poor performance detected. Immediate investigation required.';
  }
}

// Generate daily summary
async function generateDailySummary(supabase: any) {
  if (!supabase) {
    return { 
      overview: { 
        totalExecutions: 0, 
        successfulExecutions: 0, 
        failedExecutions: 0, 
        successRate: '0%',
        averageDaily: 0,
        periodDays: 1
      },
      dailyBreakdown: [],
      topAgents: [],
      topWorkflows: [],
      trends: {}
    };
  }
  
  const { data: executions } = await supabase
    .from('n8n_executions')
    .select('*')
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  return processExecutionData(executions || [], 1);
}

// Alert functions (placeholder implementations)
async function sendSlackAlert(summary: any, recipients: string[], customMessage?: string) {
  // Implementation would depend on Slack webhook setup
  console.log('[N8N Usage Summary] Slack alert would be sent to:', recipients);
  return true;
}

async function sendEmailAlert(summary: any, recipients: string[], customMessage?: string) {
  // Implementation would depend on email service setup
  console.log('[N8N Usage Summary] Email alert would be sent to:', recipients);
  return true;
}

async function sendWebhookAlert(summary: any, recipients: string[], customMessage?: string) {
  // Implementation would depend on webhook setup
  console.log('[N8N Usage Summary] Webhook alert would be sent to:', recipients);
  return true;
} 