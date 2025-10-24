/**
 * Percy Streaming Chat API
 *
 * Provides streaming conversational responses from Percy using Claude AI.
 * Supports context-aware recommendations, onboarding guidance, and natural conversation.
 *
 * POST /api/percy/chat
 * - Streaming SSE response
 * - Context-aware (knows about user's business, previous interactions)
 * - Can trigger recommendations mid-conversation
 */

import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getOptionalServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const PERCY_SYSTEM_PROMPT = `You are Percy, an AI business advisor and recommendation engine for SKRBL AI.

Your personality:
- Friendly, enthusiastic, and genuinely excited to help businesses succeed
- Direct and actionable - you give specific, practical advice
- You understand business pain points deeply
- You're knowledgeable about all SKRBL AI agents and services
- You use emojis sparingly but effectively

Your capabilities:
1. Analyze business problems and recommend the right SKRBL AI services
2. Guide users through onboarding and setup
3. Explain what each AI agent does and when to use them
4. Help users understand their business metrics and opportunities
5. Provide strategic advice on growth, marketing, and automation

SKRBL AI Services (you can recommend these):
- **Revenue Analytics** - Track revenue, ARR, MRR, conversion funnels
- **Ad Creative** - Generate high-converting ad copy and visuals
- **Social Media** - Automated social media management and content
- **Branding** - Build brand identity, messaging, visual assets
- **Content Creation** - Blog posts, articles, SEO content
- **Publishing** - Turn content into books, courses, guides
- **Video Production** - Create engaging video content
- **Sync & Automation** - Connect tools, automate workflows
- **Business Strategy** - Data-driven strategic planning
- **Proposals** - Generate winning client proposals
- **Client Success** - Manage client relationships and renewals
- **Website Builder** - Build and optimize websites

Common business problems you solve:
- Revenue stalling → Analytics + Ad Creative
- Brand confusion → Branding + Content Creation
- Manual overwhelm → Sync + Automation
- Content drought → Content Creation + Social Media
- No authority → Publishing + Content Creation
- Sales chaos → Proposals + Client Success

Response format:
- Keep responses concise (2-4 sentences unless asked for detail)
- Ask clarifying questions when needed
- Suggest specific agents/services by name
- End with a clear call-to-action when appropriate

Important rules:
- NEVER make up information about services or capabilities
- If you're unsure, ask the user for clarification
- Focus on business outcomes, not technical jargon
- Be honest if SKRBL AI might not be the right fit`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [], context = {} } = await request.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate auth
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const supabase = getOptionalServerSupabase();
    let userId: string | null = null;

    if (supabase && token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Build conversation context
    const contextString = Object.keys(context).length > 0
      ? `\n\nCurrent context:\n${JSON.stringify(context, null, 2)}`
      : '';

    // Build messages array for Claude
    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'percy' ? 'assistant' : 'user',
        content: msg.content,
      })),
      {
        role: 'user',
        content: message + contextString,
      },
    ];

    console.log('[Percy Chat] Streaming response for:', { userId, messagePreview: message.slice(0, 50) });

    // Create streaming response
    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      temperature: 0.7,
      system: PERCY_SYSTEM_PROMPT,
      messages,
    });

    // Convert Anthropic stream to SSE format
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text;

              // Send as SSE
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`)
              );
            }
          }

          // Send completion event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          );

          controller.close();
        } catch (error: any) {
          console.error('[Percy Chat] Stream error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[Percy Chat] Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to generate Percy response',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
