import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_BASE_URL')!
const n8nApiKey = Deno.env.get('N8N_API_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { paymentIntentId, userId, amount, currency, metadata } = await req.json()

    // Validate required fields
    if (!paymentIntentId || !userId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Update user subscription status
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) {
      throw new Error(`User not found: ${userError.message}`)
    }

    // Update user to premium status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscription_status: 'active',
        subscription_tier: metadata?.plan || 'premium',
        subscription_updated_at: new Date().toISOString(),
        payment_intent_id: paymentIntentId
      })
      .eq('id', userId)

    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`)
    }

    // Log payment in transactions table
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        payment_intent_id: paymentIntentId,
        amount: amount,
        currency: currency || 'USD',
        status: 'completed',
        metadata: metadata,
        processed_at: new Date().toISOString()
      })

    if (transactionError) {
      console.error('Failed to log transaction:', transactionError)
      // Don't fail the function for logging errors
    }

    // MMM: n8n noop shim. Replace with AgentKit or queues later.
    // Check if NOOP mode is enabled (protects against n8n downtime)
    const FF_N8N_NOOP = Deno.env.get('FF_N8N_NOOP') === 'true' || Deno.env.get('FF_N8N_NOOP') === '1';
    
    let n8nResponse: Response | { ok: boolean };
    
    if (FF_N8N_NOOP) {
      console.log('[NOOP] Skipping n8n payment webhook (FF_N8N_NOOP=true)', {
        userId,
        paymentIntentId,
        amount,
        plan: metadata?.plan
      });
      n8nResponse = { ok: true }; // Mock success
    } else {
      // Trigger n8n workflow for post-payment automation
      const n8nPayload = {
        userId,
        email: user.email,
        paymentIntentId,
        amount,
        currency,
        plan: metadata?.plan || 'premium',
        isFirstPayment: metadata?.isFirstPayment || false,
        timestamp: new Date().toISOString(),
        metadata
      }

      n8nResponse = await fetch(`${n8nWebhookUrl}/payment-completed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': n8nApiKey
        },
        body: JSON.stringify(n8nPayload)
      })

      if (!n8nResponse.ok) {
        console.error('Failed to trigger n8n workflow:', await n8nResponse.text())
        // Don't fail the function for n8n errors, but log them
      }
    }

    // Grant access to premium features
    const { error: accessError } = await supabase
      .from('user_feature_access')
      .upsert({
        user_id: userId,
        feature: 'premium_agents',
        enabled: true,
        granted_at: new Date().toISOString()
      })

    if (accessError) {
      console.error('Failed to grant feature access:', accessError)
    }

    // Schedule follow-up workflows if needed
    const followUpTasks = []

    // Welcome email for new subscribers
    if (metadata?.isFirstPayment) {
      followUpTasks.push({
        type: 'welcome_sequence',
        delay: 300, // 5 minutes
        payload: { userId, plan: metadata.plan }
      })
    }

    // Feature introduction emails
    followUpTasks.push({
      type: 'feature_introduction',
      delay: 3600, // 1 hour
      payload: { userId, plan: metadata?.plan || 'premium' }
    })

    // Engagement check after 7 days
    followUpTasks.push({
      type: 'engagement_check',
      delay: 604800, // 7 days
      payload: { userId }
    })

    // Queue follow-up tasks (if n8n is available and not in NOOP mode)
    if (n8nResponse.ok && !FF_N8N_NOOP) {
      for (const task of followUpTasks) {
        try {
          await fetch(`${n8nWebhookUrl}/schedule-task`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': n8nApiKey
            },
            body: JSON.stringify(task)
          })
        } catch (error) {
          console.error(`Failed to schedule task ${task.type}:`, error)
        }
      }
    } else if (FF_N8N_NOOP) {
      console.log('[NOOP] Skipping n8n follow-up task scheduling (FF_N8N_NOOP=true)', {
        taskCount: followUpTasks.length
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment processed successfully',
        userId,
        paymentIntentId,
        workflowTriggered: n8nResponse.ok,
        followUpTasksScheduled: followUpTasks.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Post-payment automation error:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})