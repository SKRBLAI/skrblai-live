/**
 * Simple Agent Grid - Temporary Replacement for AgentConstellation
 * 
 * This is a simple grid layout for agents while the new Agent League system
 * is being integrated. This provides basic agent display functionality.
 * 
 * @version 1.0.0 (Temporary)
 */

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { Agent } from '@/types/agent';
import CloudinaryImage from '@/components/ui/CloudinaryImage';

interface SimpleAgentGridProps {
  agents?: Agent[];
  selectedAgent?: Agent | null;
  setSelectedAgent?: (agent: Agent | null) => void;
  handleAgentLaunch?: (agent: Agent) => Promise<void>;
  recommendedAgentIds?: string[];
}

export default function SimpleAgentGrid({
  agents = [],
  selectedAgent,
  setSelectedAgent,
  handleAgentLaunch,
  recommendedAgentIds = [],
}: SimpleAgentGridProps) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  // Filter out Percy from the grid display
  const displayAgents = agents.filter(agent => 
    agent.id !== 'percy' && 
    agent.id !== 'PercyAgent' && 
    agent.name !== 'Percy' &&
    agent.visible !== false
  );

  const handleAgentClick = (agent: Agent) => {
    if (setSelectedAgent) {
      setSelectedAgent(agent);
    }
  };

  const handleAgentAction = async (agent: Agent) => {
    if (handleAgentLaunch) {
      await handleAgentLaunch(agent);
    }
    if (setSelectedAgent) {
      setSelectedAgent(null);
    }
  };

  if (displayAgents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-4">🤖</div>
          <p>No agents available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Agent Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {displayAgents.map((agent, index) => {
          const isRecommended = recommendedAgentIds.includes(agent.id);
          
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAgentClick(agent)}
              onMouseEnter={() => setHoveredAgent(agent.id)}
              onMouseLeave={() => setHoveredAgent(null)}
              className={`
                relative group cursor-pointer p-4 rounded-xl border-2 transition-all duration-300
                ${isRecommended 
                  ? 'border-cyan-400/50 bg-cyan-400/10 shadow-lg shadow-cyan-400/20' 
                  : 'border-gray-600/30 bg-gray-800/30 hover:border-gray-500/50'
                }
                backdrop-blur-sm hover:shadow-xl
              `}
              data-agent-id={agent.id}
            >
              {/* Recommended indicator */}
              {isRecommended && (
                <div className="absolute -top-2 -right-2 z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs">✨</span>
                  </motion.div>
                </div>
              )}

              {/* Agent Image */}
              <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 rounded-full overflow-hidden border-2 border-gray-600/50 group-hover:border-gray-400/70 transition-colors">
                {agent.imageSlug ? (
                  <CloudinaryImage
                    agent={agent}
                    alt={agent.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 text-2xl">
                    {agent.emoji || '🤖'}
                  </div>
                )}
                
                {/* Glow effect for recommended */}
                {isRecommended && (
                  <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-pulse"></div>
                )}
              </div>

              {/* Agent Info */}
              <div className="text-center">
                <h3 className="font-semibold text-white text-sm md:text-base mb-1 group-hover:text-cyan-400 transition-colors">
                  {agent.name}
                </h3>
                <p className="text-gray-400 text-xs line-clamp-2">
                  {agent.description}
                </p>
                
                {/* Premium badge */}
                {agent.premium && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gradient-to-r from-yellow-600/20 to-orange-600/20 text-yellow-400 border border-yellow-600/30">
                      ⭐ Pro
                    </span>
                  </div>
                )}
              </div>

              {/* Hover overlay */}
              <AnimatePresence>
                {hoveredAgent === agent.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl flex items-end justify-center p-2"
                  >
                    <motion.button
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-white text-xs rounded-md transition-colors"
                    >
                      Select
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Agent Modal */}
      <AnimatePresence>
        {selectedAgent && setSelectedAgent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setSelectedAgent(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
            >
              <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 border border-gray-600/50 shadow-2xl">
                {/* Close button */}
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Agent details */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-600/50">
                    {selectedAgent.imageSlug ? (
                      <CloudinaryImage
                        agent={selectedAgent}
                        alt={selectedAgent.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 text-2xl">
                        {selectedAgent.emoji || '🤖'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedAgent.name}</h3>
                    <p className="text-gray-400 text-sm">{selectedAgent.category}</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  {selectedAgent.description}
                </p>

                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAgentAction(selectedAgent)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Launch {selectedAgent.name}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAgent(null)}
                    className="w-full bg-gray-700/50 text-gray-300 font-medium py-2 px-4 rounded-lg border border-gray-600/50 hover:bg-gray-600/50 transition-all duration-200"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export { SimpleAgentGrid }; 