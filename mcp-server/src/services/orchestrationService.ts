import { logger } from '../utils/logger';
import { QueueService } from './queueService';
import { WorkflowService } from './workflowService';

export interface OrchestrationRequest {
  type: 'agent_handoff' | 'video_analysis' | 'payment_processing' | 'email_automation' | 'custom';
  payload: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, any>;
}

export interface OrchestrationResponse {
  success: boolean;
  orchestrationId: string;
  queueJobs?: string[];
  workflowExecutions?: string[];
  message?: string;
  error?: string;
}

export class OrchestrationService {
  private queueService: QueueService;
  private workflowService: WorkflowService;

  constructor() {
    this.queueService = new QueueService();
    this.workflowService = new WorkflowService();
  }

  /**
   * Main orchestration method that coordinates between queues and workflows
   */
  async orchestrate(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    const orchestrationId = `orch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    logger.info(`🎼 Starting orchestration ${orchestrationId}`, {
      type: request.type,
      priority: request.priority,
      metadata: request.metadata
    });

    try {
      const response: OrchestrationResponse = {
        success: true,
        orchestrationId,
        queueJobs: [],
        workflowExecutions: []
      };

      switch (request.type) {
        case 'agent_handoff':
          return await this.orchestrateAgentHandoff(request, orchestrationId);
        
        case 'video_analysis':
          return await this.orchestrateVideoAnalysis(request, orchestrationId);
        
        case 'payment_processing':
          return await this.orchestratePaymentProcessing(request, orchestrationId);
        
        case 'email_automation':
          return await this.orchestrateEmailAutomation(request, orchestrationId);
        
        case 'custom':
          return await this.orchestrateCustom(request, orchestrationId);
        
        default:
          throw new Error(`Unknown orchestration type: ${request.type}`);
      }

    } catch (error) {
      logger.error(`❌ Orchestration ${orchestrationId} failed:`, error);
      return {
        success: false,
        orchestrationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Orchestrate agent handoff process
   */
  private async orchestrateAgentHandoff(
    request: OrchestrationRequest, 
    orchestrationId: string
  ): Promise<OrchestrationResponse> {
    const { fromAgent, toAgent, userId, context, reason } = request.payload;
    
    logger.info(`🤝 Orchestrating agent handoff: ${fromAgent} → ${toAgent}`);

    // 1. Queue the handoff job
    const handoffJob = await this.queueService.addAgentHandoffJob({
      fromAgent,
      toAgent,
      userId,
      context: { ...context, orchestrationId },
      handoffReason: reason
    }, { priority: request.priority === 'high' ? 10 : 5 });

    // 2. Trigger n8n workflow for notifications and logging
    const workflowResult = await this.workflowService.triggerWorkflow('agent-handoff', {
      fromAgent,
      toAgent,
      userId,
      context,
      reason,
      orchestrationId,
      jobId: handoffJob.id
    });

    // 3. Optional: Queue follow-up notifications
    const notificationJob = await this.queueService.addNotificationJob({
      userId,
      type: 'email',
      message: `Agent handoff completed: ${fromAgent} → ${toAgent}`,
      metadata: { orchestrationId, handoffJobId: handoffJob.id }
    });

    return {
      success: true,
      orchestrationId,
      queueJobs: [handoffJob.id!, notificationJob.id!],
      workflowExecutions: workflowResult.executionId ? [workflowResult.executionId] : [],
      message: `Agent handoff orchestrated: ${fromAgent} → ${toAgent}`
    };
  }

  /**
   * Orchestrate video analysis process
   */
  private async orchestrateVideoAnalysis(
    request: OrchestrationRequest,
    orchestrationId: string
  ): Promise<OrchestrationResponse> {
    const { videoUrl, userId, analysisType, metadata } = request.payload;
    
    logger.info(`🎥 Orchestrating video analysis for user ${userId}`);

    // 1. Queue video analysis job
    const analysisJob = await this.queueService.addVideoAnalysisJob({
      videoUrl,
      userId,
      analysisType,
      metadata: { ...metadata, orchestrationId }
    });

    // 2. Trigger n8n workflow for pre-analysis setup
    const workflowResult = await this.workflowService.triggerWorkflow('video-analysis-start', {
      videoUrl,
      userId,
      analysisType,
      orchestrationId,
      jobId: analysisJob.id
    });

    // 3. Schedule follow-up workflow for post-analysis
    const followUpResult = await this.workflowService.scheduleWorkflow('video-analysis-followup', {
      userId,
      orchestrationId,
      analysisJobId: analysisJob.id
    }, { delay: 3600 }); // 1 hour delay

    return {
      success: true,
      orchestrationId,
      queueJobs: [analysisJob.id!],
      workflowExecutions: [
        workflowResult.executionId,
        followUpResult.executionId
      ].filter(Boolean) as string[],
      message: `Video analysis orchestrated for user ${userId}`
    };
  }

  /**
   * Orchestrate payment processing workflow
   */
  private async orchestratePaymentProcessing(
    request: OrchestrationRequest,
    orchestrationId: string
  ): Promise<OrchestrationResponse> {
    const { paymentIntentId, userId, amount, currency, metadata } = request.payload;
    
    logger.info(`💳 Orchestrating payment processing for ${paymentIntentId}`);

    // 1. Queue payment processing job (high priority)
    const paymentJob = await this.queueService.addPaymentProcessingJob({
      paymentIntentId,
      userId,
      amount,
      currency,
      metadata: { ...metadata, orchestrationId }
    }, { priority: 9 });

    // 2. Trigger immediate n8n workflow for payment confirmation
    const workflowResult = await this.workflowService.triggerWorkflow('payment-processing', {
      paymentIntentId,
      userId,
      amount,
      currency,
      orchestrationId,
      jobId: paymentJob.id
    });

    // 3. Schedule welcome email workflow for new customers
    const emailJobs = [];
    if (metadata?.isFirstPayment) {
      const welcomeEmailJob = await this.queueService.addEmailJob({
        to: metadata.email,
        templateId: 'welcome-premium',
        variables: { 
          userName: metadata.userName || 'Valued Customer',
          plan: metadata.plan || 'Premium'
        },
        priority: 'high'
      }, { delay: 300 }); // 5 minute delay
      
      emailJobs.push(welcomeEmailJob.id!);
    }

    return {
      success: true,
      orchestrationId,
      queueJobs: [paymentJob.id!, ...emailJobs],
      workflowExecutions: workflowResult.executionId ? [workflowResult.executionId] : [],
      message: `Payment processing orchestrated for ${paymentIntentId}`
    };
  }

  /**
   * Orchestrate email automation sequences
   */
  private async orchestrateEmailAutomation(
    request: OrchestrationRequest,
    orchestrationId: string
  ): Promise<OrchestrationResponse> {
    const { sequence, userId, email, variables, schedule } = request.payload;
    
    logger.info(`📧 Orchestrating email automation sequence: ${sequence}`);

    const emailJobs = [];
    const workflowExecutions = [];

    // Trigger n8n workflow to coordinate the sequence
    const workflowResult = await this.workflowService.triggerWorkflow('email-automation', {
      sequence,
      userId,
      email,
      variables,
      schedule,
      orchestrationId
    });

    if (workflowResult.executionId) {
      workflowExecutions.push(workflowResult.executionId);
    }

    // Queue individual emails based on sequence type
    switch (sequence) {
      case 'onboarding': {
        // Welcome email (immediate)
        const welcomeJob = await this.queueService.addEmailJob({
          to: email,
          templateId: 'onboarding-welcome',
          variables: { ...variables, orchestrationId },
          priority: 'high'
        });
        emailJobs.push(welcomeJob.id!);

        // Feature introduction (1 day delay)
        const featureJob = await this.queueService.addEmailJob({
          to: email,
          templateId: 'onboarding-features',
          variables: { ...variables, orchestrationId },
          priority: 'normal'
        }, { delay: 86400 }); // 24 hours
        emailJobs.push(featureJob.id!);

        break;
      }

      case 'trial_expiry': {
        // Reminder emails at different intervals
        const intervals = [7, 3, 1]; // days before expiry
        for (const days of intervals) {
          const reminderJob = await this.queueService.addEmailJob({
            to: email,
            templateId: `trial-reminder-${days}d`,
            variables: { ...variables, daysRemaining: days, orchestrationId },
            priority: 'normal'
          }, { delay: (days * 86400) }); // Convert days to seconds
          emailJobs.push(reminderJob.id!);
        }
        break;
      }
    }

    return {
      success: true,
      orchestrationId,
      queueJobs: emailJobs,
      workflowExecutions,
      message: `Email automation sequence '${sequence}' orchestrated`
    };
  }

  /**
   * Orchestrate custom workflow combinations
   */
  private async orchestrateCustom(
    request: OrchestrationRequest,
    orchestrationId: string
  ): Promise<OrchestrationResponse> {
    const { workflows, queues, sequence } = request.payload;
    
    logger.info(`🔧 Orchestrating custom sequence for ${orchestrationId}`);

    const queueJobs: string[] = [];
    const workflowExecutions: string[] = [];

    // Process sequence of actions
    for (const action of sequence) {
      switch (action.type) {
        case 'queue': {
          const job = await this.queueService.addJob(
            action.queueName,
            action.payload,
            action.options
          );
          if (job.id) queueJobs.push(job.id);
          break;
        }

        case 'workflow': {
          const result = await this.workflowService.triggerWorkflow(
            action.workflowId,
            { ...action.payload, orchestrationId }
          );
          if (result.executionId) workflowExecutions.push(result.executionId);
          break;
        }

        case 'delay': {
          // Handle delays in custom sequences
          await new Promise(resolve => setTimeout(resolve, action.duration));
          break;
        }
      }
    }

    return {
      success: true,
      orchestrationId,
      queueJobs,
      workflowExecutions,
      message: `Custom orchestration completed with ${sequence.length} actions`
    };
  }

  /**
   * Get orchestration status by ID
   */
  async getOrchestrationStatus(orchestrationId: string): Promise<any> {
    logger.info(`📊 Getting status for orchestration ${orchestrationId}`);

    try {
      // Aggregate status from queues and workflows
      const queueStats = await this.queueService.getJobsByOrchestrationId(orchestrationId);
      const workflowStats = await this.workflowService.getExecutionsByOrchestrationId(orchestrationId);

      return {
        orchestrationId,
        status: 'running', // TODO: Calculate actual status
        queueJobs: queueStats,
        workflowExecutions: workflowStats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error getting orchestration status for ${orchestrationId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel orchestration and related jobs
   */
  async cancelOrchestration(orchestrationId: string): Promise<boolean> {
    logger.info(`🛑 Canceling orchestration ${orchestrationId}`);

    try {
      // Cancel queue jobs
      await this.queueService.cancelJobsByOrchestrationId(orchestrationId);
      
      // Cancel workflow executions
      await this.workflowService.cancelExecutionsByOrchestrationId(orchestrationId);

      logger.info(`✅ Orchestration ${orchestrationId} canceled successfully`);
      return true;

    } catch (error) {
      logger.error(`Error canceling orchestration ${orchestrationId}:`, error);
      return false;
    }
  }

  /**
   * Clean up resources
   */
  async close(): Promise<void> {
    logger.info('🔒 Closing OrchestrationService...');
    // Cleanup logic here
  }
}