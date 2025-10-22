import { NextRequest, NextResponse } from 'next/server';
import { agentDashboardList } from '../../../lib/agents/agentRegistry';
import agentRegistry from '../../../lib/agents/agentRegistry';
import { agentBackstories } from '../../../lib/agents/agentBackstories';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // NEW: Recommendation endpoint
    if (searchParams.get('recommend') === 'true') {
      const mission = searchParams.get('mission') || '';
      const type = searchParams.get('type') || 'business'; // 'business' | 'sports'
      
      // Mission-to-agent mapping
      const missionMap: Record<string, string[]> = {
        'branding': ['branding', 'contentcreation', 'adcreative'],
        'brand': ['branding', 'contentcreation', 'adcreative'],
        'logo': ['branding', 'adcreative'],
        'identity': ['branding', 'contentcreation'],
        'publishing': ['publishing', 'contentcreation', 'branding'],
        'book': ['publishing', 'contentcreation'],
        'content': ['contentcreation', 'social', 'publishing'],
        'marketing': ['social', 'adcreative', 'analytics'],
        'social': ['social', 'contentcreation', 'adcreative'],
        'advertising': ['adcreative', 'social', 'analytics'],
        'ads': ['adcreative', 'social', 'analytics'],
        'sports': ['skillsmith'], // Always SkillSmith for sports
        'fitness': ['skillsmith'],
        'training': ['skillsmith'],
        'automation': ['sync', 'biz', 'percy'],
        'integration': ['sync', 'percy'],
        'analytics': ['analytics', 'biz'],
        'data': ['analytics', 'sync'],
        'website': ['site', 'branding', 'contentcreation'],
        'web': ['site', 'branding'],
        'business': ['biz', 'proposal', 'analytics'],
        'strategy': ['biz', 'analytics'],
        'video': ['videocontent', 'social', 'adcreative'],
        'client': ['clientsuccess', 'biz'],
        'payment': ['payment', 'analytics']
      };
      
      const missionLower = mission.toLowerCase();
      const recommendedAgentIds = missionMap[missionLower] || ['percy'];
      
      // Get full agent data
      const recommendedAgents = agentRegistry
        .filter(a => recommendedAgentIds.includes(a.id))
        .map(agent => ({
          id: agent.id,
          name: agent.name,
          superheroName: agent.superheroName,
          description: agent.description,
          capabilities: agent.capabilities,
          route: agent.route || `/agents/${agent.id}`,
          chatRoute: `/agents/${agent.id}/chat`,
          imageSlug: agent.imageSlug,
          backstory: agentBackstories[agent.id],
          catchphrase: agent.catchphrase,
          primaryCapability: agent.primaryCapability,
          missionTypes: agent.missionTypes || [],
          archetype: agent.archetype
        }));
      
      return NextResponse.json({
        success: true,
        mission,
        type,
        recommendedAgents,
        primaryAgent: recommendedAgents[0] || null,
        count: recommendedAgents.length
      });
    }
    
    // Otherwise return normal agent list
    // Filter visible agents
    const visibleAgents = agentDashboardList.filter(
      agent => agent.visible !== false && agent.id && agent.name &&
      // Exclude Percy from all agent listings
      agent.id !== 'percy' && agent.id !== 'percy' && agent.name !== 'Percy'
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