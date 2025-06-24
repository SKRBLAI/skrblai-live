'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { agentBackstories } from '@/lib/agents/agentBackstories';
import { getAgent } from '@/lib/agents/agentLeague';
import { getAgentImagePath } from '@/utils/agentUtils';

export default function AgentBackstoryPage({ params }: { params: { agentId: string } }) {
  const router = useRouter();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.agentId) {
      setError('Agent ID is required');
      setLoading(false);
      return;
    }

    try {
      // Get agent from registry
      const agentData = getAgent(params.agentId);
      if (!agentData) {
        setError('Agent not found');
        setLoading(false);
        return;
      }

      // Get backstory from agentBackstories
      const backstory = agentBackstories[params.agentId] || 
                       agentBackstories[params.agentId.replace('-agent', '')] || 
                       agentBackstories[params.agentId.replace('Agent', '')];
      
      if (!backstory) {
        setError('Agent backstory not found');
        setLoading(false);
        return;
      }

      // Combine agent data with backstory
      setAgent({
        ...agentData,
        ...backstory
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading agent backstory:', err);
      setError('Failed to load agent backstory');
      setLoading(false);
    }
  }, [params.agentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading agent backstory...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Agent Not Found</h1>
          <p className="text-gray-300 mb-6">{error || 'Unable to load agent details'}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="mb-8 flex items-center text-gray-400 hover:text-white transition-colors"
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
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-purple-400/50 shadow-2xl agent-image-container">
              <Image
                src={getAgentImagePath(agent, "nobg")}
                alt={agent.superheroName || agent.name}
                fill
                className="agent-image object-contain"
                style={{ 
                  objectFit: 'contain',
                  objectPosition: 'center center',
                  transform: 'scale(0.85)' 
                }}
              />
            </div>
          </div>

          {/* Hero Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              {agent.superheroName || agent.name}
            </h1>
            <p className="text-xl text-gray-300 mb-4 italic">
              {agent.origin || 'Origin unknown'}
            </p>
            {agent.catchphrase && (
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-400/30">
                <p className="text-lg font-bold text-purple-300">"{agent.catchphrase}" <span className="ml-2 text-fuchsia-300 animate-pulse">✨</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Backstory Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Backstory */}
          <div className="md:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-4">Backstory</h2>
            <p className="text-gray-300 leading-relaxed mb-6">{agent.backstory}</p>
            
            {/* Powers */}
            <h3 className="text-xl font-semibold text-white mb-3">Powers</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
              {agent.powers?.map((power: string, idx: number) => (
                <li key={idx} className="flex items-center text-cyan-300">
                  <span className="mr-2">⚡</span> {power}
                </li>
              ))}
            </ul>

            {/* Weakness */}
            <h3 className="text-xl font-semibold text-white mb-3">Weakness</h3>
            <p className="text-red-300 mb-6">{agent.weakness || 'Unknown'}</p>

            {/* Nemesis */}
            <h3 className="text-xl font-semibold text-white mb-3">Nemesis</h3>
            <p className="text-orange-300 mb-6">{agent.nemesis || 'Unknown'}</p>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Stats */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Agent Stats</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Category</p>
                  <p className="text-white">{agent.category || 'Uncategorized'}</p>
                </div>
                {agent.workflowCapabilities && (
                  <div>
                    <p className="text-gray-400 text-sm">Capabilities</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {agent.workflowCapabilities.slice(0, 3).map((capability: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full">
                          {capability.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <button 
                onClick={() => router.push(`/services/${agent.id}`)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 mb-3"
              >
                Launch Agent
              </button>
              <button 
                onClick={() => router.back()}
                className="w-full bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-lg border border-gray-600 hover:bg-gray-600 transition-all duration-200"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 