// Maps agentId + task to n8n workflowId using ENV or config
export function getWorkflowIdForAgentTask(agentId: string, task: string): string | undefined {
  // Example: Use ENV for mapping, fallback to config map
  const envKey = `N8N_WORKFLOW_${agentId.toUpperCase()}_${task.toUpperCase()}`;
  if (process.env[envKey]) return process.env[envKey] as string;
  // Fallback static map (should be replaced with ENV in prod)
  const map: Record<string, string> = {
    'publishing:publish': process.env.N8N_WORKFLOW_PUBLISH_BOOK || '',
    'proposal:send_proposal': process.env.N8N_WORKFLOW_SEND_PROPOSAL || '',
    'percy:sync_content': process.env.N8N_WORKFLOW_SYNC_CONTENT || '',
    'onboarding-agent:onboard': process.env.N8N_WORKFLOW_ONBOARD_USER || '',
  };
  return map[`${agentId}:${task}`] || undefined;
} 