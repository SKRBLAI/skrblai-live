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

const glow = {
  resting:
    '0 0 24px 4px rgba(0,245,212,0.48), 0 0 60px 10px rgba(0,102,255,0.28), 0 0 32px 8px rgba(232,121,249,0.18)',
  hover:
    '0 0 36px 8px rgba(0,245,212,0.70), 0 0 80px 20px rgba(0,102,255,0.38), 0 0 48px 12px rgba(232,121,249,0.28)',
  recommended:
    '0 0 40px 12px rgba(34,197,94,0.60), 0 0 80px 24px rgba(34,197,94,0.40), 0 0 60px 16px rgba(34,197,94,0.30)',
};

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
          y: [0, -8, 0, 8, 0], // gentle levitation
          scale: 1,
          rotateY: [0, 3, 0, -3, 0], // subtle cosmic sway
          transition: {
            y: { duration: 12, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' as const },
            rotateY: { duration: 16, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' as const },
            opacity: { duration: 0.6 },
            scale: { duration: 0.6 },
          }
        }}
        whileHover={{ 
          scale: 1.08, 
          rotateY: 0, 
          rotateX: 0, 
          boxShadow: isRecommended ? glow.recommended : glow.hover,
          transition: { duration: 0.3 }
        }}
        whileFocus={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 120, delay: 0.05 * index }}
        className={`relative w-full max-w-72 h-80 md:h-96 flex-shrink-0 mx-auto rounded-3xl shadow-xl overflow-hidden perspective-1000 ${selected ? 'ring-4 ring-fuchsia-400/80 ring-offset-2' : ''} ${className}`}
        style={{ 
          filter: 'drop-shadow(' + (isRecommended ? glow.recommended : glow.resting) + ')',
          zIndex: isRecommended ? 10 : 1,
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(51, 65, 85, 0.9) 100%)',
          border: '1px solid rgba(30, 144, 255, 0.2)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Agent Image Container */}
        <div className="relative w-full h-[60%] flex items-center justify-center p-4">
          {/* Agent Image */}
          <div className="agent-image-container w-32 h-32 md:w-40 md:h-40">
            <img
              src={agentImagePath}
              alt={`${agent.name} AI Agent`}
              className="agent-image w-full h-full object-contain"
              onError={handleImageError}
              loading="lazy"
            />
          </div>
          
          {/* Agent Intelligence Overlay */}
          {showIntelligence && agentIntelligence && (
            <motion.div
              className="absolute top-2 left-2 right-2 z-10 max-w-xs md:max-w-sm overflow-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + 0.05 * index }}
            >
              <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-purple-500/30">
                <div className="flex items-center justify-between text-xs">
                  <div className="text-purple-400 font-semibold flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                    IQ: {agentIntelligence.intelligenceLevel}
                  </div>
                  <div className="text-cyan-400 font-medium flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    {liveUsers} live now
                  </div>
                </div>
                <div className="text-xs text-yellow-400 font-semibold mt-1 capitalize">
                  {agentIntelligence.autonomyLevel} • {urgencySpots} urgent tasks
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  {agentIntelligence.superheroName} • {agentIntelligence.predictionCapabilities.length} prediction domains
                </div>
              </div>
            </motion.div>
          )}

          {/* Predictive Insights Overlay (on hover) */}
          {showIntelligence && isHovered && predictiveInsights.length > 0 && (
            <motion.div
              className="absolute top-16 left-2 right-2 z-20 max-w-xs md:max-w-sm overflow-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-gradient-to-br from-gray-900/95 to-purple-900/95 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/50 shadow-xl">
                <div className="text-xs text-cyan-400 font-semibold mb-2 flex items-center gap-1">
                  🔮 Predictive Insights
                </div>
                {predictiveInsights.slice(0, 2).map((insight, idx) => (
                  <div key={idx} className="text-xs text-gray-300 mb-1">
                    <span className="text-yellow-400 font-medium capitalize">
                      {insight.domain.replace('_', ' ')}:
                    </span>
                    <span className="ml-1">{insight.insight.slice(0, 50)}...</span>
                    <div className="text-xs text-green-400 mt-0.5">
                      {Math.round(insight.probability * 100)}% confidence
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Agent Info Section */}
        <div className="relative w-full h-[40%] p-4 flex flex-col justify-between">
          {/* Agent Name */}
          <motion.div
            className="text-center mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + 0.05 * index }}
          >
            <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-electric-blue via-teal-400 to-electric-blue bg-clip-text text-transparent text-center whitespace-normal break-words no-text-cutoff">
              {agent.name}
            </h3>
            {agent.description && (
              <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                {agent.description}
              </p>
            )}
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            {/* LEARN Button */}
            <motion.button
              className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold border border-cyan-400/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200"
              onClick={handleLearnClick}
              aria-label={`Learn about ${agent.name}`}
              tabIndex={0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              LEARN
            </motion.button>
            
            {/* CHAT Button */}
            <motion.button
              className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold border border-purple-400/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/80 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200"
              onClick={handleChatClick}
              aria-label={`Chat with ${agent.name}`}
              tabIndex={0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              CHAT
            </motion.button>
            
            {/* LAUNCH Button */}
            <motion.button
              className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-green-600/80 to-emerald-600/80 hover:from-green-500 hover:to-emerald-500 text-white text-xs font-bold border border-green-400/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400/80 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200"
              onClick={handleLaunchClick}
              aria-label={`Launch ${agent.name}`}
              tabIndex={0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              LAUNCH
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Phase 3: Enhanced Backstory Modal (triggered by LEARN button only) */}
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
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowBackstoryModal(false);
                      handleChatClick({ stopPropagation: () => {} } as any);
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold"
                  >
                    Chat Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowBackstoryModal(false);
                      handleLaunchClick({ stopPropagation: () => {} } as any);
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-bold"
                  >
                    Launch Agent
                  </motion.button>
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
