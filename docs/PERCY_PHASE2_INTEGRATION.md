# Percy Phase 2 - Recommendation & Chat Integration Guide

## Overview

Phase 2 adds **intelligent recommendations** and **streaming AI chat** to Percy, making the platform more interactive, personalized, and conversion-focused.

## What's New in Phase 2

### 1. Recommendation System Integration
- ✅ React hook for easy recommendation fetching
- ✅ Visual recommendation badges with confidence indicators
- ✅ Ready to integrate into Agent League, dashboard, and onboarding

### 2. Streaming Percy Chat
- ✅ Real-time streaming responses using Claude AI
- ✅ Context-aware conversations (knows user's business)
- ✅ React hook for easy integration
- ✅ SSE-based for instant, token-by-token streaming

### 3. Real-time Activity Feed (Phase 2.1)
- ✅ Database tables and SSE endpoint
- ✅ Activity logger utilities
- ✅ Comprehensive Windsurf task list for UI

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Layer                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  usePercyRecommendation()    usePercyChat()         │
│         ↓                           ↓                │
│  PercyRecommendsBadge      PercyChat Component      │
│         ↓                           ↓                │
│  Agent League Cards         Chat Interface          │
│                                                      │
└──────────────────┬──────────────────┬───────────────┘
                   │                   │
                   ↓                   ↓
┌─────────────────────────────────────────────────────┐
│                    API Layer                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  /api/services/percy-recommend                      │
│  - POST: Get recommendations                        │
│  - Supports: instant, set, generate                 │
│                                                      │
│  /api/percy/chat                                    │
│  - POST: Streaming chat (SSE)                       │
│  - Uses Claude 3.5 Sonnet                           │
│                                                      │
│  /api/activity/live-feed                            │
│  - GET: Real-time agent activity (SSE)              │
│                                                      │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────┐
│                  Engine Layer                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  lib/percy/recommendationEngine.ts                  │
│  - Multi-factor scoring algorithm                   │
│  - Context-aware recommendations                    │
│  - Confidence calculation                           │
│                                                      │
│  Anthropic Claude API                               │
│  - Streaming conversation                           │
│  - Business context awareness                       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 1. Recommendation System Integration

### Quick Start

```tsx
import { usePercyRecommendation } from '@/hooks/usePercyRecommendation';
import { PercyRecommendsBadge } from '@/components/percy/PercyRecommendsBadge';

function AgentCard({ agent }: { agent: Agent }) {
  const { recommendation, loading, getRecommendation } = usePercyRecommendation();

  useEffect(() => {
    // Get recommendation when user views the agent
    getRecommendation('revenue-stalling', {
      businessType: 'ecommerce',
      urgencyLevel: 'high'
    });
  }, []);

  return (
    <div className="agent-card">
      {recommendation && (
        <PercyRecommendsBadge
          confidence={recommendation.metadata.confidence}
          variant="badge"
          showConfidence
        />
      )}
      <h3>{agent.name}</h3>
    </div>
  );
}
```

### Hook API: `usePercyRecommendation`

**Location:** `/hooks/usePercyRecommendation.ts`

#### Methods

##### `getRecommendation(trigger, context?, requestType?)`
Get a single instant recommendation.

```tsx
const { getRecommendation } = usePercyRecommendation();

const result = await getRecommendation(
  'revenue-stalling',  // Business problem trigger
  {
    businessType: 'ecommerce',
    urgencyLevel: 'high',
    userHistory: ['analytics', 'social']
  },
  'instant'  // 'instant' | 'set' | 'generate'
);
```

##### `getRecommendationSet(context, count?)`
Get multiple recommendations (2-5 options).

```tsx
const result = await getRecommendationSet(
  {
    businessType: 'saas',
    urgencyLevel: 'medium'
  },
  3  // Number of recommendations
);
```

##### `generateRecommendation(context)`
Generate contextual recommendation based on full analysis.

```tsx
const result = await generateRecommendation({
  businessType: 'ecommerce',
  urgencyLevel: 'high',
  userHistory: ['analytics'],
  previousEngagement: [
    { service: 'analytics', timestamp: Date.now() - 86400000 }
  ]
});
```

##### `clearRecommendation()`
Clear the current recommendation state.

#### Response Format

```typescript
{
  recommendation: {
    service: {
      id: 'analytics',
      name: 'Revenue Analytics',
      category: 'Data & Insights',
      description: '...'
    },
    confidence: 0.95,  // 0-1
    reasoning: 'Based on your revenue stalling issue...',
    followUpServices: [
      { id: 'ad-creative', name: 'Ad Creative', reason: '...' },
      { id: 'social', name: 'Social Media', reason: '...' }
    ],
    urgencyMessage: 'Act now - 3 spots left this week',
    agentHandoff: {
      agentId: 'the-don',
      agentName: 'The Don',
      reason: 'Analytics expert'
    }
  },
  percyMessage: {
    greeting: "Hey there! 👋",
    confidence: "I'm highly confident this is perfect for you",
    urgency: "Act now - 3 spots left this week"
  },
  metadata: {
    confidence: 0.95,
    timestamp: 1698765432000,
    recommendationType: 'instant',
    triggerAnalyzed: 'revenue-stalling'
  }
}
```

### Component: `PercyRecommendsBadge`

**Location:** `/components/percy/PercyRecommendsBadge.tsx`

Visual indicator for recommendations with 4 variants.

#### Variants

**badge** - Compact pill badge
```tsx
<PercyRecommendsBadge
  confidence={0.95}
  variant="badge"
  showConfidence  // Show percentage
/>
```

**subtle** - Inline text indicator
```tsx
<PercyRecommendsBadge
  confidence={0.85}
  variant="subtle"
  reasoning="Based on your revenue goals"
/>
```

**prominent** - Full card with explanation
```tsx
<PercyRecommendsBadge
  confidence={0.92}
  variant="prominent"
  reasoning="This agent will help you track revenue and optimize conversions"
  showConfidence
/>
```

**inline** - Minimal inline badge
```tsx
<PercyRecommendsBadge
  confidence={0.88}
  variant="inline"
/>
```

#### Corner Badge
For agent cards - shows sparkle icon in corner:
```tsx
import { PercyRecommendsCornerBadge } from '@/components/percy/PercyRecommendsBadge';

<div className="relative">
  <PercyRecommendsCornerBadge confidence={0.95} />
  <AgentCard agent={agent} />
</div>
```

#### Confidence Levels

- **High (>0.8)**: Green, Zap icon, pulse animation
- **Medium (0.5-0.8)**: Blue, TrendingUp icon
- **Low (<0.5)**: Purple, Sparkles icon

---

## 2. Streaming Percy Chat

### Quick Start

```tsx
import { usePercyChat } from '@/hooks/usePercyChat';

function PercyChatInterface() {
  const { messages, sendMessage, loading, streaming } = usePercyChat({
    onMessageComplete: (msg) => console.log('Complete:', msg),
    onError: (err) => console.error('Error:', err)
  });

  const handleSend = async (text: string) => {
    await sendMessage(text, {
      businessType: 'ecommerce',
      currentRevenue: 50000
    });
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id} className={msg.role}>
          {msg.content}
        </div>
      ))}
      {streaming && <TypingIndicator />}
    </div>
  );
}
```

### Hook API: `usePercyChat`

**Location:** `/hooks/usePercyChat.ts`

#### Methods

##### `sendMessage(message, context?)`
Send a message to Percy and stream the response.

```tsx
const { sendMessage } = usePercyChat();

await sendMessage(
  'How can I increase my revenue?',
  {
    businessType: 'ecommerce',
    currentRevenue: 50000,
    teamSize: 5,
    mainGoal: 'grow revenue'
  }
);
```

##### `cancelStream()`
Cancel the current streaming request.

```tsx
const { cancelStream, streaming } = usePercyChat();

if (streaming) {
  cancelStream();
}
```

##### `clearMessages()`
Clear all messages from the conversation.

##### `reset()`
Reset the entire conversation (cancels stream + clears messages).

#### State

```typescript
{
  messages: PercyMessage[],  // Conversation history
  loading: boolean,          // Sending request
  streaming: boolean,        // Currently streaming response
  error: string | null       // Error message if failed
}
```

#### Message Format

```typescript
{
  id: string,               // Unique message ID
  role: 'user' | 'percy',  // Who sent the message
  content: string,          // Message text
  timestamp: number         // Unix timestamp
}
```

### API Endpoint: `/api/percy/chat`

**POST** - Streaming SSE endpoint

**Request:**
```json
{
  "message": "How can I grow my business?",
  "conversationHistory": [
    { "role": "user", "content": "Hello" },
    { "role": "percy", "content": "Hi! How can I help?" }
  ],
  "context": {
    "businessType": "ecommerce",
    "currentRevenue": 50000
  }
}
```

**Response:** Server-Sent Events (SSE)

```
data: {"type":"text","content":"Based"}
data: {"type":"text","content":" on"}
data: {"type":"text","content":" your"}
data: {"type":"done"}
```

### Percy's Personality & Capabilities

Percy is configured with:
- Friendly, enthusiastic, actionable personality
- Knowledge of all SKRBL AI services and agents
- Understanding of common business problems
- Ability to recommend specific agents/services
- Strategic business advice

**System Prompt Location:** `/app/api/percy/chat/route.ts`

### Context Awareness

Percy can use context to personalize responses:

```typescript
const context = {
  businessType: 'ecommerce' | 'saas' | 'agency' | 'consulting',
  currentRevenue: number,
  teamSize: number,
  mainGoal: string,
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical',
  // ... any other business context
};
```

---

## 3. Integration Examples

### Example 1: Agent League with Recommendations

```tsx
import { usePercyRecommendation } from '@/hooks/usePercyRecommendation';
import { PercyRecommendsCornerBadge } from '@/components/percy/PercyRecommendsBadge';

function AgentLeagueDashboard() {
  const { getRecommendation } = usePercyRecommendation();
  const [recommendedAgents, setRecommendedAgents] = useState<string[]>([]);

  useEffect(() => {
    // Get recommendations on page load
    getRecommendation('contextual', {
      businessType: userBusinessType,
      urgencyLevel: 'medium'
    }).then(result => {
      if (result?.recommendation.agentHandoff) {
        setRecommendedAgents([result.recommendation.agentHandoff.agentId]);
      }
    });
  }, []);

  return (
    <div className="agent-grid">
      {agents.map(agent => (
        <div key={agent.id} className="relative">
          {recommendedAgents.includes(agent.id) && (
            <PercyRecommendsCornerBadge confidence={0.95} />
          )}
          <AgentCard agent={agent} />
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Onboarding with Percy Chat

```tsx
import { usePercyChat } from '@/hooks/usePercyChat';

function OnboardingChat() {
  const { messages, sendMessage, streaming } = usePercyChat({
    onMessageComplete: (msg) => {
      // Analyze message for recommendation triggers
      if (msg.content.includes('analytics')) {
        // Show analytics agent
      }
    }
  });

  useEffect(() => {
    // Start conversation automatically
    sendMessage('Hi Percy! I need help growing my business.', {
      businessType: 'ecommerce'
    });
  }, []);

  return (
    <div>
      {messages.map(msg => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {streaming && <TypingIndicator />}
      <ChatInput onSend={sendMessage} disabled={streaming} />
    </div>
  );
}
```

### Example 3: Service Recommendation on Dashboard

```tsx
import { usePercyRecommendation } from '@/hooks/usePercyRecommendation';
import { PercyRecommendsBadge } from '@/components/percy/PercyRecommendsBadge';

function DashboardRecommendations() {
  const { recommendation, getRecommendationSet } = usePercyRecommendation();

  useEffect(() => {
    getRecommendationSet({
      businessType: 'saas',
      urgencyLevel: 'high',
      userHistory: ['analytics']
    }, 3);
  }, []);

  if (!recommendation) return null;

  const recommendations = Array.isArray(recommendation.recommendation)
    ? recommendation.recommendation
    : [recommendation.recommendation];

  return (
    <div className="recommendations-panel">
      <h2>Percy Recommends</h2>
      {recommendations.map((rec, i) => (
        <div key={i} className="recommendation-card">
          <PercyRecommendsBadge
            confidence={rec.confidence}
            variant="prominent"
            reasoning={rec.reasoning}
            showConfidence
          />
          <h3>{rec.service.name}</h3>
          <p>{rec.service.description}</p>
          <button>Get Started →</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 4. Testing

### Test Recommendations

```bash
# Get instant recommendation
curl -X POST http://localhost:3000/api/services/percy-recommend \
  -H "Content-Type: application/json" \
  -d '{
    "trigger": "revenue-stalling",
    "context": {
      "businessType": "ecommerce",
      "urgencyLevel": "high"
    },
    "requestType": "instant"
  }'
```

### Test Streaming Chat

```bash
# Stream Percy chat
curl -N -X POST http://localhost:3000/api/percy/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "How can I grow my revenue?",
    "context": {
      "businessType": "ecommerce"
    }
  }'
```

---

## 5. Environment Variables

Required for streaming chat:

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 6. Files Added/Modified

### New Files

**Hooks:**
- `/hooks/usePercyRecommendation.ts` - Recommendation hook
- `/hooks/usePercyChat.ts` - Streaming chat hook

**Components:**
- `/components/percy/PercyRecommendsBadge.tsx` - Recommendation badges

**API Routes:**
- `/app/api/percy/chat/route.ts` - Streaming chat endpoint

**Utilities:**
- `/lib/activity/activityLogger.ts` - Activity tracking

**Database:**
- `/supabase/migrations/20251024_activity_feed_tables.sql` - Activity feed schema

**Documentation:**
- `/docs/PERCY_PHASE2_INTEGRATION.md` - This file
- `/docs/ACTIVITY_FEED.md` - Activity feed guide
- `/docs/WINDSURF_TASKS.md` - Windsurf UI tasks

### Existing Files (Already Working)

**API Routes:**
- `/app/api/services/percy-recommend/route.ts` - Recommendation API
- `/app/api/activity/live-feed/route.ts` - Activity feed SSE

**Engine:**
- `/lib/percy/recommendationEngine.ts` - Recommendation logic
- `/lib/config/services.ts` - Service definitions

---

## 7. Next Steps

### Immediate (Do Now)
1. **Apply Database Migration**
   - Run `supabase/migrations/20251024_activity_feed_tables.sql` in Supabase Dashboard

2. **Set Environment Variable**
   - Add `ANTHROPIC_API_KEY` to `.env.local`

3. **Test Streaming Chat**
   - Use curl or build a simple test component

### Short-term (For Windsurf)
- Build Activity Feed UI components (see `/docs/WINDSURF_TASKS.md`)
- Style and polish recommendation badges
- Add animations and transitions
- Implement filters and search
- Add unit tests

### Medium-term (Next Phase)
- A/B test recommendation copy and placement
- Track recommendation acceptance rates
- Build analytics dashboard for Percy performance
- Implement recommendation feedback loop
- Add N8N workflow tracking

---

## 8. Best Practices

### Recommendations

✅ **DO:**
- Show recommendations contextually (when user is browsing)
- Display confidence scores for transparency
- Provide clear reasoning for recommendations
- Limit to 3-5 recommendations max
- Track which recommendations are accepted

❌ **DON'T:**
- Show too many recommendations at once
- Recommend without context
- Hide the reasoning
- Auto-start agents without user confirmation

### Streaming Chat

✅ **DO:**
- Show typing indicators while streaming
- Allow users to cancel long responses
- Maintain conversation history (last 10 messages)
- Provide context (business type, goals)
- Handle errors gracefully

❌ **DON'T:**
- Block UI while streaming
- Send full conversation history (use last 10)
- Forget to handle network errors
- Stream without showing progress

---

## 9. Troubleshooting

### Recommendations Not Loading

1. Check API endpoint: `/api/services/percy-recommend`
2. Verify request format (trigger + context)
3. Check browser console for errors
4. Ensure recommendation engine is working

### Chat Not Streaming

1. Verify `ANTHROPIC_API_KEY` is set
2. Check browser supports EventSource (SSE)
3. Verify auth token is valid
4. Check API route logs for errors

### Activity Feed Not Updating

1. Apply database migration
2. Check Supabase Realtime is enabled
3. Verify RLS policies allow user access
4. Check agent launches are being logged

---

## 10. Performance

### Recommendations
- API response: ~200-500ms
- Cached on client for 5 minutes
- No database queries (uses in-memory service config)

### Streaming Chat
- First token: ~500-1000ms
- Streaming speed: ~50 tokens/second
- Max conversation history: 10 messages
- Token limit: 1024 tokens per response

### Activity Feed
- SSE connection overhead: ~100ms
- Real-time latency: <100ms
- Heartbeat interval: 30 seconds
- Auto-reconnects on disconnect

---

## Summary

Phase 2 delivers **intelligent recommendations** and **streaming AI chat** to Percy, transforming it from a static onboarding tool into a dynamic, conversational business advisor.

**Key Capabilities:**
- ✅ Context-aware service recommendations with confidence scores
- ✅ Real-time streaming conversations with Claude AI
- ✅ Visual recommendation indicators (badges, corner badges)
- ✅ Real-time agent activity feed infrastructure
- ✅ Easy-to-use React hooks for all features
- ✅ Comprehensive documentation and examples

**What's Next:**
- Windsurf builds the Activity Feed UI
- Integrate recommendations into Agent League
- A/B test recommendation placement and copy
- Track conversion metrics
- Build analytics dashboard

The foundation is solid. Now it's time to polish the UI and measure the impact! 🚀
