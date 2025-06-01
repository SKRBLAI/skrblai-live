import { NextRequest, NextResponse } from 'next/server';
import { agentDashboardList } from '@/lib/agents/agentRegistry';

export async function GET(req: NextRequest) {
  try {
    // Filter visible agents
    const visibleAgents = agentDashboardList.filter(
      agent => agent.visible !== false && agent.id && agent.name &&
      // Exclude Percy from all agent listings
      agent.id !== 'percy-agent' && agent.id !== 'percy' && agent.name !== 'Percy'
    );

    return NextResponse.json({ 
      agents: visibleAgents,
      count: visibleAgents.length 
    });
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' }, 
      { status: 500 }
    );
  }
} 