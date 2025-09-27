'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { agentBackstories } from '../../../../lib/agents/agentBackstories';
import { getAgentImagePath } from '../../../../utils/agentUtils';
import agentRegistry from '../../../../lib/agents/agentRegistry';
import { agentPath } from '../../../../utils/agentRouting';
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

export default function AgentBackstoryPage({ params }: { params: Promise<{ agent: string }> }) {
  const router = useRouter();
  const [agentId, setAgentId] = useState<string>('');
  const [agent, setAgent] = useState<AgentDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAgent = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.agent;
      setAgentId(id);
      
      if (!id) {
        setError('Agent ID is required');
        setLoading(false);
        return;
      }

      try {
        // Get agent from registry first
        const registryAgent = agentRegistry.find(a => a.id === id);
        
        // Get backstory from agentBackstories.ts (single source of truth)
        const backstory = agentBackstories[id] || 
                         agentBackstories[id.replace('-agent', '')] || 
                         agentBackstories[id.replace('Agent', '')];
        
        if (!backstory) {
          setError('Agent backstory not found');
          setLoading(false);
          return;
        }

        // Combine registry data with backstory data (backstory takes precedence)
        const combinedAgent: AgentDisplay = {
          id,
          name: registryAgent?.name || backstory.superheroName || id,
          category: registryAgent?.category || 'AI Agent',
          imageSlug: registryAgent?.imageSlug || id,
          ...backstory // This includes superheroName, origin, powers, etc.
        };

        setAgent(combinedAgent);
        setLoading(false);
      } catch (err) {
        console.error('Error loading agent backstory:', err);
        setError('Failed to load agent backstory');
        setLoading(false);
      }
    };

    loadAgent();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading agent backstory...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gradient-to-br from-violet-800 via-purple-900 to-indigo-900/80 backdrop-blur-xl bg-opacity-80 border-2 border-teal-400/80 shadow-[0_0_24px_#30D5C8AA] rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-[#00F0FF] drop-shadow-glow mb-4">Agent Not Found</h1>
          <p className="text-white/90 mb-6">{error || 'Unable to load agent details'}</p>
          <button 
            onClick={() => router.push('/agents')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg hover:from-cyan-600 hover:to-teal-700 transition-colors"
          >
            View All Agents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="mb-8 flex items-center text-white/60 hover:text-[#00F0FF] transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          {/* Agent Image */}
          <div className="relative w-48 h-48 md:w-64 md:h-64">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-full animate-pulse blur-xl opacity-50"></div>
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-teal-400/50 shadow-2xl">
              <Image
                src={getAgentImagePath(agent, "nobg")}
                alt={agent.superheroName || agent.name}
                fill
                className="object-contain"
                style={{ 
                  objectFit: 'contain',
                  objectPosition: 'center center',
                  transform: 'scale(0.85)' 
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.warn(`[AgentBackstory] Failed to load image for ${agent.name}`);
                  if (!target.src.includes('default.png')) {
                    target.src = '/images/agents/default.png';
                  }
                }}
              />
            </div>
          </div>

          {/* Hero Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-[#00F0FF] drop-shadow-glow">
              {agent.superheroName || agent.name}
            </h1>
            <p className="text-xl text-white/90 mb-4 italic">
              {agent.origin || 'Origin unknown'}
            </p>
            {agent.catchphrase && (
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-400/30">
                <p className="text-lg font-bold text-orange-400">"{agent.catchphrase}" <span className="ml-2 text-cyan-300 animate-pulse">✨</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Backstory Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Backstory */}
          <div className="md:col-span-2 bg-gradient-to-br from-violet-800 via-purple-900 to-indigo-900/80 backdrop-blur-xl bg-opacity-80 border-2 border-teal-400/40 shadow-[0_0_24px_#30D5C8AA] rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-[#00F0FF] drop-shadow-glow mb-4">Backstory</h2>
            <p className="text-white/90 leading-relaxed mb-6">{agent.backstory}</p>
            
            {/* Powers */}
            {agent.powers && agent.powers.length > 0 && (
              <>
                <h3 className="text-xl font-semibold text-cyan-300 mb-3">Powers</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                  {agent.powers.map((power: string, idx: number) => (
                    <li key={idx} className="flex items-center text-cyan-300">
                      <span className="mr-2">⚡</span> {power}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Weakness */}
            {agent.weakness && (
              <>
                <h3 className="text-xl font-semibold text-orange-400 mb-3">Weakness</h3>
                <p className="text-orange-400 mb-6">{agent.weakness}</p>
              </>
            )}

            {/* Nemesis */}
            {agent.nemesis && (
              <>
                <h3 className="text-xl font-semibold text-red-400 mb-3">Nemesis</h3>
                <p className="text-red-400 mb-6">{agent.nemesis}</p>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Stats */}
            <div className="bg-gradient-to-br from-violet-800 via-purple-900 to-indigo-900/80 backdrop-blur-xl bg-opacity-80 border-2 border-teal-400/40 shadow-[0_0_24px_#30D5C8AA] rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-cyan-300 mb-4">Agent Stats</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-white/60 text-sm">Category</p>
                  <p className="text-white/90">{agent.category || 'AI Agent'}</p>
                </div>
                {agent.workflowCapabilities && agent.workflowCapabilities.length > 0 && (
                  <div>
                    <p className="text-white/60 text-sm">Capabilities</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {agent.workflowCapabilities.slice(0, 3).map((capability, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-900/30 text-cyan-300 text-xs rounded-full">
                          {capability.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gradient-to-br from-violet-800 via-purple-900 to-indigo-900/80 backdrop-blur-xl bg-opacity-80 border-2 border-teal-400/40 shadow-[0_0_24px_#30D5C8AA] rounded-2xl p-6">
              <button 
                onClick={() => router.push(agentPath(agent.id, 'home'))}
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-teal-700 transition-all duration-200 mb-3"
              >
                Launch Agent
              </button>
              <button 
                onClick={() => router.push('/agents')}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white/90 font-medium py-2 px-4 rounded-lg border border-gray-600 hover:from-gray-500 hover:to-gray-600 transition-all duration-200"
              >
                View All Agents
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}