export interface WorkflowJob {
  id: string;
  agentId: string;
  task: string;
  payload: any;
  userId: string;
  userRole: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
  metadata: {
    featureType?: string;
    workflow?: string;
    estimatedDuration?: number;
  };
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  agentId: string;
  steps: WorkflowStep[];
  requiredRole?: string;
  category: 'content' | 'automation' | 'analysis' | 'integration';
  estimatedDuration: number; // minutes
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'ai_task' | 'webhook' | 'delay' | 'conditional' | 'parallel';
  config: Record<string, any>;
  retryConfig?: {
    maxAttempts: number;
    backoffMs: number;
  };
}

class WorkflowQueue {
  private jobs = new Map<string, WorkflowJob>();
  private runningJobs = new Set<string>();
  private maxConcurrent = 5;

  async addJob(
    agentId: string,
    task: string,
    payload: any,
    userId: string,
    userRole: string,
    options: {
      priority?: WorkflowJob['priority'];
      featureType?: string;
      maxAttempts?: number;
    } = {}
  ): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: WorkflowJob = {
      id: jobId,
      agentId,
      task,
      payload,
      userId,
      userRole,
      priority: options.priority || 'normal',
      status: 'pending',
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      createdAt: new Date(),
      metadata: {
        featureType: options.featureType
      }
    };

    this.jobs.set(jobId, job);
    
    // Start processing if capacity available
    this.processQueue();
    
    return jobId;
  }

  async getJob(jobId: string): Promise<WorkflowJob | null> {
    return this.jobs.get(jobId) || null;
  }

  async getJobsByUser(userId: string): Promise<WorkflowJob[]> {
    return Array.from(this.jobs.values()).filter(job => job.userId === userId);
  }

  private async processQueue(): Promise<void> {
    if (this.runningJobs.size >= this.maxConcurrent) {
      return; // Queue full
    }

    // Get next job by priority
    const pendingJobs = Array.from(this.jobs.values())
      .filter(job => job.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { 'urgent': 4, 'high': 3, 'normal': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    const nextJob = pendingJobs[0];
    if (!nextJob) return;

    await this.executeJob(nextJob);
  }

  private async executeJob(job: WorkflowJob): Promise<void> {
    this.runningJobs.add(job.id);
    job.status = 'running';
    job.startedAt = new Date();
    job.attempts++;

    try {
      // Import the workflow execution function
      const { runAgentWorkflow } = await import('@/lib/agents/runAgentWorkflow');
      
      const result = await runAgentWorkflow(job.agentId, {
        ...job.payload,
        task: job.task
      }, job.userRole);

      if (result.status === 'success') {
        job.status = 'completed';
        job.result = result.result;
        job.completedAt = new Date();
      } else {
        throw new Error(result.result || 'Workflow failed');
      }

    } catch (error: any) {
      job.error = error.message;
      
      if (job.attempts < job.maxAttempts) {
        job.status = 'retrying';
        // Exponential backoff
        const delay = Math.pow(2, job.attempts) * 1000;
        setTimeout(() => {
          job.status = 'pending';
          this.processQueue();
        }, delay);
      } else {
        job.status = 'failed';
        job.completedAt = new Date();
      }
    }

    this.runningJobs.delete(job.id);
    
    // Continue processing queue
    setTimeout(() => this.processQueue(), 100);
  }

  getQueueStats(): {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
  } {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      running: jobs.filter(j => j.status === 'running').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length
    };
  }
}

export const workflowQueue = new WorkflowQueue();

// Workflow Templates
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'content-creation-pipeline',
    name: 'Content Creation Pipeline',
    description: 'Research → Write → Edit → Publish workflow',
    agentId: 'contentCreatorAgent',
    category: 'content',
    estimatedDuration: 15,
    steps: [
      {
        id: 'research',
        name: 'Research Topic',
        type: 'ai_task',
        config: { task: 'research', depth: 'comprehensive' }
      },
      {
        id: 'outline',
        name: 'Create Outline',
        type: 'ai_task',
        config: { task: 'outline', structure: 'blog_post' }
      },
      {
        id: 'write',
        name: 'Write Content',
        type: 'ai_task',
        config: { task: 'write', tone: 'professional' }
      },
      {
        id: 'edit',
        name: 'Edit & Optimize',
        type: 'ai_task',
        config: { task: 'edit', focus: 'seo' }
      }
    ]
  },
  {
    id: 'social-media-campaign',
    name: 'Social Media Campaign',
    description: 'Multi-platform social content generation',
    agentId: 'socialMediaAgent',
    category: 'content',
    estimatedDuration: 10,
    requiredRole: 'pro',
    steps: [
      {
        id: 'strategy',
        name: 'Campaign Strategy',
        type: 'ai_task',
        config: { task: 'strategy', platforms: ['twitter', 'linkedin', 'instagram'] }
      },
      {
        id: 'content_parallel',
        name: 'Generate Platform Content',
        type: 'parallel',
        config: {
          tasks: [
            { platform: 'twitter', format: 'thread' },
            { platform: 'linkedin', format: 'post' },
            { platform: 'instagram', format: 'story' }
          ]
        }
      }
    ]
  },
  {
    id: 'lead-qualification',
    name: 'Lead Qualification Flow',
    description: 'Automated lead scoring and nurturing',
    agentId: 'salesAgent',
    category: 'automation',
    estimatedDuration: 5,
    requiredRole: 'pro',
    steps: [
      {
        id: 'score',
        name: 'Score Lead',
        type: 'ai_task',
        config: { task: 'score_lead', criteria: 'b2b_saas' }
      },
      {
        id: 'qualify_check',
        name: 'Qualification Check',
        type: 'conditional',
        config: { 
          condition: 'score >= 75',
          onTrue: 'send_to_sales',
          onFalse: 'nurture_sequence'
        }
      },
      {
        id: 'webhook',
        name: 'Update CRM',
        type: 'webhook',
        config: { url: '/api/crm/update', method: 'POST' }
      }
    ]
  }
];

export function getWorkflowTemplate(templateId: string): WorkflowTemplate | null {
  return WORKFLOW_TEMPLATES.find(t => t.id === templateId) || null;
}

export function getTemplatesByCategory(category: WorkflowTemplate['category']): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(t => t.category === category);
}

export function getTemplatesForRole(userRole: string): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(t => {
    if (!t.requiredRole) return true;
    if (userRole === 'admin') return true;
    if (userRole === 'enterprise') return true;
    if (userRole === 'pro' && t.requiredRole === 'pro') return true;
    return false;
  });
} 