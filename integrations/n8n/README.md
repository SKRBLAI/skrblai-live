# n8n Workflow Orchestration Integration

This directory contains n8n workflow configurations and documentation for integrating workflow orchestration with the SKRBL AI platform.

## Overview

n8n serves as the central orchestration layer for SKRBL AI, managing complex workflows involving:
- Agent launches and handoffs (Percy, SkillSmith, etc.)
- Automated onboarding and follow-up sequences  
- Cross-agent collaboration and data flow
- Email automation and notification campaigns
- Payment processing and subscription management
- Analytics and reporting automation

## Architecture

```
integrations/n8n/
├── workflows/          # n8n workflow JSON exports
│   ├── agent-launch.json
│   ├── onboarding.json
│   ├── agent-handoff.json
│   └── payment-automation.json
├── webhooks/          # Webhook endpoint configurations
├── templates/         # Reusable workflow templates
├── docker-compose.yml # Local n8n setup
└── README.md         # This file
```

## Setup Options

### Option 1: n8n Cloud (Recommended for Production)

1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Create a new instance
3. Get your API key from instance settings
4. Add environment variables to SKRBL AI:

```env
N8N_API_BASE_URL=https://your-instance.app.n8n.cloud/api/v1
N8N_API_KEY=your_api_key_here
N8N_WEBHOOK_BASE_URL=https://your-instance.app.n8n.cloud/webhook
```

### Option 2: Self-Hosted n8n (Local Development)

Use the provided docker-compose.yml:

```bash
# Start n8n locally
cd integrations/n8n
docker-compose up -d

# Access n8n at http://localhost:5678
```

Environment variables for local setup:

```env
N8N_API_BASE_URL=http://localhost:5678/api/v1
N8N_API_KEY=your_local_api_key
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook
```

## Core Workflows

### 1. Agent Launch Workflow
**File**: `workflows/agent-launch.json`  
**Trigger**: User interaction or scheduled event  
**Purpose**: Coordinate agent initialization and context setup

**Flow**:
1. Receive agent launch request
2. Validate user permissions and context
3. Initialize agent state in database
4. Send welcome message
5. Set up follow-up schedule
6. Log analytics event

**Webhook URL**: `{N8N_WEBHOOK_BASE_URL}/agent-launch`

### 2. Onboarding Automation
**File**: `workflows/onboarding.json`  
**Trigger**: New user registration  
**Purpose**: Automated user onboarding sequence

**Flow**:
1. Welcome email sequence
2. Trial period setup
3. Feature introduction emails
4. Progress tracking
5. Conversion optimization
6. Follow-up reminders

**Webhook URL**: `{N8N_WEBHOOK_BASE_URL}/user-onboarding`

### 3. Agent Handoff Orchestration  
**File**: `workflows/agent-handoff.json`  
**Trigger**: Agent decision point or queue job  
**Purpose**: Seamless transitions between AI agents

**Flow**:
1. Receive handoff request from source agent
2. Validate handoff conditions
3. Prepare context for target agent
4. Notify both agents
5. Update user session state
6. Log handoff analytics
7. Trigger BullMQ job if needed

**Webhook URL**: `{N8N_WEBHOOK_BASE_URL}/agent-handoff`

### 4. Payment Processing Automation
**File**: `workflows/payment-automation.json`  
**Trigger**: Successful payment webhook from Stripe  
**Purpose**: Post-payment automation and fulfillment

**Flow**:
1. Validate payment webhook
2. Update user subscription status
3. Grant access to premium features
4. Send confirmation email
5. Trigger welcome sequence for new subscribers
6. Update analytics and reporting
7. Queue follow-up workflows

**Webhook URL**: `{N8N_WEBHOOK_BASE_URL}/payment-completed`

## Integration with SKRBL AI

### Triggering n8n from SKRBL AI

Use the existing n8n client:

```typescript
import { triggerN8nWorkflow } from '../lib/n8nClient';

// Trigger agent launch
const result = await triggerN8nWorkflow('agent-launch', {
  userId: 'user123',
  agentType: 'skillsmith',
  context: { sessionId: 'abc123' }
});

// Trigger onboarding sequence
await triggerN8nWorkflow('user-onboarding', {
  userId: 'user123',
  email: 'user@example.com',
  signupSource: 'website',
  planType: 'trial'
});
```

### Triggering SKRBL AI from n8n

Create webhook endpoints in your Next.js API:

```typescript
// app/api/webhooks/n8n/queue/route.ts
import { queueClient } from '../../../../lib/queues/client';

export async function POST(request: Request) {
  const data = await request.json();
  
  // Add job to appropriate queue based on workflow data
  switch (data.workflowType) {
    case 'video-analysis':
      await queueClient.addVideoAnalysisJob(data.payload);
      break;
    case 'email-send':
      await queueClient.addEmailJob(data.payload);
      break;
    case 'agent-handoff':
      await queueClient.addAgentHandoffJob(data.payload);
      break;
  }
  
  return new Response(JSON.stringify({ success: true }));
}
```

### Bidirectional Integration Patterns

#### 1. Queue → n8n → Queue
```
BullMQ Job → n8n Workflow → BullMQ Job
```
Example: Video analysis completes → n8n orchestrates follow-up → Email job queued

#### 2. API → n8n → Database
```
User Action → n8n Workflow → Supabase Update
```
Example: User upgrades → n8n processes → Database and email updates

#### 3. Schedule → n8n → Multiple Actions
```
Cron Schedule → n8n Workflow → Multiple Systems
```
Example: Daily digest → n8n coordinates → Emails, reports, cleanups

## Workflow Templates

### Basic Agent Handoff Template

```json
{
  "name": "Agent Handoff Template",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "agent-handoff"
      }
    },
    {
      "name": "Validate Request",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Validate handoff request\nif (!$json.fromAgent || !$json.toAgent || !$json.userId) {\n  throw new Error('Missing required fields');\n}\nreturn $json;"
      }
    },
    {
      "name": "Update Database",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "insert",
        "table": "agent_handoffs"
      }
    },
    {
      "name": "Trigger Queue Job",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "{{$env.SKRBL_API_BASE}}/api/webhooks/n8n/queue",
        "method": "POST"
      }
    }
  ]
}
```

## Environment Configuration

### n8n Environment Variables

Add these to your n8n instance:

```env
# SKRBL AI Integration
SKRBL_API_BASE=https://your-skrbl-domain.com
SKRBL_API_KEY=your_skrbl_api_key

# Database Integration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# Email Service
RESEND_API_KEY=your_resend_api_key

# Payment Integration
STRIPE_SECRET_KEY=your_stripe_secret

# Redis/Queue Integration
REDIS_URL=your_redis_connection_string
```

### SKRBL AI Environment Variables

```env
# n8n Integration
N8N_API_BASE_URL=https://your-n8n-instance.com/api/v1
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com/webhook

# Webhook Security
N8N_WEBHOOK_SECRET=your_webhook_secret_for_validation
```

## Security and Authentication

### Webhook Security

1. **API Key Authentication**: Use API keys for n8n to SKRBL AI calls
2. **Webhook Signatures**: Validate webhook signatures for security
3. **IP Allowlisting**: Restrict webhook endpoints to n8n IP ranges
4. **Rate Limiting**: Implement rate limiting on webhook endpoints

### Implementation Example

```typescript
// app/api/webhooks/n8n/[...path]/route.ts
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const headersList = headers();
  const signature = headersList.get('x-n8n-signature');
  
  // Validate webhook signature
  if (!validateN8nSignature(signature, await request.text())) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Process webhook
  const data = await request.json();
  // ... handle webhook data
}
```

## Monitoring and Analytics

### Workflow Monitoring

n8n provides built-in monitoring for:
- Workflow execution status
- Error rates and failure points
- Execution duration metrics
- Resource usage statistics

### Custom Analytics Integration

Add analytics tracking to workflows:

```json
{
  "name": "Track Analytics",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "{{$env.SKRBL_API_BASE}}/api/analytics/track",
    "method": "POST",
    "body": {
      "event": "workflow_completed",
      "workflow": "{{$workflow.name}}",
      "userId": "{{$json.userId}}",
      "timestamp": "{{$now}}"
    }
  }
}
```

## Development Workflow

### 1. Local Development Setup

```bash
# Start local n8n
cd integrations/n8n
docker-compose up -d

# Import workflows
# Use n8n UI to import workflow JSON files

# Test webhooks
curl -X POST http://localhost:5678/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### 2. Workflow Development Process

1. Create workflow in n8n UI
2. Test with sample data
3. Export as JSON
4. Save to `workflows/` directory
5. Document webhook endpoints
6. Create integration tests
7. Deploy to production n8n instance

### 3. Testing and Validation

```typescript
// Test n8n integration
import { triggerN8nWorkflow } from '../lib/n8nClient';

describe('n8n Integration', () => {
  test('should trigger agent handoff workflow', async () => {
    const result = await triggerN8nWorkflow('agent-handoff', {
      fromAgent: 'skillsmith',
      toAgent: 'percy',
      userId: 'test-user',
      context: { reason: 'test' }
    });
    
    expect(result.success).toBe(true);
    expect(result.executionId).toBeDefined();
  });
});
```

## Production Deployment

### n8n Cloud Deployment

1. Create production n8n instance
2. Configure environment variables
3. Import production workflows
4. Set up monitoring and alerting
5. Configure backup procedures

### Self-Hosted Deployment

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - WEBHOOK_URL=${N8N_WEBHOOK_URL}
      - GENERIC_TIMEZONE=${TIMEZONE}
    volumes:
      - n8n_data:/home/node/.n8n
    ports:
      - "5678:5678"
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  n8n_data:
  postgres_data:
```

## Troubleshooting

### Common Issues

1. **Webhook timeouts**: Increase timeout settings in n8n
2. **Authentication failures**: Verify API keys and signatures
3. **Rate limiting**: Implement exponential backoff
4. **Database connections**: Check Supabase connection settings

### Debug Mode

Enable debug logging in n8n:

```env
N8N_LOG_LEVEL=debug
N8N_LOG_OUTPUT=console
```

### Error Handling

Implement error handling in workflows:

```json
{
  "name": "Error Handler",
  "type": "n8n-nodes-base.code",
  "parameters": {
    "jsCode": "try {\n  // Main workflow logic\n} catch (error) {\n  // Send error notification\n  console.error('Workflow error:', error);\n  return { error: error.message };\n}"
  }
}
```

## Workflow Examples by Use Case

### SkillSmith Video Analysis Flow
1. User uploads video → Webhook triggers n8n
2. n8n queues video analysis job in BullMQ  
3. Analysis completes → Queue triggers n8n webhook
4. n8n sends analysis results email
5. n8n schedules follow-up check-in
6. If high score → Trigger Percy upsell workflow

### Percy Upsell Automation
1. SkillSmith identifies upsell opportunity
2. Agent handoff queued to Percy
3. n8n orchestrates handoff process
4. Percy engagement initiated
5. Conversion tracking and analytics
6. Follow-up sequences based on outcome

### Trial Expiration Management
1. Scheduled workflow checks trial status
2. Send reminder emails at intervals
3. Trigger conversion campaigns
4. Archive inactive trial users
5. Analytics reporting on conversion rates

## Next Steps

1. Import provided workflow templates
2. Configure environment variables
3. Test webhook integrations
4. Set up monitoring and alerting
5. Create custom workflows for specific use cases
6. Implement error handling and recovery
7. Scale based on usage patterns