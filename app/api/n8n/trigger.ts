import { NextRequest, NextResponse } from 'next/server';
import { triggerN8nWorkflow, getWorkflowStatus } from '../../../lib/n8nClient';
import { getOptionalServerSupabase } from '@/lib/supabase/server';

// Initialize Supabase client for execution logging
export async function POST(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    const { workflowId, agentId, agentAction, chained, userPrompt, ...payload } = await req.json();
    
    if (!workflowId) {
      return NextResponse.json({ success: false, error: 'Missing workflowId' }, { status: 400 });
    }

    // Enhanced payload for agent chaining and tracking
    const enhancedPayload = {
      ...payload,
      agentId,
      agentAction,
      userPrompt,
      chained: chained || false,
      timestamp: new Date().toISOString(),
      source: 'skrbl-ai-platform',
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    console.log(`[N8N API] Triggering workflow ${workflowId} for agent ${agentId || 'unknown'}`);

    const result = await triggerN8nWorkflow(workflowId, enhancedPayload);
    
    // Log execution to Supabase for analytics and monitoring
    try {
      await supabase.from('n8n_executions').insert({
        workflow_id: workflowId,
        execution_id: result.executionId,
        agent_id: agentId,
        status: result.status || 'running',
        success: result.success,
        user_prompt: userPrompt,
        payload: JSON.stringify(payload),
        timestamp: new Date().toISOString(),
        error_message: result.error || null,
        chained: chained || false
      });
    } catch (logError) {
      console.error('[N8N API] Failed to log execution:', logError);
      // Don't fail the request if logging fails
    }
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        data: result.data,
        workflowId,
        agentId,
        executionId: result.executionId,
        status: result.status || 'running',
        message: `Workflow ${workflowId} triggered successfully`,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error || result.message,
        workflowId,
        agentId,
        status: result.status || 'error',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[N8N API] Trigger error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Enhanced GET endpoint for webhook health check and execution status
export async function GET(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
const { searchParams } = new URL(req.url);
  const executionId = searchParams.get('executionId');
  const healthCheck = searchParams.get('health');

  // Health check endpoint
  if (healthCheck === 'true') {
    return NextResponse.json({
      status: 'healthy',
      service: 'n8n-workflow-trigger',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      features: ['real-time-status', 'execution-tracking', 'agent-integration']
    });
  }

  // Execution status check
  if (executionId) {
    try {
      const statusResult = await getWorkflowStatus(executionId);
      
      // Update status in Supabase
      if (statusResult.success) {
        try {
          await supabase
            .from('n8n_executions')
            .update({
              status: statusResult.status,
              updated_at: new Date().toISOString(),
              completed_at: statusResult.status === 'success' ? new Date().toISOString() : null
            })
            .eq('execution_id', executionId);
        } catch (updateError) {
          console.error('[N8N API] Failed to update execution status:', updateError);
        }
      }

      return NextResponse.json({
        success: statusResult.success,
        executionId,
        status: statusResult.status,
        data: statusResult.data,
        error: statusResult.error,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('[N8N API] Status check error:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to check execution status',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  }

  // Default response for GET without parameters
  return NextResponse.json({
    message: 'N8N Workflow API',
    endpoints: {
      POST: 'Trigger workflow',
      GET: 'Check execution status (?executionId=xxx) or health (?health=true)'
    },
    timestamp: new Date().toISOString()
  });
} 