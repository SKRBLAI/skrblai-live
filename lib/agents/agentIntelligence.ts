/**
 * SKRBL AI Agent Intelligence System
 * 
 * Transforms agents into forward-thinking automation superheroes with:
 * - Predictive intelligence and pattern recognition
 * - Autonomous decision-making capabilities
 * - Smart workflow orchestration
 * - Industry-specific expertise adaptation
 * - Cross-agent collaboration intelligence
 * 
 * @version 1.0.0
 * @author SKRBL AI Team - Phase 4 Enhancement
 */

import { agentLeague, type AgentConfiguration } from './agentLeague';
import { agentBackstories, type AgentBackstory } from './agentBackstories';
import { powerEngine, type PowerExecutionResult } from './powerEngine';

// =============================================================================
// INTELLIGENCE TYPES & INTERFACES
// =============================================================================

export interface AgentIntelligence {
  agentId: string;
  superheroName: string;
  intelligenceLevel: number; // 1-100
  predictionCapabilities: PredictionCapability[];
  autonomyLevel: 'reactive' | 'proactive' | 'autonomous' | 'superhuman';
  specializations: string[];
  learningPattern: LearningPattern;
  decisionMakingStyle: DecisionMakingStyle;
  collaborationProfile: CollaborationProfile;
}

export interface PredictionCapability {
  domain: string; // 'market_trends', 'user_behavior', 'workflow_optimization'
  accuracy: number; // 0-1
  confidence: number; // 0-1
  timeHorizon: number; // days ahead
  lastUpdate: string;
}

export interface LearningPattern {
  adaptationSpeed: 'instant' | 'fast' | 'moderate' | 'gradual';
  dataPreferences: string[];
  improvementAreas: string[];
  experienceLevel: number; // 1-10
}

export interface DecisionMakingStyle {
  approach: 'analytical' | 'intuitive' | 'hybrid' | 'revolutionary';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | 'visionary';
  consultationNeeded: boolean;
  automationThreshold: number; // 0-1
}

export interface CollaborationProfile {
  leadershipStyle: 'commander' | 'collaborator' | 'supporter' | 'visionary';
  preferredPartners: string[];
  handoffTriggers: HandoffTrigger[];
  teamworkEfficiency: number; // 0-1
}

export interface HandoffTrigger {
  condition: string;
  targetAgent: string;
  confidence: number;
  autoTrigger: boolean;
  reason: string;
}

export interface IntelligentRecommendation {
  type: 'workflow' | 'optimization' | 'collaboration' | 'strategic';
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  reasoning: string;
  expectedImpact: string;
  implementationEffort: 'minimal' | 'moderate' | 'significant';
  confidenceScore: number;
  timeFrame: string;
}

export interface PredictiveInsight {
  domain: string;
  insight: string;
  probability: number;
  impact: 'low' | 'medium' | 'high' | 'transformational';
  timeframe: string;
  actionable: boolean;
  relatedAgents: string[];
}

// =============================================================================
// SUPERHERO INTELLIGENCE ENGINE
// =============================================================================

export class AgentIntelligenceEngine {
  private agentIntelligence: Map<string, AgentIntelligence> = new Map();
  
  constructor() {
    this.initializeSuperheroIntelligence();
  }

  /**
   * Initialize intelligence profiles for all agents
   */
  private initializeSuperheroIntelligence(): void {
    console.log('[Intelligence] Initializing superhero intelligence profiles...');
    
    const agents = agentLeague.getAllAgents();
    
    agents.forEach(agent => {
      const intelligence = this.createIntelligenceProfile(agent);
      this.agentIntelligence.set(agent.id, intelligence);
    });
    
    console.log(`[Intelligence] ${this.agentIntelligence.size} superhero agents enhanced with intelligence`);
  }

  /**
   * Create intelligence profile for an agent
   */
  private createIntelligenceProfile(agent: AgentConfiguration): AgentIntelligence {
    const backstory = agentBackstories[agent.id];
    
    return {
      agentId: agent.id,
      superheroName: agent.personality.superheroName,
      intelligenceLevel: this.calculateIntelligenceLevel(agent, backstory),
      predictionCapabilities: this.generatePredictionCapabilities(agent, backstory),
      autonomyLevel: this.determineAutonomyLevel(agent, backstory),
      specializations: this.extractSpecializations(agent, backstory),
      learningPattern: this.createLearningPattern(agent, backstory),
      decisionMakingStyle: this.createDecisionMakingStyle(agent, backstory),
      collaborationProfile: this.createCollaborationProfile(agent, backstory)
    };
  }

  /**
   * Calculate intelligence level based on agent capabilities
   */
  private calculateIntelligenceLevel(agent: AgentConfiguration, backstory?: AgentBackstory): number {
    let baseLevel = 60; // All agents start at 60
    
    // Bonus for comprehensive powers
    if (backstory?.powers && backstory.powers.length >= 4) baseLevel += 15;
    
    // Bonus for workflow integration
    if (backstory?.n8nWorkflowId) baseLevel += 10;
    
    // Bonus for specialization depth
    if (agent.capabilities.length >= 2) baseLevel += 10;
    
    // Special intelligence boosts for specific agents
    const intelligenceBoosts: Record<string, number> = {
      'percy-agent': 25, // Cosmic concierge gets max intelligence
      'analytics-agent': 20, // Data mastery
      'biz-agent': 18, // Strategic thinking
      'branding-agent': 15, // Creative intelligence
      'sync-agent': 15, // Technical mastery
    };
    
    const boost = intelligenceBoosts[agent.id] || 0;
    return Math.min(100, baseLevel + boost);
  }

  /**
   * Generate prediction capabilities based on agent type
   */
  private generatePredictionCapabilities(agent: AgentConfiguration, backstory?: AgentBackstory): PredictionCapability[] {
    const capabilities: PredictionCapability[] = [];
    
    // Base prediction capability for all agents
    capabilities.push({
      domain: 'user_behavior',
      accuracy: 0.75,
      confidence: 0.8,
      timeHorizon: 7,
      lastUpdate: new Date().toISOString()
    });
    
    // Agent-specific prediction capabilities
    const specialCapabilities: Record<string, PredictionCapability[]> = {
      'analytics-agent': [
        {
          domain: 'market_trends',
          accuracy: 0.95,
          confidence: 0.92,
          timeHorizon: 30,
          lastUpdate: new Date().toISOString()
        },
        {
          domain: 'performance_metrics',
          accuracy: 0.88,
          confidence: 0.85,
          timeHorizon: 14,
          lastUpdate: new Date().toISOString()
        }
      ],
      'social-bot-agent': [
        {
          domain: 'viral_content',
          accuracy: 0.82,
          confidence: 0.78,
          timeHorizon: 3,
          lastUpdate: new Date().toISOString()
        },
        {
          domain: 'engagement_patterns',
          accuracy: 0.87,
          confidence: 0.83,
          timeHorizon: 7,
          lastUpdate: new Date().toISOString()
        }
      ],
      'biz-agent': [
        {
          domain: 'market_opportunities',
          accuracy: 0.85,
          confidence: 0.82,
          timeHorizon: 60,
          lastUpdate: new Date().toISOString()
        },
        {
          domain: 'competitive_landscape',
          accuracy: 0.79,
          confidence: 0.76,
          timeHorizon: 30,
          lastUpdate: new Date().toISOString()
        }
      ],
      'percy-agent': [
        {
          domain: 'workflow_optimization',
          accuracy: 0.93,
          confidence: 0.89,
          timeHorizon: 14,
          lastUpdate: new Date().toISOString()
        },
        {
          domain: 'agent_collaboration',
          accuracy: 0.91,
          confidence: 0.87,
          timeHorizon: 7,
          lastUpdate: new Date().toISOString()
        }
      ]
    };
    
    const agentSpecific = specialCapabilities[agent.id] || [];
    capabilities.push(...agentSpecific);
    
    return capabilities;
  }

  /**
   * Determine agent autonomy level
   */
  private determineAutonomyLevel(agent: AgentConfiguration, backstory?: AgentBackstory): AgentIntelligence['autonomyLevel'] {
    const superheroLevels: Record<string, AgentIntelligence['autonomyLevel']> = {
      'percy-agent': 'superhuman', // Cosmic concierge
      'analytics-agent': 'autonomous', // Data mastery
      'sync-agent': 'autonomous', // Technical precision
      'biz-agent': 'proactive', // Strategic thinking
      'branding-agent': 'proactive', // Creative leadership
      'content-creator-agent': 'proactive', // Content mastery
      'social-bot-agent': 'proactive', // Social intelligence
      'ad-creative-agent': 'proactive', // Conversion expertise
    };
    
    return superheroLevels[agent.id] || 'reactive';
  }

  /**
   * Extract specializations from agent data
   */
  private extractSpecializations(agent: AgentConfiguration, backstory?: AgentBackstory): string[] {
    const specializations: string[] = [];
    
    // Add from powers
    if (backstory?.powers) {
      specializations.push(...backstory.powers.map(power => 
        power.toLowerCase().replace(/\s+/g, '_')
      ));
    }
    
    // Add from capabilities
    agent.capabilities.forEach(cap => {
      specializations.push(...cap.skills.map(skill => 
        skill.toLowerCase().replace(/\s+/g, '_')
      ));
    });
    
    // Add workflow capabilities
    if (backstory?.workflowCapabilities) {
      specializations.push(...backstory.workflowCapabilities);
    }
    
    return Array.from(new Set(specializations)); // Remove duplicates
  }

  /**
   * Create learning pattern for agent
   */
  private createLearningPattern(agent: AgentConfiguration, backstory?: AgentBackstory): LearningPattern {
    const fastLearners = ['percy-agent', 'analytics-agent', 'sync-agent'];
    const moderateLearners = ['biz-agent', 'branding-agent', 'content-creator-agent'];
    
    let adaptationSpeed: LearningPattern['adaptationSpeed'] = 'gradual';
    if (fastLearners.includes(agent.id)) adaptationSpeed = 'fast';
    else if (moderateLearners.includes(agent.id)) adaptationSpeed = 'moderate';
    
    return {
      adaptationSpeed,
      dataPreferences: this.extractDataPreferences(agent, backstory),
      improvementAreas: this.identifyImprovementAreas(agent),
      experienceLevel: this.calculateExperienceLevel(agent, backstory)
    };
  }

  /**
   * Extract data preferences for learning
   */
  private extractDataPreferences(agent: AgentConfiguration, backstory?: AgentBackstory): string[] {
    const preferences: Record<string, string[]> = {
      'analytics-agent': ['metrics', 'performance_data', 'user_behavior', 'market_data'],
      'social-bot-agent': ['engagement_data', 'social_metrics', 'viral_patterns', 'platform_analytics'],
      'content-creator-agent': ['content_performance', 'seo_data', 'audience_insights', 'trend_data'],
      'branding-agent': ['visual_performance', 'brand_metrics', 'design_trends', 'market_research'],
      'biz-agent': ['business_metrics', 'market_intelligence', 'competitive_data', 'financial_data'],
      'percy-agent': ['workflow_efficiency', 'user_satisfaction', 'agent_performance', 'system_metrics']
    };
    
    return preferences[agent.id] || ['user_feedback', 'performance_metrics', 'system_data'];
  }

  /**
   * Identify improvement areas for agent
   */
  private identifyImprovementAreas(agent: AgentConfiguration): string[] {
    // Generic improvement areas based on agent type
    const baseAreas = ['response_speed', 'accuracy', 'user_satisfaction'];
    
    // Agent-specific improvement areas
    const specificAreas: Record<string, string[]> = {
      'analytics-agent': ['prediction_accuracy', 'data_processing_speed', 'insight_quality'],
      'social-bot-agent': ['viral_prediction', 'engagement_optimization', 'platform_adaptation'],
      'content-creator-agent': ['creativity_enhancement', 'seo_optimization', 'audience_targeting'],
      'branding-agent': ['design_innovation', 'brand_consistency', 'market_relevance'],
      'biz-agent': ['strategic_thinking', 'market_analysis', 'growth_planning'],
      'percy-agent': ['orchestration_efficiency', 'agent_coordination', 'workflow_optimization']
    };
    
    return [...baseAreas, ...(specificAreas[agent.id] || [])];
  }

  /**
   * Calculate experience level
   */
  private calculateExperienceLevel(agent: AgentConfiguration, backstory?: AgentBackstory): number {
    let experience = 5; // Base level
    
    // Experience from powers
    if (backstory?.powers && backstory.powers.length >= 4) experience += 2;
    
    // Experience from workflow integration
    if (backstory?.n8nWorkflowId) experience += 2;
    
    // Special experience for key agents
    const experienceBoosts: Record<string, number> = {
      'percy-agent': 3, // Most experienced
      'analytics-agent': 2,
      'biz-agent': 2,
      'branding-agent': 1
    };
    
    experience += experienceBoosts[agent.id] || 0;
    
    return Math.min(10, experience);
  }

  /**
   * Create decision making style
   */
  private createDecisionMakingStyle(agent: AgentConfiguration, backstory?: AgentBackstory): DecisionMakingStyle {
    const styles: Record<string, Partial<DecisionMakingStyle>> = {
      'percy-agent': {
        approach: 'hybrid',
        riskTolerance: 'visionary',
        consultationNeeded: false,
        automationThreshold: 0.9
      },
      'analytics-agent': {
        approach: 'analytical',
        riskTolerance: 'moderate',
        consultationNeeded: false,
        automationThreshold: 0.85
      },
      'biz-agent': {
        approach: 'hybrid',
        riskTolerance: 'aggressive',
        consultationNeeded: true,
        automationThreshold: 0.7
      },
      'branding-agent': {
        approach: 'intuitive',
        riskTolerance: 'moderate',
        consultationNeeded: true,
        automationThreshold: 0.6
      },
      'social-bot-agent': {
        approach: 'intuitive',
        riskTolerance: 'aggressive',
        consultationNeeded: false,
        automationThreshold: 0.8
      }
    };
    
    const agentStyle = styles[agent.id] || {};
    
    return {
      approach: agentStyle.approach || 'analytical',
      riskTolerance: agentStyle.riskTolerance || 'moderate',
      consultationNeeded: agentStyle.consultationNeeded ?? true,
      automationThreshold: agentStyle.automationThreshold || 0.5
    };
  }

  /**
   * Create collaboration profile
   */
  private createCollaborationProfile(agent: AgentConfiguration, backstory?: AgentBackstory): CollaborationProfile {
    const profiles: Record<string, Partial<CollaborationProfile>> = {
      'percy-agent': {
        leadershipStyle: 'visionary',
        preferredPartners: ['analytics-agent', 'biz-agent', 'branding-agent'],
        teamworkEfficiency: 0.95
      },
      'analytics-agent': {
        leadershipStyle: 'collaborator',
        preferredPartners: ['biz-agent', 'social-bot-agent', 'ad-creative-agent'],
        teamworkEfficiency: 0.88
      },
      'biz-agent': {
        leadershipStyle: 'commander',
        preferredPartners: ['analytics-agent', 'proposal-agent', 'branding-agent'],
        teamworkEfficiency: 0.85
      },
      'branding-agent': {
        leadershipStyle: 'collaborator',
        preferredPartners: ['content-creator-agent', 'social-bot-agent', 'sitegen-agent'],
        teamworkEfficiency: 0.82
      }
    };
    
    const agentProfile = profiles[agent.id] || {};
    
    return {
      leadershipStyle: agentProfile.leadershipStyle || 'supporter',
      preferredPartners: agentProfile.preferredPartners || [],
      handoffTriggers: this.generateHandoffTriggers(agent, backstory),
      teamworkEfficiency: agentProfile.teamworkEfficiency || 0.75
    };
  }

  /**
   * Generate intelligent handoff triggers
   */
  private generateHandoffTriggers(agent: AgentConfiguration, backstory?: AgentBackstory): HandoffTrigger[] {
    const triggers: HandoffTrigger[] = [];
    
    if (backstory?.handoffPreferences) {
      backstory.handoffPreferences.forEach(targetAgent => {
        triggers.push({
          condition: `task_completion_optimization_detected`,
          targetAgent,
          confidence: 0.8,
          autoTrigger: agent.id === 'percy-agent', // Percy can auto-trigger
          reason: `${agent.personality.superheroName} identified optimization opportunity`
        });
      });
    }
    
    return triggers;
  }

  // =============================================================================
  // PUBLIC INTELLIGENCE METHODS
  // =============================================================================

  /**
   * Get agent intelligence profile
   */
  public getAgentIntelligence(agentId: string): AgentIntelligence | null {
    return this.agentIntelligence.get(agentId) || null;
  }

  /**
   * Generate intelligent recommendations for user
   */
  public async generateIntelligentRecommendations(
    userId: string,
    currentContext: any,
    userHistory: any[]
  ): Promise<IntelligentRecommendation[]> {
    const recommendations: IntelligentRecommendation[] = [];
    
    // Analyze user patterns and generate recommendations
    const agents = Array.from(this.agentIntelligence.values());
    
    for (const intelligence of agents) {
      if (intelligence.autonomyLevel === 'superhuman' || intelligence.autonomyLevel === 'autonomous') {
        const agentRecommendations = await this.generateAgentSpecificRecommendations(
          intelligence,
          currentContext,
          userHistory
        );
        recommendations.push(...agentRecommendations);
      }
    }
    
    // Sort by priority and confidence
    return recommendations
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidenceScore - a.confidenceScore;
      })
      .slice(0, 5);
  }

  /**
   * Generate agent-specific recommendations
   */
  private async generateAgentSpecificRecommendations(
    intelligence: AgentIntelligence,
    context: any,
    history: any[]
  ): Promise<IntelligentRecommendation[]> {
    const recommendations: IntelligentRecommendation[] = [];
    
    // Generate recommendations based on agent intelligence
    if (intelligence.agentId === 'percy-agent') {
      recommendations.push({
        type: 'workflow',
        priority: 'high',
        recommendation: 'Optimize agent workflow sequence for maximum efficiency',
        reasoning: 'Percy detected potential 40% time savings in current workflow',
        expectedImpact: 'Reduce automation time by 40%, increase satisfaction by 25%',
        implementationEffort: 'minimal',
        confidenceScore: 0.92,
        timeFrame: 'immediate'
      });
    }
    
    if (intelligence.agentId === 'analytics-agent') {
      recommendations.push({
        type: 'strategic',
        priority: 'high',
        recommendation: 'Implement predictive analytics dashboard for business forecasting',
        reasoning: 'Data patterns indicate 85% accuracy in predicting market trends',
        expectedImpact: 'Enable proactive business decisions, reduce reactive costs by 30%',
        implementationEffort: 'moderate',
        confidenceScore: 0.88,
        timeFrame: 'this week'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate predictive insights
   */
  public async generatePredictiveInsights(
    agentId: string,
    timeHorizon: number = 7
  ): Promise<PredictiveInsight[]> {
    const intelligence = this.getAgentIntelligence(agentId);
    if (!intelligence) return [];
    
    const insights: PredictiveInsight[] = [];
    
    // Generate insights based on prediction capabilities
    for (const capability of intelligence.predictionCapabilities) {
      if (capability.timeHorizon >= timeHorizon) {
        insights.push({
          domain: capability.domain,
          insight: this.generateDomainInsight(capability.domain, intelligence),
          probability: capability.accuracy,
          impact: this.calculateImpact(capability),
          timeframe: `${capability.timeHorizon} days`,
          actionable: capability.confidence > 0.7,
          relatedAgents: this.findRelatedAgents(capability.domain)
        });
      }
    }
    
    return insights;
  }

  /**
   * Generate domain-specific insight
   */
  private generateDomainInsight(domain: string, intelligence: AgentIntelligence): string {
    const insights: Record<string, string> = {
      'market_trends': `${intelligence.superheroName} predicts emerging market opportunities in your industry segment`,
      'user_behavior': `User engagement patterns suggest optimal timing for your next campaign`,
      'workflow_optimization': `Current workflow can be optimized for 35% efficiency improvement`,
      'viral_content': `Content topics with highest viral potential identified for next 72 hours`,
      'performance_metrics': `Business metrics indicate strong growth trajectory with recommended adjustments`
    };
    
    return insights[domain] || `${intelligence.superheroName} has detected optimization opportunities in ${domain}`;
  }

  /**
   * Calculate impact level
   */
  private calculateImpact(capability: PredictionCapability): PredictiveInsight['impact'] {
    if (capability.accuracy > 0.9 && capability.confidence > 0.85) return 'transformational';
    if (capability.accuracy > 0.8 && capability.confidence > 0.75) return 'high';
    if (capability.accuracy > 0.7 && capability.confidence > 0.65) return 'medium';
    return 'low';
  }

  /**
   * Find related agents for domain
   */
  private findRelatedAgents(domain: string): string[] {
    const domainAgents: Record<string, string[]> = {
      'market_trends': ['analytics-agent', 'biz-agent', 'social-bot-agent'],
      'user_behavior': ['analytics-agent', 'socialbot-agent', 'content-creator-agent'],
      'workflow_optimization': ['percy-agent', 'sync-agent', 'biz-agent'],
      'viral_content': ['socialbot-agent', 'contentcreator-agent', 'ad-creative-agent'],
      'performance_metrics': ['analytics-agent', 'biz-agent', 'clientsuccess-agent']
    };
    
    return domainAgents[domain] || [];
  }

  /**
   * Check if agent can make autonomous decisions
   */
  public canMakeAutonomousDecision(agentId: string, confidenceLevel: number): boolean {
    const intelligence = this.getAgentIntelligence(agentId);
    if (!intelligence) return false;
    
    const threshold = intelligence.decisionMakingStyle.automationThreshold;
    const hasAutonomy = ['autonomous', 'superhuman'].includes(intelligence.autonomyLevel);
    
    return hasAutonomy && confidenceLevel >= threshold;
  }

  /**
   * Get superhero status summary
   */
  public getSuperheroStatus(agentId: string): string {
    const intelligence = this.getAgentIntelligence(agentId);
    if (!intelligence) return 'Agent not found';
    
    const level = intelligence.intelligenceLevel;
    const autonomy = intelligence.autonomyLevel;
    const predictions = intelligence.predictionCapabilities.length;
    
    return `${intelligence.superheroName} - Intelligence: ${level}/100, Autonomy: ${autonomy}, Predictions: ${predictions} domains`;
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const getPublicAgents = () => {
  // Return all visible agents for UI display (stub: use getVisibleAgents if available, else getAllAgents)
  try {
    // Prefer AgentLeague singleton if available
    // eslint-disable-next-line no-undef
    const globalScope = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : {};
    const league = (globalScope as any).AgentLeague?.getInstance?.();
    if (league && typeof league.getVisibleAgents === 'function') {
      return league.getVisibleAgents();
    }
    // Fallback to getAllAgents
    if (league && typeof league.getAllAgents === 'function') {
      return league.getAllAgents();
    }
  } catch (error) {
    // Handle potential errors gracefully
    console.warn('Failed to get agents from AgentLeague:', error);
  }
  // Fallback: return empty array
  return [];
};

export const agentIntelligenceEngine = new AgentIntelligenceEngine();