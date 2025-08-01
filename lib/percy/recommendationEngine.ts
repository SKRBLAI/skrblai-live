import { ServiceSolution, businessSolutions, RecommendationContext } from '../config/services';

export interface PercyRecommendation {
  primaryService: ServiceSolution;
  reasoning: string;
  confidence: number;
  urgencyMessage?: string;
  followUpServices: ServiceSolution[];
  agentHandoffSuggestion?: {
    fromAgent: string;
    toAgent: string;
    reason: string;
  };
}

class PercyRecommendationEngine {
  private readonly CONFIDENCE_THRESHOLD = 0.7;

  /**
   * Analyzes user context and returns Percy's smart recommendation
   */
  async generateRecommendation(context: RecommendationContext): Promise<PercyRecommendation> {
    console.log('[Percy] Analyzing user context:', context);

    // Score each service based on context
    const scoredServices = businessSolutions.map(service => ({
      service,
      score: this.calculateServiceScore(service, context)
    }));

    // Sort by score (highest first)
    scoredServices.sort((a, b) => b.score - a.score);

    const primaryService = scoredServices[0].service;
    const confidence = scoredServices[0].score;

    // Generate reasoning
    const reasoning = this.generateReasoning(primaryService, context, confidence);

    // Get follow-up services (top 2-3 excluding primary)
    const followUpServices = scoredServices
      .slice(1, 4)
      .filter(s => s.score > 0.3)
      .map(s => s.service);

    // Generate urgency message if applicable
    const urgencyMessage = this.generateUrgencyMessage(primaryService, context);

    // Suggest agent handoff if relevant
    const agentHandoffSuggestion = this.generateAgentHandoff(primaryService, context);

    return {
      primaryService,
      reasoning,
      confidence,
      urgencyMessage,
      followUpServices,
      agentHandoffSuggestion
    };
  }

  private calculateServiceScore(service: ServiceSolution, context: RecommendationContext): number {
    let score = 0.1; // Base score

    // History matching
    if (context.userHistory?.length) {
      const historyMatches = service.personalization.tags.filter(tag =>
        context.userHistory?.some(h => h.toLowerCase().includes(tag))
      ).length;
      score += historyMatches * 0.15;
    }

    // Current selection context
    if (context.currentSelection) {
      const currentLower = context.currentSelection.toLowerCase();
      
      // Direct problem match
      if (service.problem.toLowerCase().includes(currentLower) || 
          currentLower.includes(service.problem.toLowerCase())) {
        score += 0.4;
      }

      // Tag relevance
      const tagMatches = service.personalization.tags.filter(tag =>
        currentLower.includes(tag) || tag.includes(currentLower)
      ).length;
      score += tagMatches * 0.1;
    }

    // Urgency level matching
    if (context.urgencyLevel) {
      const urgencyBonus = {
        'critical': 0.3,
        'high': 0.2,
        'medium': 0.1,
        'low': 0.05
      };
      
      if (service.urgencyLevel === context.urgencyLevel) {
        score += urgencyBonus[context.urgencyLevel];
      }
    }

    // Business type matching
    if (context.businessType) {
      const businessFit = service.personalization.industryFit.includes('any') ||
        service.personalization.industryFit.includes(context.businessType);
      
      if (businessFit) {
        score += 0.15;
      }
    }

    // Recent engagement boost
    if (context.previousEngagement?.length) {
      const recentEngagement = context.previousEngagement.find(e => 
        e.serviceId === service.id && 
        Date.now() - e.timestamp < 24 * 60 * 60 * 1000 // 24 hours
      );
      
      if (recentEngagement) {
        score += recentEngagement.action === 'clicked' ? 0.2 : 0.1;
      }
    }

    // Success rate bonus (higher success rate = higher recommendation confidence)
    score += (service.metrics.successRate / 100) * 0.1;

    return Math.min(score, 1.0); // Cap at 1.0
  }

  private generateReasoning(service: ServiceSolution, context: RecommendationContext, confidence: number): string {
    const reasoningTemplates = {
      high: [
        `Based on what you've shared, **${service.problem}** is clearly your biggest bottleneck. I've seen this exact pattern ${service.liveActivity.users} times this week.`,
        `Your situation screams **${service.problem}** - and I have the perfect solution that's already helped ${service.metrics.successRate}% of businesses in your position.`,
        `This is a no-brainer recommendation. **${service.problem}** is exactly what's holding you back, and our ${service.agents.join(' + ')} team can solve it in ${service.metrics.timeToResults}.`
      ],
      medium: [
        `I'm ${Math.round(confidence * 100)}% confident that **${service.problem}** is your primary challenge. Here's why this solution fits perfectly...`,
        `Based on your context, **${service.problem}** stands out as the most impactful area to address first.`,
        `My analysis points to **${service.problem}** as your highest-leverage opportunity for growth.`
      ],
      low: [
        `While I need more context to be certain, **${service.problem}** seems like a strong starting point for your business.`,
        `**${service.problem}** could be the key to unlocking your next growth phase.`,
        `I'd recommend exploring **${service.problem}** as a potential high-impact area.`
      ]
    };

    const confidenceLevel = confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low';
    const templates = reasoningTemplates[confidenceLevel];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateUrgencyMessage(service: ServiceSolution, context: RecommendationContext): string | undefined {
    if (service.urgencyLevel === 'critical' || context.urgencyLevel === 'critical') {
      return `⚡ **URGENT**: This issue is costing you money every day. ${service.liveActivity.users} businesses are already solving this problem this week.`;
    }

    if (service.urgencyLevel === 'high' || context.urgencyLevel === 'high') {
      return `🔥 **HIGH PRIORITY**: The longer you wait, the harder this becomes. Only ${Math.floor(Math.random() * 15) + 5} spots left this month.`;
    }

    if (service.liveActivity.users > 50) {
      return `📈 **TRENDING**: ${service.liveActivity.users} businesses are tackling this exact challenge right now.`;
    }

    return undefined;
  }

  private generateAgentHandoff(service: ServiceSolution, context: RecommendationContext): PercyRecommendation['agentHandoffSuggestion'] {
    if (!service.agentSuggested.length) return undefined;

    const primaryAgent = service.agentSuggested[0];
    const secondaryAgent = service.agentSuggested[1];

    if (primaryAgent && secondaryAgent) {
      return {
        fromAgent: primaryAgent,
        toAgent: secondaryAgent,
        reason: `Start with ${primaryAgent} for immediate impact, then ${secondaryAgent} will amplify the results.`
      };
    }

    return undefined;
  }

  /**
   * Get real-time recommendation based on current page/interaction
   */
  async getInstantRecommendation(trigger: string, userContext?: Partial<RecommendationContext>): Promise<PercyRecommendation> {
    const context: RecommendationContext = {
      currentSelection: trigger,
      urgencyLevel: 'medium',
      ...userContext
    };

    return this.generateRecommendation(context);
  }

  /**
   * Get multiple recommendations for comparison
   */
  async getRecommendationSet(context: RecommendationContext, count: number = 3): Promise<PercyRecommendation[]> {
    const recommendations: PercyRecommendation[] = [];
    
    for (let i = 0; i < count; i++) {
      const rec = await this.generateRecommendation(context);
      recommendations.push(rec);
      
      // Remove the recommended service from future recommendations
      const usedServiceIds = recommendations.map(r => r.primaryService.id);
      // You could filter businessSolutions here to avoid duplicates
    }

    return recommendations;
  }
}

// Export singleton instance
export const percyRecommendationEngine = new PercyRecommendationEngine();

// Convenience function for quick recommendations
export async function getPercyRecommendation(
  trigger: string, 
  userContext?: Partial<RecommendationContext>
): Promise<PercyRecommendation> {
  return percyRecommendationEngine.getInstantRecommendation(trigger, userContext);
}

// Percy's dynamic messaging templates
export const percyMessages = {
  greeting: [
    "🚀 **Perfect timing!** I've analyzed your situation and found exactly what you need...",
    "⚡ **This is exciting!** Based on what you've shared, I have the perfect solution...",
    "🎯 **Bingo!** I can see exactly what's holding your business back..."
  ],
  confidence: {
    high: "I'm **absolutely certain** this is your best path forward.",
    medium: "This has a **strong probability** of being your game-changer.",
    low: "This could be a **solid starting point** for your growth."
  },
  urgency: {
    critical: "⚠️ **This can't wait.** Every day costs you potential revenue.",
    high: "🔥 **Strike while the iron is hot.** This opportunity won't last.",
    medium: "📈 **Good timing to act.** Momentum is building in this area.",
    low: "💡 **Worth considering** when you're ready to make this move."
  }
};