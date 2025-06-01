import agentRegistry from '@/lib/agents/agentRegistry';
import { NextResponse } from 'next/server';
import { getAgentImagePath, getAgentImageSlug } from '@/utils/agentUtils';
import type { Agent } from '@/types/agent';
import { createClient } from '@supabase/supabase-js';
import { systemLog } from '@/utils/systemLog';

const ORBIT_TIERS = ['inner', 'mid', 'outer'] as const;

type OrbitAgent = {
  id: string;
  name: string;
  orbit: { radius: number; speed: number; angle: number };
  imageSlug: string;
  moodColor?: string;
  gender: 'male' | 'female' | 'neutral';
  tier: 'inner' | 'mid' | 'outer';
};

function selfHealAgent(agent: Agent): OrbitAgent {
  // Default/fix all required fields
  const id = agent.id || 'unknown-agent';
  const name = agent.name || 'Unknown';
  const orbit = {
    radius: agent.orbit?.radius ?? 100,
    speed: agent.orbit?.speed ?? 1,
    angle: agent.orbit?.angle ?? 0,
  };
  const imageSlug = agent.imageSlug || getAgentImageSlug(agent);
  const gender = ['male', 'female', 'neutral'].includes(agent.gender || '') ? agent.gender as 'male' | 'female' | 'neutral' : 'neutral';
  const moodColor = (agent as any).moodColor;
  let tier = (agent as any).tier;
  if (!tier || !ORBIT_TIERS.includes(tier)) {
    tier = 'outer';
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[API/featured] Agent ${name} missing/invalid tier, defaulting to 'outer'`);
    }
  }
  // Log missing/invalid fields
  if (!agent.id || !agent.name || !agent.orbit || !agent.imageSlug) {
    console.warn(`[API/featured] Agent missing required fields:`, { id, name, orbit, imageSlug });
  }
  return { id, name, orbit, imageSlug, moodColor, gender, tier };
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const meta: any = { ip: req.headers.get('x-forwarded-for') || 'unknown', timestamp: new Date().toISOString() };
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      await systemLog({ type: 'warning', message: 'Unauthorized /api/agents/featured access attempt', meta });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const featuredAgents = agentRegistry
      .filter(a => {
        // Exclude Percy from featured agents
        if (a.id === 'percy-agent' || a.id === 'percy' || a.name === 'Percy') {
          return false;
        }
        return a.displayInOrbit === true;
      })
      .map(selfHealAgent);
    await systemLog({ type: 'info', message: 'Featured agents accessed', meta: { ...meta, userId: user.id, email: user.email } });
    return NextResponse.json({ agents: featuredAgents });
  } catch (error: any) {
    await systemLog({ type: 'error', message: 'Featured agent list fetch error', meta: { ...meta, error: error.message } });
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 