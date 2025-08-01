export interface ServiceSolution {
  id: string;
  problem: string;
  subheading: string;
  description: string;
  agents: string[];
  icon: string; // Changed from React.ReactNode to string
  metrics: {
    successRate: number;
    avgIncrease: string;
    timeToResults: string;
  };
  href: string;
  primaryColor: string;
  liveActivity: {
    users: number;
    status: string;
  };
  // New enhanced fields
  videoDemoUrl?: string;
  conversionCTA: string;
  agentSuggested: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  demoContent: {
    title: string;
    preview: string;
    duration: string;
  };
  personalization: {
    tags: string[];
    industryFit: string[];
    businessSize: string[];
  };
}

// Enhanced business solutions with new fields
export const businessSolutions: ServiceSolution[] = [
  {
    id: 'revenue-stalling',
    problem: "Revenue Stalling",
    subheading: "Break through growth plateaus",
    description: "AI powered analytics and marketing automation that identifies hidden revenue opportunities and converts them into profit.",
    agents: ['analytics', 'adcreative', 'social'],
    icon: 'TrendingUp',
    metrics: { successRate: 94, avgIncrease: "127%", timeToResults: "14 days" },
    href: '/analytics',
    primaryColor: 'from-green-600 to-emerald-500',
    liveActivity: { users: 47, status: "🔥 Hot" },
    videoDemoUrl: '/videos/demos/revenue-analytics.mp4',
    conversionCTA: 'Unlock Hidden Revenue Now',
    agentSuggested: ['analytics', 'adcreative'],
    urgencyLevel: 'high',
    demoContent: {
      title: 'Revenue Analytics in Action',
      preview: 'Watch how our AI identifies $50K+ revenue opportunities in 3 minutes',
      duration: '2:30'
    },
    personalization: {
      tags: ['revenue-growth', 'analytics', 'automation'],
      industryFit: ['ecommerce', 'saas', 'consulting', 'agencies'],
      businessSize: ['startup', 'small-business', 'enterprise']
    }
  },
  {
    id: 'brand-confusion',
    problem: "Brand Confusion", 
    subheading: "Customers don't get your brand",
    description: "Complete brand identity transformation with AI powered logo design, voice development, and positioning strategy.",
    agents: ['branding', 'contentcreation', 'book-publishing'],
    icon: 'Palette',
    metrics: { successRate: 89, avgIncrease: "156%", timeToResults: "21 days" },
    href: '/branding',
    primaryColor: 'from-purple-600 to-pink-500',
    liveActivity: { users: 33, status: "🎯 Trending" },
    videoDemoUrl: '/videos/demos/brand-transformation.mp4',
    conversionCTA: 'Transform Your Brand Today',
    agentSuggested: ['branding', 'contentcreation'],
    urgencyLevel: 'medium',
    demoContent: {
      title: 'Brand Transformation Demo',
      preview: 'See a complete brand makeover from confused to compelling in minutes',
      duration: '3:45'
    },
    personalization: {
      tags: ['branding', 'design', 'positioning'],
      industryFit: ['retail', 'professional-services', 'creative', 'hospitality'],
      businessSize: ['startup', 'small-business', 'medium-business']
    }
  },
  {
    id: 'manual-overwhelm',
    problem: "Manual Overwhelm",
    subheading: "Drowning in repetitive tasks",
    description: "Complete workflow automation that handles your busywork while you focus on strategy and growth.",
    agents: ['sync', 'biz', 'percy'],
    icon: 'Zap',
    metrics: { successRate: 96, avgIncrease: "234%", timeToResults: "7 days" },
    href: '/content-automation',
    primaryColor: 'from-blue-600 to-cyan-500',
    liveActivity: { users: 61, status: "⚡ Active" },
    videoDemoUrl: '/videos/demos/workflow-automation.mp4',
    conversionCTA: 'Automate Everything Now',
    agentSuggested: ['sync', 'biz'],
    urgencyLevel: 'critical',
    demoContent: {
      title: 'Workflow Automation Magic',
      preview: 'Watch 8 hours of work get automated in 90 seconds',
      duration: '1:30'
    },
    personalization: {
      tags: ['automation', 'productivity', 'efficiency'],
      industryFit: ['any'],
      businessSize: ['any']
    }
  },
  {
    id: 'content-drought',
    problem: "Content Drought",
    subheading: "Running out of content ideas",
    description: "AI powered content engine that creates unlimited engaging content across all platforms and formats.",
    agents: ['contentcreation', 'social', 'videocontent'],
    icon: 'FilePenLine',
    metrics: { successRate: 92, avgIncrease: "189%", timeToResults: "10 days" },
    href: '/content-automation',
    primaryColor: 'from-orange-600 to-red-500',
    liveActivity: { users: 78, status: "📈 Growing" },
    videoDemoUrl: '/videos/demos/content-engine.mp4',
    conversionCTA: 'Generate Endless Content',
    agentSuggested: ['contentcreation', 'social'],
    urgencyLevel: 'medium',
    demoContent: {
      title: 'Content Engine Demo',
      preview: 'Generate 30 days of content in 3 minutes',
      duration: '2:15'
    },
    personalization: {
      tags: ['content-marketing', 'social-media', 'creativity'],
      industryFit: ['marketing', 'media', 'ecommerce', 'education'],
      businessSize: ['startup', 'small-business', 'medium-business']
    }
  },
  {
    id: 'authority-absence',
    problem: "Authority Absence",
    subheading: "Nobody knows you exist",
    description: "Complete thought leadership strategy with book publishing, speaking opportunities, and industry recognition.",
    agents: ['publishing', 'contentcreation', 'proposal'],
    icon: 'BookOpen',
    metrics: { successRate: 87, avgIncrease: "167%", timeToResults: "30 days" },
    href: '/book-publishing',
    primaryColor: 'from-indigo-600 to-purple-500',
    liveActivity: { users: 29, status: "📚 Expert" },
    videoDemoUrl: '/videos/demos/thought-leadership.mp4',
    conversionCTA: 'Become An Authority',
    agentSuggested: ['publishing', 'contentcreation'],
    urgencyLevel: 'low',
    demoContent: {
      title: 'Thought Leadership Journey',
      preview: 'From unknown to industry expert in 30 days',
      duration: '4:20'
    },
    personalization: {
      tags: ['thought-leadership', 'publishing', 'authority'],
      industryFit: ['consulting', 'professional-services', 'coaching', 'finance'],
      businessSize: ['small-business', 'medium-business', 'enterprise']
    }
  },
  {
    id: 'sales-chaos',
    problem: "Sales Chaos",
    subheading: "Leads falling through cracks",
    description: "Complete sales automation with lead nurturing, proposal generation, and client success management.",
    agents: ['proposal', 'clientsuccess', 'analytics'],
    icon: 'DollarSign',
    metrics: { successRate: 91, avgIncrease: "198%", timeToResults: "14 days" },
    href: '/dashboard/analytics',
    primaryColor: 'from-green-600 to-teal-500',
    liveActivity: { users: 52, status: "💰 Profitable" },
    videoDemoUrl: '/videos/demos/sales-automation.mp4',
    conversionCTA: 'Fix Sales Chaos Now',
    agentSuggested: ['proposal', 'clientsuccess'],
    urgencyLevel: 'high',
    demoContent: {
      title: 'Sales Automation Demo',
      preview: 'Turn chaos into a predictable revenue machine',
      duration: '3:00'
    },
    personalization: {
      tags: ['sales-automation', 'lead-nurturing', 'crm'],
      industryFit: ['saas', 'professional-services', 'real-estate', 'consulting'],
      businessSize: ['startup', 'small-business', 'medium-business']
    }
  }
];

// Live business metrics
export interface LiveMetrics {
  totalUsers: number;
  urgentSpots: number;
  activeSolutions: number;
  businessesTransformed: number;
  revenueGenerated: string;
  averageROI: string;
}

// Global success metrics
export const globalMetrics = {
  totalProblems: 147,
  problemsSolved: 139,
  avgTimeToSolution: "12 days",
  clientSatisfaction: "97.3%"
};

// Percy recommendation context types
export interface RecommendationContext {
  userHistory?: string[];
  currentSelection?: string;
  businessType?: string;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  previousEngagement?: {
    serviceId: string;
    timestamp: number;
    action: 'viewed' | 'clicked' | 'started';
  }[];
}

// Agent handoff animation types
export interface HandoffAnimation {
  fromServiceId: string;
  toServiceId: string;
  agentInvolved: string;
  animationType: 'arrow' | 'fade' | 'progress' | 'glow';
  duration: number;
}