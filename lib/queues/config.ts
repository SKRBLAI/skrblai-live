import { ConnectionOptions } from 'bullmq';

// Redis connection configuration for BullMQ
export const redisConfig: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  lazyConnect: true,
};

// Queue configuration options
export const queueConfig = {
  connection: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep only 100 completed jobs
    removeOnFail: 50,      // Keep only 50 failed jobs
    attempts: 3,           // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
};

// Available queue names
export const QueueNames = {
  VIDEO_ANALYSIS: 'video-analysis',
  EMAIL_SEND: 'email-send',
  AGENT_HANDOFF: 'agent-handoff',
  WORKFLOW_TRIGGER: 'workflow-trigger',
  PAYMENT_PROCESSING: 'payment-processing',
  NOTIFICATION_SEND: 'notification-send',
} as const;

export type QueueName = typeof QueueNames[keyof typeof QueueNames];