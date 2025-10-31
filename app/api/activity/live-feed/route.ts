import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase';

export const runtime = 'nodejs'; // Use Node.js runtime for this route
export const dynamic = 'force-dynamic'; // Force dynamic rendering, prevent static analysis

/**
 * GET /api/activity/live-feed
 * Server-Sent Events endpoint for live agent activity feed
 * Provides real-time updates on agent launches, completions, and system events
 */
export async function GET(request: NextRequest) {
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const agentFilter = searchParams.get('agent');
  const eventTypes = searchParams.get('types')?.split(',') || [
    'agent_launch',
    'agent_complete',
    'agent_error',
    'workflow_trigger',
    'system_event'
  ];

  // Verify user authentication
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (!user || userError) {
    return NextResponse.json(
      { success: false, error: 'Invalid authentication' },
      { status: 401 }
    );
  }

  // Create readable stream for SSE
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      const data = {
        type: 'connection',
        timestamp: new Date().toISOString(),
        message: 'Live activity feed connected',
        userId: user.id
      };
      
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      // Set up real-time subscription to activity events
      const setupSubscription = async () => {
        try {
          // Subscribe to agent launches
          const launchSubscription = supabase
            .channel('agent_launches')
            .on('postgres_changes', {
              event: 'INSERT',
              schema: 'public',
              table: 'agent_launches',
              filter: userId ? `user_id=eq.${userId}` : undefined
            }, (payload) => {
              if (eventTypes.includes('agent_launch')) {
                const eventData = {
                  type: 'agent_launch',
                  timestamp: new Date().toISOString(),
                  data: {
                    id: payload.new.id,
                    agentId: payload.new.agent_id,
                    userId: payload.new.user_id,
                    status: payload.new.status,
                    source: payload.new.source
                  }
                };
                
                if (!agentFilter || payload.new.agent_id === agentFilter) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
                }
              }
            })
            .subscribe();

          // Subscribe to agent launch updates (completions/errors)
          const updateSubscription = supabase
            .channel('agent_launch_updates')
            .on('postgres_changes', {
              event: 'UPDATE',
              schema: 'public',
              table: 'agent_launches',
              filter: userId ? `user_id=eq.${userId}` : undefined
            }, (payload) => {
              const isComplete = payload.new.status === 'success';
              const isError = payload.new.status === 'failed';
              
              if ((isComplete && eventTypes.includes('agent_complete')) ||
                  (isError && eventTypes.includes('agent_error'))) {
                
                const eventData = {
                  type: isComplete ? 'agent_complete' : 'agent_error',
                  timestamp: new Date().toISOString(),
                  data: {
                    id: payload.new.id,
                    agentId: payload.new.agent_id,
                    userId: payload.new.user_id,
                    status: payload.new.status,
                    result: payload.new.result,
                    errorMessage: payload.new.error_message
                  }
                };
                
                if (!agentFilter || payload.new.agent_id === agentFilter) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
                }
              }
            })
            .subscribe();

          // Subscribe to N8N workflow executions
          const workflowSubscription = supabase
            .channel('n8n_executions')
            .on('postgres_changes', {
              event: 'INSERT',
              schema: 'public',
              table: 'n8n_executions'
            }, (payload) => {
              if (eventTypes.includes('workflow_trigger')) {
                const eventData = {
                  type: 'workflow_trigger',
                  timestamp: new Date().toISOString(),
                  data: {
                    executionId: payload.new.execution_id,
                    workflowId: payload.new.workflow_id,
                    agentId: payload.new.agent_id,
                    status: payload.new.status,
                    chained: payload.new.chained
                  }
                };
                
                if (!agentFilter || payload.new.agent_id === agentFilter) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
                }
              }
            })
            .subscribe();

          // Subscribe to system health events
          const systemSubscription = supabase
            .channel('system_health')
            .on('postgres_changes', {
              event: 'INSERT',
              schema: 'public',
              table: 'system_health_logs'
            }, (payload) => {
              if (eventTypes.includes('system_event')) {
                const eventData = {
                  type: 'system_event',
                  timestamp: new Date().toISOString(),
                  data: {
                    status: payload.new.overall_status,
                    score: payload.new.overall_score,
                    criticalIssues: JSON.parse(payload.new.critical_issues || '[]').length
                  }
                };
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
              }
            })
            .subscribe();

          // Send periodic heartbeat every 30 seconds
          const heartbeatInterval = setInterval(() => {
            const heartbeat = {
              type: 'heartbeat',
              timestamp: new Date().toISOString(),
              message: 'Connection alive'
            };
            
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(heartbeat)}\n\n`));
            } catch (error) {
              // Connection closed, cleanup
              clearInterval(heartbeatInterval);
              launchSubscription.unsubscribe();
              updateSubscription.unsubscribe();
              workflowSubscription.unsubscribe();
              systemSubscription.unsubscribe();
            }
          }, 30000);

          // Cleanup on connection close
          request.signal.addEventListener('abort', () => {
            clearInterval(heartbeatInterval);
            launchSubscription.unsubscribe();
            updateSubscription.unsubscribe();
            workflowSubscription.unsubscribe();
            systemSubscription.unsubscribe();
            controller.close();
          });

        } catch (error) {
          console.error('[Live Feed] Subscription setup error:', error);
          const errorEvent = {
            type: 'error',
            timestamp: new Date().toISOString(),
            message: 'Failed to setup real-time subscriptions',
            error: error
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
        }
      };

      setupSubscription();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

/**
 * POST /api/activity/live-feed
 * Manually trigger activity events for testing
 */
export async function POST(request: NextRequest) {
  try {
    const { eventType, agentId, userId, data = {} } = await request.json();

    if (!eventType) {
      return NextResponse.json(
        { success: false, error: 'eventType is required' },
        { status: 400 }
      );
    }

    // Log synthetic event for testing
    const testEvent = {
      event_type: eventType,
      agent_id: agentId,
      user_id: userId,
      data: JSON.stringify(data),
      timestamp: new Date().toISOString(),
      source: 'manual_trigger'
    };

    console.log('[Live Feed] Manual test event triggered:', testEvent);

    return NextResponse.json({
      success: true,
      message: `Test event '${eventType}' triggered`,
      event: testEvent,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Live Feed] POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to trigger test event'
    }, { status: 500 });
  }
} 