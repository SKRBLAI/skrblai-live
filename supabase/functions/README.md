# Supabase Edge Functions - MCP Orchestration Integration

This directory contains Supabase Edge Functions that integrate with the SKRBL AI MCP (Master Control Program) orchestration system.

## Overview

Supabase Edge Functions serve as serverless automation endpoints that:
- Process database events and triggers
- Integrate with n8n workflows
- Handle background automation tasks
- Provide secure API endpoints for external integrations

## Functions

### `post-payment-automation`
**Purpose**: Automate user onboarding and feature access after successful payments

**Triggers**: Called by Stripe webhooks or payment processing systems

**Features**:
- Updates user subscription status in database
- Grants access to premium features
- Triggers n8n workflows for email automation
- Schedules follow-up engagement tasks
- Logs payment transactions

**Environment Variables**:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
N8N_WEBHOOK_BASE_URL=your_n8n_webhook_base_url
N8N_API_KEY=your_n8n_api_key
```

## Development Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Initialize Supabase (if needed)

```bash
supabase init
```

### 3. Start Local Development

```bash
supabase start
supabase functions serve
```

### 4. Deploy Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy post-payment-automation
```

## Integration with MCP Orchestration

### Flow Diagram

```
Payment Event → Supabase Function → Database Update → n8n Workflow → Queue Jobs
```

### Example Integration Flow

1. **Payment Completed**: Stripe webhook calls Supabase Function
2. **Database Update**: Function updates user subscription status
3. **Feature Access**: Grants access to premium features
4. **Workflow Trigger**: Calls n8n webhook for automation
5. **Email Sequence**: n8n triggers email workflows
6. **Queue Jobs**: Background tasks queued for processing

### Function to n8n Integration

```typescript
// Inside Supabase Function
const n8nResponse = await fetch(`${n8nWebhookUrl}/payment-completed`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': n8nApiKey
  },
  body: JSON.stringify({
    userId,
    email: user.email,
    paymentIntentId,
    amount,
    plan: 'premium',
    timestamp: new Date().toISOString()
  })
})
```

### n8n to Function Integration

n8n workflows can call Supabase Functions directly:

```json
{
  "name": "Call Supabase Function",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "https://your-project.supabase.co/functions/v1/post-payment-automation",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer {{$env.SUPABASE_ANON_KEY}}",
      "Content-Type": "application/json"
    }
  }
}
```

## Database Schema Requirements

### Required Tables

```sql
-- User subscription tracking
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscription_status TEXT DEFAULT 'trial',
  subscription_tier TEXT DEFAULT 'free',
  subscription_updated_at TIMESTAMP WITH TIME ZONE,
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transaction logging
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  payment_intent_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  metadata JSONB,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature access control
CREATE TABLE IF NOT EXISTS user_feature_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  feature TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature)
);
```

## Security Considerations

### Authentication

Functions use Supabase's built-in authentication:

```typescript
// Validate API key in function
const authHeader = req.headers.get('authorization')
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return new Response('Unauthorized', { status: 401 })
}
```

### CORS Configuration

Shared CORS configuration in `_shared/cors.ts`:

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}
```

### Environment Variables

Secure handling of sensitive data:

```typescript
const n8nApiKey = Deno.env.get('N8N_API_KEY')
if (!n8nApiKey) {
  throw new Error('N8N_API_KEY not configured')
}
```

## Monitoring and Logging

### Function Logs

Access logs via Supabase Dashboard or CLI:

```bash
supabase functions logs post-payment-automation
```

### Error Handling

Structured error handling and logging:

```typescript
try {
  // Function logic
} catch (error) {
  console.error('Function error:', {
    function: 'post-payment-automation',
    error: error.message,
    timestamp: new Date().toISOString(),
    payload: req.body
  })
  
  return new Response(
    JSON.stringify({ error: 'Internal server error' }),
    { status: 500, headers: corsHeaders }
  )
}
```

### Analytics Integration

Track function usage:

```typescript
// Log function execution to analytics
await supabase
  .from('function_analytics')
  .insert({
    function_name: 'post-payment-automation',
    execution_time: Date.now() - startTime,
    success: true,
    user_id: userId
  })
```

## Testing

### Local Testing

```bash
# Test function locally
curl -X POST http://localhost:54321/functions/v1/post-payment-automation \
  -H "Authorization: Bearer your_anon_key" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_test_123",
    "userId": "user_123",
    "amount": 2999,
    "currency": "USD",
    "metadata": {
      "plan": "premium",
      "isFirstPayment": true
    }
  }'
```

### Integration Testing

```typescript
import { createClient } from '@supabase/supabase-js'

describe('Post Payment Automation', () => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  test('should process payment and trigger workflows', async () => {
    const response = await supabase.functions.invoke('post-payment-automation', {
      body: {
        paymentIntentId: 'pi_test_123',
        userId: 'test_user',
        amount: 2999,
        currency: 'USD'
      }
    })

    expect(response.data?.success).toBe(true)
    expect(response.data?.workflowTriggered).toBe(true)
  })
})
```

## Production Deployment

### Environment Setup

Set production environment variables:

```bash
supabase secrets set N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com/webhook
supabase secrets set N8N_API_KEY=your_production_api_key
```

### Function Deployment

```bash
# Deploy to production
supabase functions deploy --project-ref your-project-ref

# Verify deployment
supabase functions list --project-ref your-project-ref
```

### Monitoring Setup

1. Enable function logs in Supabase Dashboard
2. Set up alerts for function failures
3. Monitor function execution time and usage
4. Track integration success rates

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS headers are properly set
2. **Environment Variables**: Verify all required env vars are set
3. **n8n Integration**: Check n8n webhook URLs and API keys
4. **Database Permissions**: Ensure function has proper database access

### Debug Mode

Enable detailed logging:

```typescript
const DEBUG = Deno.env.get('DEBUG') === 'true'

if (DEBUG) {
  console.log('Function payload:', await req.json())
  console.log('Environment check:', {
    hasN8nUrl: !!Deno.env.get('N8N_WEBHOOK_BASE_URL'),
    hasApiKey: !!Deno.env.get('N8N_API_KEY')
  })
}
```

## Integration Examples

### Stripe Webhook Integration

```typescript
// Stripe webhook calls Supabase Function
app.post('/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature']
  const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    
    // Call Supabase Function
    await fetch(`${supabaseUrl}/functions/v1/post-payment-automation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentIntentId: paymentIntent.id,
        userId: paymentIntent.metadata.userId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      })
    })
  }
  
  res.json({ received: true })
})
```

### Custom Webhook Endpoints

Create additional functions for specific integrations:

```bash
supabase functions new agent-handoff-processor
supabase functions new trial-expiration-handler
supabase functions new feature-usage-tracker
```

## Next Steps

1. Deploy functions to Supabase project
2. Configure environment variables
3. Test integration with n8n workflows
4. Set up monitoring and alerting
5. Create additional functions for specific use cases
6. Implement comprehensive error handling
7. Add analytics and performance tracking