"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import type { Agent } from '@/types/agent';
import { getAgentImagePath } from '@/utils/agentUtils';
import { agentBackstories } from '@/lib/agents/agentBackstories';

interface AgentCarouselProps {
  agents: Agent[];
  onLaunch?: (agent: Agent) => void;
  onInfo?: (agent: Agent) => void;
  onHandoff?: (agent: Agent) => void;
  selectedAgentId?: string;
  showPremiumBadges?: boolean;
  showDetailedCards?: boolean;
}

export default function AgentCarousel({ 
  agents, 
  onLaunch, 
  onInfo,
  onHandoff,
  selectedAgentId,
  showPremiumBadges = false,
  showDetailedCards = false 
}: AgentCarouselProps) {
  const router = useRouter();
  
  const handleAgentLaunch = (agent: Agent) => {
    if (onLaunch) {
      onLaunch(agent);
    }
  };

  const handleAgentInfo = (agent: Agent) => {
    if (onInfo) {
      onInfo(agent);
    } else {
      // Default behavior: navigate to agent backstory page
      router.push(`/agent-backstory/${agent.id}`);
    }
  };

  const handleAgentHandoff = (agent: Agent) => {
    if (onHandoff) {
      onHandoff(agent);
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4 sm:gap-6 px-4 min-w-max">
        {agents.map((agent, index) => {
          const isPremium = !!agent.premium;
          const isSelected = selectedAgentId === agent.id;
          // Get backstory data if available
          const backstory = agentBackstories[agent.id] || 
                           agentBackstories[agent.id.replace('-agent', '')] || 
                           agentBackstories[agent.id.replace('Agent', '')];
          
          return (
            <motion.div
              key={agent.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`min-w-[200px] sm:min-w-[240px] max-w-xs flex-1 ${
                showDetailedCards ? 'min-w-[280px]' : ''
              }`}
            >
              <motion.div
                className={`
                  relative cosmic-glass rounded-xl p-4 cursor-pointer group
                  transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/60
                  ${isSelected ? 'cosmic-border cosmic-glow' : 'border border-slate-600/50'}
                  ${isPremium ? 'hover:border-cyan-400/60' : 'hover:border-cyan-400/60'}
                  ${showDetailedCards ? 'p-6' : 'p-4'}
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Premium Badge */}
                {showPremiumBadges && isPremium && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-full cosmic-glow">
                      Premium
                    </span>
                  </div>
                )}

                {/* Agent Image */}
                <div className={`relative mx-auto mb-4 ${showDetailedCards ? 'w-20 h-20' : 'w-16 h-16'} rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-600 p-1 cosmic-glow`}>
                  <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden">
                    <Image
                      src={getAgentImagePath(agent)}
                      alt={backstory?.superheroName || agent.name}
                      fill
                      className="carousel-agent-image"
                      sizes={showDetailedCards ? "80px" : "64px"}
                      onError={(e) => {
                        // Fallback to emoji if the primary image fails to load
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite error loop
                        target.src = '';
                        target.alt = '🤖';
                        target.style.background = '#222';
                        target.style.display = 'flex';
                        target.style.alignItems = 'center';
                        target.style.justifyContent = 'center';
                        target.style.fontSize = '2rem';
                      }}
                    />
                  </div>
                  
                  {/* Animated ring for premium agents */}
                  {isPremium && (
                    <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-pulse"></div>
                  )}
                </div>

                {/* Agent Info */}
                <div className="text-center">
                  <h3 className={`font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors duration-200 text-glow ${
                    showDetailedCards ? 'text-lg' : 'text-sm sm:text-base'
                  }`}>
                    {backstory?.superheroName || agent.name.replace('Agent', '')}
                  </h3>
                  
                  {showDetailedCards && (
                    <>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {agent.description || 'AI-powered automation assistant'}
                      </p>
                      
                      {/* Capabilities */}
                      <div className="flex flex-wrap gap-1 justify-center mb-3">
                        {(backstory?.powers || agent.capabilities || []).slice(0, 2).map((capability, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-slate-700/50 text-cyan-400 text-xs rounded-full"
                          >
                            {capability}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-center gap-2 mt-3">
                    {/* Info Button */}
                    <button
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAgentInfo(agent);
                      }}
                    >
                      ℹ️ Info
                    </button>
                    
                    {/* Launch Button */}
                    <button
                      className={`
                        px-2 py-1 rounded text-xs transition-colors
                        ${isPremium 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white' 
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
                        }
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAgentLaunch(agent);
                      }}
                    >
                      🚀 Launch
                    </button>
                  </div>
                </div>

                {/* Premium Lock Overlay */}
                {isPremium && !agent.unlocked && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center">
                    <div className="text-3xl mb-2">🔒</div>
                    <p className="text-white font-medium text-sm text-center px-2">
                      Premium Feature
                    </p>
                    <p className="text-gray-300 text-xs text-center px-2 mt-1">
                      Upgrade to unlock
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
