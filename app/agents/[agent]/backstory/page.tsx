import React from 'react';
import Image from 'next/image';
import { agentBackstories } from '../../../../lib/agents/agentBackstories';
import { getAgentImagePath } from '../../../../utils/agentUtils';
import agentRegistry from '../../../../lib/agents/agentRegistry';
import BackstoryClientWrapper from './BackstoryClientWrapper';
import type { Metadata } from 'next';

interface AgentDisplay {
  id: string;
  name: string;
  category?: string;
  superheroName?: string;
  origin?: string;
  powers?: string[];
  weakness?: string;
  catchphrase?: string;
  nemesis?: string;
  backstory?: string;
  workflowCapabilities?: string[];
  imageSlug?: string;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ agent: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const agentId = resolvedParams.agent;
  const backstory = agentBackstories[agentId];
  
  return {
    title: `${backstory?.superheroName || agentId} Agent Backstory - SKRBL AI`,
    description: `Learn about the backstory and powers of ${backstory?.superheroName || agentId} - ${backstory?.backstory?.slice(0, 150) || 'SKRBL AI superhero agent'}...`,
    alternates: {
      canonical: `https://skrblai.io/agents/${agentId}/backstory`,
    },
  };
}

export default async function AgentBackstoryPage({ params }: { params: Promise<{ agent: string }> }) {
  const resolvedParams = await params;
  const agentId = resolvedParams.agent;
  
  if (!agentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gradient-to-br from-violet-800 via-purple-900 to-indigo-900/80 backdrop-blur-xl bg-opacity-80 border-2 border-teal-400/80 shadow-[0_0_24px_#30D5C8AA] rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-[#00F0FF] drop-shadow-glow mb-4">Agent Not Found</h1>
          <p className="text-white/90 mb-6">Agent ID is required</p>
        </div>
      </div>
    );
  }

  // Get agent from registry first
  const registryAgent = agentRegistry.find(a => a.id === agentId);
  
  // Get backstory from agentBackstories.ts (single source of truth)
  const backstory = agentBackstories[agentId] || 
                   agentBackstories[agentId.replace('-agent', '')] || 
                   agentBackstories[agentId.replace('Agent', '')];
  
  // If no backstory exists, create a stub fallback
  const fallbackBackstory = !backstory ? {
    superheroName: registryAgent?.name || agentId,
    origin: "Backstory coming soon.",
    powers: ["AI Intelligence", "Task Automation", "User Assistance"],
    weakness: "Still developing full capabilities",
    catchphrase: "Ready to help you succeed!",
    nemesis: "Incomplete Documentation",
    backstory: "Backstory coming soon."
  } : null;

  // Combine registry data with backstory data (backstory takes precedence)
  const finalBackstory = backstory || fallbackBackstory!;
  const agent: AgentDisplay = {
    id: agentId,
    name: registryAgent?.name || finalBackstory.superheroName || agentId,
    category: registryAgent?.category || 'AI Agent',
    imageSlug: registryAgent?.imageSlug || agentId,
    ...finalBackstory // This includes superheroName, origin, powers, etc.
  };

  return <BackstoryClientWrapper agent={agent} />;
}