import { NextRequest, NextResponse } from 'next/server';
import { triggerN8nWorkflow, getWorkflowStatus } from '../../../../../lib/n8nClient';
import { agentDashboardList } from '../../../../../lib/agents/agentRegistry';
import { createSafeSupabaseClient } from '../../../../../lib/supabase/client';

// Initialize Supabase client for execution logging with safe fallback
const supabase = createSafeSupabaseClient();

export async function POST(request: NextRequest, { params }: { params: { agentId: string } }) {
  try {
    const { agentId } = params;
    const body = await request.json();
    const { payload, userPrompt, fileData } = body;

    // Find the agent by agentId
    const agent = agentDashboardList.find(a => 
      a.id === agentId || 
      a.name.toLowerCase().replace(/\s+/g, '-') === agentId ||
      a.id.replace('-agent', '') === agentId
    );

    if (!agent) {
      return NextResponse.json({ 
        success: false, 
        error: `Agent not found: ${agentId}` 
      }, { status: 404 });
    }

    // Check if agent has N8N workflow configured
    if (!agent.n8nWorkflowId) {
      console.warn(`[N8N] Agent ${agent.name} has no N8N workflow configured, using mock mode`);
      
      // Mock response for agents without N8N workflows
      return NextResponse.json({
        success: true,
        message: `${agent.name} executed successfully (mock mode)`,
        executionId: `mock_${Date.now()}_${agentId}`,
        status: 'success',
        data: {
          agent: agent.name,
          capability: agent.primaryCapability,
          output: agent.primaryOutput,
          timestamp: new Date().toISOString(),
          mode: 'mock'
        }
      });
    }

    // Prepare enhanced payload for N8N
    const enhancedPayload = {
      agentId: agent.id,
      agentName: agent.name,
      capability: agent.primaryCapability,
      expectedOutput: agent.primaryOutput,
      userPrompt,
      payload: payload || {},
      fileData,
      timestamp: new Date().toISOString(),
      source: 'skrbl-ai-dashboard',
      // Add superhero personality data for enhanced responses
      personality: {
        superheroName: agent.superheroName,
        powers: agent.powers,
        catchphrase: agent.catchphrase
      }
    };

    // Trigger N8N workflow
    const result = await triggerN8nWorkflow(agent.n8nWorkflowId, enhancedPayload);

    // Log execution to Supabase for analytics
    try {
      await supabase.from('agent_executions').insert({
        agent_id: agent.id,
        agent_name: agent.name,
        n8n_workflow_id: agent.n8nWorkflowId,
        execution_id: result.executionId,
        status: result.status,
        success: result.success,
        user_prompt: userPrompt,
        timestamp: new Date().toISOString(),
        error_message: result.error || null
      });
    } catch (logError) {
      console.error('[N8N] Failed to log execution:', logError);
      // Don't fail the main request if logging fails
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${agent.name} workflow triggered successfully`,
        executionId: result.executionId,
        status: result.status,
        data: result.data,
        agent: {
          name: agent.name,
          capability: agent.primaryCapability,
          primaryOutput: agent.primaryOutput
        }
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to trigger N8N workflow' 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[API] Error in POST /api/agents/[agentId]/trigger-n8n:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// GET endpoint to check execution status
export async function GET(request: NextRequest, { params }: { params: { agentId: string } }) {
  try {
    const { agentId } = params; // Using agentId here as well
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');

    if (!executionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'executionId is required' 
      }, { status: 400 });
    }

    // Find the agent by agentId
    const agent = agentDashboardList.find(a => 
      a.id === agentId || 
      a.name.toLowerCase().replace(/\s+/g, '-') === agentId ||
      a.id.replace('-agent', '') === agentId
    );

    if (!agent || !agent.n8nWorkflowId) {
      return NextResponse.json({ 
        success: false, 
        error: `Agent or workflow not found for: ${agentId}` 
      }, { status: 404 });
    }

    // Check workflow status
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
