#!/usr/bin/env ts-node
import { DevHelpers, getAgent } from '../lib/agents/agentLeague';

const results = DevHelpers.validateAllAgents();
let hasErrors = false;

// Collect validation errors
for (const [agentId, res] of Object.entries(results)) {
  if (!res.valid) {
    console.error(`❌ Agent ${agentId} issues:`);
    res.issues.forEach(issue => console.error('   -', issue));
    hasErrors = true;
  }
}

// Ensure unique n8nWorkflowIds
const workflowIdMap = new Map<string, string>();
for (const agentId of Object.keys(results)) {
  const agent = getAgent(agentId);
  if (agent?.n8nWorkflowId) {
    if (workflowIdMap.has(agent.n8nWorkflowId)) {
      const conflict = workflowIdMap.get(agent.n8nWorkflowId);
      console.error(`❌ Duplicate n8nWorkflowId '${agent.n8nWorkflowId}' found for agents ${conflict} and ${agentId}`);
      hasErrors = true;
    } else {
      workflowIdMap.set(agent.n8nWorkflowId, agentId);
    }
  }
}

if (hasErrors) {
  console.error('\nAgent validation failed. Please fix the issues above.');
  process.exit(1);
}

console.log('✅ All agents validated successfully.'); 