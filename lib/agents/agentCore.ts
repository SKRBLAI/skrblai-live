/**
 * SKRBL AI Unified Agent Core
 *
 * Exposes a single access surface for all agent configuration,
 * metadata, and helper utilities. It bridges the previous
 * AgentLeague and AgentRegistry modules so the rest of the
 * codebase can migrate incrementally without breaking.
 *
 * Eventually, the underlying implementation will be fully
 * consolidated, but for now we simply re-export the most common
 * APIs and singletons while pointing new code towards `agentCore`.
 */

import agentRegistry, { agentDashboardList } from './agentRegistry';
import {
  AgentLeague,
  getAgent,
  getAllAgents,
  getAgentSystemPrompt,
  enhancePromptWithPersonality,
  getAgentVisualConfig,
  findBestHandoff,
  handleAgentChat,
  getAgentConversationCapabilities,
  type AgentConfiguration,
  type AgentPower,
  type CrossAgentHandoff
} from './agentLeague';

/**
 * Singleton instance of the AgentLeague.
 * This is the canonical source of truth moving forward.
 */
export const agentCore = AgentLeague.getInstance();

// -----------------------------------------------------------------------------
// Legacy re-exports for backwards compatibility
// -----------------------------------------------------------------------------

export { agentRegistry, agentDashboardList };
export {
  // Core agent helpers
  getAgent,
  getAllAgents,
  getAgentSystemPrompt,
  enhancePromptWithPersonality,
  getAgentVisualConfig,
  findBestHandoff,
  handleAgentChat,
  getAgentConversationCapabilities,
  // Types
  AgentConfiguration,
  AgentPower,
  CrossAgentHandoff
};

// Default export for convenience (matches previous Registry default style)
export default agentCore; 