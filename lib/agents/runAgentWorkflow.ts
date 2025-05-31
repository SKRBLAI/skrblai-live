import * as workflows from './workflows';
import agentRegistry from './agentRegistry';

/**
 * Runs an agent workflow, including onboarding if agent supports it.
 * Enforces premium gating: if agent has roleRequired, user must have that role.
 * @param agentId string
 * @param payload object
 * @param userRole string (optional, defaults to 'client')
 * @returns Promise<{result: string, status: string}>
 */
export async function runAgentWorkflow(agentId: string, payload: any, userRole: string = 'client'): Promise<{ result: string; status: string }> {
  const workflowFn = (workflows as Record<string, Function>)[agentId];

  if (!workflowFn) {
    throw new Error(`No workflow defined for agent: ${agentId}`);
  }

  const agent = agentRegistry.find(a => a.id === agentId);
  if (!agent) {
    return { result: 'Agent not found', status: 'error' };
  }

  // Premium gating: check roleRequired
  if (agent.roleRequired && userRole !== agent.roleRequired) {
    return { result: `Access denied: ${agent.name} requires ${agent.roleRequired} plan.`, status: 'error' };
  }

  // If onboarding task and agent has onboarding handler, call it
  if (payload?.task === 'onboard' && typeof agent.handleOnboarding === 'function') {
    const onboardingResult = await agent.handleOnboarding(payload);
    return { result: onboardingResult.message, status: onboardingResult.success ? 'success' : 'error' };
  }

  try {
    const result = await workflowFn(payload);
    return { status: 'success', result };
  } catch (error: any) {
    return { status: 'error', result: error.message || 'Unknown error' };
  }
}
