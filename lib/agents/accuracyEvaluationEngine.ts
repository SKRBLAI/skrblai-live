/**
 * 🎯 N8N ACCURACY EVALUATION ENGINE
 * 
 * Automated QA system for all SKRBL AI agent workflows with:
 * - Real-time accuracy validation
 * - Intelligent retry mechanisms
 * - Fallback agent routing
 * - Admin notifications and escalation
 * - Performance optimization insights
 * 
 * @version 1.0.0 - ACCURACY DOMINATION
 */

import { createClient } from '@supabase/supabase-js';
import { agentLeague } from './agentLeague';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================================================
// ACCURACY EVALUATION TYPES
// =============================================================================

export interface AccuracyEvaluationConfig {
  executionId: string;
  workflowId: string;
  agentId: string;
  agentName: string;
  stepName: string;
  stepType: 'agent_execution' | 'handoff' | 'validation' | 'output_formatting';
  evaluationType: 'schema_validation' | 'output_quality' | 'handoff_accuracy' | 'completion_check';
  expectedSchema?: any;
  actualOutput: any;
  userPrompt?: string;
  userId?: string;
  executionTimeMs?: number;
}

export interface AccuracyResult {
  passed: boolean;
  accuracyScore: number;
  confidenceScore: number;
  validationErrors: string[];
  qualityMetrics: Record<string, any>;
  suggestedImprovements: string[];
  requiresRetry: boolean;
  escalationNeeded: boolean;
  fallbackAgentId?: string;
}

export interface AccuracyThreshold {
  agentId: string;
  workflowId?: string;
  stepType: string;
  minimumAccuracyScore: number;
  warningAccuracyScore: number;
  minimumConfidenceScore: number;
  maxExecutionTimeMs: number;
  maxRetryAttempts: number;
  autoRetryEnabled: boolean;
  fallbackAgentId?: string;
  escalationEnabled: boolean;
  adminNotificationEnabled: boolean;
}

// =============================================================================
// ACCURACY EVALUATION ENGINE
// =============================================================================

export class AccuracyEvaluationEngine {
  private thresholds: Map<string, AccuracyThreshold> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the accuracy evaluation engine
   */
  private async initialize(): Promise<void> {
    try {
      console.log('[AccuracyEngine] Initializing accuracy evaluation engine...');
      
      // Load accuracy thresholds from database
      const { data: thresholds } = await supabase
        .from('accuracy_thresholds')
        .select('*');
      
      if (thresholds) {
        thresholds.forEach(threshold => {
          const key = `${threshold.agent_id}:${threshold.workflow_id || 'default'}:${threshold.step_type}`;
          this.thresholds.set(key, {
            agentId: threshold.agent_id,
            workflowId: threshold.workflow_id,
            stepType: threshold.step_type,
            minimumAccuracyScore: threshold.minimum_accuracy_score,
            warningAccuracyScore: threshold.warning_accuracy_score,
            minimumConfidenceScore: threshold.minimum_confidence_score,
            maxExecutionTimeMs: threshold.maximum_execution_time_ms,
            maxRetryAttempts: threshold.maximum_retry_attempts,
            autoRetryEnabled: threshold.auto_retry_enabled,
            fallbackAgentId: threshold.fallback_agent_id,
            escalationEnabled: threshold.escalation_enabled,
            adminNotificationEnabled: threshold.admin_notification_enabled
          });
        });
      }
      
      this.initialized = true;
      console.log(`[AccuracyEngine] Loaded ${this.thresholds.size} accuracy thresholds`);
      
    } catch (error) {
      console.error('[AccuracyEngine] Failed to initialize:', error);
    }
  }

  /**
   * Evaluate the accuracy of a workflow step
   */
  public async evaluateAccuracy(config: AccuracyEvaluationConfig): Promise<AccuracyResult> {
    if (!this.initialized) await this.initialize();
    
    const startTime = Date.now();
    
    try {
      console.log(`[AccuracyEngine] Evaluating ${config.stepType} for ${config.agentId}`);
      
      // Get threshold configuration
      const threshold = this.getThreshold(config.agentId, config.workflowId, config.stepType);
      
      // Perform evaluation based on type
      let result: AccuracyResult;
      
      switch (config.evaluationType) {
        case 'schema_validation':
          result = await this.validateSchema(config, threshold);
          break;
        case 'output_quality':
          result = await this.evaluateOutputQuality(config, threshold);
          break;
        case 'handoff_accuracy':
          result = await this.evaluateHandoffAccuracy(config, threshold);
          break;
        case 'completion_check':
          result = await this.checkCompletion(config, threshold);
          break;
        default:
          throw new Error(`Unknown evaluation type: ${config.evaluationType}`);
      }
      
      // Check execution time threshold
      if (config.executionTimeMs && config.executionTimeMs > threshold.maxExecutionTimeMs) {
        result.qualityMetrics.executionTimeWarning = true;
        result.suggestedImprovements.push(`Execution time ${config.executionTimeMs}ms exceeds threshold ${threshold.maxExecutionTimeMs}ms`);
      }
      
      // Determine final status
      const finalStatus = this.determineFinalStatus(result, threshold);
      
      // Log the evaluation
      await this.logEvaluation(config, result, threshold, finalStatus);
      
      const evaluationTime = Date.now() - startTime;
      console.log(`[AccuracyEngine] Evaluation completed in ${evaluationTime}ms - Status: ${finalStatus}`);
      
      return result;
      
    } catch (error) {
      console.error('[AccuracyEngine] Evaluation failed:', error);
      
      // Log the failure
      await this.logEvaluationFailure(config, error as Error);
      
      return {
        passed: false,
        accuracyScore: 0,
        confidenceScore: 0,
        validationErrors: [`Evaluation system error: ${(error as Error).message}`],
        qualityMetrics: {},
        suggestedImprovements: ['Fix evaluation system error'],
        requiresRetry: true,
        escalationNeeded: true
      };
    }
  }

  /**
   * Validate output against expected schema
   */
  private async validateSchema(config: AccuracyEvaluationConfig, threshold: AccuracyThreshold): Promise<AccuracyResult> {
    const validationErrors: string[] = [];
    let accuracyScore = 100;
    
    if (!config.expectedSchema) {
      return {
        passed: true,
        accuracyScore: 90,
        confidenceScore: 85,
        validationErrors: ['No schema validation required'],
        qualityMetrics: { schemaValidation: 'skipped' },
        suggestedImprovements: [],
        requiresRetry: false,
        escalationNeeded: false
      };
    }
    
    // Validate required fields
    const requiredFields = config.expectedSchema.required || [];
    for (const field of requiredFields) {
      if (!config.actualOutput[field]) {
        validationErrors.push(`Missing required field: ${field}`);
        accuracyScore -= 15;
      }
    }
    
    // Validate field types
    const properties = config.expectedSchema.properties || {};
    for (const [field, schema] of Object.entries(properties)) {
      if (config.actualOutput[field]) {
        const actualType = typeof config.actualOutput[field];
        const expectedType = (schema as any).type;
        
        if (expectedType && actualType !== expectedType) {
          validationErrors.push(`Field '${field}' type mismatch: expected ${expectedType}, got ${actualType}`);
          accuracyScore -= 10;
        }
      }
    }
    
    accuracyScore = Math.max(0, accuracyScore);
    const confidenceScore = validationErrors.length === 0 ? 95 : Math.max(60, 95 - validationErrors.length * 10);
    
    return {
      passed: accuracyScore >= threshold.minimumAccuracyScore,
      accuracyScore,
      confidenceScore,
      validationErrors,
      qualityMetrics: {
        schemaValidation: validationErrors.length === 0 ? 'passed' : 'failed',
        fieldsValidated: Object.keys(properties).length,
        errorsFound: validationErrors.length
      },
      suggestedImprovements: validationErrors.length > 0 ? ['Fix schema validation errors'] : [],
      requiresRetry: accuracyScore < threshold.warningAccuracyScore,
      escalationNeeded: accuracyScore < threshold.warningAccuracyScore && validationErrors.length > 3
    };
  }

  /**
   * Evaluate output quality using heuristics
   */
  private async evaluateOutputQuality(config: AccuracyEvaluationConfig, threshold: AccuracyThreshold): Promise<AccuracyResult> {
    const qualityMetrics: Record<string, any> = {};
    const validationErrors: string[] = [];
    const suggestedImprovements: string[] = [];
    let accuracyScore = 80; // Start with baseline
    
    // Check output completeness
    if (!config.actualOutput || Object.keys(config.actualOutput).length === 0) {
      validationErrors.push('Empty or missing output');
      accuracyScore = 0;
    } else {
      qualityMetrics.outputSize = JSON.stringify(config.actualOutput).length;
      
      // Check for error indicators
      if (config.actualOutput.error || config.actualOutput.failed) {
        validationErrors.push('Output contains error indicators');
        accuracyScore -= 30;
      }
      
      // Check for success indicators
      if (config.actualOutput.success || config.actualOutput.result) {
        accuracyScore += 10;
        qualityMetrics.hasSuccessIndicators = true;
      }
      
      // Content quality checks
      if (typeof config.actualOutput.result === 'string') {
        const content = config.actualOutput.result;
        qualityMetrics.contentLength = content.length;
        
        if (content.length < 10) {
          validationErrors.push('Output content too short');
          accuracyScore -= 15;
        }
        
        // Check for placeholder content
        if (content.includes('TODO') || content.includes('placeholder')) {
          validationErrors.push('Output contains placeholder content');
          accuracyScore -= 20;
        }
      }
    }
    
    accuracyScore = Math.max(0, Math.min(100, accuracyScore));
    const confidenceScore = Math.max(70, 95 - validationErrors.length * 8);
    
    return {
      passed: accuracyScore >= threshold.minimumAccuracyScore,
      accuracyScore,
      confidenceScore,
      validationErrors,
      qualityMetrics,
      suggestedImprovements,
      requiresRetry: accuracyScore < threshold.warningAccuracyScore,
      escalationNeeded: accuracyScore < threshold.warningAccuracyScore / 2
    };
  }

  /**
   * Evaluate handoff accuracy
   */
  private async evaluateHandoffAccuracy(config: AccuracyEvaluationConfig, threshold: AccuracyThreshold): Promise<AccuracyResult> {
    const validationErrors: string[] = [];
    let accuracyScore = 100;
    
    // Check if handoff suggestions are present
    if (!config.actualOutput.handoffSuggestions) {
      validationErrors.push('Missing handoff suggestions');
      accuracyScore -= 20;
    } else {
      const suggestions = config.actualOutput.handoffSuggestions;
      
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        validationErrors.push('Invalid or empty handoff suggestions');
        accuracyScore -= 15;
      } else {
        // Validate each suggestion
        for (const suggestion of suggestions) {
          if (!suggestion.agentId) {
            validationErrors.push('Handoff suggestion missing agentId');
            accuracyScore -= 10;
          } else {
            // Check if suggested agent exists
            const targetAgent = agentLeague.getAgent(suggestion.agentId);
            if (!targetAgent) {
              validationErrors.push(`Invalid handoff target: ${suggestion.agentId}`);
              accuracyScore -= 15;
            }
          }
        }
      }
    }
    
    accuracyScore = Math.max(0, accuracyScore);
    const confidenceScore = validationErrors.length === 0 ? 90 : Math.max(60, 90 - validationErrors.length * 12);
    
    return {
      passed: accuracyScore >= threshold.minimumAccuracyScore,
      accuracyScore,
      confidenceScore,
      validationErrors,
      qualityMetrics: {
        handoffValidation: validationErrors.length === 0 ? 'passed' : 'failed',
        suggestionsCount: config.actualOutput.handoffSuggestions?.length || 0
      },
      suggestedImprovements: validationErrors.length > 0 ? ['Fix handoff validation errors'] : [],
      requiresRetry: accuracyScore < threshold.warningAccuracyScore,
      escalationNeeded: accuracyScore < 50
    };
  }

  /**
   * Check completion status
   */
  private async checkCompletion(config: AccuracyEvaluationConfig, threshold: AccuracyThreshold): Promise<AccuracyResult> {
    const validationErrors: string[] = [];
    let accuracyScore = 100;
    
    // Check for completion indicators
    if (!config.actualOutput.success && !config.actualOutput.completed) {
      validationErrors.push('No completion indicators found');
      accuracyScore -= 30;
    }
    
    // Check for error states
    if (config.actualOutput.error || config.actualOutput.failed) {
      validationErrors.push('Output indicates failure');
      accuracyScore = 0;
    }
    
    const confidenceScore = accuracyScore >= 80 ? 95 : 75;
    
    return {
      passed: accuracyScore >= threshold.minimumAccuracyScore,
      accuracyScore,
      confidenceScore,
      validationErrors,
      qualityMetrics: {
        completionCheck: accuracyScore >= 70 ? 'passed' : 'failed',
        hasErrorIndicators: !!(config.actualOutput.error || config.actualOutput.failed)
      },
      suggestedImprovements: validationErrors.length > 0 ? ['Ensure proper completion status'] : [],
      requiresRetry: accuracyScore < threshold.warningAccuracyScore,
      escalationNeeded: accuracyScore === 0
    };
  }

  /**
   * Get accuracy threshold for agent/workflow/step
   */
  private getThreshold(agentId: string, workflowId?: string, stepType?: string): AccuracyThreshold {
    // Try specific workflow first, then default
    const keys = [
      `${agentId}:${workflowId}:${stepType}`,
      `${agentId}:default:${stepType}`,
      `${agentId}:default:agent_execution`
    ];
    
    for (const key of keys) {
      const threshold = this.thresholds.get(key);
      if (threshold) return threshold;
    }
    
    // Fallback default threshold
    return {
      agentId,
      stepType: stepType || 'agent_execution',
      minimumAccuracyScore: 85,
      warningAccuracyScore: 70,
      minimumConfidenceScore: 80,
      maxExecutionTimeMs: 30000,
      maxRetryAttempts: 3,
      autoRetryEnabled: true,
      escalationEnabled: true,
      adminNotificationEnabled: true
    };
  }

  /**
   * Determine final status based on results and thresholds
   */
  private determineFinalStatus(result: AccuracyResult, threshold: AccuracyThreshold): 'pass' | 'fail' | 'warning' | 'retry' {
    if (result.escalationNeeded) return 'fail';
    if (result.requiresRetry) return 'retry';
    if (result.accuracyScore < threshold.minimumAccuracyScore) return 'fail';
    if (result.accuracyScore < threshold.warningAccuracyScore * 1.2) return 'warning';
    return 'pass';
  }

  /**
   * Log evaluation results to database
   */
  private async logEvaluation(
    config: AccuracyEvaluationConfig, 
    result: AccuracyResult, 
    threshold: AccuracyThreshold,
    status: string
  ): Promise<void> {
    try {
      await supabase.from('agent_evaluation_logs').insert({
        execution_id: config.executionId,
        workflow_id: config.workflowId,
        agent_id: config.agentId,
        agent_name: config.agentName,
        step_name: config.stepName,
        step_type: config.stepType,
        evaluation_type: config.evaluationType,
        accuracy_status: status,
        accuracy_score: result.accuracyScore,
        confidence_score: result.confidenceScore,
        expected_schema: config.expectedSchema,
        actual_output: config.actualOutput,
        validation_errors: result.validationErrors,
        quality_metrics: result.qualityMetrics,
        suggested_improvements: result.suggestedImprovements,
        escalation_triggered: result.escalationNeeded,
        execution_time_ms: config.executionTimeMs,
        user_id: config.userId,
        user_prompt: config.userPrompt,
        admin_notified: result.escalationNeeded && threshold.adminNotificationEnabled
      });
    } catch (error) {
      console.error('[AccuracyEngine] Failed to log evaluation:', error);
    }
  }

  /**
   * Log evaluation system failure
   */
  private async logEvaluationFailure(config: AccuracyEvaluationConfig, error: Error): Promise<void> {
    try {
      await supabase.from('agent_evaluation_logs').insert({
        execution_id: config.executionId,
        workflow_id: config.workflowId,
        agent_id: config.agentId,
        agent_name: config.agentName,
        step_name: config.stepName,
        step_type: config.stepType,
        evaluation_type: config.evaluationType,
        accuracy_status: 'fail',
        accuracy_score: 0,
        confidence_score: 0,
        error_message: error.message,
        escalation_triggered: true,
        admin_notified: true,
        user_id: config.userId,
        user_prompt: config.userPrompt
      });
    } catch (logError) {
      console.error('[AccuracyEngine] Failed to log evaluation failure:', logError);
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE & UTILITY FUNCTIONS
// =============================================================================

export const accuracyEngine = new AccuracyEvaluationEngine();

/**
 * Quick evaluation function for N8N workflows
 */
export async function evaluateWorkflowStep(config: AccuracyEvaluationConfig): Promise<AccuracyResult> {
  return accuracyEngine.evaluateAccuracy(config);
}

/**
 * Create N8N-compatible evaluation node payload
 */
export function createEvaluationNodePayload(result: AccuracyResult, retryCount = 0): any {
  return {
    success: result.passed,
    accuracyScore: result.accuracyScore,
    confidenceScore: result.confidenceScore,
    status: result.passed ? 'pass' : (result.requiresRetry ? 'retry' : 'fail'),
    errors: result.validationErrors,
    suggestions: result.suggestedImprovements,
    metrics: result.qualityMetrics,
    shouldRetry: result.requiresRetry && retryCount < 3,
    escalate: result.escalationNeeded,
    fallbackAgent: result.fallbackAgentId,
    retryCount,
    timestamp: new Date().toISOString()
  };
}
