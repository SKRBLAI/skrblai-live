"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Agent } from '@/types/agent';
import { getAgentImagePath } from '@/utils/agentUtils';

interface AgentCarouselProps {
  agents: Agent[];
  onLaunch?: (agent: Agent) => void;
  selectedAgentId?: string;
  showPremiumBadges?: boolean;
  showDetailedCards?: boolean;
}

export default function AgentCarousel({ 
  agents, 
  onLaunch, 
  selectedAgentId,
  showPremiumBadges = false,
  showDetailedCards = false 
}: AgentCarouselProps) {
  
  const handleAgentClick = (agent: Agent) => {
    if (onLaunch) {
      onLaunch(agent);
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4 sm:gap-6 px-4 min-w-max">
        {agents.map((agent, index) => {
          const isPremium = !!agent.premium;
          const isSelected = selectedAgentId === agent.id;
          
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
                  relative bg-slate-800/70 backdrop-blur-lg border rounded-xl p-4 shadow-lg
                  hover:bg-slate-700/70 transition-all duration-300 cursor-pointer group
                  focus:outline-none focus:ring-2 focus:ring-cyan-400/60
                  ${isSelected ? 'border-cyan-400 shadow-cyan-400/25' : 'border-slate-600/50'}
                  ${isPremium ? 'hover:border-purple-400/60' : 'hover:border-cyan-400/60'}
                  ${showDetailedCards ? 'p-6' : 'p-4'}
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAgentClick(agent)}
              >
                {/* Premium Badge */}
                {showPremiumBadges && isPremium && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                      Premium
                    </span>
                  </div>
                )}

                {/* Agent Image */}
                <div className={`relative mx-auto mb-4 ${showDetailedCards ? 'w-20 h-20' : 'w-16 h-16'} rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-600 p-1`}>
                  <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden">
                    <Image
                      src={agent.imageSlug ? `/images/agents-${agent.imageSlug}-skrblai.png` : getAgentImagePath(agent)}
                      alt={agent.name}
                      fill
                      className="object-cover"
                      sizes={showDetailedCards ? "80px" : "64px"}
                    />
                  </div>
                  
                  {/* Animated ring for premium agents */}
                  {isPremium && (
                    <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-pulse"></div>
                  )}
                </div>

                {/* Agent Info */}
                <div className="text-center">
                  <h3 className={`font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors duration-200 ${
                    showDetailedCards ? 'text-lg' : 'text-sm sm:text-base'
                  }`}>
                    {agent.name.replace('Agent', '')}
                  </h3>
                  
                  {showDetailedCards && (
                    <>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {agent.description || 'AI-powered automation assistant'}
                      </p>
                      
                      {/* Capabilities */}
                      <div className="flex flex-wrap gap-1 justify-center mb-3">
                        {agent.capabilities?.slice(0, 2).map((capability, idx) => (
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
                  
                  {/* Launch Button */}
                  <button
                    className={`
                      w-full py-2 rounded-lg font-medium transition-all duration-200
                      ${isPremium 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white' 
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
                      }
                      ${showDetailedCards ? 'py-3 text-sm' : 'py-2 text-xs sm:text-sm'}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAgentClick(agent);
                    }}
                  >
                    {isPremium ? '👑 Launch Premium' : '🚀 Launch Agent'}
                  </button>
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
