import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Enhanced VIP domains with reputation scoring
const VIP_DOMAINS = [
  // Fortune 500 Tech (40 points)
  { domain: 'microsoft.com', score: 40, category: 'fortune500-tech' },
  { domain: 'google.com', score: 40, category: 'fortune500-tech' },
  { domain: 'apple.com', score: 40, category: 'fortune500-tech' },
  { domain: 'amazon.com', score: 40, category: 'fortune500-tech' },
  { domain: 'meta.com', score: 40, category: 'fortune500-tech' },
  { domain: 'netflix.com', score: 35, category: 'fortune500-tech' },
  { domain: 'salesforce.com', score: 35, category: 'fortune500-tech' },
  { domain: 'adobe.com', score: 35, category: 'fortune500-tech' },
  { domain: 'oracle.com', score: 35, category: 'fortune500-tech' },
  { domain: 'ibm.com', score: 35, category: 'fortune500-tech' },
  
  // High-Growth Tech (30 points)
  { domain: 'stripe.com', score: 30, category: 'high-growth-tech' },
  { domain: 'shopify.com', score: 30, category: 'high-growth-tech' },
  { domain: 'airbnb.com', score: 30, category: 'high-growth-tech' },
  { domain: 'uber.com', score: 30, category: 'high-growth-tech' },
  { domain: 'openai.com', score: 35, category: 'ai-leader' },
  { domain: 'anthropic.com', score: 35, category: 'ai-leader' },
  { domain: 'deepmind.com', score: 35, category: 'ai-leader' },
  
  // Investment/Consulting (25 points)
  { domain: 'mckinsey.com', score: 25, category: 'consulting' },
  { domain: 'bain.com', score: 25, category: 'consulting' },
  { domain: 'bcg.com', score: 25, category: 'consulting' },
  { domain: 'deloitte.com', score: 20, category: 'consulting' },
  { domain: 'ey.com', score: 20, category: 'consulting' },
  { domain: 'kpmg.com', score: 20, category: 'consulting' }
];

const VIP_EMAIL_PATTERNS = [
  { pattern: /^[a-zA-Z0-9._%+-]+@(founder|ceo|cto|vp|director|head|chief)\./i, score: 20 },
  { pattern: /^(ceo|cto|vp|founder|director|head|chief)[a-zA-Z0-9._%+-]*@/i, score: 20 },
  { pattern: /^[a-zA-Z0-9._%+-]+\+(ceo|founder|exec)@/i, score: 15 },
  { pattern: /@(founders|executives|leadership)\./i, score: 15 }
];

// Enhanced VIP title indicators with scoring
const VIP_TITLES = [
  { title: 'CEO', score: 25, category: 'c-suite' },
  { title: 'CTO', score: 25, category: 'c-suite' },
  { title: 'CFO', score: 25, category: 'c-suite' },
  { title: 'CMO', score: 25, category: 'c-suite' },
  { title: 'COO', score: 25, category: 'c-suite' },
  { title: 'Founder', score: 30, category: 'founder' },
  { title: 'Co-Founder', score: 30, category: 'founder' },
  { title: 'President', score: 20, category: 'executive' },
  { title: 'VP', score: 15, category: 'vp' },
  { title: 'Vice President', score: 15, category: 'vp' },
  { title: 'Director', score: 12, category: 'director' },
  { title: 'Head of', score: 10, category: 'head' },
  { title: 'Partner', score: 18, category: 'partner' },
  { title: 'Principal', score: 15, category: 'principal' }
];

// Agent squad templates for VIP clients
const VIP_AGENT_SQUADS = {
  'enterprise-growth': {
    name: 'Enterprise Growth Squad',
    description: 'Complete business scaling solution',
    agents: ['biz', 'analytics', 'branding', 'contentcreation', 'social'],
    focus: 'Strategic growth, data-driven decisions, market expansion'
  },
  'content-powerhouse': {
    name: 'Content Powerhouse Squad',
    description: 'End-to-end content marketing automation',
    agents: ['contentcreation', 'adcreative', 'social', 'publishing', 'videocontent'],
    focus: 'Content creation, distribution, and optimization'
  },
  'tech-startup': {
    name: 'Tech Startup Squad',
    description: 'Perfect for scaling tech companies',
    agents: ['biz', 'adcreative', 'analytics', 'site', 'payment'],
    focus: 'Product marketing, user acquisition, conversion optimization'
  },
  'enterprise-automation': {
    name: 'Enterprise Automation Squad',
    description: 'Complete workflow automation',
    agents: ['percy-sync', 'clientsuccess', 'payment', 'analytics', 'proposal'],
    focus: 'Process automation, client management, operations'
  },
  'consulting-firm': {
    name: 'Consulting Firm Squad',
    description: 'Professional services optimization',
    agents: ['proposal', 'clientsuccess', 'branding', 'contentcreation', 'analytics'],
    focus: 'Client acquisition, proposal automation, thought leadership'
  }
};

export async function POST(req: NextRequest) {
  try {
    const { 
      email, 
      domain, 
      userTitle, 
      companyName, 
      companySize,
      linkedinUrl,
      revenue,
      industry,
      useCase,
      teamSize 
    } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required for VIP recognition' },
        { status: 400 }
      );
    }

    // Enhanced VIP scoring with domain reputation and LinkedIn data
    const scoringData = await enhancedVIPScoring({
      email,
      domain,
      userTitle,
      companyName,
      companySize,
      linkedinUrl,
      revenue,
      industry,
      teamSize
    });

    // Determine VIP level and personalized squad
    const vipLevel = determineVIPLevel(scoringData.totalScore);
    const recommendedSquad = recommendAgentSquad(vipLevel, industry, useCase, teamSize);
    const personalizedPlan = getPersonalizedPlan(vipLevel, scoringData, recommendedSquad);

    // Check if user already exists in VIP database
    const { data: existingVIP } = await supabase
      .from('vip_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    // Enhanced VIP data with domain reputation and squad recommendation
    const vipData = {
      email: email.toLowerCase(),
      domain: domain || email.split('@')[1],
      user_title: userTitle,
      company_name: companyName,
      company_size: companySize,
      linkedin_url: linkedinUrl,
      revenue,
      industry,
      team_size: teamSize,
      vip_score: scoringData.totalScore,
      vip_level: vipLevel,
      domain_reputation: scoringData.domainReputation,
      linkedin_profile: scoringData.linkedinData,
      recommended_squad: JSON.stringify(recommendedSquad),
      personalized_plan: JSON.stringify(personalizedPlan),
      scoring_breakdown: JSON.stringify(scoringData.breakdown),
      last_updated: new Date().toISOString()
    };

    if (existingVIP) {
      // Update existing VIP
      await supabase
        .from('vip_users')
        .update({
          ...vipData,
          recognition_count: existingVIP.recognition_count + 1
        })
        .eq('email', email.toLowerCase());
    } else {
      // Create new VIP record
      await supabase
        .from('vip_users')
        .insert({
          ...vipData,
          recognition_count: 1,
          created_at: new Date().toISOString()
        });
    }

    console.log(`[VIP Recognition] ${email} - Level: ${vipLevel}, Score: ${scoringData.totalScore}, Squad: ${recommendedSquad.name}`);

    return NextResponse.json({
      success: true,
      vipRecognition: {
        isVIP: vipLevel !== 'standard',
        vipLevel,
        vipScore: scoringData.totalScore,
        domainReputation: scoringData.domainReputation,
        linkedinEnrichment: scoringData.linkedinData,
        recommendedSquad,
        personalizedPlan,
        benefits: getVIPBenefits(vipLevel),
        prioritySupport: vipLevel === 'enterprise' || vipLevel === 'platinum',
        customOnboarding: vipLevel !== 'standard',
        dedicatedSuccess: vipLevel === 'enterprise',
        scoringBreakdown: scoringData.breakdown
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[VIP Recognition] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process VIP recognition',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Enhanced VIP scoring with domain reputation and LinkedIn enrichment
async function enhancedVIPScoring(data: any) {
  let totalScore = 0;
  const breakdown: any = {
    domain: 0,
    email: 0,
    title: 0,
    companySize: 0,
    revenue: 0,
    linkedin: 0,
    industry: 0
  };

  // Domain reputation scoring (up to 40 points)
  const domainReputation = await checkDomainReputation(data.domain || data.email.split('@')[1]);
  breakdown.domain = domainReputation.score;
  totalScore += domainReputation.score;

  // Email pattern scoring (up to 20 points)
  if (data.email) {
    for (const emailPattern of VIP_EMAIL_PATTERNS) {
      if (emailPattern.pattern.test(data.email)) {
        breakdown.email = emailPattern.score;
        totalScore += emailPattern.score;
        break;
      }
    }
  }

  // Title scoring (up to 25 points)
  if (data.userTitle) {
    for (const vipTitle of VIP_TITLES) {
      if (data.userTitle.toLowerCase().includes(vipTitle.title.toLowerCase())) {
        breakdown.title = vipTitle.score;
        totalScore += vipTitle.score;
        break;
      }
    }
  }

  // Company size scoring (up to 10 points)
  if (data.companySize) {
    const sizeScore = calculateCompanySizeScore(data.companySize);
    breakdown.companySize = sizeScore;
    totalScore += sizeScore;
  }

  // Revenue scoring (up to 10 points)
  if (data.revenue) {
    const revenueScore = calculateRevenueScore(data.revenue);
    breakdown.revenue = revenueScore;
    totalScore += revenueScore;
  }

  // LinkedIn enrichment (up to 15 points)
  const linkedinData = await enrichLinkedInProfile(data.linkedinUrl, data.userTitle, data.companyName);
  breakdown.linkedin = linkedinData.score;
  totalScore += linkedinData.score;

  // Industry scoring (up to 10 points)
  if (data.industry) {
    const industryScore = calculateIndustryScore(data.industry);
    breakdown.industry = industryScore;
    totalScore += industryScore;
  }

  return {
    totalScore: Math.min(totalScore, 100),
    domainReputation,
    linkedinData,
    breakdown
  };
}

// Check domain reputation and company information
async function checkDomainReputation(domain: string) {
  if (!domain) return { score: 0, category: 'unknown', info: null };

  // Check against VIP domains list
  const vipDomain = VIP_DOMAINS.find(d => d.domain === domain.toLowerCase());
  if (vipDomain) {
    return {
      score: vipDomain.score,
      category: vipDomain.category,
      info: {
        isFortune500: vipDomain.category.includes('fortune500'),
        isHighGrowth: vipDomain.category.includes('high-growth'),
        isAILeader: vipDomain.category.includes('ai-leader')
      }
    };
  }

  // Check for educational and government domains
  if (domain.endsWith('.edu')) {
    return {
      score: 25,
      category: 'education',
      info: { isEducational: true }
    };
  }

  if (domain.endsWith('.gov')) {
    return {
      score: 35,
      category: 'government',
      info: { isGovernment: true }
    };
  }

  // Basic domain analysis (could be enhanced with external APIs)
  const domainParts = domain.split('.');
  if (domainParts.length >= 2) {
    const tld = domainParts[domainParts.length - 1];
    const businessTlds = ['com', 'co', 'inc', 'corp', 'llc'];
    
    if (businessTlds.includes(tld)) {
      return {
        score: 5,
        category: 'business',
        info: { isBusiness: true }
      };
    }
  }

  return {
    score: 0,
    category: 'standard',
    info: null
  };
}

// Enrich LinkedIn profile data (placeholder for actual LinkedIn API integration)
async function enrichLinkedInProfile(linkedinUrl?: string, userTitle?: string, companyName?: string) {
  let score = 0;
  const enrichmentData: any = {
    profileExists: false,
    connectionsCount: 0,
    experienceLevel: 'entry',
    skills: [],
    recommendations: 0
  };

  if (!linkedinUrl) {
    return { score: 0, ...enrichmentData };
  }

  // Basic LinkedIn URL validation and analysis
  if (linkedinUrl.includes('linkedin.com/in/')) {
    enrichmentData.profileExists = true;
    score += 5;

    // Extract profile identifier for potential API calls
    const profileMatch = linkedinUrl.match(/linkedin\.com\/in\/([^/?]+)/);
    if (profileMatch) {
      enrichmentData.profileId = profileMatch[1];
      
      // Mock enrichment data (in production, would use LinkedIn API)
      if (userTitle) {
        const executiveKeywords = ['CEO', 'CTO', 'Founder', 'VP', 'Director'];
        if (executiveKeywords.some(keyword => userTitle.includes(keyword))) {
          enrichmentData.experienceLevel = 'executive';
          score += 10;
        } else {
          enrichmentData.experienceLevel = 'senior';
          score += 5;
        }
      }

      // Mock additional scoring based on profile completeness
      enrichmentData.connectionsCount = Math.floor(Math.random() * 1000) + 500; // Mock data
      if (enrichmentData.connectionsCount > 500) {
        score += 3;
      }
    }
  }

  return {
    score: Math.min(score, 15),
    ...enrichmentData
  };
}

// Calculate company size score
function calculateCompanySizeScore(companySize: string): number {
  const size = companySize.toLowerCase();
  if (size.includes('1000+') || size.includes('enterprise') || size.includes('10000+')) {
    return 10;
  } else if (size.includes('500') || size.includes('large') || size.includes('1000')) {
    return 7;
  } else if (size.includes('100') || size.includes('medium') || size.includes('500')) {
    return 5;
  } else if (size.includes('50') || size.includes('small')) {
    return 3;
  }
  return 1;
}

// Calculate revenue score
function calculateRevenueScore(revenue: string): number {
  const revenueNum = parseInt(revenue.replace(/[^0-9]/g, ''));
  if (revenueNum >= 100000000) { // $100M+
    return 10;
  } else if (revenueNum >= 10000000) { // $10M+
    return 7;
  } else if (revenueNum >= 1000000) { // $1M+
    return 5;
  } else if (revenueNum >= 100000) { // $100K+
    return 3;
  }
  return 1;
}

// Calculate industry score
function calculateIndustryScore(industry: string): number {
  const highValueIndustries = ['technology', 'fintech', 'saas', 'ai', 'machine learning'];
  const mediumValueIndustries = ['consulting', 'marketing', 'media', 'ecommerce'];
  
  const industryLower = industry.toLowerCase();
  
  if (highValueIndustries.some(hvi => industryLower.includes(hvi))) {
    return 10;
  } else if (mediumValueIndustries.some(mvi => industryLower.includes(mvi))) {
    return 7;
  }
  return 3;
}

// Recommend agent squad based on VIP level and requirements
function recommendAgentSquad(vipLevel: string, industry?: string, useCase?: string, teamSize?: number) {
  // Default squad based on VIP level
  let defaultSquad = 'enterprise-growth';
  
  if (vipLevel === 'enterprise') {
    defaultSquad = 'enterprise-automation';
  } else if (vipLevel === 'platinum') {
    defaultSquad = 'enterprise-growth';
  }

  // Customize based on industry
  if (industry) {
    const industryLower = industry.toLowerCase();
    if (industryLower.includes('tech') || industryLower.includes('startup')) {
      defaultSquad = 'tech-startup';
    } else if (industryLower.includes('consulting') || industryLower.includes('professional services')) {
      defaultSquad = 'consulting-firm';
    } else if (industryLower.includes('content') || industryLower.includes('media') || industryLower.includes('marketing')) {
      defaultSquad = 'content-powerhouse';
    }
  }

  // Customize based on use case
  if (useCase) {
    const useCaseLower = useCase.toLowerCase();
    if (useCaseLower.includes('content') || useCaseLower.includes('marketing')) {
      defaultSquad = 'content-powerhouse';
    } else if (useCaseLower.includes('automation') || useCaseLower.includes('workflow')) {
      defaultSquad = 'enterprise-automation';
    }
  }

  return VIP_AGENT_SQUADS[defaultSquad as keyof typeof VIP_AGENT_SQUADS] || VIP_AGENT_SQUADS['enterprise-growth'];
}

// The rest of the existing functions remain the same...
function determineVIPLevel(score: number): string {
  if (score >= 70) return 'enterprise';
  if (score >= 50) return 'platinum';
  if (score >= 30) return 'gold';
  if (score >= 15) return 'silver';
  return 'standard';
}

function getPersonalizedPlan(vipLevel: string, scoringData: any, recommendedSquad: any) {
  const basePlans = {
    enterprise: {
      planName: 'Enterprise Custom',
      monthlyValue: 2999,
      yearlyDiscount: 25,
      features: [
        'Unlimited AI agents',
        'Custom workflow development',
        'Dedicated success manager',
        'Priority support (1-hour response)',
        'Custom integrations',
        'Advanced analytics',
        'White-label options',
        'API access',
        `Custom Agent Squad: ${recommendedSquad.name}`
      ],
      customizations: [
        'Custom agent development',
        'Dedicated infrastructure',
        'Compliance packages (SOC2, HIPAA)',
        'Custom SLA agreements',
        'Personalized agent squad configuration'
      ]
    },
    platinum: {
      planName: 'Platinum Pro',
      monthlyValue: 999,
      yearlyDiscount: 20,
      features: [
        '50+ premium AI agents',
        'Advanced automation workflows',
        'Priority support (4-hour response)',
        'Custom branding',
        'Advanced integrations',
        'Team collaboration',
        'Performance analytics',
        `Recommended Squad: ${recommendedSquad.name}`
      ],
      customizations: [
        'Custom agent training',
        'Workflow optimization',
        'Integration assistance',
        'Squad customization available'
      ]
    },
    gold: {
      planName: 'Gold Business',
      monthlyValue: 299,
      yearlyDiscount: 15,
      features: [
        '25+ AI agents',
        'Business automation',
        'Standard support',
        'Team features',
        'Basic integrations',
        'Usage analytics',
        `Suggested Squad: ${recommendedSquad.name}`
      ],
      customizations: [
        'Onboarding assistance',
        'Basic workflow setup',
        'Squad recommendations'
      ]
    },
    silver: {
      planName: 'Silver Starter',
      monthlyValue: 99,
      yearlyDiscount: 10,
      features: [
        '10+ AI agents',
        'Basic automation',
        'Email support',
        'Individual use',
        'Standard integrations'
      ],
      customizations: [
        'Guided setup'
      ]
    },
    standard: {
      planName: 'Standard',
      monthlyValue: 29,
      yearlyDiscount: 10,
      features: [
        '5 AI agents',
        'Basic features',
        'Community support'
      ],
      customizations: []
    }
  };

  return basePlans[vipLevel as keyof typeof basePlans] || basePlans.standard;
}

function getVIPBenefits(vipLevel: string) {
  const benefits = {
    enterprise: [
      'Dedicated success manager',
      '1-hour priority support',
      'Custom development',
      'White-label options',
      'Compliance packages',
      'Custom SLA',
      'Personalized agent squad'
    ],
    platinum: [
      'Priority support (4-hour response)',
      'Custom agent training',
      'Advanced analytics',
      'Team collaboration',
      'Integration assistance',
      'Agent squad recommendations'
    ],
    gold: [
      'Business onboarding',
      'Team features',
      'Workflow optimization',
      'Standard support',
      'Basic squad guidance'
    ],
    silver: [
      'Guided setup',
      'Email support',
      'Basic automation'
    ],
    standard: [
      'Community support',
      'Basic features'
    ]
  };

  return benefits[vipLevel as keyof typeof benefits] || benefits.standard;
}

// GET endpoint remains the same but now includes enhanced data
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const domain = searchParams.get('domain');

    if (!email && !domain) {
      return NextResponse.json(
        { success: false, error: 'Email or domain required' },
        { status: 400 }
      );
    }

    let query = supabase.from('vip_users').select('*');

    if (email) {
      query = query.eq('email', email.toLowerCase());
    } else if (domain) {
      query = query.eq('domain', domain.toLowerCase());
    }

    const { data: vipUsers, error } = await query;

    if (error) {
      console.error('[VIP Recognition] Failed to fetch VIP data:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch VIP status' },
        { status: 500 }
      );
    }

    if (!vipUsers || vipUsers.length === 0) {
      return NextResponse.json({
        success: true,
        vipStatus: {
          isVIP: false,
          vipLevel: 'standard',
          message: 'No VIP recognition found'
        }
      });
    }

    const vipUser = vipUsers[0];

    return NextResponse.json({
      success: true,
      vipStatus: {
        isVIP: vipUser.vip_level !== 'standard',
        vipLevel: vipUser.vip_level,
        vipScore: vipUser.vip_score,
        domainReputation: vipUser.domain_reputation,
        recommendedSquad: JSON.parse(vipUser.recommended_squad || '{}'),
        personalizedPlan: JSON.parse(vipUser.personalized_plan || '{}'),
        benefits: getVIPBenefits(vipUser.vip_level),
        lastUpdated: vipUser.last_updated,
        scoringBreakdown: JSON.parse(vipUser.scoring_breakdown || '{}')
      }
    });

  } catch (error: any) {
    console.error('[VIP Recognition] GET Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get VIP status',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 