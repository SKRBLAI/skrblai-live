import { NextRequest, NextResponse } from 'next/server';
import { triggerAgentWorkflow } from '../../../../../lib/agents/powerEngine';
import { getAgentWorkflowConfig, getHandoffSuggestions } from '../../../../../lib/agents/workflows/workflowLookup';
import type { WorkflowExecutionContext } from '../../../../../lib/agents/workflows/workflowLookup';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/agents/workflow/[agentId]
 * Trigger agent workflow with enhanced personality injection and context tracking
 */
export async function POST(
  request: NextRequest, 
  { params }: { params: { agentId: string } }
) {
  const startTime = Date.now();
  
  try {
    const { agentId } = params;
    
    // Parse request body
    const body = await request.json();
    const {
      userPrompt,
      payload = {},
      fileData,
      sessionId,
      userId,
      userRole = 'free',
      previousAgent,
      handoffReason
    } = body;

    console.log(`[Workflow API] Processing workflow request for ${agentId}:`, {
      userId,
      userRole,
      hasFileData: !!fileData,
      payloadSize: JSON.stringify(payload).length,
      timestamp: new Date().toISOString()
    });

    // Validate required parameters
    if (!userPrompt || !agentId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: agentId and userPrompt',
        agentId,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Get workflow configuration
    const workflowConfig = getAgentWorkflowConfig(agentId);
    if (!workflowConfig) {
      return NextResponse.json({
        success: false,
        error: `Agent not found or not configured: ${agentId}`,
        agentId,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // Check if user has access to this agent
    if (workflowConfig.requiresPremium) {
      const hasAccess = ['pro', 'enterprise', 'vip'].includes(userRole);
      if (!hasAccess) {
        return NextResponse.json({
          success: false,
          error: `${workflowConfig.superheroName} requires premium access`,
          agentId,
          agentName: workflowConfig.superheroName,
          requiresPremium: true,
          userRole,
          timestamp: new Date().toISOString()
        }, { status: 403 });
      }
    }

    // Prepare execution context
    const executionContext: WorkflowExecutionContext = {
      userId: userId || 'anonymous',
      userRole,
      sessionId: sessionId || `session_${Date.now()}`,
      requestTimestamp: new Date().toISOString(),
      userPrompt,
      fileData,
      previousAgent,
      handoffReason
    };

    // Log workflow request
    await logWorkflowRequest(agentId, workflowConfig, executionContext, request);

    // Trigger the workflow
    const result = await triggerAgentWorkflow(agentId, payload, executionContext);

    // Get handoff suggestions based on the result
    const handoffSuggestions = getHandoffSuggestions(agentId, userPrompt);

    // Prepare enhanced response
    const response = {
      success: result.success,
      executionId: result.executionId,
      agentId,
      agentName: workflowConfig.agentName,
      superheroName: workflowConfig.superheroName,
      status: result.status,
      data: result.data,
      error: result.error,
      estimatedCompletion: result.estimatedCompletion,
      
      // Enhanced metadata
      workflowInfo: {
        hasWorkflow: workflowConfig.hasWorkflow,
        capabilities: workflowConfig.workflowCapabilities,
        estimatedDuration: workflowConfig.estimatedDuration,
        fallbackBehavior: workflowConfig.fallbackBehavior
      },
      
      // Cross-agent handoff suggestions
      handoffSuggestions: handoffSuggestions.map(suggestion => ({
        agentId: suggestion.agentId,
        agentName: suggestion.agentName,
        superheroName: suggestion.superheroName,
        capabilities: suggestion.workflowCapabilities,
        triggerMessage: getHandoffMessage(workflowConfig.agentName, suggestion.superheroName),
        confidence: 75 // Base confidence for suggested handoffs
      })),
      
      // Performance metrics
      metrics: {
        ...result.metrics,
        requestProcessingTime: Date.now() - startTime,
        apiVersion: '2.0.0'
      },
      
      timestamp: new Date().toISOString()
    };

    // Log successful response
    console.log(`[Workflow API] Workflow triggered successfully:`, {
      executionId: result.executionId,
      agentId,
      status: result.status,
      processingTime: Date.now() - startTime
    });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[Workflow API] Error processing workflow request:', error);

    // Log error
    await logWorkflowError(params.agentId, error, request);

    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      agentId: params.agentId,
      timestamp: new Date().toISOString(),
      requestProcessingTime: Date.now() - startTime
    }, { status: 500 });
  }
}

/**
 * GET /api/agents/workflow/[agentId]
 * Get agent workflow configuration and status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params;
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');

    // If executionId provided, return execution status
    if (executionId) {
      const { data: execution } = await supabase
        .from('agent_workflow_executions')
        .select('*')
        .eq('execution_id', executionId)
        .single();

      if (!execution) {
        return NextResponse.json({
          success: false,
          error: 'Execution not found',
          executionId
        }, { status: 404 });
      }

      return NextResponse.json({
        executionId,
        agentId: execution.agent_id,
        agentName: execution.agent_name,
        superheroName: execution.superhero_name,
        status: execution.status,
        error: execution.error_message,
        timestamp: execution.timestamp,
        estimatedDuration: execution.estimated_duration,
        workflowCapabilities: execution.workflow_capabilities
      });
    }

    // Otherwise, return agent configuration
    const workflowConfig = getAgentWorkflowConfig(agentId);
    if (!workflowConfig) {
      return NextResponse.json({
        success: false,
        error: `Agent not found: ${agentId}`,
        agentId
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      agentId: workflowConfig.agentId,
      agentName: workflowConfig.agentName,
      superheroName: workflowConfig.superheroName,
      hasWorkflow: workflowConfig.hasWorkflow,
      workflowCapabilities: workflowConfig.workflowCapabilities,
      automationTriggers: workflowConfig.automationTriggers,
      estimatedDuration: workflowConfig.estimatedDuration,
      requiresPremium: workflowConfig.requiresPremium,
      fallbackBehavior: workflowConfig.fallbackBehavior,
      handoffPreferences: workflowConfig.handoffPreferences
    });

  } catch (error: any) {
    console.error('[Workflow API] Error getting agent configuration:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      agentId: params.agentId
    }, { status: 500 });
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Log workflow request for analytics
 */
async function logWorkflowRequest(
  agentId: string,
  config: any,
  context: WorkflowExecutionContext,
  request: NextRequest
): Promise<void> {
  try {
    const requestMetadata = {
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      userAgent: request.headers.get('user-agent')?.substring(0, 200) || 'unknown',
      referer: request.headers.get('referer') || null,
      timestamp: new Date().toISOString()
    };

    await supabase.from('agent_workflow_requests').insert({
      agent_id: agentId,
      agent_name: config.agentName,
      superhero_name: config.superheroName,
      user_id: context.userId,
      user_role: context.userRole,
      session_id: context.sessionId,
      user_prompt: context.userPrompt,
      has_workflow: config.hasWorkflow,
      requires_premium: config.requiresPremium,
      workflow_capabilities: config.workflowCapabilities,
      request_metadata: requestMetadata,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Workflow API] Failed to log request:', error);
    // Don't fail the main request if logging fails
  }
}

/**
 * Log workflow errors for debugging
 */
async function logWorkflowError(
  agentId: string,
  error: Error,
  request: NextRequest
): Promise<void> {
  try {
    await supabase.from('agent_workflow_errors').insert({
      agent_id: agentId,
      error_message: error.message,
      error_stack: error.stack?.substring(0, 1000),
      request_url: request.url,
      request_method: request.method,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent')?.substring(0, 200),
      timestamp: new Date().toISOString()
    });
  } catch (logError) {
    console.error('[Workflow API] Failed to log error:', logError);
  }
}

/**
 * Generate handoff message between agents
 */
function getHandoffMessage(fromAgent: string, toAgent: string): string {
  const messages = [
    `Great work by ${fromAgent}! ${toAgent} can take this to the next level.`,
    `${fromAgent} has laid the foundation. Ready for ${toAgent} to work their magic?`,
    `Perfect! ${toAgent} specializes in exactly what you need next.`,
    `${fromAgent} did their part. Now let ${toAgent} show you what they can do!`,
    `Excellent progress! ${toAgent} can help you build on this success.`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
} 