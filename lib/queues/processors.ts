import { Job, Worker } from 'bullmq';
import { queueConfig, QueueNames } from './config';
import { triggerN8nWorkflow } from '../n8nClient';
import {
  VideoAnalysisJobData,
  EmailJobData,
  AgentHandoffJobData,
  WorkflowTriggerJobData,
  PaymentProcessingJobData,
  NotificationJobData,
} from './client';

// Video Analysis Processor (SkillSmith example)
export async function processVideoAnalysis(job: Job<VideoAnalysisJobData>): Promise<any> {
  const { videoUrl, userId, analysisType, metadata } = job.data;
  
  console.log(`[VideoAnalysis] Starting analysis for user ${userId}, type: ${analysisType}`);
  
  try {
    // Update job progress
    await job.updateProgress(10);
    
    // TODO: Add actual video analysis logic here
    // For now, we'll simulate the process and trigger n8n workflow
    
    // Simulate analysis steps
    await job.updateProgress(30);
    console.log(`[VideoAnalysis] Processing video: ${videoUrl}`);
    
    // Mock analysis result
    const analysisResult = {
      videoUrl,
      userId,
      analysisType,
      skills: ['Communication', 'Leadership', 'Problem Solving'],
      confidence: 0.85,
      recommendations: [
        'Focus on vocal clarity during presentations',
        'Maintain consistent eye contact with audience',
        'Use more structured storytelling techniques'
      ],
      timestamp: new Date().toISOString(),
      metadata,
    };
    
    await job.updateProgress(70);
    
    // Trigger n8n workflow for post-analysis actions
    const workflowResult = await triggerN8nWorkflow('skill-analysis-complete', {
      analysisResult,
      userId,
      analysisType,
    });
    
    await job.updateProgress(90);
    
    // Store result in database (TODO: implement actual storage)
    console.log(`[VideoAnalysis] Analysis completed for ${userId}:`, analysisResult);
    
    await job.updateProgress(100);
    
    return {
      success: true,
      analysisResult,
      workflowTriggered: workflowResult.success,
      completedAt: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error(`[VideoAnalysis] Error processing video for ${userId}:`, error);
    throw error;
  }
}

// Email Processor
export async function processEmailSend(job: Job<EmailJobData>): Promise<any> {
  const { to, templateId, variables, priority } = job.data;
  
  console.log(`[EmailSend] Sending email to ${to} with template ${templateId}`);
  
  try {
    // TODO: Integrate with actual email service (Resend, SendGrid, etc.)
    // For now, simulate email sending
    
    await job.updateProgress(50);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await job.updateProgress(100);
    
    console.log(`[EmailSend] Email sent successfully to ${to}`);
    
    return {
      success: true,
      recipient: to,
      templateId,
      sentAt: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error(`[EmailSend] Error sending email to ${to}:`, error);
    throw error;
  }
}

// Agent Handoff Processor
export async function processAgentHandoff(job: Job<AgentHandoffJobData>): Promise<any> {
  const { fromAgent, toAgent, userId, context, handoffReason } = job.data;
  
  console.log(`[AgentHandoff] Handing off user ${userId} from ${fromAgent} to ${toAgent}`);
  
  try {
    // Update job progress
    await job.updateProgress(25);
    
    // Store handoff in database
    // TODO: Implement actual database storage
    
    await job.updateProgress(50);
    
    // Trigger n8n workflow for handoff notifications
    const workflowResult = await triggerN8nWorkflow('agent-handoff', {
      fromAgent,
      toAgent,
      userId,
      context,
      handoffReason,
      timestamp: new Date().toISOString(),
    });
    
    await job.updateProgress(75);
    
    // Send notifications to both agents
    // TODO: Implement notification logic
    
    await job.updateProgress(100);
    
    console.log(`[AgentHandoff] Handoff completed for user ${userId}`);
    
    return {
      success: true,
      fromAgent,
      toAgent,
      userId,
      workflowTriggered: workflowResult.success,
      completedAt: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error(`[AgentHandoff] Error processing handoff for ${userId}:`, error);
    throw error;
  }
}

// Workflow Trigger Processor (n8n integration)
export async function processWorkflowTrigger(job: Job<WorkflowTriggerJobData>): Promise<any> {
  const { workflowId, payload, priority } = job.data;
  
  console.log(`[WorkflowTrigger] Triggering n8n workflow ${workflowId}`);
  
  try {
    await job.updateProgress(30);
    
    // Trigger the n8n workflow
    const result = await triggerN8nWorkflow(workflowId, payload);
    
    await job.updateProgress(80);
    
    if (!result.success) {
      throw new Error(`Workflow trigger failed: ${result.message}`);
    }
    
    await job.updateProgress(100);
    
    console.log(`[WorkflowTrigger] Workflow ${workflowId} triggered successfully`);
    
    return {
      success: true,
      workflowId,
      executionId: result.executionId,
      status: result.status,
      completedAt: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error(`[WorkflowTrigger] Error triggering workflow ${workflowId}:`, error);
    throw error;
  }
}

// Payment Processing Processor
export async function processPaymentProcessing(job: Job<PaymentProcessingJobData>): Promise<any> {
  const { paymentIntentId, userId, amount, currency, metadata } = job.data;
  
  console.log(`[PaymentProcessing] Processing payment ${paymentIntentId} for user ${userId}`);
  
  try {
    await job.updateProgress(20);
    
    // TODO: Integrate with Stripe or other payment processor
    // For now, simulate payment processing
    
    await job.updateProgress(50);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await job.updateProgress(80);
    
    // Trigger n8n workflow for post-payment actions
    const workflowResult = await triggerN8nWorkflow('payment-completed', {
      paymentIntentId,
      userId,
      amount,
      currency,
      metadata,
      processedAt: new Date().toISOString(),
    });
    
    await job.updateProgress(100);
    
    console.log(`[PaymentProcessing] Payment ${paymentIntentId} processed successfully`);
    
    return {
      success: true,
      paymentIntentId,
      userId,
      amount,
      currency,
      workflowTriggered: workflowResult.success,
      processedAt: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error(`[PaymentProcessing] Error processing payment ${paymentIntentId}:`, error);
    throw error;
  }
}

// Notification Processor
export async function processNotificationSend(job: Job<NotificationJobData>): Promise<any> {
  const { userId, type, message, metadata } = job.data;
  
  console.log(`[NotificationSend] Sending ${type} notification to user ${userId}`);
  
  try {
    await job.updateProgress(40);
    
    // TODO: Implement actual notification sending based on type
    switch (type) {
      case 'email':
        // Send email notification
        break;
      case 'sms':
        // Send SMS notification
        break;
      case 'push':
        // Send push notification
        break;
    }
    
    await job.updateProgress(80);
    
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await job.updateProgress(100);
    
    console.log(`[NotificationSend] ${type} notification sent to user ${userId}`);
    
    return {
      success: true,
      userId,
      type,
      sentAt: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error(`[NotificationSend] Error sending ${type} notification to ${userId}:`, error);
    throw error;
  }
}

// Worker factory function
export function createWorker(queueName: string, processor: Function): Worker {
  return new Worker(queueName, processor as any, {
    connection: queueConfig.connection,
    concurrency: process.env.NODE_ENV === 'production' ? 5 : 2,
    removeOnComplete: 50,
    removeOnFail: 20,
  });
}

// Initialize all workers
export function initializeWorkers(): Map<string, Worker> {
  const workers = new Map<string, Worker>();
  
  // Create workers for each queue type
  workers.set(QueueNames.VIDEO_ANALYSIS, createWorker(QueueNames.VIDEO_ANALYSIS, processVideoAnalysis));
  workers.set(QueueNames.EMAIL_SEND, createWorker(QueueNames.EMAIL_SEND, processEmailSend));
  workers.set(QueueNames.AGENT_HANDOFF, createWorker(QueueNames.AGENT_HANDOFF, processAgentHandoff));
  workers.set(QueueNames.WORKFLOW_TRIGGER, createWorker(QueueNames.WORKFLOW_TRIGGER, processWorkflowTrigger));
  workers.set(QueueNames.PAYMENT_PROCESSING, createWorker(QueueNames.PAYMENT_PROCESSING, processPaymentProcessing));
  workers.set(QueueNames.NOTIFICATION_SEND, createWorker(QueueNames.NOTIFICATION_SEND, processNotificationSend));
  
  console.log('[QueueProcessors] All workers initialized');
  
  return workers;
}

// Graceful shutdown for workers
export async function shutdownWorkers(workers: Map<string, Worker>): Promise<void> {
  console.log('[QueueProcessors] Shutting down workers...');
  
  const shutdownPromises = Array.from(workers.values()).map(worker => worker.close());
  await Promise.all(shutdownPromises);
  
  console.log('[QueueProcessors] All workers shut down');
}