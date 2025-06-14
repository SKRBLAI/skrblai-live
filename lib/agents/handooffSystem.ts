import { agentLeague, type AgentConfiguration, type CrossAgentHandoff } from './agentLeague';
import { powerEngine, type PowerExecutionResult, type HandoffSuggestion } from './powerEngine';
import { createClient } from '@supabase/supabase-js';
import { runAgentWorkflow } from './runAgentWorkflow';

// =============================================================================
// HANDOFF TYPES & INTERFACES
// =============================================================================
// ... existing code ... 