import { NextResponse } from 'next/server';
import { runAgentWorkflow } from '../../../../../lib/agents/runAgentWorkflow';
import { withSafeJson } from '@/lib/api/safe';
import { getOptionalServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withSafeJson(async (req: Request) => {
  // Parse agentId from URL path: /api/agents/{agentId}/launch
  const url = new URL(req.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const agentId = segments[segments.indexOf('agents') + 1];
  const payload = await req.json();
  
  // ✅ PROPER AUTH VALIDATION - Get user from auth header
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
  }

  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  // Validate the token and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    console.error('[Agent Launch] Auth validation failed:', authError?.message);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const userId = user.id;

  // Get user role for workflow permissions
  const { data: userRoleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
    
  const userRole = userRoleData?.role || 'free';

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
    const result = await runAgentWorkflow(agentId, payload, userRole);

    // If workflow execution is successful, trigger n8n webhook
    const N8N_WEBHOOK_URL = process.env.N8N_AGENT_LAUNCH_WEBHOOK_URL;
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
});