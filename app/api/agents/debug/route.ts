import { NextRequest, NextResponse } from 'next/server';
import { agentDashboardList } from '@/lib/agents/agentRegistry';
import { agentBackstories } from '@/lib/agents/agentBackstories';

export async function GET(req: NextRequest) {
  try {
    // Get all agents from registry
    const allAgents = agentDashboardList.map(agent => ({
      id: agent.id,
      name: agent.name,
      visible: agent.visible,
      category: agent.category,
      hasBackstory: !!agentBackstories[agent.id],
      imageSlug: agent.imageSlug,
      route: agent.route
    }));

    // Get agents from backstories
    const backstoryAgents = Object.keys(agentBackstories).map(id => ({
      id,
      name: agentBackstories[id].superheroName,
      hasRegistryEntry: !!agentDashboardList.find(a => a.id === id)
    }));

    // Find discrepancies
    const missingFromRegistry = backstoryAgents.filter(ba => !ba.hasRegistryEntry);
    const missingBackstories = allAgents.filter(a => !a.hasBackstory);
    const invisibleAgents = allAgents.filter(a => a.visible === false);

    return NextResponse.json({
      summary: {
        totalAgentsInRegistry: allAgents.length,
        totalBackstories: backstoryAgents.length,
        visibleAgents: allAgents.filter(a => a.visible !== false).length,
        invisibleAgents: invisibleAgents.length,
        missingFromRegistry: missingFromRegistry.length,
        missingBackstories: missingBackstories.length
      },
      details: {
        allAgents,
        backstoryAgents,
        missingFromRegistry,
        missingBackstories,
        invisibleAgents
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data' }, 
      { status: 500 }
    );
  }
} 