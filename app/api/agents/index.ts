import agentRegistry from '@/lib/agents/agentRegistry';
import { NextResponse } from 'next/server';
import { getAgentImagePath, getAgentSets } from '@/utils/agentUtils';
import type { Agent } from '@/types/agent';
import { createClient } from '@supabase/supabase-js';
import { systemLog } from '@/utils/systemLog';
import { checkPremiumAccess, getAvailableFeatures } from '@/lib/premiumGating';

const ORBIT_TIERS = ['inner', 'mid', 'outer'] as const;

// --- Simple in-memory rate limiter (per IP) ---
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    entry = { count: 1, reset: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(ip, entry);
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }
  entry.count++;
  return false;
}

function selfHealAgent(agent: Agent) {
  const id = agent.id || 'unknown-agent';
  const name = agent.name || 'Unknown';
  const orbit = agent.orbit || { radius: 200, speed: 0.02, angle: 0 };
  const imageSlug = getAgentImagePath(agent);
  const gender = ['male', 'female', 'neutral'].includes(agent.gender || '') ? agent.gender : 'neutral';
  const moodColor = (agent as any).moodColor;
  let tier = (agent as any).tier;
  if (!tier || !ORBIT_TIERS.includes(tier)) {
    tier = 'outer';
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[API/agents] Agent ${name} missing/invalid tier, defaulting to 'outer'`);
    }
  }
  if (!agent.id || !agent.name || !agent.orbit || !agent.imageSlug) {
    console.warn(`[API/agents] Agent missing required fields:`, { id, name, orbit, imageSlug });
  }
  return { ...agent, id, name, orbit, imageSlug, moodColor, gender, tier };
}

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (checkRateLimit(ip)) {
    await systemLog({ type: 'warning', message: 'Rate limit exceeded on /api/agents', meta: { ip } });
    return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const meta: any = { ip: req.headers.get('x-forwarded-for') || 'unknown', timestamp: new Date().toISOString() };
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      await systemLog({ type: 'warning', message: 'Unauthorized /api/agents access attempt', meta });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    // Fetch user role
    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('userId', user.id)
      .maybeSingle();
    const userRole = userRoleData?.role || 'client';
    // Filter agents by role gating AND exclude Percy AND premium gating
    const visibleAgents = agentRegistry.filter(a => {
      // Exclude Percy from all agent listings
      if (a.id === 'percy-agent' || a.id === 'percy' || a.name === 'Percy') {
        return false;
      }
      
      // Check role-based access
      if (a.roleRequired && userRole !== a.roleRequired) {
        return false;
      }
      
      // Check premium feature access for premium agents
      if (a.premiumFeature && !checkPremiumAccess(userRole, a.premiumFeature)) {
        return false;
      }
      
      return true;
    });
    // Group if requested
    const url = new URL(req.url);
    const grouped = url.searchParams.get('grouped');
    let result;
    if (grouped) {
      result = getAgentSets(visibleAgents, 3);
    } else {
      result = visibleAgents;
    }
    // Add premium metadata to response
    const availableFeatures = getAvailableFeatures(userRole);
    await systemLog({ type: 'info', message: 'Agents list accessed', meta: { ...meta, userId: user.id, email: user.email, grouped: !!grouped, userRole } });
    return NextResponse.json({ 
      agents: result,
      userRole,
      availableFeatures: availableFeatures.map(f => f.id),
      premiumFeatures: availableFeatures
    });
  } catch (error: any) {
    await systemLog({ type: 'error', message: 'Agent list fetch error', meta: { ...meta, error: error.message } });
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 