import { validateAgentInput } from '@/utils/agentUtils';
import type { Agent, AgentInput as BaseAgentInput, AgentFunction } from '@/types/agent';

// Business Agent Types
interface BizAgentInput extends BaseAgentInput {
  businessName: string;
  industry: string;
  businessGoals?: string[];
  timeframe?: string;
  annualRevenue?: number;
  companySize?: string;
  challenges?: string[];
  location?: string;
}

interface BusinessInitiative {
  title: string;
  description: string;
  priority: string;
  timeline: string;
  keyMetrics: string[];
  resources: string[];
}

interface BusinessPlan {
  initiatives: BusinessInitiative[];
  goals: string[];
  timeline: string;
  budget: number;
}

interface Task {
  title: string;
  description: string;
  assignedTo: string;
  priority: string;
}

/**
 * Business Agent - Analyzes business data and provides strategic insights
 * @param input - Business analysis parameters
 * @returns Promise with success status, message and optional data
 */
const runBizAgent = async (input: BizAgentInput) => {
  try {
    // Validate required fields
    if (!input.userId || !input.businessName || !input.industry) {
      throw new Error('Missing required fields: userId, businessName, and industry');
    }

    // Parse business parameters
    const bizParams = {
      businessGoals: input.businessGoals || ['Increase Revenue', 'Expand Market Share'],
      timeframe: input.timeframe || '12 months',
      annualRevenue: input.annualRevenue || 1000000,
      companySize: input.companySize || 'small',
      challenges: input.challenges || ['Market Competition', 'Resource Optimization']
    };

    // Generate insights and recommendations
    const analysis = {
      marketAnalysis: generateMarketAnalysis(input.industry),
      competitorAnalysis: generateCompetitorAnalysis(input.industry),
      recommendations: generateRecommendations(
        input.industry,
        bizParams.businessGoals,
        bizParams.challenges,
        bizParams.timeframe
      ),
      businessPlan: generateBusinessPlan(
        input.industry,
        bizParams.businessGoals,
        bizParams.timeframe,
        bizParams.annualRevenue
      ),
      metadata: {
        businessName: input.businessName,
        industry: input.industry,
        timeframe: bizParams.timeframe,
        lastUpdated: new Date().toISOString()
      }
    };

    // Log agent activity
    logAgentActivity('bizAgent', input.userId, {
      action: 'generate_analysis',
      businessName: input.businessName,
      industry: input.industry
    });

    return Promise.resolve({
      success: true,
      message: 'Business analysis generated successfully',
      data: analysis
    });

  } catch (error) {
    return Promise.resolve({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

/**
 * Generate market analysis
 * @param industry - Industry of the business
 * @returns Generated market analysis
 */
function generateMarketAnalysis(industry: string): string {
  const analyses = {
    tech: [
      'Market shows strong growth potential in digital segment',
      'Increasing demand for mobile-first solutions',
      'Emerging opportunities in AI/ML integration'
    ],
    retail: [
      'Growing focus on omnichannel experiences',
      'Rising demand for personalized shopping',
      'Shift towards sustainable products'
    ],
    finance: [
      'Increasing adoption of digital payments',
      'Growing interest in decentralized finance',
      'Rising demand for automated solutions'
    ],
    default: [
      'Market shows positive growth trends',
      'Increasing demand for innovative solutions',
      'Growing focus on sustainability'
    ]
  };

  const industryAnalyses = analyses[industry as keyof typeof analyses] || analyses.default;
  return industryAnalyses[Math.floor(Math.random() * industryAnalyses.length)];
}

/**
 * Generate competitor analysis
 * @param industry - Industry of the business
 * @returns Generated competitor analysis
 */
function generateCompetitorAnalysis(industry: string): string {
  const analyses = {
    tech: [
      'Main competitors focusing on cloud solutions',
      'New entrants disrupting with AI/ML',
      'Market leaders investing in quantum computing'
    ],
    retail: [
      'Traditional retailers expanding online presence',
      'D2C brands gaining market share',
      'Focus on last-mile delivery optimization'
    ],
    finance: [
      'Fintech startups disrupting traditional banking',
      'Increased focus on blockchain technology',
      'Growing competition in digital payments'
    ],
    default: [
      'Main competitors focusing on traditional solutions',
      'New entrants bringing innovative approaches',
      'Market leaders investing in R&D'
    ]
  };

  const industryAnalyses = analyses[industry as keyof typeof analyses] || analyses.default;
  return industryAnalyses[Math.floor(Math.random() * industryAnalyses.length)];
}

/**
 * Generate recommendations
 * @param industry - Industry of the business
 * @param businessGoals - Business goals
 * @param challenges - Business challenges
 * @param timeframe - Timeframe for recommendations
 * @returns Generated recommendations
 */
function generateRecommendations(
  industry: string,
  businessGoals: string[],
  challenges: string[],
  timeframe: string
): {
  summary: string;
  strategies: Task[];
} {
  return {
    summary: `Based on the ${industry} industry and ${businessGoals} goals, we recommend the following strategies to address ${challenges} challenges over the ${timeframe} timeframe.`,
    strategies: [
      {
        title: 'Develop a digital transformation strategy',
        description: 'Invest in digital technologies to enhance customer experiences and improve operational efficiency.',
        assignedTo: 'Technology Lead',
        priority: 'High'
      },
      {
        title: 'Enhance data-driven decision making',
        description: 'Implement data analytics tools to inform business decisions and drive growth.',
        assignedTo: 'Data Analytics Team',
        priority: 'Medium'
      },
      {
        title: 'Foster a culture of innovation',
        description: 'Encourage experimentation and innovation to stay ahead of competitors and address emerging challenges.',
        assignedTo: 'Innovation Team',
        priority: 'Medium'
      }
    ]
  };
}

/**
 * Generate business plan
 * @param industry - Industry of the business
 * @param goals - Business goals
 * @param timeline - Business plan timeline
 * @param budget - Business plan budget
 * @returns Generated business plan
 */
function generateBusinessPlan(
  industry: string,
  goals: string[],
  timeline: string,
  budget: number
): BusinessPlan {
  const initiatives = generateInitiatives(goals);
  return {
    initiatives,
    goals,
    timeline,
    budget
  };
}

/**
 * Generate initiatives
 * @param goals - Business goals
 * @returns Generated initiatives
 */
function generateInitiatives(goals: string[]): BusinessInitiative[] {
  return goals.map(goal => ({
    title: `Initiative for ${goal}`,
    description: `Strategic initiative to achieve ${goal}`,
    priority: 'High',
    timeline: 'Q1',
    keyMetrics: ['Revenue', 'User Growth', 'Engagement'],
    resources: ['Team A', 'Budget B', 'Tools C']
  }));
}

/**
 * Log agent activity
 * @param agentName - Name of the agent
 * @param userId - User ID
 * @param activity - Activity details
 */
function logAgentActivity(agentName: string, userId: string, activity: Record<string, unknown>): void {
  console.log(`Agent ${agentName} activity for user ${userId}:`, activity);
}

const bizAgent: Agent = {
  id: 'biz-agent',
  name: 'Business Agent',
  category: 'Business',
  description: 'Helps with business strategy and operations.',
  visible: true,
  agentCategory: ['business', 'strategy', 'operations'],
  config: {
    name: 'Business Strategy',
    description: 'AI-powered business planning and analysis',
    capabilities: ['strategy', 'planning', 'analysis']
  },
  runAgent: async (input: BaseAgentInput) => {
    // Use the validateAgentInput helper for business fields
    const extendedInput = input as unknown as Record<string, any>;
    
    const bizFields = validateAgentInput(
      extendedInput,
      ['businessName', 'industry', 'businessGoals', 'timeframe', 'annualRevenue', 'companySize', 'challenges', 'location'],
      {
        // Type validation functions
        businessName: (val) => typeof val === 'string',
        industry: (val) => typeof val === 'string',
        businessGoals: (val) => Array.isArray(val),
        timeframe: (val) => typeof val === 'string',
        annualRevenue: (val) => typeof val === 'number',
        companySize: (val) => typeof val === 'string',
        challenges: (val) => Array.isArray(val),
        location: (val) => typeof val === 'string'
      },
      {
        // Default values
        businessName: '',
        industry: '',
        businessGoals: [],
        timeframe: '1 year',
        annualRevenue: 0,
        companySize: 'small',
        challenges: [],
        location: ''
      }
    );
    
    // Create the final input with both base and extended fields
    const bizInput: BizAgentInput = {
      userId: input.userId,
      goal: input.goal,
      content: input.content,
      context: input.context,
      options: input.options,
      ...bizFields
    };
    
    return runBizAgent(bizInput);
  }
};

console.log('[AgentAudit] Registered:', bizAgent.name, bizAgent.agentCategory);

export { bizAgent };
export default bizAgent;