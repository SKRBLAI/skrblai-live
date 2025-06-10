# N8N Agent Integration System - Complete Setup Guide

> **Version 2.0.0** | **MAX/QUAD UP Implementation** | **SKRBL AI Agent League**

## 🎯 **OVERVIEW**

This document provides complete setup instructions for SKRBL AI's n8n workflow integration system that enables every AI agent to execute real automation workflows with full personality injection, cross-agent handoffs, and comprehensive logging.

### **What This System Does**
- ✅ **Full Agent Automation**: Every agent can trigger real n8n workflows
- ✅ **Personality Injection**: Agent backstories and personas are injected into workflows
- ✅ **Cross-Agent Handoffs**: Agents can suggest and trigger each other's workflows
- ✅ **Frontend Integration**: Launch workflows directly from agent cards/modals
- ✅ **Premium Gating**: Control access based on user subscription level
- ✅ **Comprehensive Logging**: Track all executions for analytics and debugging
- ✅ **Error Handling**: Robust fallback and error recovery

## 🏗️ **ARCHITECTURE OVERVIEW**

```mermaid
graph TB
    UI[Agent Cards/Modals] --> API[/api/agents/workflow/agentId]
    API --> PE[PowerEngine]
    PE --> WL[WorkflowLookup]
    PE --> N8N[N8N Client]
    
    WL --> BS[AgentBackstories]
    WL --> AL[AgentLeague]
    
    N8N --> N8NW[N8N Workflows]
    PE --> DB[(Supabase Logging)]
    
    subgraph Frontend
        UI
        WLB[WorkflowLaunchButton]
        HSP[HandoffSuggestionsPanel]
    end
    
    subgraph Backend
        API
        PE
        WL
        N8N
    end
    
    subgraph Configuration
        BS
        AL
    end
```

## 📋 **PREREQUISITES**

### **Required Environment Variables**
```bash
# N8N Configuration
N8N_API_BASE_URL=https://your-n8n-instance.com
N8N_API_KEY=your_n8n_api_key
N8N_BASE_URL=https://your-n8n-instance.com  # For webhook URLs

# N8N Quota Limits (Optional)
N8N_DAILY_LIMIT=1000
N8N_MONTHLY_LIMIT=10000
N8N_CONCURRENT_LIMIT=5

# Supabase (Already Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Required Database Tables**
The following tables need to exist in your Supabase database:

```sql
-- Agent workflow executions
CREATE TABLE agent_workflow_executions (
  execution_id VARCHAR(255) PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  agent_name VARCHAR(255) NOT NULL,
  superhero_name VARCHAR(255) NOT NULL,
  n8n_workflow_id VARCHAR(255),
  user_id UUID,
  user_role VARCHAR(50),
  session_id VARCHAR(255),
  user_prompt TEXT,
  workflow_capabilities JSONB,
  estimated_duration INTEGER,
  status VARCHAR(50),
  success BOOLEAN,
  error_message TEXT,
  previous_agent VARCHAR(255),
  handoff_reason VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow request logging
CREATE TABLE agent_workflow_requests (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  agent_name VARCHAR(255),
  superhero_name VARCHAR(255),
  user_id VARCHAR(255),
  user_role VARCHAR(50),
  session_id VARCHAR(255),
  user_prompt TEXT,
  has_workflow BOOLEAN,
  requires_premium BOOLEAN,
  workflow_capabilities JSONB,
  request_metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error logging
CREATE TABLE agent_workflow_errors (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(255),
  error_message TEXT,
  error_stack TEXT,
  request_url VARCHAR(500),
  request_method VARCHAR(10),
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 **STEP-BY-STEP SETUP**

### **Step 1: Configure Agent Backstories with Workflows**

Each agent needs workflow configuration in `lib/agents/agentBackstories.ts`:

```typescript
'percy-agent': {
  superheroName: 'Percy the Cosmic Concierge',
  // ... existing backstory fields ...
  
  // NEW: N8N Workflow Integration
  n8nWorkflowId: 'percy-orchestration-master',
  n8nWebhookUrl: `${process.env.N8N_BASE_URL}/webhook/percy-orchestration-master`,
  workflowCapabilities: ['agent_routing', 'task_orchestration', 'workflow_coordination'],
  automationTriggers: ['help me choose', 'which agent', 'coordinate tasks'],
  handoffPreferences: ['branding-agent', 'content-creator-agent', 'analytics-agent']
}
```

**Required Fields:**
- `n8nWorkflowId`: Your n8n workflow ID
- `workflowCapabilities`: Array of what this agent can do
- `automationTriggers`: Keywords that suggest this agent
- `handoffPreferences`: Agents this one suggests for next steps

### **Step 2: Create N8N Workflows**

For each agent, create an n8n workflow with these requirements:

#### **Webhook Trigger Configuration**
- **Method**: POST
- **Path**: `/webhook/{your-workflow-id}`
- **Authentication**: API Key (optional but recommended)

#### **Expected Payload Structure**
Your n8n workflow will receive this payload:

```json
{
  "executionId": "workflow_1737123456_percy-agent_abc123",
  "agentId": "percy-agent",
  "agentName": "Percy",
  "superheroName": "Percy the Cosmic Concierge",
  "userPrompt": "Help me choose the right agent for branding",
  "userId": "user_123",
  "userRole": "pro",
  "sessionId": "session_1737123456",
  "timestamp": "2025-01-17T10:30:00Z",
  "workflowCapabilities": ["agent_routing", "task_orchestration"],
  "estimatedDuration": 5,
  "payload": {},
  "fileData": null,
  "previousAgent": null,
  "handoffReason": null,
  "platform": "skrbl-ai-v2",
  "source": "enhanced-power-engine",
  "version": "2.0.0"
}
```

#### **Recommended Workflow Structure**
1. **Input Validation** - Validate required fields
2. **Agent Logic** - Your agent's core functionality
3. **Response Formation** - Structure the response
4. **Error Handling** - Catch and format errors
5. **Output** - Return structured response

#### **Expected Response Format**
```json
{
  "success": true,
  "status": "completed", // or "running", "failed"
  "data": {
    "result": "Agent routing complete",
    "suggestions": ["branding-agent", "content-creator-agent"],
    "confidence": 95
  },
  "message": "Percy has analyzed your request and found the perfect agent!"
}
```

### **Step 3: Update Agent League Configuration** (Optional)

If you want to override backstory settings, update `lib/agents/agentLeague.ts`:

```typescript
{
  id: 'percy-agent',
  name: 'Percy',
  // ... existing config ...
  n8nWorkflowId: 'percy-orchestration-master', // Override backstory setting
  primaryWorkflow: 'agent-orchestration',
  fallbackBehavior: 'mock' // or 'error', 'redirect'
}
```

### **Step 4: Add Workflow Buttons to Agent Cards**

Update your agent card components to include workflow launch buttons:

```tsx
import WorkflowLaunchButton from '@/components/agents/WorkflowLaunchButton';
import HandoffSuggestionsPanel from '@/components/agents/HandoffSuggestionsPanel';

function AgentCard({ agent }) {
  const [handoffSuggestions, setHandoffSuggestions] = useState([]);

  return (
    <div className="agent-card">
      {/* ... existing agent card content ... */}
      
      <WorkflowLaunchButton
        agentId={agent.id}
        agentName={agent.name}
        superheroName={agent.superheroName}
        hasWorkflow={!!agent.n8nWorkflowId}
        requiresPremium={agent.premium}
        workflowCapabilities={agent.workflowCapabilities}
        onWorkflowComplete={(result) => {
          console.log('Workflow completed:', result);
        }}
        onHandoffSuggestion={(suggestions) => {
          setHandoffSuggestions(suggestions);
        }}
      />

      {handoffSuggestions.length > 0 && (
        <HandoffSuggestionsPanel
          suggestions={handoffSuggestions}
          sourceAgent={agent.id}
          sourceAgentName={agent.superheroName}
          onHandoffTrigger={(agentId, suggestion) => {
            console.log('Handoff triggered:', agentId, suggestion);
          }}
        />
      )}
    </div>
  );
}
```

## 📚 **API USAGE EXAMPLES**

### **Trigger Agent Workflow**
```typescript
// POST /api/agents/workflow/percy-agent
const response = await fetch('/api/agents/workflow/percy-agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userPrompt: "Help me choose the right agent for my branding project",
    userId: "user_123",
    userRole: "pro",
    sessionId: "session_456",
    payload: {
      projectType: "startup_branding",
      industry: "technology"
    }
  })
});

const result = await response.json();
console.log('Workflow result:', result);
```

### **Get Agent Configuration**
```typescript
// GET /api/agents/workflow/percy-agent
const response = await fetch('/api/agents/workflow/percy-agent');
const config = await response.json();
console.log('Agent config:', config);
```

### **Check Execution Status**
```typescript
// GET /api/agents/workflow/percy-agent?executionId=workflow_123
const response = await fetch('/api/agents/workflow/percy-agent?executionId=workflow_123');
const status = await response.json();
console.log('Execution status:', status);
```

## 🔧 **ADVANCED CONFIGURATION**

### **Custom Workflow Lookup**
Use the workflow lookup utility for advanced scenarios:

```typescript
import { getAgentWorkflowConfig, getHandoffSuggestions } from '@/lib/agents/workflowLookup';

// Get agent workflow configuration
const config = getAgentWorkflowConfig('percy-agent');
console.log('Workflow config:', config);

// Find agents by capability
const capableAgents = findAgentsByCapability('brand_identity');
console.log('Branding agents:', capableAgents);

// Get handoff suggestions
const suggestions = getHandoffSuggestions('branding-agent', 'create website');
console.log('Handoff suggestions:', suggestions);
```

### **Direct Power Engine Usage**
For advanced integrations, use the power engine directly:

```typescript
import { triggerAgentWorkflow } from '@/lib/agents/powerEngine';

const result = await triggerAgentWorkflow('branding-agent', {
  projectType: 'startup',
  industry: 'tech'
}, {
  userId: 'user_123',
  userRole: 'pro',
  sessionId: 'session_456',
  requestTimestamp: new Date().toISOString(),
  userPrompt: 'Create a tech startup brand identity'
});
```

### **Cross-Agent Handoffs**
Programmatically trigger handoffs:

```typescript
import { executeHandoff } from '@/lib/agents/powerEngine';

const handoffResult = await executeHandoff(
  'execution_123', // Source execution ID
  {
    targetAgentId: 'content-creator-agent',
    targetAgentName: 'ContentCarltig',
    suggestion: 'Create content for your new brand',
    confidence: 85,
    autoTrigger: false,
    triggerPayload: { brandAssets: brandData }
  },
  userContext
);
```

## 🔍 **MONITORING & ANALYTICS**

### **Workflow Statistics**
```typescript
import { getWorkflowStatistics } from '@/lib/agents/workflowLookup';

const stats = getWorkflowStatistics();
console.log('Workflow coverage:', stats.coveragePercentage);
console.log('Most capable agent:', stats.mostCapableAgent);
```

### **Database Queries for Analytics**
```sql
-- Most used agents
SELECT agent_id, agent_name, COUNT(*) as executions
FROM agent_workflow_executions
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY agent_id, agent_name
ORDER BY executions DESC;

-- Success rates by agent
SELECT 
  agent_id,
  COUNT(*) as total_executions,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_executions,
  ROUND(AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) * 100, 2) as success_rate
FROM agent_workflow_executions
GROUP BY agent_id;

-- Average execution time by agent
SELECT 
  agent_id,
  AVG(estimated_duration) as avg_duration,
  COUNT(*) as total_executions
FROM agent_workflow_executions
WHERE success = true
GROUP BY agent_id;
```

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **1. Agent Not Found Error**
```
Error: Agent not found or not configured: your-agent-id
```
**Solution**: Check that the agent exists in `agentLeague.ts` and has proper configuration.

#### **2. No Workflow Configuration**
```
Warning: Agent has no workflow configured, using mock mode
```
**Solution**: Add `n8nWorkflowId` to the agent's backstory or league configuration.

#### **3. N8N Connection Failed**
```
Error: N8N workflow trigger failed: Network error
```
**Solutions**:
- Check `N8N_API_BASE_URL` environment variable
- Verify n8n instance is accessible
- Check API key configuration
- Ensure workflow ID exists in n8n

#### **4. Premium Access Required**
```
Error: Agent requires premium access
```
**Solution**: User needs to upgrade subscription or agent needs `requiresPremium: false`.

#### **5. Quota Limit Reached**
```
Error: Daily execution limit reached (1000)
```
**Solution**: Increase limits in environment variables or wait for reset.

### **Debug Mode**
Enable detailed logging by checking browser console for:
- `[WorkflowLookup]` - Configuration loading
- `[PowerEngine]` - Workflow execution
- `[Workflow API]` - API request/response
- `[WorkflowLaunch]` - Frontend interactions

### **Validation Tools**
```typescript
import { validateWorkflowConfig } from '@/lib/agents/workflowLookup';

// Check agent configuration
const validation = validateWorkflowConfig('percy-agent');
if (!validation.valid) {
  console.log('Issues:', validation.issues);
  console.log('Recommendations:', validation.recommendations);
}
```

## 🎯 **TESTING GUIDE**

### **Test Workflow Integration**
1. **Mock Mode Test**: Ensure agents without n8n workflows show preview mode
2. **Real Workflow Test**: Trigger a workflow and verify n8n receives payload
3. **Handoff Test**: Trigger workflow and verify handoff suggestions appear
4. **Premium Test**: Test premium agent with free user (should fail gracefully)
5. **Error Test**: Use invalid workflow ID and verify error handling

### **Frontend Testing Checklist**
- [ ] Workflow launch button appears on agent cards
- [ ] Button shows correct state (enabled/disabled/loading)
- [ ] Prompt input modal opens for user input
- [ ] Premium blocking works correctly
- [ ] Success/error toasts appear
- [ ] Handoff suggestions panel appears
- [ ] Execution status updates properly

### **Backend Testing Checklist**
- [ ] API endpoint responds correctly
- [ ] Workflow configuration loads properly
- [ ] N8N client connects successfully
- [ ] Database logging works
- [ ] Error handling and fallbacks work
- [ ] Quota limits are enforced

## 📈 **PERFORMANCE OPTIMIZATION**

### **Caching Strategies**
- Agent configurations are cached in memory
- Workflow lookup results can be cached
- Consider Redis for production quota tracking

### **Monitoring Points**
- N8N API response times
- Database query performance
- Frontend render times
- Workflow execution success rates

## 🔐 **SECURITY CONSIDERATIONS**

### **API Security**
- User authentication required for workflow triggers
- Input validation on all endpoints
- Rate limiting on workflow triggers
- Secure environment variable storage

### **N8N Security**
- Use API keys for n8n authentication
- Validate webhook signatures
- Sanitize user inputs before sending to n8n
- Monitor for unusual activity patterns

## 🚀 **DEPLOYMENT CHECKLIST**

### **Pre-Production**
- [ ] All environment variables configured
- [ ] Database tables created with proper indexes
- [ ] N8N workflows created and tested
- [ ] Agent backstories updated with workflow IDs
- [ ] Frontend components integrated
- [ ] Error logging and monitoring set up

### **Production**
- [ ] N8N instance properly secured
- [ ] Database connection pooling configured
- [ ] Monitoring and alerting set up
- [ ] Backup strategies in place
- [ ] Performance monitoring enabled

---

## 📞 **SUPPORT**

For implementation support or questions:
1. Check the troubleshooting section above
2. Review the console logs for detailed error messages
3. Validate configuration using the provided utilities
4. Test in isolation using the API endpoints directly

**System Status**: ✅ **Ready for Production**

---

*This documentation covers the complete MAX/QUAD UP n8n agent integration system. All components are type-safe, modular, and production-ready.* 