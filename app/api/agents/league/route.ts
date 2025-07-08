/**
 * Agent League API Endpoint
 * 
 * Provides access to the centralized Agent League system for frontend components.
 * Supports agent discovery, power execution, and cross-agent handoffs.
 * 
 * @version 2.0.0
 * @author SKRBL AI Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  agentLeague, 
  getAgent, 
  getAllAgents, 
  getAgentSystemPrompt,
  getAgentVisualConfig,
  findBestHandoff,
  DevHelpers
} from '@/lib/agents/agentLeague';
import { 
  powerEngine, 
  executePower,
  getPowerExecutionStatus,
  type PowerExecutionRequest 
} from '@/lib/agents/powerEngine';
import { 
  handoffSystem,
  analyzeHandoffOpportunities,
  executeHandoff,
  type HandoffContext 
} from '@/lib/agents/handoffs/handoffSystem';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================================================
// API ROUTE HANDLERS
// =============================================================================

/**
 * GET /api/agents/league
 * Returns agent information and league status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const agentId = searchParams.get('agentId');
    const executionId = searchParams.get('executionId');

    switch (action) {
      case 'list':
        return handleListAgents(searchParams);
      
      case 'get':
        return handleGetAgent(agentId);
      
      case 'visual':
        return handleGetVisualConfig(agentId);
      
      case 'prompt':
        return handleGetSystemPrompt(agentId);
      
      case 'status':
        return handleGetExecutionStatus(executionId);
      
      case 'validate':
        return handleValidateAgents();
      
      case 'health':
        return handleHealthCheck();
      
      case 'chat-capabilities':
        return handleGetChatCapabilities(agentId);
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter',
          availableActions: ['list', 'get', 'visual', 'prompt', 'status', 'validate', 'health', 'chat-capabilities']
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('[AgentLeague API] GET error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/agents/league
 * Handles agent power execution and handoffs
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...params } = body;

    // Authentication check
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (!user || userError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid authentication token'
      }, { status: 401 });
    }

    // Get user role
    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('userId', user.id)
      .maybeSingle();
    
    const userRole = userRoleData?.role || 'client';

    switch (action) {
      case 'execute_power':
        return handleExecutePower(params, user, userRole);
      
      case 'analyze_handoffs':
        return handleAnalyzeHandoffs(params, user, userRole);
      
      case 'execute_handoff':
        return handleExecuteHandoff(params, user, userRole);
      
      case 'find_handoff':
        return handleFindHandoff(params);
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter',
          availableActions: ['execute_power', 'analyze_handoffs', 'execute_handoff', 'find_handoff']
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('[AgentLeague API] POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// =============================================================================
// HANDLER FUNCTIONS
// =============================================================================

/**
 * Handle listing agents with optional filtering
 */
async function handleListAgents(searchParams: URLSearchParams) {
  const category = searchParams.get('category');
  const visible = searchParams.get('visible');
  const includePersonality = searchParams.get('personality') === 'true';
  const includeCapabilities = searchParams.get('capabilities') === 'true';

  let agents = getAllAgents();

  // Apply filters
  if (category) {
    agents = agents.filter(agent => agent.category.toLowerCase() === category.toLowerCase());
  }

  if (visible === 'true') {
    agents = agents.filter(agent => agent.visible);
  }

  // Format response based on requested detail level
  const response = agents.map(agent => {
    const base = {
      id: agent.id,
      name: agent.name,
      category: agent.category,
      description: agent.description,
      version: agent.version,
      visible: agent.visible,
      premium: agent.premium,
      emoji: agent.emoji,
      colorTheme: agent.colorTheme,
      imageSlug: agent.imageSlug
    };

    if (includePersonality) {
      Object.assign(base, {
        personality: agent.personality
      });
    }

    if (includeCapabilities) {
      Object.assign(base, {
        capabilities: agent.capabilities,
        powers: agent.powers
      });
    }

    return base;
  });

  return NextResponse.json({
    success: true,
    agents: response,
    count: response.length,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle getting single agent details
 */
async function handleGetAgent(agentId: string | null) {
  if (!agentId) {
    return NextResponse.json({
      success: false,
      error: 'Agent ID is required'
    }, { status: 400 });
  }

  const agent = getAgent(agentId);
  if (!agent) {
    return NextResponse.json({
      success: false,
      error: `Agent not found: ${agentId}`
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    agent,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle getting agent visual configuration
 */
async function handleGetVisualConfig(agentId: string | null) {
  if (!agentId) {
    return NextResponse.json({
      success: false,
      error: 'Agent ID is required'
    }, { status: 400 });
  }

  const visualConfig = getAgentVisualConfig(agentId);
  if (!visualConfig) {
    return NextResponse.json({
      success: false,
      error: `Agent not found: ${agentId}`
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    visualConfig,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle getting agent system prompt
 */
async function handleGetSystemPrompt(agentId: string | null) {
  if (!agentId) {
    return NextResponse.json({
      success: false,
      error: 'Agent ID is required'
    }, { status: 400 });
  }

  const systemPrompt = getAgentSystemPrompt(agentId);
  
  return NextResponse.json({
    success: true,
    systemPrompt,
    agentId,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle getting execution status
 */
async function handleGetExecutionStatus(executionId: string | null) {
  if (!executionId) {
    return NextResponse.json({
      success: false,
      error: 'Execution ID is required'
    }, { status: 400 });
  }

  const status = await getPowerExecutionStatus(executionId);
  
  return NextResponse.json({
    success: true,
    status,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle agent validation
 */
async function handleValidateAgents() {
  const validationResults = DevHelpers.validateAllAgents();
  const missingBackstories = DevHelpers.getAgentsMissingBackstories();

  const summary = {
    totalAgents: Object.keys(validationResults).length,
    validAgents: Object.values(validationResults).filter(r => r.valid).length,
    invalidAgents: Object.values(validationResults).filter(r => !r.valid).length,
    missingBackstories: missingBackstories.length
  };

  return NextResponse.json({
    success: true,
    summary,
    validationResults,
    missingBackstories,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle health check
 */
async function handleHealthCheck() {
  const agents = getAllAgents();
  const agentCount = agents.length;
  const visibleAgents = agents.filter(a => a.visible).length;

  return NextResponse.json({
    success: true,
    status: 'healthy',
    service: 'agent-league',
    version: '2.0.0',
    agentCount,
    visibleAgents,
    features: [
      'centralized-configuration',
      'personality-injection',
      'cross-agent-handoffs',
      'power-execution',
      'intelligent-routing'
    ],
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle power execution
 */
async function handleExecutePower(params: any, user: any, userRole: string) {
  const { agentId, powerId, userPrompt, payload, fileData } = params;

  if (!agentId || !powerId || !userPrompt) {
    return NextResponse.json({
      success: false,
      error: 'Missing required parameters: agentId, powerId, userPrompt'
    }, { status: 400 });
  }

  const powerRequest: PowerExecutionRequest = {
    agentId,
    powerId,
    userPrompt,
    payload: payload || {},
    context: {
      userId: user.id,
      userRole,
      sessionId: `session_${Date.now()}_${user.id}`,
      metadata: {},
      requestTimestamp: new Date().toISOString()
    },
    fileData
  };

  const result = await executePower(powerRequest);

  return NextResponse.json({
    success: result.success,
    result,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle handoff analysis
 */
async function handleAnalyzeHandoffs(params: any, user: any, userRole: string) {
  const { sourceAgentId, sourceExecutionId, userPrompt, executionResult, userPreferences } = params;

  if (!sourceAgentId || !userPrompt || !executionResult) {
    return NextResponse.json({
      success: false,
      error: 'Missing required parameters: sourceAgentId, userPrompt, executionResult'
    }, { status: 400 });
  }

  const handoffContext: HandoffContext = {
    sourceAgentId,
    sourceExecutionId: sourceExecutionId || `analysis_${Date.now()}`,
    userPrompt,
    executionResult,
    userPreferences: userPreferences || {
      autoHandoffs: false,
      preferredAgents: [],
      workflowStyle: 'manual',
      notificationLevel: 'standard'
    },
    sessionData: {
      userId: user.id,
      sessionId: `session_${Date.now()}_${user.id}`,
      userRole,
      timestamp: new Date().toISOString(),
      agentHistory: []
    }
  };

  const recommendations = await analyzeHandoffOpportunities(handoffContext);

  return NextResponse.json({
    success: true,
    recommendations,
    count: recommendations.length,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle handoff execution
 */
async function handleExecuteHandoff(params: any, user: any, userRole: string) {
  const { recommendation, context, userConfirmation } = params;

  if (!recommendation || !context) {
    return NextResponse.json({
      success: false,
      error: 'Missing required parameters: recommendation, context'
    }, { status: 400 });
  }

  // Ensure context has user info
  context.sessionData = {
    ...context.sessionData,
    userId: user.id,
    userRole
  };

  const execution = await executeHandoff(recommendation, context, userConfirmation);

  return NextResponse.json({
    success: execution.executionStatus !== 'failed',
    execution,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle finding best handoff
 */
async function handleFindHandoff(params: any) {
  const { fromAgentId, userInput } = params;

  if (!fromAgentId || !userInput) {
    return NextResponse.json({
      success: false,
      error: 'Missing required parameters: fromAgentId, userInput'
    }, { status: 400 });
  }

  const handoff = findBestHandoff(fromAgentId, userInput);

  return NextResponse.json({
    success: true,
    handoff,
    found: !!handoff,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle getting agent chat capabilities
 */
async function handleGetChatCapabilities(agentId: string | null) {
  if (!agentId) {
    return NextResponse.json({
      success: false,
      error: 'Agent ID is required'
    }, { status: 400 });
  }

  try {
    const { getAgentConversationCapabilities } = await import('@/lib/agents/agentLeague');
    const capabilities = getAgentConversationCapabilities(agentId);
    
    if (!capabilities) {
      return NextResponse.json({
        success: false,
        error: `Agent not found or doesn't support chat: ${agentId}`
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      agentId,
      capabilities,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get chat capabilities',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

console.log('[AgentLeague API] Endpoint initialized - Ready to serve the league! 🚀'); 