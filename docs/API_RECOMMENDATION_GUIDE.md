# Agent Recommendation API Guide

## Overview

The Agent Recommendation API provides intelligent agent suggestions based on mission type and business context. This guide covers all endpoints and usage examples.

---

## Endpoints

### 1. Agent Recommendation Endpoint

**Endpoint:** `GET /api/agents?recommend=true&mission={mission}&type={type}`

**Description:** Get recommended agents for a specific mission or task.

**Parameters:**
- `recommend` (required): Set to `true` to enable recommendation mode
- `mission` (required): The mission/task type (e.g., 'branding', 'content', 'sports')
- `type` (optional): Context type - 'business' (default) or 'sports'

**Response:**
```json
{
  "success": true,
  "mission": "branding",
  "type": "business",
  "recommendedAgents": [
    {
      "id": "branding",
      "name": "Branding",
      "superheroName": "BrandAlexander the Identity Architect",
      "description": "AI-powered brand identity and guidelines generation",
      "capabilities": ["brand identity", "logo design", ...],
      "route": "/agents/branding",
      "chatRoute": "/agents/branding/chat",
      "imageSlug": "branding",
      "backstory": { ... },
      "catchphrase": "Your brand, your legacy, my masterpiece!",
      "primaryCapability": "Brand Identity Creation",
      "missionTypes": ["branding", "logo", "identity", ...],
      "archetype": "creator"
    },
    ...
  ],
  "primaryAgent": { ... },
  "count": 3
}
```

---

## Supported Mission Types

### Business Missions

| Mission Type | Recommended Agents | Description |
|-------------|-------------------|-------------|
| `branding` / `brand` / `logo` / `identity` | Branding, Content Creation, Ad Creative | Brand identity and visual design |
| `publishing` / `book` | Publishing, Content Creation, Branding | Book publishing and content distribution |
| `content` | Content Creation, Social, Publishing | Content marketing and creation |
| `marketing` / `social` | Social, Ad Creative, Analytics | Marketing and social media |
| `advertising` / `ads` | Ad Creative, Social, Analytics | Advertising campaigns |
| `automation` / `integration` | Sync, Biz, Percy | Business automation and integration |
| `analytics` / `data` | Analytics, Biz | Data analysis and insights |
| `website` / `web` | Site, Branding, Content Creation | Website creation and optimization |
| `business` / `strategy` | Biz, Proposal, Analytics | Business strategy and planning |
| `video` | Video Content, Social, Ad Creative | Video content creation |
| `client` | Client Success, Biz | Client relationship management |
| `payment` | Payment, Analytics | Payment processing and financial analysis |

### Sports Missions

| Mission Type | Recommended Agent | Description |
|-------------|------------------|-------------|
| `sports` / `fitness` / `training` | Skill Smith | Athletic training and performance optimization |

---

## Usage Examples

### Example 1: Get Branding Recommendations

```bash
curl "https://skrblai.app/api/agents?recommend=true&mission=branding&type=business"
```

**Response:**
```json
{
  "success": true,
  "mission": "branding",
  "type": "business",
  "recommendedAgents": [
    {
      "id": "branding",
      "name": "Branding",
      "superheroName": "BrandAlexander the Identity Architect",
      ...
    },
    {
      "id": "contentcreation",
      "name": "Content Creator",
      "superheroName": "ContentCarltig the Word Weaver",
      ...
    },
    {
      "id": "adcreative",
      "name": "Ad Creative",
      "superheroName": "AdmEthen the Conversion Catalyst",
      ...
    }
  ],
  "primaryAgent": { ... },
  "count": 3
}
```

### Example 2: Get Sports Training Recommendations

```bash
curl "https://skrblai.app/api/agents?recommend=true&mission=sports&type=sports"
```

**Response:**
```json
{
  "success": true,
  "mission": "sports",
  "type": "sports",
  "recommendedAgents": [
    {
      "id": "skillsmith",
      "name": "Skill Smith",
      "superheroName": "Skill Smith the Sports Performance Forger",
      "missionTypes": ["sports", "fitness", "training", ...],
      "archetype": "athlete",
      ...
    }
  ],
  "primaryAgent": { ... },
  "count": 1
}
```

### Example 3: Frontend Integration (React/Next.js)

```typescript
// Fetch agent recommendations
async function getAgentRecommendations(mission: string, type: string = 'business') {
  const response = await fetch(
    `/api/agents?recommend=true&mission=${mission}&type=${type}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }
  
  return response.json();
}

// Usage in component
const PercySuggestionModal = ({ mission }: { mission: string }) => {
  const [recommendations, setRecommendations] = useState(null);
  
  useEffect(() => {
    getAgentRecommendations(mission).then(setRecommendations);
  }, [mission]);
  
  return (
    <div>
      <h2>Recommended Agents for {mission}</h2>
      {recommendations?.recommendedAgents?.map(agent => (
        <AgentCard 
          key={agent.id} 
          agent={agent}
          onSelect={() => handleAgentSelect(agent)}
        />
      ))}
    </div>
  );
};
```

---

## Chat API with Streaming

### Non-Streaming Chat

**Endpoint:** `POST /api/agents/chat/[agentId]`

**Request Body:**
```json
{
  "message": "Hello! Can you help me with branding?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ],
  "context": {
    "userId": "user-123"
  },
  "stream": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your brand, your legacy, my masterpiece! I'm BrandAlexander...",
  "personalityInjected": true,
  "handoffSuggestions": [...],
  "conversationAnalytics": {...},
  "agentId": "branding",
  "agentName": "Branding",
  "superheroName": "BrandAlexander the Identity Architect",
  "timestamp": "2025-10-22T..."
}
```

### Streaming Chat (SSE)

**Endpoint:** `POST /api/agents/chat/[agentId]` with `stream: true`

**Request Body:**
```json
{
  "message": "Tell me about your branding superpowers!",
  "conversationHistory": [],
  "context": {},
  "stream": true
}
```

**Response:** Server-Sent Events stream

```javascript
// Frontend usage with EventSource pattern
async function streamAgentChat(agentId, message, conversationHistory) {
  const response = await fetch(`/api/agents/chat/${agentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversationHistory,
      stream: true
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        
        if (data.type === 'chunk') {
          fullResponse += data.text;
          onChunk(data.text); // Update UI incrementally
        } else if (data.type === 'complete') {
          onComplete(fullResponse);
        } else if (data.type === 'error') {
          onError(data.error);
        }
      }
    }
  }
}
```

---

## Agent Activity Tracking (Realtime)

### React Hook Usage

```typescript
import { useAgentActivity, useAgentStatus } from '@/hooks/useAgentActivity';

// Track all agent activity
const MyActivityFeed = () => {
  const activities = useAgentActivity(20); // Keep last 20 activities
  
  return (
    <div>
      {activities.map((activity, i) => (
        <div key={i}>
          <strong>{activity.agentName}</strong> - {activity.action}
          <span>{activity.timestamp.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// Track agent status
const AgentStatusDashboard = () => {
  const statusMap = useAgentStatus();
  
  return (
    <div>
      {Array.from(statusMap.values()).map(status => (
        <div key={status.agentId}>
          <span>{status.agentName}</span>
          <StatusBadge status={status.status} />
          <span>{status.activeUsers} active users</span>
        </div>
      ))}
    </div>
  );
};
```

### Direct Subscription

```typescript
import { subscribeToAgentActivity, logAgentActivity } from '@/hooks/useAgentActivity';

// Subscribe to activity
const unsubscribe = subscribeToAgentActivity((activity) => {
  console.log('Agent activity:', activity);
  // Update UI, show notifications, etc.
});

// Later: cleanup
unsubscribe();

// Log activity manually
await logAgentActivity({
  agentId: 'branding',
  agentName: 'Branding',
  action: 'chat',
  userId: 'user-123'
});
```

---

## Error Handling

### Recommendation API Errors

```typescript
try {
  const response = await fetch('/api/agents?recommend=true&mission=invalid');
  const data = await response.json();
  
  if (!data.success) {
    console.error('Recommendation failed:', data.error);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### Chat API Errors

```typescript
try {
  const response = await fetch('/api/agents/chat/invalid-agent', {
    method: 'POST',
    body: JSON.stringify({ message: 'Hello' })
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Chat failed:', error.error);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

---

## Testing

### Manual Testing with cURL

```bash
# Test recommendation endpoint
curl "http://localhost:3000/api/agents?recommend=true&mission=branding"

# Test non-streaming chat
curl -X POST http://localhost:3000/api/agents/chat/branding \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Help me create a brand identity",
    "conversationHistory": [],
    "stream": false
  }'

# Test streaming chat
curl -X POST http://localhost:3000/api/agents/chat/branding \
  -H "Content-Type: application/json" \
  -N \
  -d '{
    "message": "Tell me about your branding powers",
    "stream": true
  }'
```

### Testing with Postman

1. **Recommendation API**
   - Method: GET
   - URL: `http://localhost:3000/api/agents?recommend=true&mission=branding&type=business`
   - Expected: JSON response with recommended agents

2. **Chat API (Non-Streaming)**
   - Method: POST
   - URL: `http://localhost:3000/api/agents/chat/branding`
   - Body (raw JSON):
     ```json
     {
       "message": "Hello!",
       "stream": false
     }
     ```

3. **Chat API (Streaming)**
   - Method: POST
   - URL: `http://localhost:3000/api/agents/chat/branding`
   - Body (raw JSON):
     ```json
     {
       "message": "Hello!",
       "stream": true
     }
     ```
   - Note: Postman will show SSE stream in response

---

## Best Practices

1. **Cache Recommendations**: Cache recommendation results for similar missions to reduce API calls

2. **Handle Fallbacks**: Always have a fallback for unknown mission types (defaults to Percy)

3. **Stream When Possible**: Use streaming for better UX in chat interfaces

4. **Track Activity**: Use Realtime subscriptions for live agent activity feeds

5. **Error Boundaries**: Wrap API calls in try-catch with user-friendly error messages

6. **Rate Limiting**: Implement rate limiting on client side for chat API

---

## Additional Resources

- [Agent Backstories Documentation](./AGENT_BACKSTORIES.md)
- [Supabase Realtime Guide](./SUPABASE_REALTIME.md)
- [OpenAI Streaming Guide](https://platform.openai.com/docs/api-reference/streaming)

---

**Last Updated:** October 22, 2025
**Version:** 1.0.0

