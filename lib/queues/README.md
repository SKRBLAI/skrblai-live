# BullMQ/Redis Queue Integration

This directory contains the BullMQ queue integration for SKRBL AI platform, providing reliable background job processing and workflow orchestration.

## Overview

The queue system handles various background tasks including:
- Video analysis processing (SkillSmith)
- Email sending
- Agent handoffs (Percy, SkillSmith, etc.)
- Workflow triggers (n8n integration)
- Payment processing
- Notification sending

## Architecture

```
lib/queues/
├── config.ts          # Redis connection and queue configuration
├── client.ts          # Queue client with typed job interfaces
├── processors.ts      # Job processors for different queue types
└── README.md         # This file
```

## Files Description

### `config.ts`
- Redis connection configuration
- Queue-specific settings
- Environment variable definitions
- Queue name constants

### `client.ts`
- QueueClient singleton class
- Typed job data interfaces
- Queue management methods
- Job statistics and monitoring

### `processors.ts`
- Job processing functions for each queue type
- Worker initialization and management
- Integration with n8n workflows
- Error handling and progress tracking

## Environment Variables

Add these to your `.env` file:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Queue Settings (optional)
BULLMQ_CONCURRENCY=5
QUEUE_REMOVE_ON_COMPLETE=100
QUEUE_REMOVE_ON_FAIL=50

# n8n Integration (required for workflow triggers)
N8N_API_BASE_URL=https://your-n8n-instance.com/api/v1
N8N_API_KEY=your_n8n_api_key
```

## Usage Examples

### Adding Jobs to Queues

```typescript
import { queueClient } from './lib/queues/client';

// Video analysis job (SkillSmith)
await queueClient.addVideoAnalysisJob({
  videoUrl: 'https://example.com/video.mp4',
  userId: 'user123',
  analysisType: 'skillsmith',
  metadata: { sessionId: 'session456' }
});

// Email job
await queueClient.addEmailJob({
  to: 'user@example.com',
  templateId: 'welcome-email',
  variables: { userName: 'John' },
  priority: 'high'
});

// Agent handoff
await queueClient.addAgentHandoffJob({
  fromAgent: 'skillsmith',
  toAgent: 'percy',
  userId: 'user123',
  context: { reason: 'upsell_opportunity' },
  handoffReason: 'User completed skill assessment'
});

// Workflow trigger (n8n)
await queueClient.addWorkflowTriggerJob({
  workflowId: 'onboarding-sequence',
  payload: { userId: 'user123', plan: 'premium' },
  priority: 'normal'
});
```

### Monitoring Queue Status

```typescript
import { queueClient } from './lib/queues/client';
import { QueueNames } from './lib/queues/config';

// Get queue statistics
const stats = await queueClient.getQueueStats(QueueNames.VIDEO_ANALYSIS);
console.log(`Waiting: ${stats.waiting.length}`);
console.log(`Active: ${stats.active.length}`);
console.log(`Completed: ${stats.completed.length}`);
console.log(`Failed: ${stats.failed.length}`);
```

## Integration with n8n

The queue system is designed to work seamlessly with n8n workflows:

1. **Queue to n8n**: Jobs can trigger n8n workflows upon completion
2. **n8n to Queue**: n8n workflows can add jobs to queues via webhook endpoints
3. **Bidirectional**: Complex orchestration patterns with feedback loops

### n8n Webhook Endpoints

Create these API endpoints to allow n8n to add jobs:

```typescript
// api/webhooks/queue/video-analysis
export async function POST(request: Request) {
  const data = await request.json();
  await queueClient.addVideoAnalysisJob(data);
  return new Response(JSON.stringify({ success: true }));
}
```

## Queue Types and Use Cases

### 1. Video Analysis Queue
- **Purpose**: Process video uploads for skill analysis
- **Priority**: Medium
- **Triggers**: User video upload, scheduled analysis
- **n8n Integration**: Triggers follow-up workflows after analysis

### 2. Email Send Queue
- **Purpose**: Send transactional and marketing emails
- **Priority**: High (transactional), Low (marketing)
- **Triggers**: User actions, scheduled campaigns
- **n8n Integration**: Email delivery status updates

### 3. Agent Handoff Queue
- **Purpose**: Manage transitions between AI agents
- **Priority**: High
- **Triggers**: Agent decision points, user interactions
- **n8n Integration**: Handoff notifications and logging

### 4. Workflow Trigger Queue
- **Purpose**: Trigger n8n workflows asynchronously
- **Priority**: Variable
- **Triggers**: System events, user actions
- **n8n Integration**: Direct workflow execution

### 5. Payment Processing Queue
- **Purpose**: Handle payment-related background tasks
- **Priority**: High
- **Triggers**: Successful payments, subscription changes
- **n8n Integration**: Post-payment automation

### 6. Notification Send Queue
- **Purpose**: Send various types of notifications
- **Priority**: Medium
- **Triggers**: System events, user preferences
- **n8n Integration**: Notification delivery tracking

## Development Setup

### 1. Install Redis (Docker)

```bash
docker run -d \
  --name redis-skrbl \
  -p 6379:6379 \
  redis:latest
```

### 2. Start Workers

```typescript
import { initializeWorkers, shutdownWorkers } from './lib/queues/processors';

// Initialize all workers
const workers = initializeWorkers();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await shutdownWorkers(workers);
  process.exit(0);
});
```

### 3. Add to Next.js API

Create `api/queues/status.ts` for monitoring:

```typescript
import { queueClient } from '../../../lib/queues/client';
import { QueueNames } from '../../../lib/queues/config';

export default async function handler(req, res) {
  const stats = {};
  
  for (const queueName of Object.values(QueueNames)) {
    stats[queueName] = await queueClient.getQueueStats(queueName);
  }
  
  res.json(stats);
}
```

## Production Considerations

### Redis Setup
- Use Redis Cluster for high availability
- Configure persistence (RDB + AOF)
- Set up monitoring (Redis Insight, Grafana)
- Enable authentication and TLS

### Scaling
- Run workers on separate processes/containers
- Use horizontal scaling for compute-heavy jobs
- Implement job prioritization based on business logic
- Monitor queue depths and processing times

### Error Handling
- Implement dead letter queues
- Set up alerting for failed jobs
- Log job failures with context
- Implement job retry strategies

### Monitoring
- Track job completion rates
- Monitor queue depths and wait times
- Set up alerts for queue backlog
- Track job processing performance

## TODO for Production

- [ ] Implement actual video analysis logic in processors
- [ ] Add database storage for job results
- [ ] Set up Redis clustering
- [ ] Implement job result caching
- [ ] Add comprehensive error logging
- [ ] Create monitoring dashboard
- [ ] Set up automated job cleanup
- [ ] Implement job prioritization rules
- [ ] Add webhook security (signatures)
- [ ] Create job scheduling capabilities

## Integration Points

### With n8n
- Webhook endpoints for job creation
- Workflow triggers after job completion
- Status updates and progress tracking

### With Supabase
- Job result storage
- User context and preferences
- Analytics and reporting

### With SKRBL AI Agents
- SkillSmith video processing
- Percy upsell triggers
- Agent handoff coordination

## Security Notes

- Validate all job data before processing
- Implement rate limiting on webhook endpoints
- Use authentication for sensitive operations
- Encrypt sensitive data in job payloads
- Audit job processing logs