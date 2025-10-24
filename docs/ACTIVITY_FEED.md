# Real-time Activity Feed - Implementation Guide

## Overview

The activity feed provides real-time updates on agent launches, workflow executions, and system health using Supabase Realtime and Server-Sent Events (SSE).

## Architecture

```
Frontend (EventSource)
    ↓
/api/activity/live-feed (SSE)
    ↓
Supabase Realtime
    ↓
Database Tables:
- agent_launches
- n8n_executions
- system_health_logs
```

## Database Tables

### agent_launches
Tracks real-time agent execution activity.

**Columns:**
- `id` - UUID primary key
- `agent_id` - Agent identifier
- `agent_name` - Human-readable agent name
- `user_id` - User who launched the agent
- `status` - 'initiated' | 'running' | 'success' | 'failed' | 'webhook_failed' | 'critical_failure'
- `source` - 'dashboard' | 'percy' | 'api' | 'skillsmith' | 'api_launch'
- `payload` - Original request data
- `result` - Execution result data
- `error_message` - Error details if failed
- `started_at` - Execution start time
- `completed_at` - Execution completion time

**Realtime Events:**
- `INSERT` - Agent launched
- `UPDATE` - Agent completed/failed

### n8n_executions
Tracks N8N workflow executions.

**Columns:**
- `execution_id` - N8N execution ID
- `workflow_id` - Workflow identifier
- `agent_id` - Associated agent
- `user_id` - User who triggered
- `status` - 'running' | 'success' | 'failed'
- `chained` - Whether part of multi-agent chain
- `trigger_data` - Input data
- `result_data` - Output data

### system_health_logs
Platform health monitoring.

**Columns:**
- `overall_status` - 'healthy' | 'degraded' | 'critical'
- `overall_score` - 0-100 health score
- `critical_issues` - Array of critical issues
- `component_statuses` - Status per component

## Usage

### Frontend: Consuming the Activity Feed

```typescript
import { useEffect, useState } from 'react';

function useActivityFeed(userId?: string) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const token = getAuthToken(); // Your auth token getter
    const eventSource = new EventSource(
      `/api/activity/live-feed?userId=${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEvents(prev => [data, ...prev]);
    };

    return () => eventSource.close();
  }, [userId]);

  return events;
}
```

### Backend: Logging Agent Activity

The `/api/agents/[agentId]/launch` route **already logs to `agent_launches`** automatically.

For custom agent execution, use the activity logger:

```typescript
import { logAgentLaunch, logAgentComplete } from '@/lib/activity/activityLogger';

// Start tracking
const launchId = await logAgentLaunch({
  agentId: 'percy',
  agentName: 'Percy',
  userId: user.id,
  source: 'dashboard',
  metadata: { context: 'recommendation' }
});

// ... execute agent work ...

// Complete tracking
await logAgentComplete({
  launchId,
  status: 'success',
  result: { data: result }
});
```

Or use the wrapper:

```typescript
import { trackAgentExecution } from '@/lib/activity/activityLogger';

const result = await trackAgentExecution(
  {
    agentId: 'skillsmith',
    agentName: 'SkillSmith',
    userId: user.id,
    source: 'percy'
  },
  async () => {
    // Your agent execution logic
    return await executeSkillSmith(params);
  }
);
```

## Migration

Apply the migration to create tables:

```bash
# Using Supabase CLI
npx supabase db push --db-url "$DATABASE_URL"

# Or apply manually in Supabase Dashboard
# SQL Editor → Run: supabase/migrations/20251024_activity_feed_tables.sql
```

## API Endpoints

### GET /api/activity/live-feed
Server-Sent Events endpoint for real-time updates.

**Query Parameters:**
- `userId` (optional) - Filter events for specific user
- `agent` (optional) - Filter events for specific agent
- `types` (optional) - Comma-separated event types to subscribe to

**Event Types:**
- `connection` - Initial connection established
- `agent_launch` - Agent started
- `agent_complete` - Agent completed successfully
- `agent_error` - Agent failed
- `workflow_trigger` - N8N workflow triggered
- `system_event` - System health update
- `heartbeat` - Keep-alive (every 30s)

**Example Response:**
```json
{
  "type": "agent_launch",
  "timestamp": "2025-10-24T12:00:00Z",
  "data": {
    "id": "uuid",
    "agentId": "percy",
    "userId": "user-uuid",
    "status": "running",
    "source": "dashboard"
  }
}
```

### POST /api/activity/live-feed
Manually trigger test events (development only).

```bash
curl -X POST /api/activity/live-feed \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "agent_launch",
    "agentId": "percy",
    "userId": "test-user"
  }'
```

## Testing

### 1. Apply Migration
```bash
npx supabase db push --db-url "$DATABASE_URL"
```

### 2. Launch an Agent
```bash
curl -X POST /api/agents/percy/launch \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}'
```

### 3. Connect to Activity Feed
```bash
curl -N -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/activity/live-feed
```

You should see real-time events as agents execute.

## What's Already Working

✅ **Agent Launch Logging** - `/api/agents/[agentId]/launch` already logs to `agent_launches`
✅ **SSE Endpoint** - `/api/activity/live-feed` is wired to Supabase Realtime
✅ **Activity Logger Utility** - `lib/activity/activityLogger.ts` provides helper functions
✅ **Database Schema** - Migration file ready to apply

## Next Steps (For Cursor/Windsurf)

These tasks are perfect for Cursor/Windsurf IDEs:

### UI Enhancements
- [ ] Add loading states to activity feed component
- [ ] Add error states and retry logic
- [ ] Implement activity feed filtering UI (by agent, by status)
- [ ] Add animations for new activity items
- [ ] Create activity feed skeleton loaders
- [ ] Add "View Details" modal for activity items
- [ ] Implement activity feed search/filter UI

### Styling & Polish
- [ ] Design activity feed item cards
- [ ] Add agent avatar icons to activity items
- [ ] Create status badge components (running, success, failed)
- [ ] Implement dark mode styles for activity feed
- [ ] Add responsive design for mobile activity feed
- [ ] Create empty state designs ("No activity yet")
- [ ] Add hover effects and transitions

### Testing & Edge Cases
- [ ] Add unit tests for activity logger functions
- [ ] Test SSE reconnection logic
- [ ] Handle offline/online transitions
- [ ] Add error boundaries around activity feed
- [ ] Test with rate limiting and throttling
- [ ] Add integration tests for activity tracking

### Documentation & Examples
- [ ] Add JSDoc comments to all exported functions
- [ ] Create Storybook stories for activity components
- [ ] Add example usage in component docs
- [ ] Create troubleshooting guide
- [ ] Document performance considerations

### Performance Optimization
- [ ] Implement activity feed pagination/virtualization
- [ ] Add request debouncing for high-frequency updates
- [ ] Implement smart caching strategy
- [ ] Add activity feed item memoization
- [ ] Optimize Realtime subscription filters

## Advanced: N8N Workflow Tracking

To track N8N workflows, add logging to your webhook handlers:

```typescript
import { logWorkflowExecution, logWorkflowComplete } from '@/lib/activity/activityLogger';

// When N8N workflow is triggered
await logWorkflowExecution({
  executionId: n8nExecutionId,
  workflowId: workflowId,
  workflowName: 'Agent Workflow',
  agentId: 'percy',
  userId: user.id,
  chained: false
});

// When N8N workflow completes
await logWorkflowComplete({
  executionId: n8nExecutionId,
  status: 'success',
  resultData: result
});
```

## Monitoring

The activity feed logs to console for debugging:

```
[Activity Logger] Agent launch logged: percy (uuid)
[Activity Logger] Agent launch completed: uuid (success)
[Live Feed] Subscription setup error: ...
```

Monitor these logs in production for issues with real-time connectivity.

## Security

- ✅ RLS policies enforce user-only access to their own activity
- ✅ Service role has full access for system monitoring
- ✅ Auth token required for SSE endpoint
- ✅ User validation on every SSE connection

## Performance

- Heartbeat every 30 seconds keeps connections alive
- Indexes on `agent_id`, `user_id`, `status`, `started_at` for fast queries
- Realtime subscriptions auto-cleanup on disconnect
- SSE automatically reconnects on network issues
