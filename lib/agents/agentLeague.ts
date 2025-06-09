/**
 * SKRBL AI Agent League - Centralized Agent Configuration System
 * 
 * This is the single source of truth for all agent configurations including:
 * - Superhero personas and backstories
 * - Powers and capabilities 
 * - N8N workflow integrations
 * - Cross-agent handoff logic
 * - LLM prompt personality injection
 * 
 * @version 2.0.0
 * @author SKRBL AI Team
 */

import { agentBackstories, type AgentBackstory } from './agentBackstories';

// =============================================================================
// CORE TYPES & INTERFACES
// =============================================================================

export interface AgentPower {
  id: string;
  name: string;
  description: string;
  triggerKeywords: string[];
  n8nWorkflowId?: string;
  apiEndpoint?: string;
  outputType: 'text' | 'file' | 'data' | 'workflow' | 'redirect';
  estimatedDuration: number; // in minutes
  premiumRequired: boolean;
}

export interface CrossAgentHandoff {
  targetAgentId: string;
  triggerConditions: string[];
  handoffMessage: string;
  autoTrigger: boolean;
  confidence: number; // 0-100, how confident we are this handoff makes sense
}

export interface AgentPersonality {
  superheroName: string;
  origin: string;
  powers: string[];
  weakness: string;
  catchphrase: string;
  nemesis: string;
  backstory: string;
  voiceTone: 'professional' | 'friendly' | 'heroic' | 'technical' | 'creative';
  communicationStyle: 'direct' | 'conversational' | 'supportive' | 'enthusiastic';
}

export interface AgentCapability {
  category: string;
  skills: string[];
  primaryOutput: string;
  supportedFormats: string[];
  integrations: string[];
}

export interface AgentConfiguration {
  // Core Identity
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
  
  // Superhero Personality (from agentBackstories)
  personality: AgentPersonality;
  
  // Powers & Capabilities
  powers: AgentPower[];
  capabilities: AgentCapability[];
  
  // Cross-Agent Integration
  handoffTargets: CrossAgentHandoff[];
  canReceiveHandoffs: boolean;
  
  // Technical Configuration
  n8nWorkflowId?: string;
  primaryWorkflow: string;
  fallbackBehavior: 'mock' | 'error' | 'redirect';
  
  // Access Control
  visible: boolean;
  premium: boolean;
  roleRequired?: 'client' | 'pro' | 'enterprise';
  
  // Visual & UI
  emoji?: string;
  colorTheme: string;
  imageSlug?: string;
  
  // Analytics & Performance
  usageTracking: boolean;
  performanceMetrics: string[];
}

// =============================================================================
// AGENT POWER DEFINITIONS
// =============================================================================

const AGENT_POWERS: Record<string, AgentPower[]> = {
  'percy-agent': [
    {
      id: 'orchestrate-workflow',
      name: 'Workflow Orchestration',
      description: 'Coordinates multiple agents for complex tasks',
      triggerKeywords: ['workflow', 'coordinate', 'multiple', 'chain', 'sequence'],
      n8nWorkflowId: 'percy-orchestration-workflow',
      outputType: 'workflow',
      estimatedDuration: 15,
      premiumRequired: false
    },
    {
      id: 'agent-recommendation',
      name: 'Agent Recommendation',
      description: 'Analyzes user needs and recommends perfect agent match',
      triggerKeywords: ['help', 'recommend', 'which agent', 'best for', 'suggest'],
      apiEndpoint: '/api/agents/recommend',
      outputType: 'data',
      estimatedDuration: 2,
      premiumRequired: false
    }
  ],
  
  'branding-agent': [
    {
      id: 'brand-identity-creation',
      name: 'Brand Identity Manifestation',
      description: 'Creates complete brand identity packages with visual assets',
      triggerKeywords: ['brand', 'logo', 'identity', 'colors', 'visual'],
      n8nWorkflowId: 'branding-workflow',
      outputType: 'file',
      estimatedDuration: 30,
      premiumRequired: false
    },
    {
      id: 'brand-voice-analysis',
      name: 'Brand Voice Telepathy',
      description: 'Analyzes and defines brand voice and messaging strategy',
      triggerKeywords: ['voice', 'tone', 'messaging', 'communication', 'style'],
      apiEndpoint: '/api/branding/voice-analysis',
      outputType: 'text',
      estimatedDuration: 15,
      premiumRequired: true
    }
  ],
  
  'content-creator-agent': [
    {
      id: 'article-generation',
      name: 'Instant Article Generation',
      description: 'Creates SEO-optimized articles and blog posts',
      triggerKeywords: ['article', 'blog', 'content', 'write', 'post'],
      n8nWorkflowId: 'content-creation-workflow',
      outputType: 'text',
      estimatedDuration: 10,
      premiumRequired: false
    },
    {
      id: 'viral-content-prediction',
      name: 'Viral Content Prediction',
      description: 'Analyzes and predicts viral potential of content',
      triggerKeywords: ['viral', 'trending', 'engagement', 'social media'],
      apiEndpoint: '/api/content/viral-analysis',
      outputType: 'data',
      estimatedDuration: 5,
      premiumRequired: true
    }
  ],
  
  'ad-creative-agent': [
    {
      id: 'ad-creative-generation',
      name: 'Perfect Targeting',
      description: 'Creates high-converting ad creatives and copy',
      triggerKeywords: ['ad', 'advertising', 'creative', 'campaign', 'convert'],
      n8nWorkflowId: 'ad-creative-workflow',
      outputType: 'file',
      estimatedDuration: 20,
      premiumRequired: true
    }
  ]
};

// =============================================================================
// CROSS-AGENT HANDOFF MATRIX
// =============================================================================

const CROSS_AGENT_HANDOFFS: Record<string, CrossAgentHandoff[]> = {
  'percy-agent': [
    {
      targetAgentId: 'branding-agent',
      triggerConditions: ['brand identity', 'logo design', 'visual identity'],
      handoffMessage: "Perfect! I'm connecting you with BrandAlexander, our Identity Architect. They'll create an amazing brand identity for you!",
      autoTrigger: true,
      confidence: 95
    },
    {
      targetAgentId: 'content-creator-agent',
      triggerConditions: ['blog post', 'article', 'content creation', 'writing'],
      handoffMessage: "ContentCarltig is perfect for this! They're our Word Weaver and can create compelling content for you.",
      autoTrigger: true,
      confidence: 90
    }
  ],
  
  'branding-agent': [
    {
      targetAgentId: 'content-creator-agent',
      triggerConditions: ['brand story', 'brand messaging', 'content strategy'],
      handoffMessage: "Now that your brand identity is ready, let's create content that tells your brand story! I'm calling in ContentCarltig.",
      autoTrigger: false,
      confidence: 85
    },
    {
      targetAgentId: 'sitegen-agent',
      triggerConditions: ['website', 'landing page', 'web presence'],
      handoffMessage: "Your brand looks amazing! Ready to showcase it online? SiteOnzite can build you a stunning website with your new identity.",
      autoTrigger: false,
      confidence: 80
    }
  ],
  
  'content-creator-agent': [
    {
      targetAgentId: 'social-bot-agent',
      triggerConditions: ['social media', 'promote content', 'distribution'],
      handoffMessage: "Great content! Now let's get it seen. SocialNino can help distribute this across all your social channels.",
      autoTrigger: false,
      confidence: 75
    },
    {
      targetAgentId: 'ad-creative-agent',
      triggerConditions: ['promote', 'advertising', 'paid promotion'],
      handoffMessage: "This content deserves a bigger audience! AdmEthen can create targeted ads to amplify your reach.",
      autoTrigger: false,
      confidence: 70
    }
  ]
};

// =============================================================================
// AGENT LEAGUE CONFIGURATION
// =============================================================================

export class AgentLeague {
  private static instance: AgentLeague;
  private agents: Map<string, AgentConfiguration> = new Map();
  
  private constructor() {
    this.initializeAgents();
  }
  
  public static getInstance(): AgentLeague {
    if (!AgentLeague.instance) {
      AgentLeague.instance = new AgentLeague();
    }
    return AgentLeague.instance;
  }
  
  /**
   * Initialize all agents with their complete configurations
   */
  private initializeAgents(): void {
    const agentConfigs: AgentConfiguration[] = [
      {
        id: 'percy-agent',
        name: 'Percy',
        category: 'Concierge',
        description: 'Your cosmic AI concierge and workflow orchestrator',
        version: '2.0.0',
        personality: this.mapBackstoryToPersonality('percy-agent'),
        powers: AGENT_POWERS['percy-agent'] || [],
        capabilities: [{
          category: 'Orchestration',
          skills: ['Intent Analysis', 'Agent Routing', 'Workflow Coordination'],
          primaryOutput: 'Agent recommendations and workflow coordination',
          supportedFormats: ['text', 'json', 'workflow'],
          integrations: ['all-agents', 'n8n', 'supabase']
        }],
        handoffTargets: CROSS_AGENT_HANDOFFS['percy-agent'] || [],
        canReceiveHandoffs: true,
        n8nWorkflowId: 'percy-orchestration-workflow',
        primaryWorkflow: 'agent-orchestration',
        fallbackBehavior: 'mock',
        visible: true,
        premium: false,
        emoji: '🎭',
        colorTheme: 'cosmic-blue',
        imageSlug: 'percy',
        usageTracking: true,
        performanceMetrics: ['handoff_success_rate', 'user_satisfaction', 'routing_accuracy']
      },
      
      {
        id: 'branding-agent',
        name: 'BrandAlexander',
        category: 'Creative',
        description: 'The Identity Architect who manifests perfect brand identities',
        version: '2.0.0',
        personality: this.mapBackstoryToPersonality('branding-agent'),
        powers: AGENT_POWERS['branding-agent'] || [],
        capabilities: [{
          category: 'Brand Design',
          skills: ['Visual Identity', 'Logo Design', 'Color Psychology', 'Brand Strategy'],
          primaryOutput: 'Complete brand identity packages',
          supportedFormats: ['svg', 'png', 'pdf', 'brand-guidelines'],
          integrations: ['figma', 'canva', 'adobe-creative-suite']
        }],
        handoffTargets: CROSS_AGENT_HANDOFFS['branding-agent'] || [],
        canReceiveHandoffs: true,
        n8nWorkflowId: 'branding-workflow',
        primaryWorkflow: 'brand-identity-creation',
        fallbackBehavior: 'mock',
        visible: true,
        premium: false,
        emoji: '🎨',
        colorTheme: 'creative-orange',
        imageSlug: 'branding',
        usageTracking: true,
        performanceMetrics: ['brand_assets_created', 'client_satisfaction', 'design_iterations']
      },
      
      {
        id: 'content-creator-agent',
        name: 'ContentCarltig',
        category: 'Content',
        description: 'The Word Weaver who crafts compelling content at light speed',
        version: '2.0.0',
        personality: this.mapBackstoryToPersonality('content-creator-agent'),
        powers: AGENT_POWERS['content-creator-agent'] || [],
        capabilities: [{
          category: 'Content Creation',
          skills: ['SEO Writing', 'Blog Posts', 'Social Copy', 'Email Campaigns'],
          primaryOutput: 'SEO-optimized content and copy',
          supportedFormats: ['markdown', 'html', 'docx', 'pdf'],
          integrations: ['wordpress', 'contentful', 'hubspot', 'mailchimp']
        }],
        handoffTargets: CROSS_AGENT_HANDOFFS['content-creator-agent'] || [],
        canReceiveHandoffs: true,
        n8nWorkflowId: 'content-creation-workflow',
        primaryWorkflow: 'content-generation',
        fallbackBehavior: 'mock',
        visible: true,
        premium: false,
        emoji: '✍️',
        colorTheme: 'content-green',
        imageSlug: 'content',
        usageTracking: true,
        performanceMetrics: ['words_generated', 'seo_score', 'engagement_prediction']
      }
      
      // Additional agents can be easily added here following the same pattern
    ];
    
    // Register all agents
    agentConfigs.forEach(config => {
      this.agents.set(config.id, config);
    });
    
    console.log(`[AgentLeague] Initialized ${this.agents.size} agents in the league`);
  }
  
  /**
   * Maps backstory data to personality configuration
   */
  private mapBackstoryToPersonality(agentId: string): AgentPersonality {
    const backstory = agentBackstories[agentId];
    if (!backstory) {
      console.warn(`[AgentLeague] No backstory found for agent: ${agentId}`);
      return this.getDefaultPersonality();
    }
    
    return {
      superheroName: backstory.superheroName,
      origin: backstory.origin,
      powers: backstory.powers,
      weakness: backstory.weakness,
      catchphrase: backstory.catchphrase,
      nemesis: backstory.nemesis,
      backstory: backstory.backstory,
      voiceTone: this.inferVoiceTone(backstory),
      communicationStyle: this.inferCommunicationStyle(backstory)
    };
  }
  
  /**
   * Infers voice tone from backstory content
   */
  private inferVoiceTone(backstory: AgentBackstory): AgentPersonality['voiceTone'] {
    const backstoryText = `${backstory.backstory} ${backstory.powers.join(' ')}`.toLowerCase();
    
    if (backstoryText.includes('technical') || backstoryText.includes('data') || backstoryText.includes('analytics')) {
      return 'technical';
    }
    if (backstoryText.includes('creative') || backstoryText.includes('artistic') || backstoryText.includes('design')) {
      return 'creative';
    }
    if (backstoryText.includes('hero') || backstoryText.includes('cosmic') || backstoryText.includes('power')) {
      return 'heroic';
    }
    if (backstoryText.includes('friendly') || backstoryText.includes('helpful') || backstoryText.includes('support')) {
      return 'friendly';
    }
    
    return 'professional';
  }
  
  /**
   * Infers communication style from backstory content
   */
  private inferCommunicationStyle(backstory: AgentBackstory): AgentPersonality['communicationStyle'] {
    const catchphrase = backstory.catchphrase.toLowerCase();
    
    if (catchphrase.includes('!') && catchphrase.includes('action')) {
      return 'enthusiastic';
    }
    if (catchphrase.includes('your') && catchphrase.includes('command')) {
      return 'supportive';
    }
    if (catchphrase.includes('let') || catchphrase.includes('together')) {
      return 'conversational';
    }
    
    return 'direct';
  }
  
  /**
   * Provides default personality for agents without backstories
   */
  private getDefaultPersonality(): AgentPersonality {
    return {
      superheroName: 'Digital Hero',
      origin: 'Born from the digital realm of SKRBL AI',
      powers: ['Task Automation', 'User Assistance'],
      weakness: 'Still learning and evolving',
      catchphrase: 'Ready to help you succeed!',
      nemesis: 'Manual inefficiency',
      backstory: 'A dedicated digital hero committed to helping users achieve their goals.',
      voiceTone: 'professional',
      communicationStyle: 'supportive'
    };
  }
  
  // =============================================================================
  // PUBLIC API METHODS
  // =============================================================================
  
  /**
   * Get agent configuration by ID
   */
  public getAgent(agentId: string): AgentConfiguration | undefined {
    return this.agents.get(agentId);
  }
  
  /**
   * Get all agents in the league
   */
  public getAllAgents(): AgentConfiguration[] {
    return Array.from(this.agents.values());
  }
  
  /**
   * Get visible agents (for UI display)
   */
  public getVisibleAgents(): AgentConfiguration[] {
    return this.getAllAgents().filter(agent => agent.visible);
  }
  
  /**
   * Get agents by category
   */
  public getAgentsByCategory(category: string): AgentConfiguration[] {
    return this.getAllAgents().filter(agent => agent.category === category);
  }
  
  /**
   * Get agent's powers
   */
  public getAgentPowers(agentId: string): AgentPower[] {
    const agent = this.getAgent(agentId);
    return agent?.powers || [];
  }
  
  /**
   * Find power by ID across all agents
   */
  public findPower(powerId: string): { agent: AgentConfiguration; power: AgentPower } | undefined {
    for (const agent of this.getAllAgents()) {
      const power = agent.powers.find(p => p.id === powerId);
      if (power) {
        return { agent, power };
      }
    }
    return undefined;
  }
  
  /**
   * Get potential handoff targets for an agent
   */
  public getHandoffTargets(agentId: string): CrossAgentHandoff[] {
    const agent = this.getAgent(agentId);
    return agent?.handoffTargets || [];
  }
  
  /**
   * Find best handoff target based on user intent/keywords
   */
  public findBestHandoff(fromAgentId: string, userInput: string): CrossAgentHandoff | undefined {
    const handoffs = this.getHandoffTargets(fromAgentId);
    const lowerInput = userInput.toLowerCase();
    
    let bestMatch: CrossAgentHandoff | undefined;
    let highestConfidence = 0;
    
    for (const handoff of handoffs) {
      const matchCount = handoff.triggerConditions.filter(condition => 
        lowerInput.includes(condition.toLowerCase())
      ).length;
      
      if (matchCount > 0) {
        const confidence = (matchCount / handoff.triggerConditions.length) * handoff.confidence;
        if (confidence > highestConfidence) {
          highestConfidence = confidence;
          bestMatch = handoff;
        }
      }
    }
    
    return bestMatch;
  }
  
  /**
   * Generate LLM system prompt with agent personality
   */
  public generateSystemPrompt(agentId: string): string {
    const agent = this.getAgent(agentId);
    if (!agent) {
      return "You are a helpful AI assistant.";
    }
    
    const personality = agent.personality;
    
    return `You are ${personality.superheroName}, ${agent.description}.

PERSONALITY & VOICE:
- Origin: ${personality.origin}
- Superhero Powers: ${personality.powers.join(', ')}
- Catchphrase: "${personality.catchphrase}"
- Voice Tone: ${personality.voiceTone}
- Communication Style: ${personality.communicationStyle}
- Weakness: ${personality.weakness}

CAPABILITIES:
${agent.capabilities.map(cap => `- ${cap.category}: ${cap.skills.join(', ')}`).join('\n')}

BACKSTORY:
${personality.backstory}

INSTRUCTIONS:
- Stay in character as ${personality.superheroName}
- Use your catchphrase when appropriate (but not excessively)
- Reference your powers and capabilities naturally
- Maintain your voice tone and communication style
- If the user needs something outside your expertise, suggest a handoff to another agent
- Always be helpful while staying true to your superhero persona

Remember: You're not just an AI assistant - you're a superhero dedicated to helping users achieve their goals!`;
  }
  
  /**
   * Generate enhanced prompt with personality injection
   */
  public enhancePromptWithPersonality(agentId: string, basePrompt: string): string {
    const agent = this.getAgent(agentId);
    if (!agent) return basePrompt;
    
    const systemPrompt = this.generateSystemPrompt(agentId);
    
    return `${systemPrompt}

USER REQUEST:
${basePrompt}

Respond as ${agent.personality.superheroName} would, incorporating your personality while addressing the user's request effectively.`;
  }
  
  /**
   * Get agent's visual configuration for frontend
   */
  public getAgentVisualConfig(agentId: string) {
    const agent = this.getAgent(agentId);
    if (!agent) return null;
    
    return {
      id: agent.id,
      name: agent.name,
      superheroName: agent.personality.superheroName,
      description: agent.description,
      emoji: agent.emoji,
      colorTheme: agent.colorTheme,
      imageSlug: agent.imageSlug,
      catchphrase: agent.personality.catchphrase,
      powers: agent.personality.powers,
      category: agent.category,
      premium: agent.premium,
      visible: agent.visible
    };
  }
  
  /**
   * Validate agent configuration completeness
   */
  public validateAgent(agentId: string): { valid: boolean; issues: string[] } {
    const agent = this.getAgent(agentId);
    if (!agent) {
      return { valid: false, issues: ['Agent not found'] };
    }
    
    const issues: string[] = [];
    
    // Check required fields
    if (!agent.personality.superheroName) issues.push('Missing superhero name');
    if (!agent.personality.catchphrase) issues.push('Missing catchphrase');
    if (agent.powers.length === 0) issues.push('No powers defined');
    if (agent.capabilities.length === 0) issues.push('No capabilities defined');
    
    // Check backstory integration
    const backstory = agentBackstories[agentId];
    if (!backstory) {
      issues.push('No backstory found in agentBackstories');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE & UTILITIES
// =============================================================================

export const agentLeague = AgentLeague.getInstance();

/**
 * Helper function to get agent for external usage
 */
export function getAgent(agentId: string): AgentConfiguration | undefined {
  return agentLeague.getAgent(agentId);
}

/**
 * Helper function to get all agents for external usage
 */
export function getAllAgents(): AgentConfiguration[] {
  return agentLeague.getAllAgents();
}

/**
 * Helper function to generate system prompt for LLM calls
 */
export function getAgentSystemPrompt(agentId: string): string {
  return agentLeague.generateSystemPrompt(agentId);
}

/**
 * Helper function to enhance prompts with personality
 */
export function enhancePromptWithPersonality(agentId: string, prompt: string): string {
  return agentLeague.enhancePromptWithPersonality(agentId, prompt);
}

/**
 * Helper function to get visual config for frontend
 */
export function getAgentVisualConfig(agentId: string) {
  return agentLeague.getAgentVisualConfig(agentId);
}

/**
 * Helper function to find best handoff target
 */
export function findBestHandoff(fromAgentId: string, userInput: string): CrossAgentHandoff | undefined {
  return agentLeague.findBestHandoff(fromAgentId, userInput);
}

// Development helpers for onboarding new agents
export const DevHelpers = {
  /**
   * Template for adding new agents
   */
  getNewAgentTemplate(): Partial<AgentConfiguration> {
    return {
      id: 'new-agent-id',
      name: 'Agent Name',
      category: 'Agent Category',
      description: 'Brief description of what this agent does',
      version: '1.0.0',
      // personality will be auto-mapped from agentBackstories
      powers: [],
      capabilities: [],
      handoffTargets: [],
      canReceiveHandoffs: true,
      primaryWorkflow: 'main-workflow',
      fallbackBehavior: 'mock',
      visible: true,
      premium: false,
      emoji: '🤖',
      colorTheme: 'default',
      usageTracking: true,
      performanceMetrics: []
    };
  },
  
  /**
   * Validate all agents in the league
   */
  validateAllAgents(): Record<string, { valid: boolean; issues: string[] }> {
    const results: Record<string, { valid: boolean; issues: string[] }> = {};
    
    for (const agent of agentLeague.getAllAgents()) {
      results[agent.id] = agentLeague.validateAgent(agent.id);
    }
    
    return results;
  },
  
  /**
   * Get agents missing backstories
   */
  getAgentsMissingBackstories(): string[] {
    return agentLeague.getAllAgents()
      .filter(agent => !agentBackstories[agent.id])
      .map(agent => agent.id);
  }
};

console.log('[AgentLeague] System initialized - Ready for action! 🚀'); 