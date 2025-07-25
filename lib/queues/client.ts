import { Queue, Worker, Job, JobsOptions } from 'bullmq';
import { queueConfig, QueueNames, QueueName } from './config';
import { triggerN8nWorkflow } from '../n8nClient';

// Queue instances for different job types
const queues = new Map<QueueName, Queue>();

// Initialize queues
export function getQueue(queueName: QueueName): Queue {
  if (!queues.has(queueName)) {
    const queue = new Queue(queueName, queueConfig);
    queues.set(queueName, queue);
  }
  return queues.get(queueName)!;
}

// Job data types for different queues
export interface VideoAnalysisJobData {
  videoUrl: string;
  userId: string;
  analysisType: 'skillsmith' | 'percy' | 'general';
  metadata?: Record<string, any>;
}

export interface EmailJobData {
  to: string;
  templateId: string;
  variables: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

export interface AgentHandoffJobData {
  fromAgent: string;
  toAgent: string;
  userId: string;
  context: Record<string, any>;
  handoffReason: string;
}

export interface WorkflowTriggerJobData {
  workflowId: string;
  payload: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

export interface PaymentProcessingJobData {
  paymentIntentId: string;
  userId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface NotificationJobData {
  userId: string;
  type: 'email' | 'sms' | 'push';
  message: string;
  metadata?: Record<string, any>;
}

// Generic job data type
export type JobData = 
  | VideoAnalysisJobData 
  | EmailJobData 
  | AgentHandoffJobData 
  | WorkflowTriggerJobData
  | PaymentProcessingJobData
  | NotificationJobData;

// Queue client class
export class QueueClient {
  private static instance: QueueClient;

  private constructor() {}

  public static getInstance(): QueueClient {
    if (!QueueClient.instance) {
      QueueClient.instance = new QueueClient();
    }
    return QueueClient.instance;
  }

  // Add a job to the queue
  async addJob<T extends JobData>(
    queueName: QueueName,
    jobData: T,
    options?: JobsOptions
  ): Promise<Job<T>> {
    const queue = getQueue(queueName);
    return queue.add(`${queueName}-job`, jobData, {
      ...queueConfig.defaultJobOptions,
      ...options,
    });
  }

  // Add video analysis job
  async addVideoAnalysisJob(
    jobData: VideoAnalysisJobData,
    options?: JobsOptions
  ): Promise<Job<VideoAnalysisJobData>> {
    return this.addJob(QueueNames.VIDEO_ANALYSIS, jobData, {
      priority: 1,
      delay: 0,
      ...options,
    });
  }

  // Add email job
  async addEmailJob(
    jobData: EmailJobData,
    options?: JobsOptions
  ): Promise<Job<EmailJobData>> {
    const priority = jobData.priority === 'high' ? 10 : jobData.priority === 'low' ? 1 : 5;
    return this.addJob(QueueNames.EMAIL_SEND, jobData, {
      priority,
      ...options,
    });
  }

  // Add agent handoff job
  async addAgentHandoffJob(
    jobData: AgentHandoffJobData,
    options?: JobsOptions
  ): Promise<Job<AgentHandoffJobData>> {
    return this.addJob(QueueNames.AGENT_HANDOFF, jobData, {
      priority: 8, // High priority for agent handoffs
      ...options,
    });
  }

  // Add workflow trigger job (integrates with n8n)
  async addWorkflowTriggerJob(
    jobData: WorkflowTriggerJobData,
    options?: JobsOptions
  ): Promise<Job<WorkflowTriggerJobData>> {
    const priority = jobData.priority === 'high' ? 10 : jobData.priority === 'low' ? 1 : 5;
    return this.addJob(QueueNames.WORKFLOW_TRIGGER, jobData, {
      priority,
      ...options,
    });
  }

  // Add payment processing job
  async addPaymentProcessingJob(
    jobData: PaymentProcessingJobData,
    options?: JobsOptions
  ): Promise<Job<PaymentProcessingJobData>> {
    return this.addJob(QueueNames.PAYMENT_PROCESSING, jobData, {
      priority: 9, // High priority for payments
      ...options,
    });
  }

  // Add notification job
  async addNotificationJob(
    jobData: NotificationJobData,
    options?: JobsOptions
  ): Promise<Job<NotificationJobData>> {
    return this.addJob(QueueNames.NOTIFICATION_SEND, jobData, options);
  }

  // Get queue statistics
  async getQueueStats(queueName: QueueName) {
    const queue = getQueue(queueName);
    return {
      waiting: await queue.getWaiting(),
      active: await queue.getActive(),
      completed: await queue.getCompleted(),
      failed: await queue.getFailed(),
      delayed: await queue.getDelayed(),
    };
  }

  // Close all queues
  async close(): Promise<void> {
    const closePromises = Array.from(queues.values()).map(queue => queue.close());
    await Promise.all(closePromises);
    queues.clear();
  }
}

// Export singleton instance
export const queueClient = QueueClient.getInstance();