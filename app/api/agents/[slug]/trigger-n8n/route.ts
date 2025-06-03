import { NextRequest, NextResponse } from 'next/server';
import { triggerN8nWorkflow, getWorkflowStatus } from '@/lib/n8nClient';
import { agentDashboardList } from '@/lib/agents/agentRegistry';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for execution logging
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { payload, userPrompt, fileData } = body;

    // Find the agent by slug
    const agent = agentDashboardList.find(a => 
      a.id === slug || 
      a.name.toLowerCase().replace(/\s+/g, '-') === slug ||
      a.id.replace('-agent', '') === slug
    );

    if (!agent) {
      return NextResponse.json({ 
        success: false, 
        error: `Agent not found: ${slug}` 
      }, { status: 404 });
    }

    // Check if agent has N8N workflow configured
    if (!agent.n8nWorkflowId) {
      console.warn(`[N8N] Agent ${agent.name} has no N8N workflow configured, using mock mode`);
      
      // Mock response for agents without N8N workflows
      return NextResponse.json({
        success: true,
        message: `${agent.name} executed successfully (mock mode)`,
        executionId: `mock_${Date.now()}_${slug}`,
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
          expectedOutput: agent.primaryOutput
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || `Failed to trigger ${agent.name} workflow`,
        message: result.message,
        status: result.status
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[N8N Agent Trigger] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint to check execution status
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');

    if (!executionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing executionId parameter' 
      }, { status: 400 });
    }

    // Get status from N8N
    const statusResult = await getWorkflowStatus(executionId);

    // Update status in Supabase
    if (statusResult.success) {
      try {
        await supabase
          .from('agent_executions')
          .update({
            status: statusResult.status,
            updated_at: new Date().toISOString()
          })
          .eq('execution_id', executionId);
      } catch (updateError) {
        console.error('[N8N] Failed to update execution status:', updateError);
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
    console.error('[N8N Status Check] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 