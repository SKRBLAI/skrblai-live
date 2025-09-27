import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join } from 'path';
import agentRegistry from '../../../../lib/agents/agentRegistry';
import { agentBackstories } from '../../../../lib/agents/agentBackstories';
import { getAgentImageVariations } from '../../../../utils/agentImages';

interface AgentAssetStatus {
  id: string;
  images: {
    png: boolean;
    nobg: boolean;
    webp: boolean;
  };
  backstory: boolean;
}

export async function GET() {
  try {
    const imagesDir = join(process.cwd(), 'public', 'images', 'agents');
    
    const agentStatuses: AgentAssetStatus[] = agentRegistry.map(agent => {
      const imageVariations = getAgentImageVariations(agent.id);
      
      // Check if image files exist (convert web paths to file paths)
      const pngPath = join(imagesDir, imageVariations.png.replace('/images/agents/', ''));
      const nobgPath = join(imagesDir, imageVariations.nobg.replace('/images/agents/', ''));
      const webpPath = join(imagesDir, imageVariations.webp.replace('/images/agents/', ''));
      
      // Check backstory existence (including fallback patterns)
      const hasBackstory = !!(
        agentBackstories[agent.id] ||
        agentBackstories[agent.id.replace('-agent', '')] ||
        agentBackstories[agent.id.replace('Agent', '')]
      );
      
      return {
        id: agent.id,
        images: {
          png: existsSync(pngPath),
          nobg: existsSync(nobgPath),
          webp: existsSync(webpPath)
        },
        backstory: hasBackstory
      };
    });
    
    // Calculate totals
    const totals = {
      withAllImages: agentStatuses.filter(agent => 
        agent.images.png && agent.images.nobg && agent.images.webp
      ).length,
      missingAnyImage: agentStatuses.filter(agent => 
        !agent.images.png || !agent.images.nobg || !agent.images.webp
      ).length,
      missingBackstory: agentStatuses.filter(agent => !agent.backstory).length,
      totalAgents: agentStatuses.length
    };
    
    return NextResponse.json({
      agents: agentStatuses,
      totals,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[API] Assets check error:', error);
    return NextResponse.json(
      { error: 'Failed to check agent assets' },
      { status: 500 }
    );
  }
}