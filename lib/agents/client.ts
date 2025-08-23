import { AgentWorkflowConfig } from './workflows/workflowLookup';

/**
 * Trigger an agent's workflow via the canonical relay route.
 * @param agentId - The agent's ID
 * @param payload - The body to send to the workflow
 * @returns The workflow execution response
 */
export async function triggerAgentWorkflow(agentId: string, payload: Record<string, any>): Promise<any> {
  const response = await fetch(`/api/agents/${agentId}/trigger-n8n`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Failed to trigger workflow');
  }
  return response.json();
}
