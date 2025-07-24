'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MessageCircle, Info, Rocket, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { Agent } from '@/types/agent';
import '@/styles/components/agent-card.css';
import { getAgentImagePath, getAgentEmoji } from '@/utils/agentUtils';
import { agentBackstories } from '@/lib/agents/agentBackstories';
import AgentLaunchButton from '@/components/agents/AgentLaunchButton';
import { agentIntelligenceEngine, type AgentIntelligence } from '@/lib/agents/agentIntelligence';
import CosmicButton from '@/components/shared/CosmicButton';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import Pseudo3DCard, { Pseudo3DFeature, Pseudo3DStats } from '@/components/shared/Pseudo3DCard';
import Image from 'next/image';
import { Agent3DCardProvider } from '@/lib/3d/Agent3DCardCore';

interface AgentLeagueCardProps {
  agent: Agent;
  index?: number;
  className?: string;
  onChat?: (agent: Agent) => void;
  onInfo?: (agent: Agent) => void;
  onHandoff?: (agent: Agent) => void;
  onLaunch?: (agent: Agent) => void;
  isRecommended?: boolean;
  userProgress?: number;
  userMastery?: number;
  showIntelligence?: boolean;
}

const AgentLeagueCard: React.FC<AgentLeagueCardProps & { selected?: boolean }> = ({
  agent,
  index = 0,
  className = '',
  onChat,
  onInfo,
  onLaunch,
  onHandoff,
  selected = false,
  isRecommended = false,
  userProgress = 0,
  userMastery = 0,
  showIntelligence = true
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [liveUsers, setLiveUsers] = useState(Math.floor(Math.random() * 89) + 12);
  const [urgencySpots, setUrgencySpots] = useState(Math.floor(Math.random() * 47) + 23);
  const [showBackstoryModal, setShowBackstoryModal] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [agentIntelligence, setAgentIntelligence] = useState<AgentIntelligence | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const backstory = agentBackstories[agent.id];

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => Math.max(5, prev + Math.floor(Math.random() * 3) - 1));
      setUrgencySpots(prev => Math.max(5, prev + Math.floor(Math.random() * 2) - 1));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showIntelligence && agent) {
      const intelligence = agentIntelligenceEngine.getAgentIntelligence(agent.id);
      setAgentIntelligence(intelligence);
    }
  }, [agent?.id, showIntelligence]);

  const handleAgentAction = (action: string) => {
    switch (action) {
      case 'chat':
        if (onChat) onChat(agent);
        break;
      case 'info':
        if (onInfo) onInfo(agent);
        break;
      case 'launch':
        if (onLaunch) onLaunch(agent);
        break;
      case 'handoff':
        if (onHandoff) onHandoff(agent);
        break;
    }
  };



  if (!agent || !agent.name) {
    return (
      <div className="h-64 flex items-center justify-center bg-gradient-to-br from-violet-800 via-purple-900 to-indigo-900/80 backdrop-blur-xl bg-opacity-80 border-2 border-teal-400/80 shadow-[0_0_24px_#30D5C8AA] rounded-2xl">
        <div className="text-white/60">Agent data unavailable</div>
      </div>
    );
  }

  return (
    <Agent3DCardProvider 
      agent={agent}
      enable3D={!shouldReduceMotion}
      enableFlip={false}
      enableHover={true}
    >
      <motion.div
        ref={cardRef}
        className={`relative ${className}`}
        initial={{ 
          opacity: 0, 
          y: shouldReduceMotion ? 0 : 30,
          scale: shouldReduceMotion ? 1 : 0.95
        }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: 1
        }}
        whileHover={{
          y: shouldReduceMotion ? 0 : -8,
          scale: shouldReduceMotion ? 1 : 1.03
        }}
        transition={{
          duration: shouldReduceMotion ? 0.1 : 0.5,
          delay: shouldReduceMotion ? 0 : index * 0.1
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className="h-full relative overflow-hidden group bg-gradient-to-br from-violet-800 via-purple-900 to-indigo-900/80 backdrop-blur-xl bg-opacity-80 border-2 border-teal-400/80 shadow-[0_0_24px_#30D5C8AA] hover:shadow-[0_0_48px_#30D5C8AA,0_4px_48px_#5B3DF555] rounded-2xl transition-all agent-card-glow float-slow"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Recommended Badge */}
          {isRecommended && (
            <div className="absolute top-3 right-3 z-20">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3" />
                RECOMMENDED
              </div>
            </div>
          )}

          {/* Live Activity Indicators */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-cyan-300 font-medium">{liveUsers}</span>
            </div>
            {urgencySpots < 30 && (
              <div className="flex items-center gap-1 bg-red-500/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-orange-400 font-medium">{urgencySpots} left</span>
              </div>
            )}
          </div>

          {/* Agent Image */}
          <div className="flex flex-col items-center pt-6 pb-4">
            <motion.div
              className="relative w-20 h-20 mb-4"
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-600/30 rounded-full blur-sm"></div>
              {/* Neon rotating ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-cyan-300/60"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              />
              {/* Orbiting particle */}
              <motion.span
                className="absolute -top-1 left-1/2 h-1 w-1 bg-cyan-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                style={{ originX: 0.5, originY: 2 }}
              />
              <Image
                src={getAgentImagePath(agent.id)}
                alt={`${agent.name} Avatar`}
                width={80}
                height={80}
                className="relative z-10 rounded-full border-2 border-cyan-400/50 shadow-lg"
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLDivElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div 
                className="hidden absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full items-center justify-center text-2xl text-white border-2 border-cyan-400/50"
                style={{ display: 'none' }}
              >
                {getAgentEmoji(agent.id)}
              </div>
            </motion.div>

            {/* Agent Name */}
            <h3 className="text-lg font-bold text-[#00F0FF] drop-shadow-glow mb-1 text-center">
              {agent.name}
            </h3>

            {/* Agent Category/Specialty */}
            <p className="text-sm text-cyan-300 mb-3 text-center">
              {backstory?.superheroName || agent.category || 'AI Specialist'}
            </p>

            {/* Progress Bar (if user has progress) */}
            {userProgress > 0 && (
              <div className="w-full mb-3">
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>Progress</span>
                  <span>{userProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-cyan-400 to-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${userProgress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            )}

            {/* Mastery Level */}
            {userMastery > 0 && (
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < userMastery ? 'text-yellow-400 fill-current' : 'text-gray-600'
                    }`}
                  />
                ))}
                <span className="text-xs text-white/60 ml-1">Level {userMastery}</span>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {agentIntelligence && (
            <div className="mx-4 mb-4 p-3 bg-gradient-to-br from-violet-700/30 via-purple-800/30 to-indigo-800/30 backdrop-blur-lg border border-teal-400/20 rounded-xl">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-cyan-300 font-bold text-sm">
                    {agentIntelligence.intelligenceLevel}
                  </div>
                  <div className="text-xs text-white/50">IQ Level</div>
                </div>
                <div>
                  <div className="text-[#00F0FF] font-bold text-sm">
                    {agentIntelligence.predictionCapabilities?.length || 0}
                  </div>
                  <div className="text-xs text-white/50">Skills</div>
                </div>
                <div>
                  <div className="text-orange-400 font-bold text-sm">
                    {agentIntelligence.specializations?.length || 0}
                  </div>
                  <div className="text-xs text-white/50">Specs</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-4 pb-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <CosmicButton
                variant="primary"
                size="sm"
                onClick={() => handleAgentAction('chat')}
                className="text-xs"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Chat
              </CosmicButton>
              <CosmicButton
                variant="secondary"
                size="sm"
                onClick={() => handleAgentAction('info')}
                className="text-xs"
              >
                <Info className="w-3 h-3 mr-1" />
                Info
              </CosmicButton>
            </div>
            
            <CosmicButton
              variant="primary"
              size="sm"
              onClick={() => handleAgentAction('launch')}
              className="w-full text-xs"
            >
              <Rocket className="w-3 h-3 mr-1" />
              Launch Agent
            </CosmicButton>
          </div>

          {/* Hover Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2"
            >
              <div className="p-4 bg-gradient-to-br from-violet-800 via-purple-900 to-indigo-900/80 backdrop-blur-xl bg-opacity-80 border-2 border-teal-400/40 shadow-[0_0_24px_#30D5C8AA] rounded-2xl">
                <h4 className="text-[#00F0FF] drop-shadow-glow font-bold mb-2">Agent Details</h4>
                <p className="text-white/90 text-sm mb-3">
                  {backstory?.backstory?.slice(0, 120) || agent.description || 'Specialized AI agent for business automation'}...
                </p>
                
                {agentIntelligence?.specializations && agentIntelligence.specializations.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-cyan-300 font-bold text-sm mb-2">Specializations</h5>
                    <div className="space-y-1">
                      {agentIntelligence.specializations.slice(0, 2).map((spec: string, i: number) => (
                        <div key={i} className="text-xs text-white/70 flex items-start gap-2">
                          <TrendingUp className="w-3 h-3 mt-0.5 text-cyan-300 flex-shrink-0" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <CosmicButton
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/services/${agent.id}`)}
                    className="text-xs flex-1"
                  >
                    Learn More
                  </CosmicButton>
                  <CosmicButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleAgentAction('handoff')}
                    className="text-xs flex-1"
                  >
                    Get Started
                  </CosmicButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Agent3DCardProvider>
  );
};

export default AgentLeagueCard;