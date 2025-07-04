/**
 * N8N Webhook Integration for SKRBL AI Events
 * 
 * Fires webhooks to n8n for key user and agent events
 * with comprehensive error logging and retry logic.
 */

interface WebhookPayload {
  event: 'signup' | 'signin' | 'agent_launch';
  timestamp: string;
  user: {
    id: string;
    email: string;
    provider?: string;
    role?: string;
  };
  agent?: {
    id: string;
    name: string;
    superheroName?: string;
    workflowId?: string;
  };
  metadata: {
    source: string;
    userAgent?: string;
    ipAddress?: string;
    promoCode?: string;
    vipCode?: string;
    sessionId?: string;
  };
}

interface WebhookResponse {
  success: boolean;
  error?: string;
  executionId?: string;
}

const N8N_WEBHOOK_BASE = process.env.N8N_WEBHOOK_BASE_URL || process.env.N8N_BASE_URL;
const WEBHOOK_TIMEOUT = 10000; // 10 seconds

/**
 * Fire webhook to n8n with retry logic
 */
async function fireWebhook(
  webhookPath: string, 
  payload: WebhookPayload,
  retries = 2
): Promise<WebhookResponse> {
  if (!N8N_WEBHOOK_BASE) {
    console.warn('[N8N Webhook] Base URL not configured, skipping webhook');
    return { success: false, error: 'N8N webhook base URL not configured' };
  }

  const webhookUrl = `${N8N_WEBHOOK_BASE}/webhook/${webhookPath}`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[N8N Webhook] Firing ${payload.event} webhook (attempt ${attempt + 1}):`, {
        url: webhookUrl,
        event: payload.event,
        userId: payload.user.id,
        agentId: payload.agent?.id
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SKRBL-AI-Webhook/1.0'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(WEBHOOK_TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`[N8N Webhook] ${payload.event} webhook successful:`, result);
      
      return {
        success: true,
        executionId: result.executionId || result.id
      };

    } catch (error: any) {
      console.error(`[N8N Webhook] ${payload.event} webhook failed (attempt ${attempt + 1}):`, {
        error: error.message,
        url: webhookUrl,
        payload: { event: payload.event, userId: payload.user.id }
      });

      // Log to database for monitoring
      await logWebhookError(webhookPath, payload, error, attempt + 1);

      if (attempt === retries) {
        return {
          success: false,
          error: error.message || 'Webhook failed after retries'
        };
      }

      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}

/**
 * Log webhook errors to database for monitoring
 */
async function logWebhookError(
  webhookPath: string,
  payload: WebhookPayload,
  error: Error,
  attempt: number
): Promise<void> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from('webhook_errors').insert({
      webhook_path: webhookPath,
      event_type: payload.event,
      user_id: payload.user.id,
      agent_id: payload.agent?.id,
      error_message: error.message,
      error_stack: error.stack?.substring(0, 1000),
      attempt_number: attempt,
      payload: payload,
      timestamp: new Date().toISOString()
    });
  } catch (logError) {
    console.error('[N8N Webhook] Failed to log webhook error:', logError);
  }
}

/**
 * Fire signup webhook
 */
export async function fireSignupWebhook(
  user: { id: string; email: string; provider?: string; role?: string },
  metadata: { source: string; userAgent?: string; ipAddress?: string; promoCode?: string; vipCode?: string; sessionId?: string }
): Promise<WebhookResponse> {
  const payload: WebhookPayload = {
    event: 'signup',
    timestamp: new Date().toISOString(),
    user,
    metadata
  };

  return fireWebhook('skrbl-signup', payload);
}

/**
 * Fire signin webhook
 */
export async function fireSigninWebhook(
  user: { id: string; email: string; provider?: string; role?: string },
  metadata: { source: string; userAgent?: string; ipAddress?: string; promoCode?: string; vipCode?: string; sessionId?: string }
): Promise<WebhookResponse> {
  const payload: WebhookPayload = {
    event: 'signin',
    timestamp: new Date().toISOString(),
    user,
    metadata
  };

  return fireWebhook('skrbl-signin', payload);
}

/**
 * Fire agent launch webhook
 */
export async function fireAgentLaunchWebhook(
  user: { id: string; email: string; role?: string },
  agent: { id: string; name: string; superheroName?: string; workflowId?: string },
  metadata: { source: string; userAgent?: string; ipAddress?: string; sessionId?: string }
): Promise<WebhookResponse> {
  const payload: WebhookPayload = {
    event: 'agent_launch',
    timestamp: new Date().toISOString(),
    user,
    agent,
    metadata
  };

  return fireWebhook('skrbl-agent-launch', payload);
}

/**
 * Test webhook connectivity
 */
export async function testWebhookConnectivity(): Promise<{ success: boolean; results: Record<string, any> }> {
  const testPayload: WebhookPayload = {
    event: 'signin',
    timestamp: new Date().toISOString(),
    user: {
      id: 'test-user-id',
      email: 'test@skrblai.io'
    },
    metadata: {
      source: 'webhook-test',
      sessionId: 'test-session'
    }
  };

  const results = {
    signup: await fireWebhook('skrbl-signup', { ...testPayload, event: 'signup' }),
    signin: await fireWebhook('skrbl-signin', testPayload),
    agentLaunch: await fireWebhook('skrbl-agent-launch', {
      ...testPayload,
      event: 'agent_launch',
      agent: { id: 'percy', name: 'Percy', superheroName: 'Percy the Cosmic Concierge' }
    })
  };

  const allSuccessful = Object.values(results).every(r => r.success);
  
  return {
    success: allSuccessful,
    results
  };
} 