import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// VIP domains and email patterns
const VIP_DOMAINS = [
  'microsoft.com',
  'google.com',
  'apple.com',
  'amazon.com',
  'meta.com',
  'netflix.com',
  'salesforce.com',
  'adobe.com',
  'oracle.com',
  'ibm.com',
  'stripe.com',
  'shopify.com',
  'airbnb.com',
  'uber.com',
  'openai.com',
  'anthropic.com'
];

const VIP_EMAIL_PATTERNS = [
  /^[a-zA-Z0-9._%+-]+@(founder|ceo|cto|vp|director|head|chief)\./i,
  /^(ceo|cto|vp|founder|director|head|chief)[a-zA-Z0-9._%+-]*@/i
];

// VIP title indicators
const VIP_TITLES = [
  'CEO', 'CTO', 'VP', 'Director', 'Founder', 'Co-Founder', 
  'Chief', 'Head of', 'President', 'Partner', 'Principal'
];

export async function POST(req: NextRequest) {
  try {
    const { 
      email, 
      domain, 
      userTitle, 
      companyName, 
      companySize,
      linkedinUrl,
      revenue 
    } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required for VIP recognition' },
        { status: 400 }
      );
    }

    // Calculate VIP score
    const vipScore = calculateVIPScore({
      email,
      domain,
      userTitle,
      companyName,
      companySize,
      linkedinUrl,
      revenue
    });

    // Determine VIP level
    const vipLevel = determineVIPLevel(vipScore);

    // Get personalized plan
    const personalizedPlan = getPersonalizedPlan(vipLevel, {
      email,
      domain,
      userTitle,
      companyName,
      companySize,
      revenue
    });

    // Check if user already exists in VIP database
    const { data: existingVIP } = await supabase
      .from('vip_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    // Update or create VIP record
    const vipData = {
      email: email.toLowerCase(),
      domain: domain || email.split('@')[1],
      user_title: userTitle,
      company_name: companyName,
      company_size: companySize,
      linkedin_url: linkedinUrl,
      revenue,
      vip_score: vipScore,
      vip_level: vipLevel,
      personalized_plan: JSON.stringify(personalizedPlan),
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

    console.log(`[VIP Recognition] ${email} - Level: ${vipLevel}, Score: ${vipScore}`);

    return NextResponse.json({
      success: true,
      vipRecognition: {
        isVIP: vipLevel !== 'standard',
        vipLevel,
        vipScore,
        personalizedPlan,
        benefits: getVIPBenefits(vipLevel),
        prioritySupport: vipLevel === 'enterprise' || vipLevel === 'platinum',
        customOnboarding: vipLevel !== 'standard',
        dedicatedSuccess: vipLevel === 'enterprise'
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

// GET endpoint to check VIP status
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
        personalizedPlan: JSON.parse(vipUser.personalized_plan || '{}'),
        benefits: getVIPBenefits(vipUser.vip_level),
        lastUpdated: vipUser.last_updated
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

// Calculate VIP score based on multiple factors
function calculateVIPScore(data: any): number {
  let score = 0;

  // Domain scoring (40 points max)
  if (data.domain && VIP_DOMAINS.includes(data.domain.toLowerCase())) {
    score += 40;
  } else if (data.domain && data.domain.includes('.edu')) {
    score += 25; // Educational institutions
  } else if (data.domain && data.domain.includes('.gov')) {
    score += 35; // Government
  }

  // Email pattern scoring (20 points max)
  if (data.email) {
    for (const pattern of VIP_EMAIL_PATTERNS) {
      if (pattern.test(data.email)) {
        score += 20;
        break;
      }
    }
  }

  // Title scoring (20 points max)
  if (data.userTitle) {
    for (const vipTitle of VIP_TITLES) {
      if (data.userTitle.toLowerCase().includes(vipTitle.toLowerCase())) {
        score += 20;
        break;
      }
    }
  }

  // Company size scoring (10 points max)
  if (data.companySize) {
    const size = data.companySize.toLowerCase();
    if (size.includes('1000+') || size.includes('enterprise')) {
      score += 10;
    } else if (size.includes('500') || size.includes('large')) {
      score += 7;
    } else if (size.includes('100') || size.includes('medium')) {
      score += 5;
    }
  }

  // Revenue scoring (10 points max)
  if (data.revenue) {
    const revenue = parseInt(data.revenue.replace(/[^0-9]/g, ''));
    if (revenue >= 100000000) { // $100M+
      score += 10;
    } else if (revenue >= 10000000) { // $10M+
      score += 7;
    } else if (revenue >= 1000000) { // $1M+
      score += 5;
    }
  }

  return Math.min(score, 100); // Cap at 100
}

// Determine VIP level based on score
function determineVIPLevel(score: number): string {
  if (score >= 70) return 'enterprise';
  if (score >= 50) return 'platinum';
  if (score >= 30) return 'gold';
  if (score >= 15) return 'silver';
  return 'standard';
}

// Get personalized plan based on VIP level and data
function getPersonalizedPlan(vipLevel: string, data: any) {
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
        'API access'
      ],
      customizations: [
        'Custom agent development',
        'Dedicated infrastructure',
        'Compliance packages (SOC2, HIPAA)',
        'Custom SLA agreements'
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
        'Performance analytics'
      ],
      customizations: [
        'Custom agent training',
        'Workflow optimization',
        'Integration assistance'
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
        'Usage analytics'
      ],
      customizations: [
        'Onboarding assistance',
        'Basic workflow setup'
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

// Get VIP benefits based on level
function getVIPBenefits(vipLevel: string) {
  const benefits = {
    enterprise: [
      'Dedicated success manager',
      '1-hour priority support',
      'Custom development',
      'White-label options',
      'Compliance packages',
      'Custom SLA'
    ],
    platinum: [
      'Priority support (4-hour response)',
      'Custom agent training',
      'Advanced analytics',
      'Team collaboration',
      'Integration assistance'
    ],
    gold: [
      'Business onboarding',
      'Team features',
      'Workflow optimization',
      'Standard support'
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