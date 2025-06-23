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

  // Agent League Card uses ONLY the Buttons.png card frame
  const frameAssetPath = getAgentImagePath(agent, "card");

  // Image error handler
  const handleFrameImgError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('[AgentLeagueCard] Failed to load frame asset:', frameAssetPath, 'for agent:', agent.id);
    event.currentTarget.onerror = null;
    event.currentTarget.src = '/images/Agents-Default-Buttons.png';
  };

  // Button action handlers
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Remove general click-to-flip behavior - buttons handle specific actions
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
      // Default chat behavior
      router.push(`/agents/${agent.id}/chat`);
    }
  };

  const handleLaunchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLaunch) {
      onLaunch(agent);
    } else if (onHandoff) {
      onHandoff(agent);
    } else {
      // Default launch behavior
      router.push(`/agents/${agent.id}/launch`);
    }
  };

  return (
    <>
      <motion.div
        ref={cardRef}
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
        className={`relative w-72 h-96 flex-shrink-0 mx-auto rounded-3xl shadow-xl overflow-visible perspective-1000 ${selected ? 'ring-4 ring-fuchsia-400/80 ring-offset-2' : ''} ${className}`}
        style={{ 
          filter: 'drop-shadow(' + (isRecommended ? glow.recommended : glow.resting) + ')',
          zIndex: isRecommended ? 10 : 1
        }}
        aria-label={`${agent.name} agent card`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Superhero Intelligence Header */}
        {showIntelligence && agentIntelligence && (
          <div className="absolute -top-3 left-4 right-4 z-20">
            <div className="bg-gradient-to-r from-purple-900/90 to-blue-900/90 border border-purple-400/50 rounded-lg px-3 py-1.5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 live-indicator"></div>
                  <span className="text-purple-200 font-semibold">
                    IQ: {agentIntelligence.intelligenceLevel}/100
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-200 font-medium capitalize">
                    {agentIntelligence.autonomyLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Live Activity Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          className="absolute top-[15%] right-[8%] bg-gradient-to-r from-red-900/90 to-orange-900/90 border border-red-400/50 rounded-lg px-2 py-1 z-20"
        >
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-red-300 text-xs font-bold">LIVE</span>
          </div>
          <div className="text-white text-xs">{liveUsers} active</div>
        </motion.div>

        {/* Phase 3: Percy Recommendation Badge */}
        {isRecommended && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="absolute top-[25%] left-[8%] bg-gradient-to-r from-green-500 to-emerald-500 rounded-full px-3 py-1 z-20 shadow-lg"
          >
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-white fill-white" />
              <span className="text-white text-xs font-bold">PERCY PICK</span>
            </div>
          </motion.div>
        )}

        {/* Phase 3: Urgency/Scarcity Indicator */}
        {urgencySpots < 30 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="absolute top-[35%] left-[8%] bg-gradient-to-r from-orange-900/90 to-yellow-900/90 border border-orange-400/50 rounded-lg px-2 py-1 z-20"
          >
            <div className="text-orange-300 text-xs font-semibold">⚠️ {urgencySpots} spots left</div>
          </motion.div>
        )}

        {/* Phase 3: User Progress Bar */}
        {userProgress > 0 && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.9 + index * 0.1, duration: 0.8 }}
            className="absolute bottom-[25%] left-[10%] right-[10%] h-1.5 bg-gray-700/80 rounded-full z-20"
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(userProgress, 100)}%` }}
              transition={{ delay: 1.1 + index * 0.1, duration: 1 }}
            />
          </motion.div>
        )}

        {/* Phase 3: Mastery Stars */}
        {userMastery > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3 + index * 0.1 }}
            className="absolute top-[45%] right-[8%] flex gap-1 z-20"
          >
            {[1, 2, 3].map(star => (
              <Star 
                key={star} 
                className={`w-3 h-3 ${userMastery >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
              />
            ))}
          </motion.div>
        )}

        {/* Main Card Frame */}
        <div className="w-full h-full relative">
          <img
            src={frameAssetPath}
            alt={`${agent.name} card frame`}
            className="w-full h-full object-contain"
            onError={handleFrameImgError}
          />
          
          {/* Agent Name with Enhanced Styling */}
          <motion.h3
            className="absolute top-[46%] left-1/2 -translate-x-1/2 text-lg font-extrabold bg-gradient-to-r from-electric-blue via-teal-400 to-electric-blue bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,245,212,0.6)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + 0.05 * index }}
          >
            {agent.name}
          </motion.h3>

          {/* Prediction Insights Overlay */}
          {showIntelligence && predictiveInsights.length > 0 && isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <div className="bg-black/80 border border-cyan-400/50 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-300 text-sm font-semibold">Predictive Insights</span>
                </div>
                <div className="space-y-1">
                  {predictiveInsights.slice(0, 2).map((insight, idx) => (
                    <div key={idx} className="text-xs text-cyan-200">
                      <span className="font-medium">{insight.domain}:</span> {insight.insight.slice(0, 50)}...
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase 3: Enhanced Interactive Button Overlays */}
          <div className="absolute bottom-[12%] left-0 right-0 flex justify-center gap-6">
            {/* LEARN Button */}
            <motion.button
              className="w-[85px] h-[36px] rounded-lg bg-transparent hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] focus:bg-cyan-500/20 transition-all group relative overflow-hidden"
              onClick={handleLearnClick}
              aria-label={`Learn about ${agent.name}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Info className="w-4 h-4 mx-auto text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="sr-only">LEARN</span>
            </motion.button>
            
            {/* CHAT Button */}
            <motion.button
              className="w-[85px] h-[36px] rounded-lg bg-transparent hover:bg-purple-500/20 hover:shadow-[0_0_15px_rgba(147,51,234,0.6)] focus:bg-purple-500/20 transition-all group relative overflow-hidden"
              onClick={handleChatClick}
              aria-label={`Chat with ${agent.name}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <MessageCircle className="w-4 h-4 mx-auto text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="sr-only">CHAT</span>
            </motion.button>
            
            {/* LAUNCH Button */}
            <motion.button
              className="w-[85px] h-[36px] rounded-lg bg-transparent hover:bg-green-500/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.6)] focus:bg-green-500/20 transition-all group relative overflow-hidden"
              onClick={handleLaunchClick}
              aria-label={`Launch ${agent.name}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Rocket className="w-4 h-4 mx-auto text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="sr-only">LAUNCH</span>
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
