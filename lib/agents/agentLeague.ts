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
  
  // NEW: Enhanced Interactivity & Personality Features
  canConverse: boolean;
  recommendedHelpers: string[];
  handoffTriggers: string[];
  conversationCapabilities: {
    supportedLanguages: string[];
    maxConversationDepth: number;
    specializedTopics: string[];
    emotionalIntelligence: boolean;
  };
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
  ],
  
  'social-bot-agent': [
    {
      id: 'viral-content-creation',
      name: 'Viral Content Generation',
      description: 'Creates engaging social media content with viral potential',
      triggerKeywords: ['social', 'viral', 'posts', 'engagement', 'trending'],
      n8nWorkflowId: 'social-media-workflow',
      outputType: 'text',
      estimatedDuration: 10,
      premiumRequired: false
    },
    {
      id: 'hashtag-strategy',
      name: 'Hashtag Telepathy',
      description: 'Generates optimal hashtag strategies for maximum reach',
      triggerKeywords: ['hashtags', 'reach', 'discovery', 'trends'],
      apiEndpoint: '/api/social/hashtag-strategy',
      outputType: 'data',
      estimatedDuration: 5,
      premiumRequired: false
    }
  ],
  
  'analytics-agent': [
    {
      id: 'data-insights',
      name: 'Future Trend Prediction',
      description: 'Analyzes data patterns and predicts future trends',
      triggerKeywords: ['analytics', 'data', 'insights', 'trends', 'metrics'],
      n8nWorkflowId: 'analytics-workflow',
      outputType: 'data',
      estimatedDuration: 15,
      premiumRequired: true
    },
    {
      id: 'roi-analysis',
      name: 'ROI Clairvoyance',
      description: 'Calculates and optimizes return on investment',
      triggerKeywords: ['roi', 'return', 'investment', 'optimization', 'profit'],
      apiEndpoint: '/api/analytics/roi-analysis',
      outputType: 'data',
      estimatedDuration: 10,
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
        performanceMetrics: ['handoff_success_rate', 'user_satisfaction', 'routing_accuracy'],
        canConverse: true,
        recommendedHelpers: ['branding-agent', 'content-creator-agent', 'analytics-agent'],
        handoffTriggers: ['need help with', 'can you find someone', 'who should I talk to', 'recommend an agent'],
        conversationCapabilities: {
          supportedLanguages: ['en', 'es', 'fr', 'de'],
          maxConversationDepth: 50,
          specializedTopics: ['agent routing', 'workflow coordination', 'task orchestration', 'general assistance'],
          emotionalIntelligence: true
        }
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
        performanceMetrics: ['brand_assets_created', 'client_satisfaction', 'design_iterations'],
        canConverse: true,
        recommendedHelpers: ['content-creator-agent', 'ad-creative-agent', 'sitegen-agent'],
        handoffTriggers: ['need website', 'create content', 'marketing materials', 'launch campaign'],
        conversationCapabilities: {
          supportedLanguages: ['en', 'es', 'fr'],
          maxConversationDepth: 30,
          specializedTopics: ['brand identity', 'logo design', 'visual branding', 'color psychology', 'brand strategy'],
          emotionalIntelligence: true
        }
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
        performanceMetrics: ['words_generated', 'seo_score', 'engagement_prediction'],
        canConverse: true,
        recommendedHelpers: ['social-bot-agent', 'branding-agent', 'analytics-agent'],
        handoffTriggers: ['social media', 'brand guidelines', 'performance data', 'analytics'],
        conversationCapabilities: {
          supportedLanguages: ['en', 'es', 'fr', 'de', 'it'],
          maxConversationDepth: 40,
          specializedTopics: ['content writing', 'SEO', 'blog posts', 'copywriting', 'content strategy'],
          emotionalIntelligence: true
        }
      },
      
      {
        id: 'social-bot-agent',
        name: 'SocialNino',
        category: 'Social Media',
        description: 'The Viral Virtuoso who creates engaging social content',
        version: '2.0.0',
        personality: this.mapBackstoryToPersonality('social-bot-agent'),
        powers: AGENT_POWERS['social-bot-agent'] || [],
        capabilities: [{
          category: 'Social Media',
          skills: ['Content Scheduling', 'Hashtag Strategy', 'Engagement Optimization', 'Trend Analysis'],
          primaryOutput: 'Social media content and campaigns',
          supportedFormats: ['text', 'image', 'video', 'carousel'],
          integrations: ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok']
        }],
        handoffTargets: CROSS_AGENT_HANDOFFS['social-bot-agent'] || [],
        canReceiveHandoffs: true,
        n8nWorkflowId: 'social-media-workflow',
        primaryWorkflow: 'social-content-creation',
        fallbackBehavior: 'mock',
        visible: true,
        premium: false,
        emoji: '📱',
        colorTheme: 'social-purple',
        imageSlug: 'social',
        usageTracking: true,
        performanceMetrics: ['posts_created', 'engagement_rate', 'viral_potential'],
        canConverse: true,
        recommendedHelpers: ['content-creator-agent', 'analytics-agent', 'ad-creative-agent'],
        handoffTriggers: ['long form content', 'data analysis', 'advertising', 'campaign performance'],
        conversationCapabilities: {
          supportedLanguages: ['en', 'es', 'fr', 'de'],
          maxConversationDepth: 35,
          specializedTopics: ['social media strategy', 'viral content', 'hashtags', 'community management'],
          emotionalIntelligence: true
        }
      },
      
      {
        id: 'analytics-agent',
        name: 'The Don of Data',
        category: 'Analytics',
        description: 'Master of data insights and predictive analytics',
        version: '2.0.0',
        personality: this.mapBackstoryToPersonality('analytics-agent'),
        powers: AGENT_POWERS['analytics-agent'] || [],
        capabilities: [{
          category: 'Data Analytics',
          skills: ['Data Analysis', 'Predictive Modeling', 'Dashboard Creation', 'ROI Calculation'],
          primaryOutput: 'Data insights and performance reports',
          supportedFormats: ['json', 'csv', 'pdf', 'dashboard'],
          integrations: ['google-analytics', 'mixpanel', 'amplitude', 'tableau']
        }],
        handoffTargets: CROSS_AGENT_HANDOFFS['analytics-agent'] || [],
        canReceiveHandoffs: true,
        n8nWorkflowId: 'analytics-workflow',
        primaryWorkflow: 'data-analysis',
        fallbackBehavior: 'mock',
        visible: true,
        premium: true,
        emoji: '📊',
        colorTheme: 'data-blue',
        imageSlug: 'analytics',
        usageTracking: true,
        performanceMetrics: ['insights_generated', 'prediction_accuracy', 'dashboard_usage'],
        canConverse: true,
        recommendedHelpers: ['content-creator-agent', 'social-bot-agent', 'ad-creative-agent'],
        handoffTriggers: ['content optimization', 'social strategy', 'ad performance', 'creative testing'],
        conversationCapabilities: {
          supportedLanguages: ['en', 'de', 'fr'],
          maxConversationDepth: 25,
          specializedTopics: ['data analysis', 'metrics interpretation', 'performance optimization', 'predictive modeling'],
          emotionalIntelligence: false
        }
      },
      
      {
        id: 'ad-creative-agent',
        name: 'AdmEthen',
        category: 'Advertising',
        description: 'The Conversion Catalyst who creates perfect ad campaigns',
        version: '2.0.0',
        personality: this.mapBackstoryToPersonality('ad-creative-agent'),
        powers: AGENT_POWERS['ad-creative-agent'] || [],
        capabilities: [{
          category: 'Ad Creation',
          skills: ['Ad Copy', 'Creative Design', 'Audience Targeting', 'A/B Testing'],
          primaryOutput: 'High-converting ad campaigns',
          supportedFormats: ['text', 'image', 'video', 'carousel'],
          integrations: ['facebook-ads', 'google-ads', 'linkedin-ads', 'twitter-ads']
        }],
        handoffTargets: CROSS_AGENT_HANDOFFS['ad-creative-agent'] || [],
        canReceiveHandoffs: true,
        n8nWorkflowId: 'ad-creative-workflow',
        primaryWorkflow: 'ad-campaign-creation',
        fallbackBehavior: 'mock',
        visible: true,
        premium: true,
        emoji: '🎯',
        colorTheme: 'conversion-red',
        imageSlug: 'ads',
        usageTracking: true,
        performanceMetrics: ['conversion_rate', 'ctr_improvement', 'roas'],
        canConverse: true,
        recommendedHelpers: ['analytics-agent', 'branding-agent', 'social-bot-agent'],
        handoffTriggers: ['performance data', 'brand assets', 'social content', 'optimization insights'],
        conversationCapabilities: {
          supportedLanguages: ['en', 'es', 'fr'],
          maxConversationDepth: 30,
          specializedTopics: ['ad campaigns', 'conversion optimization', 'audience targeting', 'creative testing'],
          emotionalIntelligence: true
        }
      }
      
      // Additional agents can be easily added here following the same pattern
    ];
    
    // Register all agents
    agentConfigs.forEach(config => {
      this.agents.set(config.id, config);
    });
    
    // ---------------------------------------------------------------------
    // Auto-register any backstories that were not explicitly configured above
    // ---------------------------------------------------------------------
    Object.entries(agentBackstories).forEach(([agentId, backstory]) => {
      if (this.agents.has(agentId)) return; // already registered (manual)

      // Derive a friendly agent name (fallback to superheroName or id)
      const friendlyName = backstory.superheroName || agentId.replace(/-agent$/, '').replace(/-/g, ' ');

      // Create a minimalist power that simply triggers the primary n8n workflow
      const defaultPower: AgentPower = {
        id: 'default-workflow',
        name: 'Primary Workflow',
        description: `${friendlyName} primary automation workflow`,
        triggerKeywords: [friendlyName.toLowerCase(), 'run', 'execute', 'workflow'],
        n8nWorkflowId: backstory.n8nWorkflowId,
        outputType: 'workflow',
        estimatedDuration: 10,
        premiumRequired: false
      };

      // Fallback capability mapping – use first power as capability summary
      const defaultCapability: AgentCapability = {
        category: 'Automation',
        skills: backstory.powers?.slice(0, 4) || [],
        primaryOutput: 'Automated deliverable',
        supportedFormats: ['text', 'file', 'data'],
        integrations: ['n8n']
      };

      const genericConfig: AgentConfiguration = {
        id: agentId,
        name: friendlyName,
        category: 'General',
        description: backstory.backstory?.slice(0, 140) || `${friendlyName} automation agent`,
        version: '1.0.0',
        personality: this.mapBackstoryToPersonality(agentId),
        powers: [defaultPower],
        capabilities: [defaultCapability],
        handoffTargets: [],
        canReceiveHandoffs: true,
        n8nWorkflowId: backstory.n8nWorkflowId,
        primaryWorkflow: backstory.n8nWorkflowId || 'generic-workflow',
        fallbackBehavior: 'mock',
        visible: true,
        premium: false,
        emoji: '🤖',
        colorTheme: 'cosmic-blue',
        imageSlug: agentId.replace(/-agent$/, ''),
        usageTracking: true,
        performanceMetrics: [],
        canConverse: true,
        recommendedHelpers: [],
        handoffTriggers: [],
        conversationCapabilities: {
          supportedLanguages: ['en'],
          maxConversationDepth: 20,
          specializedTopics: [],
          emotionalIntelligence: false
        }
      };

      this.agents.set(agentId, genericConfig);
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
  // CONVERSATIONAL AGENT METHODS
  // =============================================================================

  /**
   * Handle conversational interaction with an agent
   */
  public async handleAgentChat(
    agentId: string, 
    message: string, 
    conversationHistory: any[] = [],
    context: any = {}
  ): Promise<any> {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    if (!agent.canConverse) {
      // Fallback to Percy for non-conversational agents
      return this.fallbackToPercy(agentId, message, conversationHistory, context);
    }

    // Create personality-enhanced prompt
    const personalityPrompt = this.createPersonalityPrompt(agent, message, conversationHistory);
    
    // Call OpenAI with personality context
    const response = await this.callOpenAIWithPersonality(personalityPrompt, agent);
    
    // Analyze for handoff suggestions
    const handoffSuggestions = this.analyzeHandoffOpportunities(agent, message, response);
    
    // Generate conversation analytics
    const analytics = this.generateConversationAnalytics(conversationHistory, message, response);

    return {
      success: true,
      message: response,
      personalityInjected: true,
      handoffSuggestions,
      conversationAnalytics: analytics,
      agentId: agent.id,
      agentName: agent.name
    };
  }

  /**
   * Create personality-enhanced prompt for agent
   */
  private createPersonalityPrompt(
    agent: AgentConfiguration, 
    userMessage: string, 
    conversationHistory: any[]
  ): string {
    const personality = agent.personality;
    
    const systemPrompt = `
You are ${personality.superheroName}, ${agent.description}.

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
5. If the user asks about something outside your expertise, consider suggesting one of your recommended helpers: ${agent.recommendedHelpers.join(', ')}
6. Incorporate your catchphrase naturally when appropriate
7. Be helpful while maintaining your unique superhero persona

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

USER MESSAGE: ${userMessage}

Respond as ${personality.superheroName}:`;

    return systemPrompt;
  }

  /**
   * Call OpenAI with personality enhancement
   */
  private async callOpenAIWithPersonality(prompt: string, agent: AgentConfiguration): Promise<string> {
    try {
      // Import the utility function for calling OpenAI
      const { callOpenAI } = await import('@/utils/agentUtils');
      
      const response = await callOpenAI(prompt, {
        maxTokens: 800,
        temperature: 0.7,
        model: 'gpt-4'
      });
      
      return response;
    } catch (error) {
      console.error('[AgentLeague] OpenAI call failed:', error);
      
      // Fallback to personality-aware mock response
      const mockResponses = [
        `${agent.personality.catchphrase} I'm here to help you with ${agent.conversationCapabilities.specializedTopics[0]}!`,
        `As ${agent.personality.superheroName}, I can assist you using my powers of ${agent.personality.powers[0]}.`,
        `Drawing from my experience in ${agent.category.toLowerCase()}, let me help you achieve your goals!`
      ];
      
      return mockResponses[Math.floor(Math.random() * mockResponses.length)];
    }
  }

  /**
   * Analyze conversation for handoff opportunities
   */
  private analyzeHandoffOpportunities(
    sourceAgent: AgentConfiguration,
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
          const helperAgent = this.getAgent(helperId);
          if (helperAgent) {
            handoffSuggestions.push({
              targetAgentId: helperId,
              targetAgentName: helperAgent.name,
              reason: `Based on your mention of "${trigger}", ${helperAgent.name} would be perfect for this task`,
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
  private generateConversationAnalytics(
    conversationHistory: any[],
    userMessage: string,
    agentResponse: string
  ): any {
    return {
      messageCount: conversationHistory.length + 1,
      avgResponseTime: 1.2, // Mock value
      personalityAlignment: 95, // Mock value - could be calculated based on personality markers
      engagementLevel: 'high',
      topicsDiscussed: ['general assistance'], // Could be extracted from message content
      sentimentScore: 0.8, // Mock positive sentiment
      handoffTriggers: 0 // Count of times handoff was suggested
    };
  }

  /**
   * Fallback to Percy for non-conversational agents
   */
  private async fallbackToPercy(
    requestedAgentId: string,
    message: string,
    conversationHistory: any[],
    context: any
  ): Promise<any> {
    const percyAgent = this.getAgent('percy-agent');
    if (!percyAgent) {
      throw new Error('Percy agent not available for fallback');
    }

    const fallbackMessage = `The user wanted to talk to ${requestedAgentId}, but that agent doesn't support chat. User message: "${message}"`;
    
    return {
      success: true,
      message: `I see you wanted to chat with ${requestedAgentId}, but they're currently focused on their specialized tasks. I'm Percy, and I'm here to help! ${percyAgent.personality.catchphrase} What would you like to accomplish?`,
      personalityInjected: true,
      handoffSuggestions: [{
        targetAgentId: requestedAgentId,
        targetAgentName: this.getAgent(requestedAgentId)?.name || 'Unknown Agent',
        reason: 'Use their specialized workflow instead of chat',
        confidence: 90,
        triggerKeywords: ['task', 'workflow'],
        userBenefit: 'Get better results through their optimized workflow'
      }],
      conversationAnalytics: this.generateConversationAnalytics(conversationHistory, message, ''),
      agentId: 'percy-agent',
      agentName: 'Percy',
      fallbackUsed: true
    };
  }

  /**
   * Get conversation capabilities for an agent
   */
  public getAgentConversationCapabilities(agentId: string): any {
    const agent = this.getAgent(agentId);
    if (!agent) return null;

    return {
      canConverse: agent.canConverse,
      capabilities: agent.conversationCapabilities,
      recommendedHelpers: agent.recommendedHelpers,
      handoffTriggers: agent.handoffTriggers
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

/**
 * Handle conversational chat with an agent
 */
export async function handleAgentChat(
  agentId: string,
  message: string,
  conversationHistory: any[] = [],
  context: any = {}
): Promise<any> {
  return agentLeague.handleAgentChat(agentId, message, conversationHistory, context);
}

/**
 * Get agent conversation capabilities
 */
export function getAgentConversationCapabilities(agentId: string): any {
  return agentLeague.getAgentConversationCapabilities(agentId);
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