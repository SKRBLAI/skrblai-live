# SKRBL AI MCP Server

Master Control Program (MCP) orchestration server for SKRBL AI platform - a microservice that coordinates complex workflows between n8n, BullMQ, and various system components.

## Overview

The MCP Server acts as the central orchestration layer that:
- Coordinates complex multi-step workflows
- Manages interactions between n8n workflows and BullMQ queues  
- Provides API endpoints for triggering orchestrated processes
- Handles agent handoffs, video analysis, payment processing, and email automation
- Offers monitoring and status tracking for orchestrated operations

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SKRBL AI UI   │    │   External      │    │   Webhooks      │
│                 │    │   Services      │    │   (Stripe, etc) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MCP Server    │
                    │  (This Service) │
                    └─────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
       ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
       │   n8n Workflows │ │  BullMQ Queues  │ │   Supabase      │
       │                 │ │                 │ │   Functions     │
       └─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Key Features

### 🎼 Orchestration Engine
- **Multi-step Workflows**: Coordinate complex processes across multiple services
- **Agent Handoffs**: Seamless transitions between AI agents (SkillSmith → Percy)
- **Video Analysis**: End-to-end video processing with follow-up actions
- **Payment Processing**: Complete payment workflows with automation
- **Email Automation**: Scheduled email sequences and campaigns

### 🚀 Integration Layer
- **n8n Integration**: Trigger and monitor n8n workflows
- **BullMQ Queues**: Manage background job processing
- **Webhook Handling**: Secure webhook endpoints for external services
- **Database Operations**: Coordinate with Supabase for data consistency

### 📊 Monitoring & Control
- **Status Tracking**: Real-time status of orchestrated processes
- **Error Handling**: Comprehensive error recovery and logging
- **Analytics**: Track orchestration success rates and performance
- **Cancellation**: Ability to cancel in-progress orchestrations

## Quick Start

### 1. Install Dependencies

```bash
cd mcp-server
npm install
```

### 2. Environment Configuration

Create `.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug

# Security
API_KEY=your_mcp_api_key_here
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# Redis Configuration (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# n8n Integration
N8N_API_BASE_URL=http://localhost:5678/api/v1
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# External Services
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 3. Development

```bash
# Development mode with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

### 4. Docker Deployment

```bash
# Build image
docker build -t skrbl-mcp-server .

# Run container
docker run -p 3001:3001 --env-file .env skrbl-mcp-server
```

## API Endpoints

### Orchestration API

#### POST `/api/orchestration/trigger`
Trigger a new orchestration process

```typescript
{
  "type": "agent_handoff" | "video_analysis" | "payment_processing" | "email_automation" | "custom",
  "payload": {
    // Type-specific payload data
  },
  "priority": "low" | "normal" | "high",
  "metadata": {
    // Optional metadata
  }
}
```

**Response:**
```json
{
  "success": true,
  "orchestrationId": "orch_1234567890_abc123",
  "queueJobs": ["job_id_1", "job_id_2"],
  "workflowExecutions": ["exec_id_1"],
  "message": "Orchestration started successfully"
}
```

#### GET `/api/orchestration/status/:orchestrationId`
Get status of an orchestration

**Response:**
```json
{
  "orchestrationId": "orch_1234567890_abc123",
  "status": "running" | "completed" | "failed" | "cancelled",
  "queueJobs": [
    {
      "id": "job_id_1",
      "status": "completed",
      "progress": 100
    }
  ],
  "workflowExecutions": [
    {
      "id": "exec_id_1", 
      "status": "success"
    }
  ],
  "timestamp": "2024-01-17T10:30:00Z"
}
```

#### DELETE `/api/orchestration/:orchestrationId`
Cancel an orchestration and related jobs

### Queue Management API

#### GET `/api/queue/stats`
Get queue statistics

#### POST `/api/queue/job`
Add job to specific queue

### Workflow API

#### POST `/api/workflow/trigger`
Trigger n8n workflow

#### GET `/api/workflow/status/:executionId`
Get workflow execution status

### Webhook Endpoints

#### POST `/webhooks/n8n/:workflowId`
Receive webhooks from n8n workflows

#### POST `/webhooks/stripe/payment-completed`
Handle Stripe payment completion webhooks

## Orchestration Examples

### Agent Handoff (SkillSmith → Percy)

```typescript
const response = await fetch('/api/orchestration/trigger', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  body: JSON.stringify({
    type: 'agent_handoff',
    payload: {
      fromAgent: 'skillsmith',
      toAgent: 'percy',
      userId: 'user123',
      context: {
        skillsAssessed: ['communication', 'leadership'],
        score: 85,
        readyForUpsell: true
      },
      reason: 'User completed skill assessment with high score'
    },
    priority: 'high'
  })
});
```

### Video Analysis Processing

```typescript
const response = await fetch('/api/orchestration/trigger', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  body: JSON.stringify({
    type: 'video_analysis',
    payload: {
      videoUrl: 'https://example.com/video.mp4',
      userId: 'user123',
      analysisType: 'skillsmith',
      metadata: {
        sessionId: 'session456',
        uploadedAt: '2024-01-17T10:00:00Z'
      }
    },
    priority: 'normal'
  })
});
```

### Payment Processing Automation

```typescript
const response = await fetch('/api/orchestration/trigger', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  body: JSON.stringify({
    type: 'payment_processing',
    payload: {
      paymentIntentId: 'pi_1234567890',
      userId: 'user123',
      amount: 2999,
      currency: 'USD',
      metadata: {
        plan: 'premium',
        isFirstPayment: true,
        email: 'user@example.com',
        userName: 'John Doe'
      }
    },
    priority: 'high'
  })
});
```

### Email Automation Sequences

```typescript
const response = await fetch('/api/orchestration/trigger', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  body: JSON.stringify({
    type: 'email_automation',
    payload: {
      sequence: 'onboarding',
      userId: 'user123',
      email: 'user@example.com',
      variables: {
        userName: 'John Doe',
        planType: 'premium'
      }
    },
    priority: 'normal'
  })
});
```

## Integration with SKRBL AI

### From Next.js Application

```typescript
// lib/mcpClient.ts
import axios from 'axios';

const mcpClient = axios.create({
  baseURL: process.env.MCP_SERVER_URL || 'http://localhost:3001',
  headers: {
    'Authorization': `Bearer ${process.env.MCP_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

export async function triggerOrchestration(type: string, payload: any) {
  const response = await mcpClient.post('/api/orchestration/trigger', {
    type,
    payload
  });
  return response.data;
}

// Usage in API route
export async function POST(request: Request) {
  const data = await request.json();
  
  const result = await triggerOrchestration('agent_handoff', {
    fromAgent: 'skillsmith',
    toAgent: 'percy',
    userId: data.userId,
    context: data.context,
    reason: data.reason
  });
  
  return Response.json(result);
}
```

### Webhook Integration

```typescript
// Handle Stripe webhooks
app.post('/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  
  if (event.type === 'payment_intent.succeeded') {
    // Trigger MCP orchestration
    await fetch(`${MCP_SERVER_URL}/api/orchestration/trigger`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MCP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'payment_processing',
        payload: {
          paymentIntentId: event.data.object.id,
          userId: event.data.object.metadata.userId,
          amount: event.data.object.amount,
          currency: event.data.object.currency
        }
      })
    });
  }
  
  res.json({ received: true });
});
```

## Monitoring and Observability

### Health Check

```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "memory": {
    "used": "45.2 MB",
    "total": "128 MB"
  },
  "services": {
    "redis": "connected",
    "n8n": "connected"
  },
  "timestamp": "2024-01-17T10:30:00Z"
}
```

### Logs

Structured logging with Winston:

```typescript
import { logger } from './utils/logger';

// Different log levels
logger.info('Orchestration started', { orchestrationId, type });
logger.warn('Queue job retry attempt', { jobId, attempt });
logger.error('Workflow execution failed', { workflowId, error });
logger.debug('Request payload', { payload });
```

### Metrics

Track key metrics:
- Orchestration success/failure rates
- Average processing time
- Queue depths and wait times
- n8n workflow execution rates
- API endpoint response times

## Error Handling

### Graceful Degradation

```typescript
// If n8n is unavailable, continue with queue processing only
try {
  await workflowService.triggerWorkflow(workflowId, payload);
} catch (error) {
  logger.warn('n8n unavailable, continuing with queue processing only');
  // Continue with queue jobs
}
```

### Retry Logic

```typescript
// Automatic retries with exponential backoff
const retryConfig = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  }
};
```

### Circuit Breaker

```typescript
// Prevent cascading failures
if (n8nFailureCount > threshold) {
  logger.warn('n8n circuit breaker triggered, switching to fallback mode');
  // Switch to queue-only processing
}
```

## Security

### API Authentication

```typescript
// JWT or API key authentication
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!validateApiKey(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
```

### Rate Limiting

```typescript
// Prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: 'Too many requests'
});
```

### Input Validation

```typescript
import { z } from 'zod';

const orchestrationSchema = z.object({
  type: z.enum(['agent_handoff', 'video_analysis', 'payment_processing']),
  payload: z.object({}).passthrough(),
  priority: z.enum(['low', 'normal', 'high']).optional()
});
```

## Production Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
EXPOSE 3001

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  mcp-server:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
      - N8N_API_BASE_URL=http://n8n:5678/api/v1
    depends_on:
      - redis
      - n8n
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mcp-server
  template:
    metadata:
      labels:
        app: mcp-server
    spec:
      containers:
      - name: mcp-server
        image: skrbl/mcp-server:latest
        ports:
        - containerPort: 3001
        env:
        - name: REDIS_HOST
          value: "redis-service"
        - name: N8N_API_BASE_URL
          value: "http://n8n-service:5678/api/v1"
```

## Development Guidelines

### Code Structure

```
src/
├── index.ts                 # Main application entry
├── services/
│   ├── orchestrationService.ts  # Core orchestration logic
│   ├── queueService.ts          # BullMQ integration
│   └── workflowService.ts       # n8n integration
├── routes/
│   ├── orchestration.ts        # Orchestration API routes
│   ├── queue.ts               # Queue management routes
│   └── webhooks.ts            # Webhook handlers
├── middleware/
│   ├── auth.ts               # Authentication middleware
│   └── errorHandler.ts       # Global error handling
└── utils/
    ├── logger.ts            # Winston logging config
    └── validation.ts        # Input validation schemas
```

### Testing

```bash
# Unit tests
npm test

# Integration tests  
npm run test:integration

# Load testing
npm run test:load
```

### Contributing

1. Follow TypeScript best practices
2. Add comprehensive error handling
3. Include unit tests for new features
4. Update documentation
5. Use conventional commit messages

## Troubleshooting

### Common Issues

1. **Connection Errors**: Check Redis and n8n connectivity
2. **Authentication Failures**: Verify API keys and tokens
3. **Queue Backlog**: Monitor queue depths and worker capacity
4. **Memory Leaks**: Monitor memory usage and implement cleanup

### Debug Mode

```bash
DEBUG=mcp-server:* npm run dev
```

### Performance Tuning

- Adjust worker concurrency based on load
- Implement connection pooling for external services
- Use caching for frequently accessed data
- Monitor and optimize database queries

## Roadmap

- [ ] Advanced workflow templating system
- [ ] Real-time orchestration dashboard
- [ ] Machine learning for orchestration optimization
- [ ] Multi-tenant orchestration support
- [ ] Advanced analytics and reporting
- [ ] Integration with additional workflow engines

## Support

For issues and questions:
- Check the troubleshooting guide
- Review application logs
- Contact the SKRBL AI development team
- Create an issue in the project repository