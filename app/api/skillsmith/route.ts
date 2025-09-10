export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Rate limiting storage (in production, use Redis or similar)
const sessionLimits = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours
const GUEST_LIMIT = 8;

// Session tracking for guest users
function getSessionId(request: NextRequest): string {
  // Try to get session from headers or generate based on IP
  const sessionId = request.headers.get('x-session-id') || 
                   request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') ||
                   'anonymous';
  return sessionId;
}

function checkRateLimit(sessionId: string, isGuest: boolean): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const limit = isGuest ? GUEST_LIMIT : RATE_LIMIT_MAX;
  
  let sessionData = sessionLimits.get(sessionId);
  
  if (!sessionData || (now - sessionData.lastReset) > RATE_LIMIT_WINDOW) {
    sessionData = { count: 0, lastReset: now };
    sessionLimits.set(sessionId, sessionData);
  }
  
  const allowed = sessionData.count < limit;
  const remaining = Math.max(0, limit - sessionData.count);
  
  if (allowed) {
    sessionData.count++;
    sessionLimits.set(sessionId, sessionData);
  }
  
  return { allowed, remaining };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, isGuest = true } = body;

    if (!message) {
      return NextResponse.json({ 
        error: 'Message is required',
        success: false 
      }, { status: 400 });
    }

    // Check rate limiting
    const sessionId = getSessionId(request);
    const { allowed, remaining } = checkRateLimit(sessionId, isGuest);

    if (!allowed) {
      const limitMessage = isGuest 
        ? `You've reached the ${GUEST_LIMIT} free message limit. Sign up to continue chatting with Skill Smith!`
        : `You've reached the ${RATE_LIMIT_MAX} message limit for today. Please try again tomorrow.`;
        
      return NextResponse.json({
        error: limitMessage,
        success: false,
        rateLimited: true,
        remaining: 0,
        showSignupCTA: isGuest
      }, { status: 429 });
    }

    // Initialize OpenAI client
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[SkillSmith API] OpenAI API key not configured');
      return NextResponse.json({
        reply: "I'm having trouble connecting to my training systems right now. Please try again in a moment, or contact support if the issue persists.",
        success: true,
        remaining
      });
    }

    const openai = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    // Prepare messages with Skill Smith context
    const systemPrompt = `You are Skill Smith, an expert AI sports performance coach and trainer. You specialize in:

- Athletic performance analysis and improvement
- Sport-specific training techniques
- Injury prevention and recovery
- Mental performance and sports psychology  
- Nutrition for athletic performance
- Movement mechanics and biomechanics

Your personality:
- Encouraging and motivational but realistic
- Data-driven and scientific in approach
- Adaptable to all skill levels (youth to professional)
- Safety-first mindset
- Concise but comprehensive advice

Guidelines:
- Keep responses under 200 words unless detailed analysis is requested
- Always prioritize safety and proper form
- Ask clarifying questions when needed (age, sport, experience level)
- Provide actionable, specific advice
- Use encouraging language while being honest about challenges
- If asked about serious injuries, recommend consulting medical professionals

Current conversation context: Sports performance coaching session.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...(Array.isArray(context) ? context : []),
      { role: 'user' as const, content: message }
    ];

    // Call OpenAI with timeout and error handling
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 30000)
    );

    const completionPromise = openai.chat.completions.create({
      model,
      temperature: 0.7,
      max_tokens: 500,
      messages,
    });

    let completion;
    try {
      completion = await Promise.race([completionPromise, timeoutPromise]) as any;
    } catch (error) {
      console.error('[SkillSmith API] OpenAI request failed:', error);
      
      // Return fallback response
      return NextResponse.json({
        reply: "I'm experiencing some technical difficulties right now. Here's a quick tip while I get back online: Focus on proper warm-up before any workout - 5-10 minutes of dynamic movement can prevent injuries and improve performance. Try again in a moment!",
        success: true,
        remaining,
        fallback: true
      });
    }

    const reply = completion.choices?.[0]?.message?.content ?? 
                 "I'm having trouble processing that right now. Could you rephrase your question about training or performance?";

    return NextResponse.json({
      reply,
      success: true,
      remaining,
      model: model
    });

  } catch (error) {
    console.error('[SkillSmith API] Unexpected error:', error);
    
    return NextResponse.json({
      reply: "Something went wrong on my end. Let me get back to you with some solid training advice - in the meantime, remember that consistency beats intensity every time!",
      success: true,
      fallback: true
    }, { status: 200 }); // Return 200 to avoid breaking the UI
  }
}