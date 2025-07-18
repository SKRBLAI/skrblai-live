'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MessageCircle, Info, Rocket, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { Agent } from '@/types/agent';
import { getAgentImagePath, getAgentEmoji } from '@/utils/agentUtils';
import { agentBackstories } from '@/lib/agents/agentBackstories';
import AgentLaunchButton from '@/components/agents/AgentLaunchButton';
import { agentIntelligenceEngine, type AgentIntelligence, type PredictiveInsight } from '@/lib/agents/agentIntelligence';
import CosmicButton from '@/components/shared/CosmicButton';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
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
  // Determines if we show the glow halo (VIP/unlocked highlight)
  const showGlowHalo = isRecommended && !selected; // simple heuristic
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
  const handleImageError = (event: any) => {
    console.error('[AgentLeagueCard] Failed to load agent image:', agentImagePath, 'for agent:', agent.id);
    event.currentTarget.onerror = null;
    event.currentTarget.src = '/images/agents-default-nobg-skrblai.webp';
  };

  // Button action handlers
  const handleCardClick = () => {
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
      {showGlowHalo && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at center, rgba(0,255,255,0.35) 0%, rgba(0,255,255,0.05) 70%, transparent 100%)',
            filter: 'blur(12px)'
          }}
          initial={{ opacity: 0.6, scale: 0.95 }}
          animate={{ opacity: isHovered ? 1 : 0.7, scale: isHovered ? 1 : 0.95 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}

      <GlassmorphicCard
        className={`relative ${className}`}
        onClick={handleCardClick}
        hoverEffect={true}
      >
        <div
          ref={cardRef}
          role="group"
          aria-label={`${agent.name} agent card`}
          tabIndex={0}
          className="w-full h-full p-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Agent Header (Like Services) */}
          <div className="flex flex-col items-center mb-4">
            {/* Agent Image - Fixed size like Services */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 mb-3">
              <Agent3DCardProvider
                agent={agent}
                className="w-full h-full"
                glowColor="#30D5C8"
                enableFlip
                flipTrigger="hover"
              >
                <Image
                  src={agentImagePath}
                  alt={`${agent.name} AI Agent`}
                  width={144}
                  height={144}
                  className="w-full h-full object-contain mx-auto rounded-2xl drop-shadow-lg"
                  onError={handleImageError}
                  loading="lazy"
                />
              </Agent3DCardProvider>
              
              {/* Agent Intelligence Overlay */}
              {showIntelligence && agentIntelligence && (
                <motion.div
                  className="absolute top-0 left-0 z-10"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + 0.05 * index }}
                >
                  <div className="bg-transparent backdrop-blur-md rounded-lg p-2 border border-purple-500/30 max-w-[120px]">
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-purple-400 font-semibold flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                        IQ: {agentIntelligence.intelligenceLevel}
                      </div>
                    </div>
                    <div className="text-xs text-yellow-400 font-semibold mt-1 capitalize">
                      {agentIntelligence.autonomyLevel}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Predictive Insights Overlay (on hover) */}
              {showIntelligence && isHovered && predictiveInsights.length > 0 && (
                <motion.div
                  className="absolute top-0 right-0 z-20"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="bg-transparent backdrop-blur-md rounded-lg p-3 border border-cyan-500/50 shadow-xl max-w-[180px]">
                    <div className="text-xs text-cyan-400 font-semibold mb-2 flex items-center gap-1">
                      🔮 Insights
                    </div>
                    {predictiveInsights.slice(0, 1).map((insight, idx) => (
                      <div key={idx} className="text-xs text-gray-300 mb-1">
                        <span className="text-yellow-400 font-medium capitalize">
                          {insight.domain.replace('_', ' ')}:
                        </span>
                        <span className="ml-1 block">{insight.insight.slice(0, 35)}...</span>
                        <div className="text-xs text-green-400 mt-0.5">
                          {Math.round(insight.probability * 100)}% confidence
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Agent Name & Category */}
            <div className="text-center mb-2">
              <h3 className="text-lg font-bold bg-gradient-to-r from-electric-blue to-teal-500 bg-clip-text text-transparent">
                {agent.name}
              </h3>
              <div className="text-sm text-gray-300 capitalize">{agent.category}</div>
            </div>

            {/* Agent Stats */}
            <div className="w-full flex justify-center items-center gap-2 mb-3">
              {/* Live Users */}
              <div className="flex items-center gap-1 text-xs text-cyan-400">
                <Users className="w-3 h-3" />
                <span>{liveUsers}</span>
              </div>
              
              {/* User Progress */}
              {userProgress > 0 && (
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>{userProgress}%</span>
                </div>
              )}
              
              {/* Mastery Level */}
              {userMastery > 0 && (
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Star className="w-3 h-3" />
                  <span>Lvl {userMastery}</span>
                </div>
              )}
              
              {/* Urgency */}
              {urgencySpots < 30 && (
                <div className="flex items-center gap-1 text-xs text-rose-400">
                  <Zap className="w-3 h-3" />
                  <span>{urgencySpots} left</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Agent Description */}
          <div className="text-sm text-gray-300 mb-4 text-center line-clamp-2">
            {agent.description?.slice(0, 80) || `AI-powered ${agent.category} assistant`}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLearnClick}
              className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-full bg-transparent border border-cyan-500/50 text-cyan-400 text-xs font-medium agent-button-learn"
            >
              <Info className="w-3 h-3" />
              Learn
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleChatClick}
              className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-full bg-transparent border border-purple-500/50 text-purple-400 text-xs font-medium agent-button-chat"
            >
              <MessageCircle className="w-3 h-3" />
              Chat
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLaunchClick}
              className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-full bg-transparent border border-emerald-500/50 text-emerald-400 text-xs font-medium agent-button-launch"
            >
              <Rocket className="w-3 h-3" />
              Launch
            </motion.button>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Backstory Modal */}
      <AnimatePresence>
        {showBackstoryModal && backstory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowBackstoryModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="relative w-full max-w-2xl max-h-[80vh] overflow-auto"
            >
              <GlassmorphicCard className="p-6">
                <button
                  onClick={() => setShowBackstoryModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  &times;
                </button>
                
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-electric-blue to-teal-500 bg-clip-text text-transparent">
                  {agent.name} Backstory
                </h2>
                
                <div className="prose prose-invert max-w-none">
                  {backstory.backstory}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <CosmicButton onClick={() => setShowBackstoryModal(false)}>
                    Close
                  </CosmicButton>
                </div>
              </GlassmorphicCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AgentLeagueCard;