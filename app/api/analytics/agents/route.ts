import { NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  // ✅ PROPER AUTH VALIDATION - Get user from auth header
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
  }

  // Validate the token and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    console.error('[Analytics] Auth validation failed:', authError?.message);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Check if user is admin
  const { data: userRoleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();
    
  const userRole = userRoleData?.role;
  const isAdmin = userRole === 'admin' || userRole === 'superadmin' || 
                  user.email?.endsWith('@skrbl.ai') || user.email?.endsWith('@skrblai.io');
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statType = searchParams.get('stat');

  try {
    switch (statType) {
      case 'usage':
        return await getAgentUsage(supabase);
      case 'power_levels':
        return await getAgentPowerLevels(supabase);
      case 'failure_rates':
        return await getAgentFailureRates(supabase);
      case 'handoffs':
        return await getHandoffStats(supabase);
      default:
        return NextResponse.json({ error: 'Invalid stat type provided' }, { status: 400 });
    }
  } catch (error: any) {
    console.error(`[Agent Analytics Error] Stat: ${statType}, Error: ${error.message}`);
    return NextResponse.json(
      { error: 'Failed to retrieve agent analytics', details: error.message },
      { status: 500 }
    );
  }
}

async function getAgentUsage(supabase: any) {
  const { data, error } = await supabase
    .from('agent_launches')
    .select('agent_id, status');

  if (error) throw error;

  return data;
}

interface AgentAnalytics {
  agent_id: string;
}

interface UsageCount {
  agent_id: string;
  count: number;
}

async function getAgentUsageStats(supabase: any) {
  const { data: rawData, error: rawError } = await supabase
    .from('agent_analytics')
    .select('agent_id')
    .eq('event_type', 'agent_launched');

  if (rawError) throw rawError;

  const usageCounts = rawData.reduce((acc: Record<string, number>, { agent_id }: AgentAnalytics) => {
    acc[agent_id] = (acc[agent_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedUsage: UsageCount[] = Object.entries(usageCounts)
    .map(([agent_id, count]) => ({ agent_id, count: count as number }))
    .sort((a, b) => (b.count as number) - (a.count as number));

  return NextResponse.json(sortedUsage);
}

interface LaunchStats {
  total: number;
  successes: number;
}

interface LaunchData {
  agent_id: string;
  status: string;
}

async function getAgentPowerLevels(supabase: any) {
  const { data: launches, error } = await supabase
    .from('agent_launches')
    .select('agent_id, status');

  if (error) throw error;

  const stats = launches.reduce((acc: Record<string, LaunchStats>, { agent_id, status }: LaunchData) => {
    if (!acc[agent_id]) {
      acc[agent_id] = { total: 0, successes: 0 };
    }
    acc[agent_id].total++;
    if (status === 'completed') {
      acc[agent_id].successes++;
    }
    return acc;
  }, {} as Record<string, LaunchStats>);

  interface PowerLevelData {
    agent_id: string;
    powerLevel: number;
    details: {
      totalLaunches: number;
      successRate: number;
    };
  }

  const powerLevels: PowerLevelData[] = Object.entries(stats).map(([agent_id, stats]) => {
    const { total, successes } = stats as LaunchStats;
    const successRate = total > 0 ? successes / total : 0;
    const powerLevel = Math.round(successRate * 100);
    return {
      agent_id,
      powerLevel,
      details: {
        totalLaunches: total,
        successRate: parseFloat(successRate.toFixed(2))
      }
    };
  }).sort((a, b) => b.powerLevel - a.powerLevel);

  return NextResponse.json(powerLevels);
}

async function getAgentFailureRates(supabase: any) {
  const { data: launches, error } = await supabase
    .from('agent_launches')
    .select('agent_id, status');

  if (error) throw error;

  interface FailureStats {
    total: number;
    failures: number;
  }

  interface LaunchFailureData {
    agent_id: string;
    status: string;
  }

  const stats = launches.reduce((acc: Record<string, FailureStats>, { agent_id, status }: LaunchFailureData) => {
    if (!acc[agent_id]) {
      acc[agent_id] = { total: 0, failures: 0 };
    }
    acc[agent_id].total++;
    if (status === 'failed') {
      acc[agent_id].failures++;
    }
    return acc;
  }, {} as Record<string, FailureStats>);

  interface FailureRateData {
    agent_id: string;
    failureRate: number;
    details: {
      totalLaunches: number;
      totalFailures: number;
    };
  }

  const failureRates: FailureRateData[] = Object.entries(stats).map(([agent_id, stats]) => {
    const { total, failures } = stats as FailureStats;
    const failureRate = total > 0 ? failures / total : 0;
    return {
      agent_id,
      failureRate: parseFloat(failureRate.toFixed(2)),
      details: {
        totalLaunches: total,
        totalFailures: failures
      }
    };
  }).sort((a, b) => b.failureRate - a.failureRate);
  
  return NextResponse.json(failureRates);
}

async function getHandoffStats(supabase: any) {
  const { data: handoffs, error } = await supabase
    .from('handoffs')
    .select('source_agent_id, target_agent_id, status');

  if (error) throw error;

  interface HandoffStats {
    total: number;
    completed: number;
    failed: number;
  }

  interface HandoffData {
    source_agent_id: string;
    target_agent_id: string;
    status: string;
  }

  const handoffStats = handoffs.reduce((acc: Record<string, HandoffStats>, { source_agent_id, target_agent_id, status }: HandoffData) => {
    const path = `${source_agent_id} → ${target_agent_id}`;
    if (!acc[path]) {
      acc[path] = { total: 0, completed: 0, failed: 0 };
    }
    acc[path].total++;
    if (status === 'completed') {
      acc[path].completed++;
    } else if (status === 'failed') {
      acc[path].failed++;
    }
    return acc;
  }, {} as Record<string, HandoffStats>);

  interface SuccessRateData {
    path: string;
    total: number;
    successRate: number;
    failureRate: number;
  }

  const successRates: SuccessRateData[] = Object.entries(handoffStats).map(([path, stats]) => {
    const { total, completed, failed } = stats as HandoffStats;
    const successRate = total > 0 ? completed / total : 0;
    const failureRate = total > 0 ? failed / total : 0;
    return {
      path,
      total,
      successRate: parseFloat(successRate.toFixed(2)),
      failureRate: parseFloat(failureRate.toFixed(2))
    };
  }).sort((a, b) => b.successRate - a.successRate);

  return NextResponse.json(successRates);
}