import { NextRequest, NextResponse } from 'next/server';
import { getAgentWorkflowConfig, ensureAgentWebhook } from '../../../../../lib/agents/workflows/workflowLookup';
import { withSafeJson } from '../../../../../utils/withSafeJson';
import { createSafeSupabaseClient } from '../../../../../lib/supabase/client';

// Initialize Supabase client for execution logging with safe fallback
const supabase = createSafeSupabaseClient();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withSafeJson(async (request: NextRequest, { params }: { params: Promise<{ agentId: string }> }) => {
  const { agentId } = await params;
  const correlationId = `${agentId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const body = await request.json();
  const { payload, userPrompt, fileData } = body;

  const config = getAgentWorkflowConfig(agentId);
  if (!config) {
    return NextResponse.json({ success: false, error: `Agent not found: ${agentId}` }, { status: 404 });
  }

  const webhookUrl = ensureAgentWebhook(agentId);
  if (!webhookUrl) {
    console.warn(`[N8N] No webhook configured for agent ${agentId}`);
    return NextResponse.json({
      success: false,
      error: 'N8N webhook not configured for agent',
      correlationId
    }, { status: 503 });
  }

  const enhancedPayload = {
    agentId: config.agentId,
    agentName: config.agentName,
    userPrompt,
    payload: payload || {},
    fileData,
    timestamp: new Date().toISOString(),
    source: 'skrbl-ai-dashboard',
    correlationId
  };

  let n8nRes;
  let n8nData;
  try {
    n8nRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enhancedPayload)
    });
    n8nData = await n8nRes.json();
  } catch (err) {
    console.error(`[N8N] Webhook error for agent ${agentId}:`, err, { correlationId });
    return NextResponse.json({ success: false, error: 'Failed to reach N8N webhook', correlationId }, { status: 502 });
  }

  // Log execution to Supabase for analytics
  try {
    await supabase.from('agent_executions').insert({
      agent_id: config.agentId,
      agent_name: config.agentName,
      n8n_workflow_id: config.n8nWorkflowId,
      execution_id: n8nData.executionId || correlationId,
      status: n8nRes.ok ? 'success' : 'error',
      success: n8nRes.ok,
      user_prompt: userPrompt,
      timestamp: new Date().toISOString(),
      error_message: n8nRes.ok ? null : (n8nData?.error || null),
      correlation_id: correlationId
    });
  } catch (logError) {
    console.error('[N8N] Failed to log execution:', logError);
  }

  if (n8nRes.ok) {
    return NextResponse.json({
      success: true,
      message: `${config.agentName} workflow triggered successfully`,
      executionId: n8nData.executionId || correlationId,
      status: n8nData.status || 'success',
      data: n8nData.data,
      correlationId
    });
  } else {
    return NextResponse.json({
      success: false,
      error: n8nData?.error || 'Failed to trigger N8N workflow',
      correlationId
    }, { status: 500 });
  }
});

// GET endpoint to check execution status
export async function GET(request: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  try {
    const { agentId } = await params;
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');

    if (!executionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'executionId is required' 
      }, { status: 400 });
    }

    const config = getAgentWorkflowConfig(agentId);
    if (!config || !config.n8nWorkflowId) {
      return NextResponse.json({ 
        success: false, 
        error: `Agent or workflow not found for: ${agentId}` 
      }, { status: 404 });
    }

    // Check workflow status
    // NOTE: getWorkflowStatus must be imported from the correct location.
    const { getWorkflowStatus } = await import('../../../../../lib/n8nClient');
    const status = await getWorkflowStatus(executionId);

    // Log status check to Supabase for analytics
    try {
      await supabase.from('agent_executions').update({ 
        status: status.status,
        finished_at: status.data?.finished ? new Date().toISOString() : null
      }).eq('execution_id', executionId);
    } catch (logError) {
      console.error('[N8N] Failed to log status update:', logError);
    }

    return NextResponse.json({ ...status });

  } catch (error: any) {
    console.error('[API] Error in GET /api/agents/[agentId]/trigger-n8n:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
