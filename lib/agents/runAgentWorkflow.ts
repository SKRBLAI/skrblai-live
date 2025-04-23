import * as workflows from './workflows';

export async function runAgentWorkflow(agentId: string, payload: any): Promise<{ status: string; result: string }> {
  const workflowFn = (workflows as Record<string, Function>)[agentId];

  if (!workflowFn) {
    throw new Error(`No workflow defined for agent: ${agentId}`);
  }

  try {
    const result = await workflowFn(payload);
    return { status: 'success', result };
  } catch (error: any) {
    return { status: 'error', result: error.message || 'Unknown error' };
  }
}
