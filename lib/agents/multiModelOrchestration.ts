/**
 * SKRBL AI Multi-Model Orchestration Engine
 * 
 * Intelligently routes AI requests to optimal models based on:
 * - Task complexity and type
 * - Cost optimization requirements  
 * - Performance metrics and response times
 * - Model-specific capabilities (vision, reasoning, creativity)
 * - Agent specialization preferences
 * 
 * @version 3.0.0
 * @author SKRBL AI Team
 */

import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface ModelProvider {
  id: string;
  name: string;
  baseModel: string;
  capabilities: ModelCapability[];
  costPerToken: {
    input: number;
    output: number;
  };
  maxTokens: number;
  avgResponseTime: number; // ms
  reliability: number; // 0-1 score
}

export interface ModelCapability {
  type: 'text' | 'vision' | 'code' | 'reasoning' | 'creativity' | 'analysis' | 'conversation';
  strength: number; // 0-1 score
  specialization?: string[];
}

export interface ModelRequest {
  prompt: string;
  taskType: 'analysis' | 'creativity' | 'conversation' | 'code' | 'vision' | 'reasoning' | 'orchestration';
  agentId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  maxTokens?: number;
  temperature?: number;
  requiresVision?: boolean;
  costBudget?: 'unlimited' | 'premium' | 'standard' | 'economy';
  performanceRequirement?: 'speed' | 'accuracy' | 'creativity' | 'balanced';
  contextWindow?: number;
  previousModel?: string; // For retry scenarios
}

export interface ModelResponse {
  content: string;
  modelUsed: string;
  executionTime: number;
  tokenCount: {
    input: number;
    output: number;
  };
  cost: number;
  confidence: number;
  metadata: {
    retryCount?: number;
    fallbackUsed?: boolean;
    optimizationReason?: string;
  };
}

export interface ModelPerformanceMetrics {
  modelId: string;
  agentId: string;
  taskType: string;
  successRate: number;
  avgResponseTime: number;
  avgCost: number;
  avgTokensUsed: number;
  qualityScore: number; // User feedback + accuracy evaluation
  usageCount: number;
  lastUpdated: Date;
}

// =============================================================================
// MODEL CONFIGURATIONS
// =============================================================================

export const MODEL_PROVIDERS: Record<string, ModelProvider> = {
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4 (OpenAI)',
    baseModel: 'gpt-4',
    capabilities: [
      { type: 'reasoning', strength: 0.95, specialization: ['complex_analysis', 'strategic_thinking'] },
      { type: 'conversation', strength: 0.90, specialization: ['personality_injection', 'context_awareness'] },
      { type: 'code', strength: 0.85, specialization: ['debugging', 'architecture'] },
      { type: 'analysis', strength: 0.90, specialization: ['data_interpretation', 'insights'] },
      { type: 'creativity', strength: 0.75, specialization: ['content_generation', 'brainstorming'] }
    ],
    costPerToken: { input: 0.03, output: 0.06 }, // per 1K tokens
    maxTokens: 8192,
    avgResponseTime: 3500,
    reliability: 0.98
  },
  
  'gpt-4-vision': {
    id: 'gpt-4-vision',
    name: 'GPT-4 Vision (OpenAI)',
    baseModel: 'gpt-4-vision-preview',
    capabilities: [
      { type: 'vision', strength: 0.95, specialization: ['image_analysis', 'visual_design', 'brand_review'] },
      { type: 'reasoning', strength: 0.90, specialization: ['visual_reasoning', 'design_critique'] },
      { type: 'analysis', strength: 0.85, specialization: ['visual_data', 'chart_interpretation'] },
      { type: 'creativity', strength: 0.80, specialization: ['visual_concepts', 'design_ideas'] }
    ],
    costPerToken: { input: 0.01, output: 0.03 }, // Cheaper for vision tasks
    maxTokens: 4096,
    avgResponseTime: 4500,
    reliability: 0.95
  },
  
  'claude-3-opus': {
    id: 'claude-3-opus',
    name: 'Claude-3 Opus (Anthropic)',
    baseModel: 'claude-3-opus-20240229',
    capabilities: [
      { type: 'creativity', strength: 0.98, specialization: ['storytelling', 'content_creation', 'brand_voice'] },
      { type: 'reasoning', strength: 0.92, specialization: ['logical_analysis', 'problem_solving'] },
      { type: 'conversation', strength: 0.95, specialization: ['natural_dialogue', 'personality_consistency'] },
      { type: 'analysis', strength: 0.88, specialization: ['qualitative_analysis', 'market_research'] },
      { type: 'code', strength: 0.80, specialization: ['documentation', 'explanation'] }
    ],
    costPerToken: { input: 0.015, output: 0.075 }, // Premium pricing for quality
    maxTokens: 200000, // Massive context window
    avgResponseTime: 4000,
    reliability: 0.97
  },
  
  'claude-3-sonnet': {
    id: 'claude-3-sonnet',
    name: 'Claude-3 Sonnet (Anthropic)',
    baseModel: 'claude-3-sonnet-20240229',
    capabilities: [
      { type: 'creativity', strength: 0.90, specialization: ['content_writing', 'marketing_copy'] },
      { type: 'conversation', strength: 0.88, specialization: ['customer_service', 'engagement'] },
      { type: 'reasoning', strength: 0.85, specialization: ['business_logic', 'workflow_planning'] },
      { type: 'analysis', strength: 0.82, specialization: ['trend_analysis', 'competitive_research'] }
    ],
    costPerToken: { input: 0.003, output: 0.015 }, // Cost-effective option
    maxTokens: 200000,
    avgResponseTime: 2500,
    reliability: 0.96
  }
};

// Agent-specific model preferences
export const AGENT_MODEL_PREFERENCES: Record<string, string[]> = {
  'percy-agent': ['gpt-4', 'claude-3-opus', 'claude-3-sonnet'], // Orchestration needs reasoning
  'branding-agent': ['claude-3-opus', 'gpt-4-vision', 'gpt-4'], // Creativity + visual analysis
  'content-creator-agent': ['claude-3-opus', 'claude-3-sonnet', 'gpt-4'], // Peak creativity
  'social-bot-agent': ['claude-3-sonnet', 'claude-3-opus', 'gpt-4'], // Viral content needs creativity
  'analytics-agent': ['gpt-4', 'claude-3-sonnet', 'gpt-4-vision'], // Data analysis priority
  'ad-creative-agent': ['claude-3-opus', 'gpt-4-vision', 'claude-3-sonnet'], // Creative ads + visual
  'video-content-agent': ['gpt-4-vision', 'claude-3-opus', 'gpt-4'], // Visual + creative
  'publishing-agent': ['claude-3-opus', 'claude-3-sonnet', 'gpt-4'], // Long-form content
  'biz-agent': ['gpt-4', 'claude-3-opus', 'claude-3-sonnet'], // Strategic reasoning
  'sync-agent': ['gpt-4', 'claude-3-sonnet', 'claude-3-opus'], // Technical coordination
  'payments-agent': ['gpt-4', 'claude-3-sonnet', 'gpt-4-vision'], // Precision required
  'client-success-agent': ['claude-3-sonnet', 'claude-3-opus', 'gpt-4'], // Customer communication
  'site-gen-agent': ['gpt-4', 'claude-3-sonnet', 'gpt-4-vision'], // Technical + design
  'proposal-agent': ['claude-3-opus', 'gpt-4', 'claude-3-sonnet'], // Persuasive writing
  'skill-smith-agent': ['gpt-4', 'claude-3-opus', 'claude-3-sonnet'] // Performance analysis
};

// =============================================================================
// MULTI-MODEL ORCHESTRATION ENGINE
// =============================================================================

export class MultiModelOrchestrationEngine {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private supabase: any;
  private performanceCache: Map<string, ModelPerformanceMetrics> = new Map();
  
  constructor() {
    // Initialize AI clients
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    // Initialize Supabase for performance tracking
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    this.loadPerformanceMetrics();
  }
  
  /**
   * Main orchestration method - intelligently selects and executes optimal model
   */
  async executeOptimalModel(request: ModelRequest): Promise<ModelResponse> {
    const startTime = Date.now();
    
    try {
      // 1. Select optimal model based on multiple factors
      const selectedModel = await this.selectOptimalModel(request);
      console.log(`[MultiModel] Selected ${selectedModel} for ${request.agentId} ${request.taskType} task`);
      
      // 2. Execute request with selected model
      const response = await this.executeModelRequest(selectedModel, request);
      
      // 3. Track performance metrics
      await this.trackPerformanceMetrics(selectedModel, request, response, startTime);
      
      // 4. Update model rankings for future optimization
      await this.updateModelRankings(selectedModel, request, response);
      
      return response;
      
    } catch (error) {
      console.error('[MultiModel] Execution failed:', error);
      
      // Intelligent fallback system
      const fallbackResponse = await this.handleModelFailure(request, error as Error, startTime);
      return fallbackResponse;
    }
  }
  
  /**
   * Intelligent model selection algorithm
   */
  private async selectOptimalModel(request: ModelRequest): Promise<string> {
    // Get agent preferences
    const agentPreferences = AGENT_MODEL_PREFERENCES[request.agentId] || ['gpt-4', 'claude-3-sonnet'];
    
    // Calculate scores for each available model
    const modelScores: Array<{ modelId: string; score: number; reasoning: string }> = [];
    
    for (const modelId of agentPreferences) {
      const model = MODEL_PROVIDERS[modelId];
      if (!model) continue;
      
      let score = 0;
      let reasoning = '';
      
      // 1. Capability matching (40% weight)
      const capabilityScore = this.calculateCapabilityScore(model, request);
      score += capabilityScore * 0.4;
      reasoning += `Capability: ${(capabilityScore * 100).toFixed(1)}% `;
      
      // 2. Cost optimization (25% weight)
      const costScore = this.calculateCostScore(model, request);
      score += costScore * 0.25;
      reasoning += `Cost: ${(costScore * 100).toFixed(1)}% `;
      
      // 3. Performance history (20% weight)
      const performanceScore = await this.calculatePerformanceScore(model, request);
      score += performanceScore * 0.2;
      reasoning += `Performance: ${(performanceScore * 100).toFixed(1)}% `;
      
      // 4. Speed requirements (10% weight)
      const speedScore = this.calculateSpeedScore(model, request);
      score += speedScore * 0.1;
      reasoning += `Speed: ${(speedScore * 100).toFixed(1)}% `;
      
      // 5. Reliability (5% weight)
      score += model.reliability * 0.05;
      reasoning += `Reliability: ${(model.reliability * 100).toFixed(1)}%`;
      
      modelScores.push({ modelId, score, reasoning });
    }
    
    // Sort by score and select best
    modelScores.sort((a, b) => b.score - a.score);
    const winner = modelScores[0];
    
    console.log(`[MultiModel] Model selection for ${request.agentId}:`, modelScores.map(m => 
      `${m.modelId}: ${(m.score * 100).toFixed(1)}% (${m.reasoning})`
    ));
    
    return winner.modelId;
  }
  
  /**
   * Calculate how well model capabilities match task requirements
   */
  private calculateCapabilityScore(model: ModelProvider, request: ModelRequest): number {
    // Find matching capabilities
    const taskCapabilities = model.capabilities.filter(cap => 
      cap.type === request.taskType || 
      (request.requiresVision && cap.type === 'vision')
    );
    
    if (taskCapabilities.length === 0) return 0.1; // Minimum score
    
    // Calculate weighted average of matching capabilities
    const avgStrength = taskCapabilities.reduce((sum, cap) => sum + cap.strength, 0) / taskCapabilities.length;
    
    // Bonus for specialized capabilities
    const hasSpecialization = taskCapabilities.some(cap => 
      cap.specialization?.some(spec => request.agentId.includes(spec.split('_')[0]))
    );
    
    return Math.min(1.0, avgStrength + (hasSpecialization ? 0.1 : 0));
  }
  
  /**
   * Calculate cost efficiency score based on budget requirements
   */
  private calculateCostScore(model: ModelProvider, request: ModelRequest): number {
    const costBudgetScores = {
      'economy': { maxCostPer1K: 0.01, weight: 1.0 },
      'standard': { maxCostPer1K: 0.05, weight: 0.8 },
      'premium': { maxCostPer1K: 0.1, weight: 0.6 },
      'unlimited': { maxCostPer1K: 1.0, weight: 0.3 }
    };
    
    const budget = costBudgetScores[request.costBudget || 'standard'];
    const avgCost = (model.costPerToken.input + model.costPerToken.output) / 2;
    
    if (avgCost <= budget.maxCostPer1K) {
      return 1.0 * budget.weight;
    } else {
      // Penalize expensive models based on budget constraints
      const penalty = Math.min(1.0, avgCost / budget.maxCostPer1K - 1);
      return Math.max(0.1, (1.0 - penalty) * budget.weight);
    }
  }
  
  /**
   * Calculate performance score based on historical data
   */
  private async calculatePerformanceScore(model: ModelProvider, request: ModelRequest): Promise<number> {
    const cacheKey = `${model.id}_${request.agentId}_${request.taskType}`;
    const metrics = this.performanceCache.get(cacheKey);
    
    if (!metrics) {
      // No historical data, use baseline score
      return 0.7;
    }
    
    // Weighted performance score
    const successWeight = 0.4;
    const qualityWeight = 0.4;
    const speedWeight = 0.2;
    
    const speedScore = metrics.avgResponseTime < 3000 ? 1.0 : 
                      metrics.avgResponseTime < 5000 ? 0.8 : 0.6;
    
    return (metrics.successRate * successWeight) + 
           (metrics.qualityScore * qualityWeight) + 
           (speedScore * speedWeight);
  }
  
  /**
   * Calculate speed score based on performance requirements
   */
  private calculateSpeedScore(model: ModelProvider, request: ModelRequest): number {
    const speedRequirements = {
      'speed': { maxMs: 2000, weight: 1.0 },
      'balanced': { maxMs: 4000, weight: 0.8 },
      'accuracy': { maxMs: 8000, weight: 0.5 },
      'creativity': { maxMs: 6000, weight: 0.6 }
    };
    
    const requirement = speedRequirements[request.performanceRequirement || 'balanced'];
    
    if (model.avgResponseTime <= requirement.maxMs) {
      return 1.0;
    } else {
      const penalty = (model.avgResponseTime - requirement.maxMs) / requirement.maxMs;
      return Math.max(0.1, 1.0 - penalty * 0.5);
    }
  }
  
  /**
   * Execute request with specific model
   */
  private async executeModelRequest(modelId: string, request: ModelRequest): Promise<ModelResponse> {
    const startTime = Date.now();
    const model = MODEL_PROVIDERS[modelId];
    
    try {
      let content: string;
      let tokenCount = { input: 0, output: 0 };
      
      if (modelId.startsWith('gpt-4')) {
        // OpenAI execution
        const response = await this.executeOpenAI(modelId, request);
        content = response.content;
        tokenCount = response.tokenCount;
        
      } else if (modelId.startsWith('claude-3')) {
        // Anthropic execution
        const response = await this.executeAnthropic(modelId, request);
        content = response.content;
        tokenCount = response.tokenCount;
        
      } else {
        throw new Error(`Unsupported model: ${modelId}`);
      }
      
      const executionTime = Date.now() - startTime;
      const cost = this.calculateCost(model, tokenCount);
      
      return {
        content,
        modelUsed: modelId,
        executionTime,
        tokenCount,
        cost,
        confidence: 0.95, // Default high confidence
        metadata: {
          retryCount: 0,
          fallbackUsed: false,
          optimizationReason: `Selected for ${request.taskType} optimization`
        }
      };
      
    } catch (error) {
      throw new Error(`Model execution failed for ${modelId}: ${error}`);
    }
  }
  
  /**
   * Execute OpenAI model request
   */
  private async executeOpenAI(modelId: string, request: ModelRequest): Promise<{content: string, tokenCount: {input: number, output: number}}> {
    const messages = [
      { role: 'user' as const, content: request.prompt }
    ];
    
    const completion = await this.openai.chat.completions.create({
      model: modelId === 'gpt-4-vision' ? 'gpt-4-vision-preview' : 'gpt-4',
      messages,
      max_tokens: request.maxTokens || 2000,
      temperature: request.temperature || 0.7
    });
    
    const content = completion.choices[0]?.message?.content || '';
    const tokenCount = {
      input: completion.usage?.prompt_tokens || 0,
      output: completion.usage?.completion_tokens || 0
    };
    
    return { content, tokenCount };
  }
  
  /**
   * Execute Anthropic model request
   */
  private async executeAnthropic(modelId: string, request: ModelRequest): Promise<{content: string, tokenCount: {input: number, output: number}}> {
    const response = await this.anthropic.messages.create({
      model: MODEL_PROVIDERS[modelId].baseModel,
      max_tokens: request.maxTokens || 2000,
      temperature: request.temperature || 0.7,
      messages: [
        { role: 'user', content: request.prompt }
      ]
    });
    
    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const tokenCount = {
      input: response.usage.input_tokens || 0,
      output: response.usage.output_tokens || 0
    };
    
    return { content, tokenCount };
  }
  
  /**
   * Calculate execution cost
   */
  private calculateCost(model: ModelProvider, tokenCount: {input: number, output: number}): number {
    return (tokenCount.input * model.costPerToken.input / 1000) + 
           (tokenCount.output * model.costPerToken.output / 1000);
  }
  
  /**
   * Handle model failures with intelligent fallback
   */
  private async handleModelFailure(request: ModelRequest, error: Error, startTime: number): Promise<ModelResponse> {
    console.warn(`[MultiModel] Primary model failed, attempting fallback:`, error.message);
    
    // Get fallback model (avoid the one that just failed)
    const agentPreferences = AGENT_MODEL_PREFERENCES[request.agentId] || ['gpt-4'];
    const fallbackModel = agentPreferences.find(model => model !== request.previousModel) || 'gpt-4';
    
    try {
      const fallbackRequest = { ...request, previousModel: request.previousModel || '' };
      const response = await this.executeModelRequest(fallbackModel, fallbackRequest);
      
      response.metadata.fallbackUsed = true;
      response.metadata.retryCount = 1;
      response.confidence = Math.max(0.7, response.confidence - 0.1); // Slightly lower confidence
      
      return response;
      
    } catch (fallbackError) {
      // Last resort: return structured error response
      return {
        content: `I apologize, but I'm experiencing technical difficulties right now. Our AI systems are temporarily overwhelmed. Please try again in a few moments, or contact support if the issue persists.`,
        modelUsed: 'fallback-error',
        executionTime: Date.now() - startTime,
        tokenCount: { input: 0, output: 0 },
        cost: 0,
        confidence: 0.1,
        metadata: {
          retryCount: 2,
          fallbackUsed: true,
          optimizationReason: 'Error recovery fallback'
        }
      };
    }
  }
  
  /**
   * Track performance metrics for optimization
   */
  private async trackPerformanceMetrics(modelId: string, request: ModelRequest, response: ModelResponse, startTime: number): Promise<void> {
    try {
      await this.supabase
        .from('model_performance_logs')
        .insert([{
          model_id: modelId,
          agent_id: request.agentId,
          task_type: request.taskType,
          execution_time: response.executionTime,
          token_count_input: response.tokenCount.input,
          token_count_output: response.tokenCount.output,
          cost: response.cost,
          success: true,
          confidence: response.confidence,
          priority: request.priority,
          cost_budget: request.costBudget || 'standard',
          performance_requirement: request.performanceRequirement || 'balanced',
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.warn('[MultiModel] Failed to track performance metrics:', error);
    }
  }
  
  /**
   * Update model rankings for future optimization
   */
  private async updateModelRankings(modelId: string, request: ModelRequest, response: ModelResponse): Promise<void> {
    const cacheKey = `${modelId}_${request.agentId}_${request.taskType}`;
    const existing = this.performanceCache.get(cacheKey);
    
    if (existing) {
      // Update rolling averages
      const newUsageCount = existing.usageCount + 1;
      const weight = 1 / newUsageCount;
      
      existing.avgResponseTime = (existing.avgResponseTime * (1 - weight)) + (response.executionTime * weight);
      existing.avgCost = (existing.avgCost * (1 - weight)) + (response.cost * weight);
      existing.qualityScore = (existing.qualityScore * (1 - weight)) + (response.confidence * weight);
      existing.usageCount = newUsageCount;
      existing.lastUpdated = new Date();
      
    } else {
      // Create new performance record
      this.performanceCache.set(cacheKey, {
        modelId,
        agentId: request.agentId,
        taskType: request.taskType,
        successRate: 1.0,
        avgResponseTime: response.executionTime,
        avgCost: response.cost,
        avgTokensUsed: response.tokenCount.input + response.tokenCount.output,
        qualityScore: response.confidence,
        usageCount: 1,
        lastUpdated: new Date()
      });
    }
  }
  
  /**
   * Load performance metrics from database
   */
  private async loadPerformanceMetrics(): Promise<void> {
    try {
      const { data: metrics } = await this.supabase
        .from('model_performance_summary')
        .select('*')
        .gte('last_updated', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days
      
      if (metrics) {
        for (const metric of metrics) {
          const cacheKey = `${metric.model_id}_${metric.agent_id}_${metric.task_type}`;
          this.performanceCache.set(cacheKey, {
            modelId: metric.model_id,
            agentId: metric.agent_id,
            taskType: metric.task_type,
            successRate: metric.success_rate,
            avgResponseTime: metric.avg_response_time,
            avgCost: metric.avg_cost,
            avgTokensUsed: metric.avg_tokens_used,
            qualityScore: metric.quality_score,
            usageCount: metric.usage_count,
            lastUpdated: new Date(metric.last_updated)
          });
        }
      }
      
      console.log(`[MultiModel] Loaded ${this.performanceCache.size} performance metrics`);
      
    } catch (error) {
      console.warn('[MultiModel] Failed to load performance metrics:', error);
    }
  }
  
  /**
   * Get model recommendations for agent
   */
  public getModelRecommendationsForAgent(agentId: string): Array<{modelId: string, reason: string, score: number}> {
    const preferences = AGENT_MODEL_PREFERENCES[agentId] || ['gpt-4'];
    
    return preferences.map(modelId => {
      const model = MODEL_PROVIDERS[modelId];
      const cacheKey = `${modelId}_${agentId}_analysis`; // Default to analysis task
      const metrics = this.performanceCache.get(cacheKey);
      
      let reason = `Optimized for ${agentId} based on `;
      let score = 0.8; // Default score
      
      if (metrics) {
        score = (metrics.successRate * 0.4) + (metrics.qualityScore * 0.4) + 
                ((5000 - metrics.avgResponseTime) / 5000 * 0.2);
        reason += `${metrics.usageCount} successful executions (${(metrics.successRate * 100).toFixed(1)}% success rate)`;
      } else {
        reason += `model capabilities and cost efficiency`;
      }
      
      return { modelId, reason, score: Math.min(1.0, Math.max(0.1, score)) };
    }).sort((a, b) => b.score - a.score);
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const multiModelEngine = new MultiModelOrchestrationEngine(); 