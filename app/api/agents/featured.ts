import agentRegistry from '@/lib/agents/agentRegistry';
import { NextResponse } from 'next/server';
import { getAgentImagePath } from '@/utils/agentUtils';

type OrbitAgent = {
  id: string;
  name: string;
  avatarVariant: 'waistUp' | 'full';
  orbit?: { radius?: number; speed?: number; angle?: number };
  imageSlug: string;
  moodColor?: string;
  gender?: 'male' | 'female' | 'neutral';
};

export async function GET() {
  // Only include agents meant for homepage orbit
  const featuredAgents: OrbitAgent[] = agentRegistry
    .filter(a => a.displayInOrbit === true)
    .map(a => ({
      id: a.id,
      name: a.name,
      avatarVariant: a.avatarVariant || 'waistUp',
      orbit: a.orbit,
      imageSlug: getAgentImagePath(a, 'waistUp'),
      moodColor: (a as any).moodColor,
      gender: a.gender,
    }));
  return NextResponse.json({ agents: featuredAgents });
} 