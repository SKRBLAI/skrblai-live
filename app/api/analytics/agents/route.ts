import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuth } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { userId, sessionClaims } = getAuth(req as any);
  const { searchParams } = new URL(req.url);
  const statType = searchParams.get('stat');

  // Only admins can access these analytics
  const userRole = (sessionClaims as { metadata?: { role?: string } } | null)?.metadata?.role;
  if (userRole !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    switch (statType) {
      case 'usage':
        return await getAgentUsage();
      case 'power_levels':
        return await getAgentPowerLevels();
      case 'failure_rates':
        return await getAgentFailureRates();
      case 'handoffs':
        return await getHandoffStats();
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

async function getAgentUsage() {
  const { data, error } = await supabase
    .from('agent_launches')
    .select('agent_id, count')
    .order('count', { ascending: false });

  if (error) throw error;
  
  // The query above assumes a view or table that pre-aggregates counts.
  // Let's do the aggregation here for now.
  const { data: rawData, error: rawError } = await supabase
    .from('agent_launches')
    .select('agent_id');
    
  if (rawError) throw rawError;

  const usageCounts = rawData.reduce((acc, { agent_id }) => {
    acc[agent_id] = (acc[agent_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedUsage = Object.entries(usageCounts)
    .map(([agent_id, count]) => ({ agent_id, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json(sortedUsage);
}

async function getAgentPowerLevels() {
  const { data: launches, error } = await supabase
    .from('agent_launches')
    .select('agent_id, status');

  if (error) throw error;

  const stats = launches.reduce((acc, { agent_id, status }) => {
    if (!acc[agent_id]) {
      acc[agent_id] = { total: 0, successes: 0 };
    }
    acc[agent_id].total++;
    if (status === 'success') {
      acc[agent_id].successes++;
    }
    return acc;
  }, {} as Record<string, { total: number; successes: number; }>);

  const powerLevels = Object.entries(stats).map(([agent_id, { total, successes }]) => {
    const successRate = total > 0 ? successes / total : 0;
    const powerLevel = (total * successRate) / 10; // Simple formula for now
    return {
      agent_id,
      powerLevel: parseFloat(powerLevel.toFixed(2)),
      details: {
        totalLaunches: total,
        successRate: parseFloat(successRate.toFixed(2))
      }
    };
  }).sort((a, b) => b.powerLevel - a.powerLevel);
  
  return NextResponse.json(powerLevels);
}

async function getAgentFailureRates() {
  const { data: launches, error } = await supabase
    .from('agent_launches')
    .select('agent_id, status');

  if (error) throw error;

  const stats = launches.reduce((acc, { agent_id, status }) => {
    if (!acc[agent_id]) {
      acc[agent_id] = { total: 0, failures: 0 };
    }
    acc[agent_id].total++;
    if (status === 'failed' || status === 'critical_failure') {
      acc[agent_id].failures++;
    }
    return acc;
  }, {} as Record<string, { total: number; failures: number; }>);

  const failureRates = Object.entries(stats).map(([agent_id, { total, failures }]) => ({
    agent_id,
    failureRate: total > 0 ? parseFloat((failures / total).toFixed(2)) : 0,
    details: {
        totalLaunches: total,
        totalFailures: failures
    }
  })).sort((a, b) => b.failureRate - a.failureRate);

  return NextResponse.json(failureRates);
}

async function getHandoffStats() {
    const { data: handoffs, error } = await supabase
        .from('agent_handoffs')
        .select('source_agent_id, target_agent_id, status');

    if (error) throw error;

    const stats = handoffs.reduce((acc, { source_agent_id, target_agent_id, status }) => {
        const path = `${source_agent_id} -> ${target_agent_id}`;
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
    }, {} as Record<string, { total: number; completed: number; failed: number; }>);

    const handoffStats = Object.entries(stats).map(([path, { total, completed, failed }]) => ({
        path,
        total,
        successRate: total > 0 ? parseFloat((completed / total).toFixed(2)) : 0,
        failureRate: total > 0 ? parseFloat((failed / total).toFixed(2)) : 0,
    })).sort((a, b) => b.total - a.total);

    return NextResponse.json(handoffStats);
} 