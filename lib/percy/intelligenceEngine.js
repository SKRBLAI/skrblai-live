/*
 * WARNING: Deprecated Module
 * --------------------------
 * `lib/percy/intelligenceEngine.js` is now a thin compatibility bridge.
 * All new code should import from:
 *   `@/lib/agents/intelligenceEngine`
 *
 * This file will be removed in a future release after all imports are migrated.
 */

// eslint-disable-next-line import/no-relative-parent-imports
import intelligenceEngine, {
  generatePercyResponse,
  checkAgentAccess,
  trackPercyInteraction,
  FREE_AGENTS,
  CONVERSATION_PHASES,
  PERCY_INTELLIGENCE_MODES,
  SUBSCRIPTION_TIERS
} from '../agents/intelligenceEngine';

console.warn('[Deprecation] Importing from "lib/percy/intelligenceEngine" is deprecated. Please import from "@/lib/agents/intelligenceEngine" instead.');
export default intelligenceEngine;
export {
  intelligenceEngine as percyIntelligence,
  generatePercyResponse,
  checkAgentAccess,
  trackPercyInteraction,
  FREE_AGENTS,
  CONVERSATION_PHASES,
  PERCY_INTELLIGENCE_MODES,
  SUBSCRIPTION_TIERS
}; 