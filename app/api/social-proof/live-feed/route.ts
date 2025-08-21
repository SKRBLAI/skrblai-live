import { NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase/server';
import { withSafeJson } from '@/lib/api/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cache for live metrics to avoid database overload
let metricsCache: any = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Live Social Proof Data Pool
const socialProofTemplates = {
  signup: [
    "Business owner from {city} just automated their entire marketing workflow",
    "Tech startup in {city} eliminated {percentage}% of manual tasks", 
    "Marketing agency in {city} boosted client results by {percentage}%",
    "Content creator in {city} published {number} articles this month",
    "Consultant in {city} secured {number} new clients this week"
  ],
  agent_launch: [
    "Business in {city} generated ${amount}K in leads today",
    "Agency in {city} saved {number} hours with automated workflows", 
    "E-commerce store in {city} boosted sales by {percentage}% this quarter",
    "Freelancer in {city} doubled their output in {number} days",
    "Marketing team in {city} automated their entire funnel"
  ],
  revenue: [
    "Client in {city} increased revenue by ${amount}K this month",
    "Agency in {city} scaled from {number} to {number2} clients using automation",
    "Business owner in {city} freed up {number} hours per week",
    "Startup in {city} reduced operational costs by {percentage}%", 
    "Marketing ROI in {city} increased by {percentage}% with AI agents"
  ],
  engagement: [
    "Platform engagement up {percentage}% this month",
    "User satisfaction rating: {rating}/5 stars",
    "{percentage}% of users report significant time savings",
    "Average productivity increase: {percentage}%",
    "Customer retention rate: {percentage}% after 3 months"
  ]
};

const cities = [
  "Austin", "Seattle", "Denver", "Miami", "Boston", "Phoenix", "Atlanta", 
  "Portland", "Chicago", "Dallas", "San Francisco", "New York", "Los Angeles",
  "Nashville", "Orlando", "Las Vegas", "Charlotte", "Detroit", "Minneapolis"
];

function generateLiveMetrics() {
  const now = Date.now();
  const baseMetrics = {
    totalUsers: 2847 + Math.floor((now / 60000) % 50), // Increments every minute
    businessesTransformed: 47213 + Math.floor((now / 30000) % 25), // Every 30 seconds
    agentsLaunched: 92847 + Math.floor((now / 45000) % 35), // Every 45 seconds
    revenueGenerated: 2849718 + Math.floor((now / 60000) % 1000), // Every minute
    automationHours: 847293 + Math.floor((now / 90000) % 75), // Every 90 seconds
    percyScans: 18472 + Math.floor((now / 40000) % 15), // Every 40 seconds
  };

  return baseMetrics;
}

function generateSocialProofMessage(type: keyof typeof socialProofTemplates): string {
  const templates = socialProofTemplates[type];
  const template = templates[Math.floor(Math.random() * templates.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  
  // Replace placeholders with realistic data
  return template
    .replace('{city}', city)
    .replace('{percentage}', String(Math.floor(Math.random() * 200) + 150))
    .replace('{number}', String(Math.floor(Math.random() * 47) + 12))
    .replace('{number2}', String(Math.floor(Math.random() * 30) + 50))
    .replace('{amount}', String(Math.floor(Math.random() * 85) + 18))
    .replace('{rating}', String((Math.random() * 0.3 + 4.7).toFixed(1)));
}

async function getAnalyticsData() {
  try {
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      return {
        realUsers: 0,
        realAgentLaunches: 0,
        realWorkflows: 0,
        recentActivity: []
      };
    }
    // Get real data from Supabase for more accurate metrics
    const [
      { count: totalProfiles },
      { count: totalAgentLaunches },
      { count: totalWorkflows },
      { data: recentActivity }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('agent_analytics').select('*', { count: 'exact', head: true }),
      supabase.from('workflowLogs').select('*', { count: 'exact', head: true }),
      supabase
        .from('user_funnel_events')
        .select('*')
        .in('event_type', ['signup_complete', 'agent_launch', 'workflow_complete'])
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(20)
    ]);

    return {
      realUsers: totalProfiles || 0,
      realAgentLaunches: totalAgentLaunches || 0,
      realWorkflows: totalWorkflows || 0,
      recentActivity: recentActivity || []
    };
  } catch (error) {
    console.error('[Social Proof API] Database error:', error);
    return {
      realUsers: 0,
      realAgentLaunches: 0,
      realWorkflows: 0,
      recentActivity: []
    };
  }
}

/**
 * GET /api/social-proof/live-feed
 * Returns live social proof data and metrics
 */
export const GET = withSafeJson(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as keyof typeof socialProofTemplates || 'signup';
    const includeActivity = searchParams.get('includeActivity') === 'true';
    const count = parseInt(searchParams.get('count') || '5');

    // Check cache
    const now = Date.now();
    if (!metricsCache || (now - lastCacheUpdate) > CACHE_DURATION) {
      const [liveMetrics, analyticsData] = await Promise.all([
        generateLiveMetrics(),
        getAnalyticsData()
      ]);

      metricsCache = {
        ...liveMetrics,
        ...analyticsData,
        timestamp: now
      };
      lastCacheUpdate = now;
    }

    // Generate social proof messages
    const socialProofMessages = Array.from({ length: count }, () => ({
      id: Math.random().toString(36).substr(2, 9),
      message: generateSocialProofMessage(type),
      type,
      timestamp: new Date().toISOString(),
      activity: {
        city: cities[Math.floor(Math.random() * cities.length)],
        metric: Math.floor(Math.random() * 500) + 100
      }
    }));

    // Enhanced metrics with real and generated data
    const enhancedMetrics = {
      live: {
        totalUsers: metricsCache.totalUsers + metricsCache.realUsers,
        businessesTransformed: metricsCache.businessesTransformed + Math.floor(metricsCache.realUsers * 1.2),
        agentsLaunched: metricsCache.agentsLaunched + metricsCache.realAgentLaunches,
        revenueGenerated: metricsCache.revenueGenerated,
        automationHours: metricsCache.automationHours,
        percyScans: metricsCache.percyScans,
        updatedAt: new Date().toISOString()
      },
      growth: {
        usersToday: Math.floor(Math.random() * 47) + 23,
        agentsLaunchedToday: Math.floor(Math.random() * 156) + 89,
        revenueToday: Math.floor(Math.random() * 28000) + 12000,
        avgSessionTime: Math.floor(Math.random() * 15) + 12,
        conversionRate: parseFloat((Math.random() * 3 + 4.2).toFixed(1))
      },
      competitive: {
        marketShare: parseFloat((Math.random() * 5 + 73).toFixed(1)),
        competitorAdvantage: parseFloat((Math.random() * 100 + 340).toFixed(0)),
        industryLeading: true,
        recentAchievements: [
          "Fastest growing AI automation platform",
          "97% customer satisfaction rate",
          "50% faster than nearest competitor"
        ]
      }
    };

    const response = {
      success: true,
      data: {
        metrics: enhancedMetrics,
        socialProof: socialProofMessages,
        activity: includeActivity ? metricsCache.recentActivity : undefined,
        meta: {
          cacheAge: now - lastCacheUpdate,
          nextUpdate: CACHE_DURATION - (now - lastCacheUpdate),
          requestTime: new Date().toISOString()
        }
      }
    };

    // Set caching headers
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
        'X-Cache-Status': metricsCache ? 'HIT' : 'MISS'
      }
    });

  } catch (error: any) {
    console.error('[Social Proof API] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch social proof data',
      data: {
        metrics: generateLiveMetrics(),
        socialProof: [],
        activity: []
      }
    }, { status: 500 });
  }
});

/**
 * POST /api/social-proof/live-feed
 * Track user activity for social proof
 */
export const POST = withSafeJson(async (req: Request) => {
  const { eventType, data, userId } = await req.json();

  if (!eventType) {
    return NextResponse.json(
      { success: false, error: 'eventType is required' },
      { status: 400 }
    );
  }

  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
  }

  // Store the activity for real-time social proof
  const activityRecord = {
    event_type: eventType,
    user_id: userId,
    data: JSON.stringify(data),
    timestamp: new Date().toISOString(),
    ip_address: (req as any).headers?.get?.('x-forwarded-for') || 'unknown'
  };

  await supabase
    .from('social_proof_events')
    .insert(activityRecord);

  // Invalidate cache to include new activity
  metricsCache = null;

  return NextResponse.json({
    success: true,
    message: 'Activity tracked successfully'
  });
});