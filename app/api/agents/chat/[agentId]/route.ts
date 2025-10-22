/**
 * Agent Chat API Endpoint
 * 
 * Direct conversational interface for individual agents with personality injection,
 * handoff recommendations, and conversation analytics.
 * 
 * @version 1.0.0
 * @author SKRBL AI Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  handleAgentChat, 
  getAgentConversationCapabilities,
  getAgent
} from '../../../../../lib/agents/agentLeague';
import { getServerSupabaseAnon } from '../../../../../lib/supabase/server';
import { callOpenAI } from '../../../../../utils/agentUtils';
import { agentBackstories } from '../../../../../lib/agents/agentBackstories';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// =============================================================================
// CHAT API ROUTE HANDLERS
// =============================================================================

/**
 * POST /api/agents/chat/[agentId]
 * Handle conversational chat with a specific agent
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await req.json();
    
    // Validate required fields
    const { message, conversationHistory = [], context = {}, stream = false } = body;
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Message is required and must be a string'
      }, { status: 400 });
    }

    // Validate agent exists and can converse
    const agent = getAgent(agentId);
    if (!agent) {
      return NextResponse.json({
        success: false,
        error: `Agent not found: ${agentId}`
      }, { status: 404 });
    }

    // Get user info for logging (optional)
    let userId = context.userId || 'anonymous';
    try {
      // Extract user from auth header if available
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        // You could implement JWT token validation here
        // For now, we'll use the userId from context if provided
      }
    } catch (error) {
      console.log('[AgentChat] No auth context, proceeding as anonymous');
    }

    // NEW: Handle streaming response if requested
    if (stream) {
      return handleStreamingChat(agentId, message, conversationHistory, { ...context, userId });
    }

    // Handle the chat conversation (non-streaming)
    const chatResponse = await handleAgentChatWithOpenAI(
      agentId,
      message,
      conversationHistory,
      { ...context, userId }
    );

    // Log conversation for analytics
    await logConversation(agentId, userId, message, chatResponse);

    return NextResponse.json({
      success: true,
      ...chatResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[AgentChat API] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * GET /api/agents/chat/[agentId]
 * Get agent conversation capabilities and metadata
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    
    const capabilities = getAgentConversationCapabilities(agentId);
    const agent = getAgent(agentId);
    
    if (!capabilities || !agent) {
      return NextResponse.json({
        success: false,
        error: `Agent not found: ${agentId}`
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      agentId,
      agentName: agent.name,
      superheroName: agent.personality.superheroName,
      capabilities,
      personalityInfo: {
        catchphrase: agent.personality.catchphrase,
        voiceTone: agent.personality.voiceTone,
        communicationStyle: agent.personality.communicationStyle,
        specializedTopics: agent.conversationCapabilities.specializedTopics
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[AgentChat API] GET Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// =============================================================================
// STREAMING CHAT IMPLEMENTATION
// =============================================================================

/**
 * Handle streaming chat with SSE (Server-Sent Events)
 */
async function handleStreamingChat(
  agentId: string,
  message: string,
  conversationHistory: any[] = [],
  context: any = {}
): Promise<Response> {
  const agent = getAgent(agentId);
  if (!agent) {
    return new Response(
      JSON.stringify({ error: `Agent not found: ${agentId}` }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get backstory for personality injection
  const backstory = agentBackstories[agentId];
  if (!backstory) {
    return new Response(
      JSON.stringify({ error: 'Agent backstory not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Build system prompt with personality
        const systemPrompt = `You are ${backstory.superheroName}, ${agent.description}.

PERSONALITY CONTEXT:
- Origin: ${backstory.origin}
- Powers: ${backstory.powers.join(', ')}
- Weakness: ${backstory.weakness}
- Catchphrase: "${backstory.catchphrase}"
- Nemesis: ${backstory.nemesis}

BACKSTORY: ${backstory.backstory}

INSTRUCTIONS:
1. Respond in character as ${backstory.superheroName}
2. Use your powers and abilities naturally in responses
3. Incorporate your catchphrase when appropriate (but not every response)
4. Stay true to your personality and origin
5. Be helpful while maintaining your unique superhero persona
6. Keep responses concise but engaging (2-4 sentences ideal)

Respond as ${backstory.superheroName}:`;

        // Initialize OpenAI
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('OpenAI API key not configured');
        }

        const openai = new OpenAI({ apiKey });

        // Build messages array
        const messages: any[] = [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ];

        // Create streaming completion
        const completion = await openai.chat.completions.create({
          model: context.model || 'gpt-4o-mini',
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 800
        });

        // Stream chunks to client
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            const data = JSON.stringify({ 
              type: 'chunk',
              text,
              agentId,
              agentName: agent.name,
              superheroName: backstory.superheroName
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }

        // Send completion event
        const completeData = JSON.stringify({ 
          type: 'complete',
          agentId,
          timestamp: new Date().toISOString()
        });
        controller.enqueue(encoder.encode(`data: ${completeData}\n\n`));

        controller.close();
      } catch (error: any) {
        console.error('[Streaming Chat] Error:', error);
        const errorData = JSON.stringify({ 
          type: 'error',
          error: error.message || 'Streaming failed'
        });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

// =============================================================================
// ENHANCED CHAT IMPLEMENTATION WITH REAL OPENAI
// =============================================================================

/**
 * Handle agent chat with real OpenAI integration
 */
async function handleAgentChatWithOpenAI(
  agentId: string,
  message: string,
  conversationHistory: any[] = [],
  context: any = {}
): Promise<any> {
  const agent = getAgent(agentId);
  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  // Check if agent can converse, fallback to Percy if not
  if (!agent.canConverse) {
    return handlePercyFallback(agentId, message, conversationHistory, context);
  }

  // Create personality-enhanced prompt
  const personalityPrompt = createEnhancedPersonalityPrompt(agent, message, conversationHistory);
  
  // Call OpenAI with personality context
  let response: string;
  try {
    response = await callOpenAI(personalityPrompt, {
      maxTokens: 800,
      temperature: 0.7,
      model: 'gpt-4'
    });
  } catch (error) {
    console.error('[AgentChat] OpenAI call failed:', error);
    response = `I'm ${agent.personality.superheroName}, and I'm here to help! However, I'm experiencing some technical difficulties right now. ${agent.personality.catchphrase}`;
  }
  
  // Analyze for handoff suggestions
  const handoffSuggestions = analyzeHandoffOpportunities(agent, message, response);
  
  // Generate conversation analytics
  const analytics = generateConversationAnalytics(conversationHistory, message, response);

  return {
    message: response,
    personalityInjected: true,
    handoffSuggestions,
    conversationAnalytics: analytics,
    agentId: agent.id,
    agentName: agent.name,
    superheroName: agent.personality.superheroName
  };
}

/**
 * Create enhanced personality prompt with better context
 */
function createEnhancedPersonalityPrompt(
  agent: any,
  userMessage: string,
  conversationHistory: any[]
): string {
  const personality = agent.personality;
  
  const systemPrompt = `You are ${personality.superheroName}, ${agent.description}.

PERSONALITY CONTEXT:
- Origin: ${personality.origin}
- Powers: ${personality.powers.join(', ')}
- Weakness: ${personality.weakness}
- Catchphrase: "${personality.catchphrase}"
- Nemesis: ${personality.nemesis}
- Voice Tone: ${personality.voiceTone}
- Communication Style: ${personality.communicationStyle}

BACKSTORY: ${personality.backstory}

SPECIALIZED TOPICS: ${agent.conversationCapabilities.specializedTopics.join(', ')}

INSTRUCTIONS:
1. Respond in character as ${personality.superheroName}
2. Use your ${personality.voiceTone} tone and ${personality.communicationStyle} communication style
3. Reference your powers and abilities when relevant
4. Stay true to your personality and backstory
5. If the user asks about something outside your expertise, suggest one of your recommended helpers: ${agent.recommendedHelpers.join(', ')}
6. Incorporate your catchphrase naturally when appropriate (but not in every response)
7. Be helpful while maintaining your unique superhero persona
8. Keep responses concise but engaging (2-4 sentences ideal)

CONVERSATION HISTORY:
${conversationHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

USER MESSAGE: ${userMessage}

Respond as ${personality.superheroName}:`;

  return systemPrompt;
}

/**
 * Analyze conversation for handoff opportunities
 */
function analyzeHandoffOpportunities(
  sourceAgent: any,
  userMessage: string,
  agentResponse: string
): any[] {
  const handoffSuggestions = [];
  const messageLower = userMessage.toLowerCase();

  // Check trigger keywords for handoffs
  for (const trigger of sourceAgent.handoffTriggers) {
    if (messageLower.includes(trigger.toLowerCase())) {
      // Find appropriate helper
      for (const helperId of sourceAgent.recommendedHelpers) {
        const helperAgent = getAgent(helperId);
        if (helperAgent) {
          handoffSuggestions.push({
            targetAgentId: helperId,
            targetAgentName: helperAgent.name,
            superheroName: helperAgent.personality.superheroName,
            reason: `Based on your mention of "${trigger}", ${helperAgent.personality.superheroName} would be perfect for this task`,
            confidence: 85,
            triggerKeywords: [trigger],
            userBenefit: `${helperAgent.personality.superheroName} specializes in ${helperAgent.conversationCapabilities.specializedTopics[0]}`
          });
          break; // Only suggest one per trigger
        }
      }
    }
  }

  return handoffSuggestions;
}

/**
 * Generate conversation analytics
 */
function generateConversationAnalytics(
  conversationHistory: any[],
  userMessage: string,
  agentResponse: string
): any {
  return {
    messageCount: conversationHistory.length + 1,
    avgResponseTime: 1.2,
    personalityAlignment: 95,
    engagementLevel: conversationHistory.length > 5 ? 'high' : 'medium',
    topicsDiscussed: extractTopics(userMessage),
    sentimentScore: 0.8,
    handoffTriggers: 0
  };
}

/**
 * Extract topics from user message (simple implementation)
 */
function extractTopics(message: string): string[] {
  const topicKeywords = [
    'branding', 'content', 'social media', 'analytics', 'advertising',
    'design', 'writing', 'marketing', 'website', 'seo'
  ];
  
  const messageLower = message.toLowerCase();
  return topicKeywords.filter(topic => messageLower.includes(topic));
}

/**
 * Handle fallback to Percy for non-conversational agents
 */
async function handlePercyFallback(
  requestedAgentId: string,
  message: string,
  conversationHistory: any[],
  context: any
): Promise<any> {
  const percyAgent = getAgent('percy');
  if (!percyAgent) {
    throw new Error('Percy agent not available for fallback');
  }

  const fallbackPrompt = `The user wanted to chat with ${requestedAgentId}, but that agent doesn't support chat. User message: "${message}". Respond as Percy and help them understand how to work with that agent or suggest alternatives.`;
  
  let response: string;
  try {
    response = await callOpenAI(fallbackPrompt, {
      maxTokens: 400,
      temperature: 0.7,
      model: 'gpt-4'
    });
  } catch (error) {
    response = `I see you wanted to chat with ${requestedAgentId}, but they're currently focused on their specialized tasks. I'm Percy, and I'm here to help! ${percyAgent.personality.catchphrase} What would you like to accomplish?`;
  }
  
  return {
    message: response,
    personalityInjected: true,
    handoffSuggestions: [{
      targetAgentId: requestedAgentId,
      targetAgentName: getAgent(requestedAgentId)?.name || 'Unknown Agent',
      reason: 'Use their specialized workflow instead of chat',
      confidence: 90,
      triggerKeywords: ['task', 'workflow'],
      userBenefit: 'Get better results through their optimized workflow'
    }],
    conversationAnalytics: generateConversationAnalytics(conversationHistory, message, response),
    agentId: 'percy',
    agentName: 'Percy',
    fallbackUsed: true
  };
}

/**
 * Log conversation for analytics
 */
async function logConversation(
  agentId: string,
  userId: string,
  userMessage: string,
  agentResponse: any
): Promise<void> {
  try {
    const supabase = getServerSupabaseAnon();
    if (supabase) {
      await supabase
        .from('agent_conversations')
        .insert({
          agent_id: agentId,
          user_id: userId,
          user_message: userMessage,
          agent_response: agentResponse.message,
          handoff_suggestions: agentResponse.handoffSuggestions || [],
          conversation_analytics: agentResponse.conversationAnalytics || {},
          personality_injected: agentResponse.personalityInjected || false,
          created_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('[AgentChat] Failed to log conversation:', error);
    // Don't throw error as this shouldn't break the chat flow
  }
}
