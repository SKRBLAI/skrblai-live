# 🚀 Agent League Refactor - Complete System Documentation

## Overview

The SKRBL AI Agent League refactor has successfully transformed the agent system from scattered configurations into a centralized, modular, and highly scalable architecture. This document outlines the new system capabilities and integration patterns.

## 🏗️ System Architecture

### 1. Centralized Configuration (`lib/agents/agentLeague.ts`)

The Agent League is now the **single source of truth** for all agent configurations:

```typescript
// Get any agent's complete configuration
const agent = agentLeague.getAgent('percy-agent');

// Get all visible agents for UI
const visibleAgents = agentLeague.getVisibleAgents();

// Generate LLM prompts with personality injection
const systemPrompt = agentLeague.generateSystemPrompt('branding-agent');
```

**Key Features:**
- ✅ Automatic personality mapping from `agentBackstories.ts`
- ✅ Centralized power and capability definitions
- ✅ Cross-agent handoff configuration
- ✅ Visual theme and UI configuration
- ✅ Development helpers for onboarding new agents

### 2. Modular Power Engine (`lib/agents/powerEngine.ts`)

The Power Engine handles all agent power executions and N8N workflow triggers:

```typescript
// Execute any agent power
const result = await powerEngine.executePower({
  agentId: 'branding-agent',
  powerId: 'brand-identity-creation',
  userPrompt: 'Create a brand for my startup',
  payload: { businessName: 'TechCorp' },
  context: userContext
});

// Check execution status
const status = await powerEngine.getPowerExecutionStatus(executionId);
```

**Key Features:**
- ✅ Modular N8N workflow integration
- ✅ API endpoint fallbacks
- ✅ Mock mode for testing
- ✅ Automatic cost calculation
- ✅ Premium access control
- ✅ Comprehensive execution logging

### 3. Cross-Agent Handoff System (`lib/agents/handoffSystem.ts`)

Intelligent agent-to-agent collaboration with automatic workflow suggestions:

```typescript
// Analyze handoff opportunities
const recommendations = await handoffSystem.analyzeHandoffOpportunities({
  sourceAgentId: 'branding-agent',
  userPrompt: 'Now I need content for my brand',
  executionResult: brandingResult,
  userPreferences: { autoHandoffs: true },
  sessionData: userSession
});

// Execute handoff
const handoffExecution = await handoffSystem.executeHandoff(
  recommendations[0], 
  context, 
  userConfirmation
);
```

**Key Features:**
- ✅ Intelligent handoff analysis
- ✅ Workflow pattern recognition
- ✅ Chained handoffs (handoffs that trigger more handoffs)
- ✅ User preference handling
- ✅ Confidence scoring and prioritization

### 4. Legacy System Archive (`lib/agents/legacy/`)

The original AgentConstellation component has been preserved for future gamification:

- ✅ Complete orbit mechanics preserved
- ✅ Visual effects and animations archived
- ✅ Agent collection patterns documented
- ✅ XP and progression foundations maintained

## 🎯 Key Improvements

### Before (Legacy System)
```typescript
// Scattered configurations
const agent = agentRegistry.find(a => a.id === 'branding-agent');
const backstory = agentBackstories['branding-agent'];
const n8nConfig = hardcodedMapping[agent.id];

// Manual LLM prompt construction
const prompt = `You are a branding agent. ${agent.description}`;

// No cross-agent coordination
// Limited workflow integration
// Inconsistent personality application
```

### After (Agent League System)
```typescript
// Centralized, type-safe configuration
const agent = agentLeague.getAgent('branding-agent');

// Automatic personality injection
const prompt = agentLeague.generateSystemPrompt('branding-agent');
// Result: "You are BrandAlexander the Identity Architect, born from the 
// Creative Nebula... Your catchphrase: 'Your brand, your legacy, my masterpiece!'"

// Intelligent cross-agent handoffs
const handoffs = await analyzeHandoffOpportunities(context);
// Result: Automatic suggestions for ContentCarltig, SiteOnzite, etc.

// Modular power execution
const result = await executePower(powerRequest);
// Result: Unified interface for N8N, APIs, and mock executions
```

## 🔌 API Integration

### New Agent League API (`/api/agents/league`)

#### GET Endpoints:
```bash
# List all agents
GET /api/agents/league?action=list&visible=true&personality=true

# Get specific agent
GET /api/agents/league?action=get&agentId=percy-agent

# Get visual configuration for frontend
GET /api/agents/league?action=visual&agentId=branding-agent

# Get system prompt for LLM calls
GET /api/agents/league?action=prompt&agentId=content-creator-agent

# Health check
GET /api/agents/league?action=health
```

#### POST Endpoints:
```bash
# Execute agent power
POST /api/agents/league
{
  "action": "execute_power",
  "agentId": "branding-agent",
  "powerId": "brand-identity-creation",
  "userPrompt": "Create a tech startup brand",
  "payload": { "businessName": "InnovateTech" }
}

# Analyze handoff opportunities
POST /api/agents/league
{
  "action": "analyze_handoffs",
  "sourceAgentId": "branding-agent",
  "userPrompt": "Now create content for this brand",
  "executionResult": { "data": "..." }
}

# Execute handoff
POST /api/agents/league
{
  "action": "execute_handoff",
  "recommendation": { "targetAgentId": "content-creator-agent", ... },
  "context": { ... },
  "userConfirmation": true
}
```

## 🎨 Frontend Integration

### React Hook for Agent League
```typescript
import { useAgentLeague } from '@/hooks/useAgentLeague';

function AgentSelector() {
  const { 
    agents, 
    executeAgentPower, 
    analyzeHandoffs,
    loading 
  } = useAgentLeague();

  const handleAgentAction = async (agentId: string, powerId: string) => {
    const result = await executeAgentPower({
      agentId,
      powerId,
      userPrompt: 'User request here',
      payload: {}
    });

    if (result.success) {
      // Check for handoff opportunities
      const handoffs = await analyzeHandoffs({
        sourceAgentId: agentId,
        userPrompt: 'Continue workflow',
        executionResult: result
      });
      
      // Present handoff options to user
      setHandoffSuggestions(handoffs);
    }
  };

  return (
    <div>
      {agents.map(agent => (
        <AgentCard 
          key={agent.id}
          agent={agent}
          onExecute={(powerId) => handleAgentAction(agent.id, powerId)}
        />
      ))}
    </div>
  );
}
```

### Visual Configuration Usage
```typescript
import { getAgentVisualConfig } from '@/lib/agents/agentLeague';

function AgentAvatar({ agentId }: { agentId: string }) {
  const config = getAgentVisualConfig(agentId);
  
  return (
    <div 
      className={`agent-avatar ${config.colorTheme}`}
      style={{ 
        '--agent-color': config.colorTheme,
        background: `var(--${config.colorTheme}-gradient)`
      }}
    >
      <img src={`/agents/${config.imageSlug}.png`} alt={config.superheroName} />
      <span className="emoji">{config.emoji}</span>
      <p className="catchphrase">"{config.catchphrase}"</p>
    </div>
  );
}
```

## 🔧 Developer Guide

### Adding New Agents

1. **Add to agentBackstories.ts:**
```typescript
export const agentBackstories = {
  // ... existing agents
  'new-agent': {
    superheroName: 'NewHero the Amazing',
    origin: 'Born from innovation',
    powers: ['Innovation', 'Problem Solving'],
    weakness: 'Overthinks solutions',
    catchphrase: 'Innovation is my middle name!',
    nemesis: 'The Stagnation Spirit',
    backstory: 'A hero dedicated to pushing boundaries...'
  }
};
```

2. **Configure in AgentLeague:**
```typescript
// In agentLeague.ts initializeAgents()
{
  id: 'new-agent',
  name: 'NewAgent',
  category: 'Innovation',
  description: 'Transforms ideas into reality',
  version: '1.0.0',
  personality: this.mapBackstoryToPersonality('new-agent'),
  powers: [
    {
      id: 'innovate',
      name: 'Innovation Generator',
      description: 'Generates innovative solutions',
      triggerKeywords: ['innovate', 'creative', 'solution'],
      n8nWorkflowId: 'innovation-workflow',
      outputType: 'text',
      estimatedDuration: 10,
      premiumRequired: false
    }
  ],
  capabilities: [{
    category: 'Innovation',
    skills: ['Creative Thinking', 'Problem Analysis'],
    primaryOutput: 'Innovative solutions and strategies',
    supportedFormats: ['text', 'pdf'],
    integrations: ['notion', 'miro']
  }],
  handoffTargets: [], // Add cross-agent handoffs
  canReceiveHandoffs: true,
  n8nWorkflowId: 'innovation-workflow',
  primaryWorkflow: 'innovation-generation',
  fallbackBehavior: 'mock',
  visible: true,
  premium: false,
  emoji: '💡',
  colorTheme: 'innovation-yellow',
  imageSlug: 'innovation',
  usageTracking: true,
  performanceMetrics: ['solutions_generated', 'innovation_score']
}
```

3. **Add Cross-Agent Handoffs:**
```typescript
const CROSS_AGENT_HANDOFFS = {
  'new-agent': [
    {
      targetAgentId: 'prototype-agent',
      triggerConditions: ['build prototype', 'create demo'],
      handoffMessage: "Great innovation! Let's build a prototype with PrototypeBuilder!",
      autoTrigger: false,
      confidence: 80
    }
  ]
};
```

### LLM Integration with Personality

```typescript
import { enhancePromptWithPersonality } from '@/lib/agents/agentLeague';

// Old way (manual)
const prompt = `You are a branding agent. Create a logo.`;

// New way (automatic personality injection)
const enhancedPrompt = enhancePromptWithPersonality(
  'branding-agent',
  'Create a logo for a tech startup'
);

// Result includes full personality, backstory, powers, and catchphrase
const response = await openai.chat.completions.create({
  messages: [{ role: 'system', content: enhancedPrompt }]
});
```

### N8N Workflow Integration

```typescript
// Powers automatically trigger correct N8N workflows
const powerResult = await executePower({
  agentId: 'branding-agent',
  powerId: 'brand-identity-creation', // Maps to 'branding-workflow'
  userPrompt: 'Create brand for coffee shop',
  payload: {
    businessName: 'Brew Haven',
    industry: 'Food & Beverage',
    targetAudience: 'Coffee enthusiasts'
  }
});

// N8N receives enhanced payload:
// {
//   agentId: 'branding-agent',
//   powerId: 'brand-identity-creation',
//   userPrompt: '...',
//   payload: { ... },
//   personality: {
//     superheroName: 'BrandAlexander the Identity Architect',
//     catchphrase: 'Your brand, your legacy, my masterpiece!',
//     powers: ['Visual Identity Manifestation', ...]
//   }
// }
```

## 📊 Analytics & Monitoring

### Power Execution Tracking
```sql
-- New table: agent_power_executions
SELECT 
  agent_name,
  power_name,
  COUNT(*) as execution_count,
  AVG(execution_time) as avg_time,
  SUM(cost) as total_cost
FROM agent_power_executions 
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY agent_name, power_name;
```

### Handoff Success Rates
```sql
-- New table: agent_handoff_executions
SELECT 
  source_agent_id,
  target_agent_id,
  COUNT(*) as handoff_count,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as success_count,
  AVG(total_value) as avg_value
FROM agent_handoff_executions 
GROUP BY source_agent_id, target_agent_id;
```

## 🧪 Testing

### Unit Tests for Agent League
```typescript
import { agentLeague, DevHelpers } from '@/lib/agents/agentLeague';

describe('Agent League', () => {
  test('should validate all agents', () => {
    const validation = DevHelpers.validateAllAgents();
    expect(validation['percy-agent'].valid).toBe(true);
  });

  test('should find best handoff', () => {
    const handoff = agentLeague.findBestHandoff(
      'branding-agent', 
      'now create content for this brand'
    );
    expect(handoff?.targetAgentId).toBe('content-creator-agent');
  });

  test('should generate system prompt', () => {
    const prompt = agentLeague.generateSystemPrompt('percy-agent');
    expect(prompt).toContain('Percy the Cosmic Concierge');
    expect(prompt).toContain('Your wish is my command protocol!');
  });
});
```

### Integration Tests for Power Engine
```typescript
import { executePower } from '@/lib/agents/powerEngine';

describe('Power Engine', () => {
  test('should execute mock power', async () => {
    const result = await executePower({
      agentId: 'test-agent',
      powerId: 'test-power',
      userPrompt: 'Test execution',
      payload: {},
      context: mockContext
    });

    expect(result.success).toBe(true);
    expect(result.powerName).toBe('test-power');
  });
});
```

## 🚀 Migration Guide

### From Legacy Agent System

1. **Update Agent References:**
```typescript
// Old
import agentRegistry from '@/lib/agents/agentRegistry';
const agent = agentRegistry.find(a => a.id === 'branding-agent');

// New
import { getAgent } from '@/lib/agents/agentLeague';
const agent = getAgent('branding-agent');
```

2. **Update LLM Calls:**
```typescript
// Old
const prompt = `You are ${agent.name}. ${agent.description}`;

// New
import { getAgentSystemPrompt } from '@/lib/agents/agentLeague';
const prompt = getAgentSystemPrompt('branding-agent');
```

3. **Update Workflow Triggers:**
```typescript
// Old
const workflowId = getWorkflowIdForAgentTask(agentId, task);
await triggerN8nWorkflow(workflowId, payload);

// New
await executePower({
  agentId,
  powerId: 'primary-power', 
  userPrompt,
  payload,
  context
});
```

## 🎯 Future Roadmap

### Phase 1: Enhanced Handoffs (Q1 2025)
- ✅ **COMPLETE**: Basic cross-agent handoff system
- 🔄 **IN PROGRESS**: Machine learning handoff optimization
- 📋 **PLANNED**: Workflow template integration

### Phase 2: Gamification Integration (Q2 2025)
- 📋 **PLANNED**: Re-enable AgentConstellation for collections
- 📋 **PLANNED**: Agent XP and progression system
- 📋 **PLANNED**: Achievement unlocks and badges

### Phase 3: Advanced Analytics (Q3 2025)
- 📋 **PLANNED**: Predictive agent recommendations
- 📋 **PLANNED**: Workflow success prediction
- 📋 **PLANNED**: Auto-optimization of handoff thresholds

## 🎉 Conclusion

The Agent League refactor provides:

✅ **Centralized Configuration** - Single source of truth for all agent data  
✅ **Modular Power System** - Unified interface for N8N, APIs, and mocks  
✅ **Cross-Agent Handoffs** - Intelligent workflow coordination  
✅ **Personality Injection** - Automatic LLM prompt enhancement  
✅ **Legacy Preservation** - Gamification foundations maintained  
✅ **Developer Experience** - Easy agent onboarding and validation  
✅ **Production Ready** - Comprehensive logging and error handling  

The system is now fully modular, scalable, and ready for future enhancements while maintaining backward compatibility and preserving valuable legacy patterns for gamification.

---

**Team:** SKRBL AI Development Team  
**Date:** January 5, 2025  
**Version:** 2.0.0  
**Status:** ✅ COMPLETE - Ready for Production 