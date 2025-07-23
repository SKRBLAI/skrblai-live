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
  industry?: string; // New field for industry
  demoPreview?: { // New field for demo preview
    enabled: boolean;
    sampleInput: string;
    expectedOutput: string;
  };
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

// Enhanced Workflow Templates with Industry Specificity
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'content-creation-pipeline',
    name: 'Content Creation Pipeline',
    description: 'Research → Write → Edit → Publish workflow',
    agentId: 'contentCreatorAgent',
    category: 'content',
    estimatedDuration: 15,
    industry: 'general',
    demoPreview: {
      enabled: true,
      sampleInput: 'AI automation trends in 2025',
      expectedOutput: 'Complete blog post with SEO optimization, social media snippets, and email newsletter version'
    },
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
  
  // NEW: E-commerce Industry Templates
  {
    id: 'ecommerce-product-launch',
    name: 'E-commerce Product Launch Campaign',
    description: 'Complete product launch with descriptions, ads, and social media',
    agentId: 'marketingAgent',
    category: 'automation',
    industry: 'ecommerce',
    estimatedDuration: 25,
    requiredRole: 'pro',
    demoPreview: {
      enabled: true,
      sampleInput: 'Smart fitness tracker with heart rate monitoring',
      expectedOutput: 'Product descriptions, Amazon listing, Facebook ads, Instagram campaign, email sequences'
    },
    steps: [
      {
        id: 'product_analysis',
        name: 'Analyze Product Features',
        type: 'ai_task',
        config: { task: 'analyze_product', focus: 'benefits_features' }
      },
      {
        id: 'descriptions',
        name: 'Generate Product Descriptions',
        type: 'parallel',
        config: {
          tasks: [
            { platform: 'amazon', format: 'listing' },
            { platform: 'shopify', format: 'description' },
            { platform: 'website', format: 'hero_copy' }
          ]
        }
      },
      {
        id: 'ad_creative',
        name: 'Create Ad Campaigns',
        type: 'ai_task',
        config: { task: 'ad_creative', platforms: ['facebook', 'google', 'tiktok'] }
      },
      {
        id: 'social_campaign',
        name: 'Social Media Campaign',
        type: 'ai_task',
        config: { task: 'social_campaign', duration: '30_days' }
      }
    ]
  },

  // NEW: SaaS Industry Templates
  {
    id: 'saas-user-onboarding',
    name: 'SaaS User Onboarding Automation',
    description: 'Complete user onboarding with emails, tutorials, and support',
    agentId: 'automationAgent',
    category: 'automation',
    industry: 'saas',
    estimatedDuration: 30,
    requiredRole: 'pro',
    demoPreview: {
      enabled: true,
      sampleInput: 'Project management software onboarding',
      expectedOutput: 'Welcome email series, video tutorials, in-app notifications, support workflows'
    },
    steps: [
      {
        id: 'email_sequence',
        name: 'Create Welcome Email Series',
        type: 'ai_task',
        config: { task: 'email_sequence', type: 'onboarding', count: 7 }
      },
      {
        id: 'tutorial_content',
        name: 'Generate Tutorial Content',
        type: 'ai_task',
        config: { task: 'tutorial_creation', format: 'step_by_step' }
      },
      {
        id: 'automation_setup',
        name: 'Setup Automation Triggers',
        type: 'webhook',
        config: { url: '/api/automation/user-onboarding', method: 'POST' }
      }
    ]
  },

  // NEW: Professional Services Templates
  {
    id: 'consulting-client-proposal',
    name: 'Consulting Client Proposal Generator',
    description: 'Generate professional proposals with pricing and timelines',
    agentId: 'proposalAgent',
    category: 'automation',
    industry: 'consulting',
    estimatedDuration: 20,
    demoPreview: {
      enabled: true,
      sampleInput: 'Digital transformation consultation for manufacturing company',
      expectedOutput: 'Professional PDF proposal with executive summary, scope, timeline, pricing'
    },
    steps: [
      {
        id: 'client_analysis',
        name: 'Analyze Client Needs',
        type: 'ai_task',
        config: { task: 'client_analysis', depth: 'comprehensive' }
      },
      {
        id: 'proposal_generation',
        name: 'Generate Proposal Content',
        type: 'ai_task',
        config: { task: 'proposal_writing', include_pricing: true }
      },
      {
        id: 'pdf_creation',
        name: 'Create Professional PDF',
        type: 'ai_task',
        config: { task: 'pdf_generation', template: 'professional' }
      }
    ]
  },

  // NEW: Real Estate Industry Templates
  {
    id: 'real-estate-listing-optimizer',
    name: 'Real Estate Listing Optimizer',
    description: 'Optimize property listings for maximum visibility and leads',
    agentId: 'contentCreatorAgent',
    category: 'content',
    industry: 'real_estate',
    estimatedDuration: 15,
    demoPreview: {
      enabled: true,
      sampleInput: '3BR/2BA home in downtown area with updated kitchen',
      expectedOutput: 'MLS listing, social media posts, virtual tour script, lead magnets'
    },
    steps: [
      {
        id: 'property_analysis',
        name: 'Analyze Property Features',
        type: 'ai_task',
        config: { task: 'property_analysis', focus: 'selling_points' }
      },
      {
        id: 'listing_optimization',
        name: 'Optimize Listing Copy',
        type: 'ai_task',
        config: { task: 'listing_copy', seo_optimized: true }
      },
      {
        id: 'marketing_materials',
        name: 'Create Marketing Materials',
        type: 'parallel',
        config: {
          tasks: [
            { type: 'social_posts', platforms: ['facebook', 'instagram'] },
            { type: 'email_templates', purpose: 'lead_nurturing' },
            { type: 'virtual_tour_script', style: 'engaging' }
          ]
        }
      }
    ]
  },

  // Enhanced existing templates
  {
    id: 'social-media-campaign',
    name: 'Social Media Campaign',
    description: 'Multi-platform social content generation',
    agentId: 'socialMediaAgent',
    category: 'content',
    industry: 'general',
    estimatedDuration: 10,
    requiredRole: 'pro',
    demoPreview: {
      enabled: true,
      sampleInput: 'Launching a new mobile app for fitness tracking',
      expectedOutput: 'Instagram posts, Twitter threads, LinkedIn articles, TikTok scripts'
    },
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
    industry: 'b2b',
    estimatedDuration: 5,
    requiredRole: 'pro',
    demoPreview: {
      enabled: true,
      sampleInput: 'Software company with 50+ employees looking for automation tools',
      expectedOutput: 'Lead score, personalized follow-up sequence, sales rep assignment'
    },
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

// NEW: Enhanced template filtering functions
export function getTemplatesByIndustry(industry: string, userRole: string = 'free'): WorkflowTemplate[] {
  return getTemplatesForRole(userRole).filter(t => 
    t.industry === industry || t.industry === 'general'
  );
}

export function getTemplatesByCategory(category: WorkflowTemplate['category'], userRole: string = 'free'): WorkflowTemplate[] {
  return getTemplatesForRole(userRole).filter(t => t.category === category);
}

export function getTemplatePreview(templateId: string): WorkflowTemplate['demoPreview'] | null {
  const template = WORKFLOW_TEMPLATES.find(t => t.id === templateId);
  return template?.demoPreview || null;
}

export function getAvailableIndustries(): string[] {
  const industries = WORKFLOW_TEMPLATES
    .map(t => t.industry)
    .filter((industry): industry is string => industry !== undefined);
  return [...new Set(industries)].sort();
}

export function getTemplatesByComplexity(maxDuration: number, userRole: string = 'free'): WorkflowTemplate[] {
  return getTemplatesForRole(userRole).filter(t => t.estimatedDuration <= maxDuration);
}

export function generateTemplateRecommendations(
  userInput: string, 
  industry?: string, 
  userRole: string = 'free'
): WorkflowTemplate[] {
  const input = userInput.toLowerCase();
  let candidates = getTemplatesForRole(userRole);
  
  // Filter by industry if provided
  if (industry) {
    candidates = candidates.filter(t => t.industry === industry || t.industry === 'general');
  }
  
  // Score templates based on keyword relevance
  const scoredTemplates = candidates.map(template => {
    let score = 0;
    
    // Check name and description
    const templateText = `${template.name} ${template.description}`.toLowerCase();
    
    // Industry-specific keywords
    const industryKeywords = {
      ecommerce: ['product', 'shop', 'store', 'sell', 'listing', 'inventory'],
      saas: ['software', 'app', 'user', 'onboarding', 'subscription', 'feature'],
      consulting: ['client', 'proposal', 'strategy', 'consulting', 'advisory'],
      real_estate: ['property', 'house', 'listing', 'real estate', 'home', 'rent'],
      b2b: ['business', 'enterprise', 'lead', 'sales', 'corporate']
    };
    
    // Score based on keyword matches
    if (template.industry && industryKeywords[template.industry as keyof typeof industryKeywords]) {
      const keywords = industryKeywords[template.industry as keyof typeof industryKeywords];
      keywords.forEach(keyword => {
        if (input.includes(keyword)) score += 10;
      });
    }
    
    // Score based on template content
    if (templateText.includes(input)) score += 20;
    
    // Boost score for demo-enabled templates
    if (template.demoPreview?.enabled) score += 5;
    
    return { template, score };
  });
  
  // Return top 3 templates, sorted by score
  return scoredTemplates
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.template);
}

// NEW: Template execution analytics
export function getTemplateAnalytics(templateId: string): {
  executionCount: number;
  averageDuration: number;
  successRate: number;
  popularityRank: number;
} {
  // This would typically query a database, but for now return mock data
  const mockData = {
    'content-creation-pipeline': { executionCount: 1247, averageDuration: 12, successRate: 94, popularityRank: 1 },
    'ecommerce-product-launch': { executionCount: 892, averageDuration: 22, successRate: 91, popularityRank: 2 },
    'social-media-campaign': { executionCount: 756, averageDuration: 8, successRate: 96, popularityRank: 3 },
    'saas-user-onboarding': { executionCount: 634, averageDuration: 28, successRate: 89, popularityRank: 4 },
    'lead-qualification': { executionCount: 523, averageDuration: 4, successRate: 97, popularityRank: 5 }
  };
  
  return mockData[templateId as keyof typeof mockData] || 
    { executionCount: 0, averageDuration: 0, successRate: 0, popularityRank: 999 };
}

// NEW: Template demo execution
export async function executeTemplateDemo(
  templateId: string, 
  sampleInput?: string
): Promise<{
  success: boolean;
  output: string;
  executionTime: number;
  steps: Array<{ name: string; status: 'completed' | 'running' | 'pending'; output?: string }>;
}> {
  const template = WORKFLOW_TEMPLATES.find(t => t.id === templateId);
  if (!template || !template.demoPreview?.enabled) {
    throw new Error('Template demo not available');
  }
  
  const startTime = Date.now();
  const input = sampleInput || template.demoPreview.sampleInput;
  
  // Simulate step execution
  const steps = template.steps.map(step => ({
    name: step.name,
    status: 'completed' as const,
    output: `Completed: ${step.name} for "${input}"`
  }));
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    output: template.demoPreview.expectedOutput,
    executionTime: Date.now() - startTime,
    steps
  };
} 