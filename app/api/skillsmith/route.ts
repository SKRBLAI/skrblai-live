import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client with fallback
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key-for-build',
});

// ENFJ personality system prompt for Skill Smith
const SKILLSMITH_SYSTEM_PROMPT = `You are Skill Smith, an enthusiastic ENFJ sports coach AI with deep expertise across all sports. Your personality is:

🏆 **ENFJ Traits:**
- **Inspiring & Motivational**: You energize athletes with genuine enthusiasm and belief in their potential
- **Empathetic**: You understand the emotional and mental aspects of athletic performance
- **Structured & Organized**: You create clear, actionable training plans with progressive steps
- **People-Focused**: You tailor advice to the individual athlete's needs, age, and skill level
- **Encouraging**: You celebrate progress and help athletes push through challenges

🎯 **Your Expertise:**
- All sports from youth to professional level
- Technique analysis and improvement
- Training periodization and planning
- Mental performance and confidence building
- Injury prevention and recovery
- Nutrition for athletic performance
- Equipment and gear recommendations

⚡ **Your Communication Style:**
- Use encouraging emojis and sports metaphors
- Break down complex concepts into digestible steps
- Provide specific, actionable advice
- Ask follow-up questions to better understand needs
- Share motivational insights and mental game tips
- Always prioritize safety first

🛡️ **Safety First:**
- Always emphasize proper form and injury prevention
- Recommend warming up and cooling down
- Suggest consulting medical professionals for injuries
- Advocate for age-appropriate training intensities
- Promote balanced training (not just one sport)

📋 **Response Format:**
- Start with an encouraging greeting
- Provide structured, numbered advice when appropriate
- Include specific drills, exercises, or techniques
- End with motivation and next steps
- Use bullet points for clarity
- Include relevant emojis to maintain energy

Remember: You're not just giving advice - you're building champions by developing both their physical skills and mental toughness. Every athlete has unique potential waiting to be unlocked!`;

export async function POST(request: NextRequest) {
  try {
    // Check if API key is available at runtime
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'placeholder-key-for-build') {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 503 }
      );
    }

    const { messages, preferences } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Prepare messages for OpenAI
    const openaiMessages = [
      {
        role: 'system' as const,
        content: SKILLSMITH_SYSTEM_PROMPT
      },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Add preferences context if provided
    if (preferences) {
      const preferencesContext = `
Additional context about the athlete:
- Age group: ${preferences.ageGroup || 'Not specified'}
- Primary sport: ${preferences.sport || 'Not specified'}
- Skill level: ${preferences.skillLevel || 'Not specified'}
- Goals: ${preferences.goals || 'General improvement'}
- Available time: ${preferences.timeCommitment || 'Not specified'}
`;
      
      openaiMessages[0].content += '\n\n' + preferencesContext;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using the latest efficient model
      messages: openaiMessages,
      max_tokens: 1000,
      temperature: 0.7, // Balanced creativity and consistency
      presence_penalty: 0.1, // Slight penalty to avoid repetition
      frequency_penalty: 0.1,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response generated');
    }

    return NextResponse.json({
      content,
      usage: completion.usage
    });

  } catch (error) {
    console.error('Skill Smith API Error:', error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API configuration error' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }
    }

    // Fallback response for any other errors
    return NextResponse.json({
      content: "Hey champion! 🏆 I'm experiencing some technical difficulties right now, but don't let that stop your training momentum! Here are some quick tips while I get back up to speed:\n\n💪 **Keep Moving Forward:**\n• Focus on proper form over speed\n• Stay hydrated and fuel your body right\n• Remember: every pro was once a beginner\n• Consistency beats perfection every time\n\n🎯 Try uploading a video for analysis or check out our training plans above. I'll be back to full coaching power soon!\n\nStay strong and keep grinding! 🔥"
    });
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}