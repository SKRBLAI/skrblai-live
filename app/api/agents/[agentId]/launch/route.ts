import { NextResponse } from 'next/server';
import { runAgentWorkflow } from '@/lib/agents/runAgentWorkflow';
// import { getAuth } from '@clerk/nextjs/server'; // Removed Clerk
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase for logging
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const N8N_WEBHOOK_URL = process.env.N8N_AGENT_LAUNCH_WEBHOOK_URL; // e.g., https://n8n.skrbl.com/webhook/skrbl-agent-launch

export async function POST(
  req: Request,
  { params }: { params: { agentId: string } }
) {
  const { agentId } = params;
  const payload = await req.json();
  const userId = null; // Placeholder - TODO: Implement Supabase auth check

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Log the initiation of the agent launch and get the unique ID
  const { data: launchData, error: logError } = await supabase
    .from('agent_launches')
    .insert({
      agent_id: agentId,
      user_id: userId,
      status: 'initiated',
      payload: payload,
      source: 'api_launch',
    })
    .select('id')
    .single();

  if (logError || !launchData) {
    console.error('Supabase logging error (initiated):', logError);
    // If we can't create the initial log, we probably shouldn't proceed.
    return NextResponse.json(
      { error: 'Failed to log agent initiation', details: logError?.message },
      { status: 500 }
    );
  }

  const launchId = launchData.id;

  try {
    // Execute the agent's primary workflow
    // const userRole = typeof sessionClaims === 'object' && sessionClaims !== null && 'metadata' in sessionClaims && typeof sessionClaims.metadata === 'object' && sessionClaims.metadata !== null && 'role' in sessionClaims.metadata ? sessionClaims.metadata.role as string : 'user'; // Removed Clerk sessionClaims
    const userRole = 'user'; // Placeholder - TODO: Implement Supabase role check if needed
    const result = await runAgentWorkflow(agentId, payload, userRole);

    // If workflow execution is successful, trigger n8n webhook
    if (result.status === 'success' && N8N_WEBHOOK_URL) {
      const webhookPayload = {
        launchId,
        agentId,
        userId,
        userRole,
        trigger_payload: payload,
        workflow_result: result,
        timestamp: new Date().toISOString(),
      };

      // Fire-and-forget the webhook
      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      }).catch(async (error) => {
        console.error('n8n webhook trigger failed:', error);
        // Log this failure to Supabase for monitoring
        await supabase.from('agent_launches').update({ 
          status: 'webhook_failed', 
          error_message: 'n8n trigger failed: ' + error.message 
        }).eq('id', launchId);
      });
      
      // Update log to success
      await supabase.from('agent_launches').update({ 
        status: 'success', 
        result: result.result 
      }).eq('id', launchId);
    } else {
      // Update log to failed
      await supabase.from('agent_launches').update({
        status: 'failed',
        error_message: result.result
      }).eq('id', launchId);
    }

    return NextResponse.json(result);
  } catch (error: any) {
     // Update log to critical_failure
    await supabase.from('agent_launches').update({
        status: 'critical_failure',
        error_message: error.message
    }).eq('id', launchId);

    console.error(`[Agent Launch Error] Agent: ${agentId}, Error: ${error.message}`);
    return NextResponse.json(
      { error: 'Failed to run agent workflow', details: error.message },
      { status: 500 }
    );
  }
} 