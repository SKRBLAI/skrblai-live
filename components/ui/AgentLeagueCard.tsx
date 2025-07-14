'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Info, Rocket, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { Agent } from '@/types/agent';
import { getAgentImagePath, getAgentEmoji } from '@/utils/agentUtils';
import { agentBackstories } from '@/lib/agents/agentBackstories';
import AgentLaunchButton from '@/components/agents/AgentLaunchButton';
import { agentIntelligenceEngine, type AgentIntelligence, type PredictiveInsight } from '@/lib/agents/agentIntelligence';
import CosmicButton from '@/components/shared/CosmicButton';

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
  const [liveUsers, setLiveUsers] = useState(Math.floor(Math.random() * 89) + 12);
  const [urgencySpots, setUrgencySpots] = useState(Math.floor(Math.random() * 47) + 23);
  const [showBackstoryModal, setShowBackstoryModal] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const backstory = agentBackstories[agent.id] || null;
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Phase 4: Get agent intelligence
  const [agentIntelligence, setAgentIntelligence] = useState<AgentIntelligence | null>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);

  useEffect(() => {
    if (showIntelligence) {
      // Load agent intelligence
      const intelligence = agentIntelligenceEngine.getAgentIntelligence(agent.id);
      setAgentIntelligence(intelligence);

      // Load predictive insights
      const loadInsights = async () => {
        const insights = await agentIntelligenceEngine.generatePredictiveInsights(agent.id, 7);
        setPredictiveInsights(insights);
      };
      loadInsights();
    }
  }, [agent.id, showIntelligence]);

  // Live metrics animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
      if (Math.random() > 0.7) {
        setUrgencySpots(prev => Math.max(1, prev - 1));
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Agent League Card now uses clean nobg-skrblai.webp images with modern UI
  const agentImagePath = getAgentImagePath(agent, "nobg");

  // Image error handler
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('[AgentLeagueCard] Failed to load agent image:', agentImagePath, 'for agent:', agent.id);
    event.currentTarget.onerror = null;
    event.currentTarget.src = '/images/agents-default-nobg-skrblai.webp';
  };

  // Button action handlers
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Card click goes to agent backstory by default
    router.push(`/agent-backstory/${agent.id}`);
  };

  const handleLearnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (backstory) {
      setShowBackstoryModal(true);
    } else if (onInfo) {
      onInfo(agent);
    } else {
      router.push(`/agent-backstory/${agent.id}`);
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChat) {
      onChat(agent);
    } else {
      // Navigate to agent backstory which has chat functionality
      router.push(`/agent-backstory/${agent.id}`);
    }
  };

  const handleLaunchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLaunch) {
      onLaunch(agent);
    } else if (onHandoff) {
      onHandoff(agent);
    } else {
      // Route to agent service page
      router.push(`/services/${agent.id}`);
    }
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        role="group"
        aria-label={`${agent.name} agent card`}
        tabIndex={0}
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: [0, -4, 0, 4, 0], // gentle levitation
          scale: 1,
          rotateY: [0, 2, 0, -2, 0], // subtle cosmic sway
          transition: {
            y: { duration: 8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' as const },
            rotateY: { duration: 12, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' as const },
            opacity: { duration: 0.6 },
            scale: { duration: 0.6 },
          }
        }}
        whileHover={{ 
          scale: 1.02, 
          rotateY: 0, 
          rotateX: 0, 
          transition: { duration: 0.3 }
        }}
        whileFocus={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 120, delay: 0.05 * index }}
        className={`relative w-full h-full flex flex-col ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Live Activity Badge */}
        {showIntelligence && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full text-xs z-10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-bold">{liveUsers}</span>
          </div>
        )}

        {/* Agent Image Section */}
        <div className="relative flex-1 flex items-center justify-center mb-4">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36">
            <img
              src={agentImagePath}
              alt={`${agent.name} AI Agent`}
              className="w-full h-full object-contain"
              onError={handleImageError}
              loading="lazy"
            />
          </div>
          
          {/* Agent Intelligence Overlay */}
          {showIntelligence && agentIntelligence && (
            <motion.div
              className="absolute top-2 left-2 z-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + 0.05 * index }}
            >
              <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-purple-500/30 max-w-[160px]">
                <div className="flex items-center justify-between text-xs">
                  <div className="text-purple-400 font-semibold flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                    IQ: {agentIntelligence.intelligenceLevel}
                  </div>
                </div>
                <div className="text-xs text-yellow-400 font-semibold mt-1 capitalize">
                  {agentIntelligence.autonomyLevel}
                </div>
                <div className="text-xs text-gray-300 mt-1 truncate">
                  {agentIntelligence.superheroName}
                </div>
              </div>
            </motion.div>
          )}

          {/* Predictive Insights Overlay (on hover) */}
          {showIntelligence && isHovered && predictiveInsights.length > 0 && (
            <motion.div
              className="absolute top-12 left-2 z-20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-gradient-to-br from-gray-900/95 to-purple-900/95 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/50 shadow-xl max-w-[200px]">
                <div className="text-xs text-cyan-400 font-semibold mb-2 flex items-center gap-1">
                  🔮 Insights
                </div>
                {predictiveInsights.slice(0, 1).map((insight, idx) => (
                  <div key={idx} className="text-xs text-gray-300 mb-1">
                    <span className="text-yellow-400 font-medium capitalize">
                      {insight.domain.replace('_', ' ')}:
                    </span>
                    <span className="ml-1 block">{insight.insight.slice(0, 40)}...</span>
                    <div className="text-xs text-green-400 mt-0.5">
                      {Math.round(insight.probability * 100)}% confidence
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Agent Name */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-white mb-1 min-h-[2rem] flex items-center justify-center break-words">
            {agent.name}
          </h3>
          {agent.description && (
            <p className="text-sm text-gray-400 line-clamp-2 mb-2">
              {agent.description}
            </p>
          )}
        </div>

        {/* Agent Stats Section - Like Services Page */}
        {showIntelligence && agentIntelligence && (
          <div className="mb-4 pt-4 border-t border-cyan-400/20">
            <div className="flex gap-4 justify-center">
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-purple-400">{agentIntelligence.intelligenceLevel}</span>
                <span className="text-xs text-gray-400">IQ Level</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-green-400">{liveUsers}</span>
                <span className="text-xs text-gray-400">Active Users</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-cyan-400">{urgencySpots}</span>
                <span className="text-xs text-gray-400">Tasks Queue</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <CosmicButton
            variant="secondary"
            size="sm"
            onClick={handleLearnClick}
            className="flex-1 text-xs font-bold"
          >
            LEARN
          </CosmicButton>
          
          <CosmicButton
            variant="primary"
            size="sm"
            onClick={handleChatClick}
            className="flex-1 text-xs font-bold"
          >
            CHAT
          </CosmicButton>
          
          <CosmicButton
            variant="accent"
            size="sm"
            onClick={handleLaunchClick}
            className="flex-1 text-xs font-bold"
          >
            LAUNCH
          </CosmicButton>
        </div>
      </motion.div>

      {/* Enhanced Backstory Modal */}
      <AnimatePresence>
        {showBackstoryModal && backstory && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBackstoryModal(false)}
          >
            <motion.div
              className="relative w-full max-w-md mx-4 p-6 rounded-2xl bg-gradient-to-br from-slate-800/95 to-purple-900/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowBackstoryModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl focus:outline-none"
                aria-label="Close backstory"
              >
                ×
              </button>

              {/* Enhanced Backstory Content */}
              <div className="text-center">
                <h4 className="text-xl font-extrabold mb-2 bg-gradient-to-r from-fuchsia-400 via-electric-blue to-teal-400 bg-clip-text text-transparent">
                  {backstory.superheroName}
                </h4>
                <div className="text-sm text-fuchsia-200 mb-3">{`"${backstory.catchphrase}"`}</div>
                <div className="text-sm mb-3 text-gray-300">{backstory.origin}</div>
                
                {/* Powers */}
                <div className="flex flex-wrap gap-2 justify-center mb-3">
                  {backstory.powers.map((power, i) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-fuchsia-800/30 text-xs font-bold border border-fuchsia-400/30 text-fuchsia-200">
                      {power}
                    </span>
                  ))}
                </div>
                
                {/* Stats */}
                <div className="text-xs text-fuchsia-300 mb-1">
                  Weakness: <span className="font-semibold text-white">{backstory.weakness}</span>
                </div>
                <div className="text-xs text-teal-300 mb-3">
                  Nemesis: <span className="font-semibold text-white">{backstory.nemesis}</span>
                </div>
                
                {/* Backstory */}
                <div className="text-xs text-gray-200 mb-4 max-h-32 overflow-y-auto">
                  {backstory.backstory}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <CosmicButton
                    variant="primary"
                    onClick={() => {
                      setShowBackstoryModal(false);
                      handleChatClick({ stopPropagation: () => {} } as any);
                    }}
                    className="flex-1"
                  >
                    Chat Now
                  </CosmicButton>
                  <CosmicButton
                    variant="accent"
                    onClick={() => {
                      setShowBackstoryModal(false);
                      handleLaunchClick({ stopPropagation: () => {} } as any);
                    }}
                    className="flex-1"
                  >
                    Launch Agent
                  </CosmicButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AgentLeagueCard;
