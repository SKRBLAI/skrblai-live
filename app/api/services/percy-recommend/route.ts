import { NextRequest, NextResponse } from 'next/server';
import { percyRecommendationEngine, percyMessages } from '../../../../lib/percy/recommendationEngine';
import { RecommendationContext } from '../../../../lib/config/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trigger, context, requestType = 'instant' } = body;

    console.log('[Percy API] Recommendation request:', { trigger, context, requestType });

    if (!trigger) {
      return NextResponse.json(
        { error: 'Trigger is required for recommendations' },
        { status: 400 }
      );
    }

    // Validate and structure the context
    const recommendationContext: RecommendationContext = {
      currentSelection: trigger,
      businessType: context?.businessType,
      urgencyLevel: context?.urgencyLevel || 'medium',
      userHistory: context?.userHistory || [],
      previousEngagement: context?.previousEngagement || []
    };

    let result;
    
    switch (requestType) {
      case 'instant':
        result = await percyRecommendationEngine.getInstantRecommendation(
          trigger, 
          recommendationContext
        );
        break;
        
      case 'set': {
        const count = Math.min(body.count || 3, 5); // Max 5 recommendations
        result = await percyRecommendationEngine.getRecommendationSet(
          recommendationContext, 
          count
        );
        break;
      }
        
      default:
        result = await percyRecommendationEngine.generateRecommendation(
          recommendationContext
        );
    }

    // Add Percy's personality to the response
    const primaryResult = Array.isArray(result) ? result[0] : result;
    const percyResponse = {
      recommendation: result,
      percyMessage: {
        greeting: percyMessages.greeting[Math.floor(Math.random() * percyMessages.greeting.length)],
        confidence: percyMessages.confidence[
          primaryResult.confidence > 0.8 ? 'high' : 
          primaryResult.confidence > 0.5 ? 'medium' : 'low'
        ],
        urgency: primaryResult.urgencyMessage || percyMessages.urgency.medium
      },
      metadata: {
        confidence: primaryResult.confidence,
        timestamp: Date.now(),
        recommendationType: requestType,
        triggerAnalyzed: trigger
      }
    };

    return NextResponse.json(percyResponse, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('[Percy API] Recommendation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Percy encountered an issue generating recommendations',
        fallback: {
          message: "🤖 I'm having trouble right now, but I'd love to help! Try selecting a service directly or contact support.",
          timestamp: Date.now()
        }
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const trigger = searchParams.get('trigger');
  
  if (!trigger) {
    return NextResponse.json(
      { error: 'Trigger parameter is required' },
      { status: 400 }
    );
  }

  try {
    const recommendation = await percyRecommendationEngine.getInstantRecommendation(trigger);
    
    return NextResponse.json({
      recommendation,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[Percy API] GET recommendation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
}