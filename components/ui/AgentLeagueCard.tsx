'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import CardBase from './CardBase';

import { MessageCircle, Info, Rocket, Star, TrendingUp, Users, Zap, Sparkles, Crown, Award, Brain, Target, Palette, BarChart3, BookOpen, Globe, Smartphone, Video, DollarSign, Shield } from 'lucide-react';
import '../../styles/components/agent-card.css';
import '../../styles/components/AgentLeagueCard.css';
import { getAgentImagePath, getAgentEmoji } from '../../utils/agentUtils';
import { SafeAgent } from '../../types/agent';
import { agentBackstories } from '../../lib/agents/agentBackstories';
import { agentLeague, type AgentConfiguration } from '../../lib/agents/agentLeague';
import { routeForAgent } from '../../lib/agents/routes';
import AgentLaunchButton from '../agents/AgentLaunchButton';
import { agentIntelligenceEngine, type AgentIntelligence } from '../../lib/agents/agentIntelligence';
import CosmicButton from '../shared/CosmicButton';
import GlassmorphicCard from '../shared/GlassmorphicCard';
import Pseudo3DCard, { Pseudo3DFeature, Pseudo3DStats } from '../shared/Pseudo3DCard';
import Image from 'next/image';
import { useAgentModal } from '../providers/GlobalModalProvider';
import { agentPath } from '../../utils/agentRouting';
import { agentSupportsChat } from '../../lib/agents/guards';
import AgentErrorBoundary from './AgentErrorBoundary';

// Capability icon mapping for visual representation
const getCapabilityIcon = (category: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Brand Design': <Palette className="w-3 h-3" />,
    'Branding': <Palette className="w-3 h-3" />,
    'Creative': <Palette className="w-3 h-3" />,
    'Content Creation': <BookOpen className="w-3 h-3" />,
    'Content': <BookOpen className="w-3 h-3" />,
    'Social Media': <Smartphone className="w-3 h-3" />,
    'Social': <Smartphone className="w-3 h-3" />,
    'Analytics': <BarChart3 className="w-3 h-3" />,
    'Data Analytics': <BarChart3 className="w-3 h-3" />,
    'Advertising': <Target className="w-3 h-3" />,
    'Ad Creation': <Target className="w-3 h-3" />,
    'Video Creation': <Video className="w-3 h-3" />,
    'Video': <Video className="w-3 h-3" />,
    'Book Publishing': <BookOpen className="w-3 h-3" />,
    'Publishing': <BookOpen className="w-3 h-3" />,
    'Website Creation': <Globe className="w-3 h-3" />,
    'Web Development': <Globe className="w-3 h-3" />,
    'Integration': <Shield className="w-3 h-3" />,
    'Data Synchronization': <Shield className="w-3 h-3" />,
    'Client Success': <Users className="w-3 h-3" />,
    'Payment Processing': <DollarSign className="w-3 h-3" />,
    'Finance': <DollarSign className="w-3 h-3" />,
    'Sports Performance': <TrendingUp className="w-3 h-3" />,
    'Sports & Fitness': <TrendingUp className="w-3 h-3" />,
    'Orchestration': <Brain className="w-3 h-3" />,
    'Concierge': <Brain className="w-3 h-3" />
  };
  return iconMap[category] || <Zap className="w-3 h-3" />;
};

// Badge type detection from agent configuration
const getBadgeType = (agentConfig: AgentConfiguration): 'recommended' | 'new' | 'featured' | null => {
  // Check if agent is premium (often featured)
  if (agentConfig.premium) return 'featured';
  
  // Check if agent has high performance metrics (recommended)
  if (agentConfig.performanceMetrics.length > 3) return 'recommended';
  
  // Check if agent is new (version 1.0.0 or recent)
  if (agentConfig.version === '1.0.0') return 'new';
  
  // Default intelligence-based recommendations
  const intelligence = agentIntelligenceEngine.getAgentIntelligence(agentConfig.id);
  if (intelligence && intelligence.intelligenceLevel > 85) return 'recommended';
  
  return null;
};

interface AgentLeagueCardProps {
  agent: SafeAgent;
  index?: number;
  className?: string;
  onChat?: (agent: SafeAgent) => void;
  onInfo?: (agent: SafeAgent) => void;
  onHandoff?: (agent: SafeAgent) => void;
  onLaunch?: (agent: SafeAgent) => void;
  isRecommended?: boolean;
  userProgress?: number;
  userMastery?: number;
  showIntelligence?: boolean;
  children?: React.ReactNode;
  onClick?: (agent: SafeAgent) => void;
  onInfoClick?: (agent: SafeAgent) => void;
}

const AgentLeagueCard: React.FC<AgentLeagueCardProps & { selected?: boolean }> = ({
  agent,
  index = 0,
  className = '',
  onChat,
  onInfo,
  onInfoClick,
  onLaunch,
  onHandoff,
  onClick,
  selected = false,
  isRecommended = false,
  userProgress = 0,
  userMastery = 0,
  showIntelligence = true
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [liveUsers, setLiveUsers] = useState(Math.floor(Math.random() * 89) + 12);
  const [urgencySpots, setUrgencySpots] = useState(Math.floor(Math.random() * 47) + 23);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [agentIntelligence, setAgentIntelligence] = useState<AgentIntelligence | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { openAgentBackstory } = useAgentModal();

  // Get full agent configuration from Agent League (data-driven approach)
  const agentConfig = agentLeague.getAgent(agent.id);
  const backstory = agentBackstories[agent.id];
  
  // Null guard for agent lookup
  if (!agent || !agent.id) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AgentLeagueCard] Invalid agent provided:', agent);
    }
    return null;
  }
  
  // Auto-detect badge type from agent configuration
  const detectedBadgeType = agentConfig ? getBadgeType(agentConfig) : null;
  const badgeType = detectedBadgeType || (isRecommended ? 'recommended' : null);

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





  if (!agent || !agent.name || !agentConfig) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AgentLeagueCard] Missing agent data:', { 
        hasAgent: !!agent, 
        hasName: !!agent?.name, 
        hasConfig: !!agentConfig,
        agentId: agent?.id 
      });
    }
    return (
      <div className="h-80 flex items-center justify-center bg-gradient-to-br from-violet-800 via-purple-900 to-indigo-900/80 backdrop-blur-xl bg-opacity-80 border-2 border-teal-400/80 shadow-[0_0_24px_#30D5C8AA] rounded-2xl">
        <div className="text-white/60">Agent data unavailable</div>
      </div>
    );
  }

  return (
    <AgentErrorBoundary agentId={agent.id}>
      <motion.div
          className={`relative min-h-80 h-80 ${className}`}
          initial={{ 
            opacity: 0, 
            y: 30,
            scale: 0.95
          }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: 1
          }}
          transition={{
            duration: 0.5,
            delay: index * 0.1
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
        {/* Power Rangers Cosmic Glass Card */}
        <CardBase 
          className="agent-league-card-base hover:shadow-[0_0_40px_rgba(0,0,0,0.35)] hover:ring-white/20 cursor-pointer h-full" 
          ariaLabel={`Agent: ${agentConfig.personality.superheroName || agent.name}`}
          onClick={() => router.push(`${agentPath(agent.id)}?tab=backstory`)}
        >
          <motion.div 
            className="agent-league-card-container agent-card-glow float-slow"
          >
                {/* Pulsing Border Animation */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl border-2 border-teal-400/60 opacity-75"
                  animate={{
                    borderColor: [
                      'rgba(48, 213, 200, 0.6)',
                      'rgba(91, 61, 245, 0.8)',
                      'rgba(168, 85, 247, 0.6)',
                      'rgba(48, 213, 200, 0.6)'
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Auto-detected Badge from Agent Config */}
                {badgeType && (
                  <div className="absolute top-2 right-2 z-10 truncate max-w-[60%]">
                    <motion.div 
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm ${
                        badgeType === 'recommended' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                        badgeType === 'featured' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                        badgeType === 'new' ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' :
                        'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {badgeType === 'recommended' && <Star className="w-3 h-3" />}
                      {badgeType === 'featured' && <Crown className="w-3 h-3" />}
                      {badgeType === 'new' && <Sparkles className="w-3 h-3" />}
                      {badgeType.toUpperCase()}
                    </motion.div>
                  </div>
                )}
                {/* Live Activity & Stats - Data-driven */}
                <div className="agent-league-stats">
                  <div className="agent-league-stat-item">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-cyan-300 font-medium">{liveUsers} online</span>
                  </div>
                  <div className="agent-league-stat-item">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-purple-300 font-medium">{agentConfig.powers.length} powers</span>
                  </div>
                </div>

                {/* Power Rangers Agent Image with standardized frame (glass + ring + soft shadow) */}
                <div className="flex flex-col items-center pt-6 pb-6 px-3">
                  <motion.div
                    className="relative mx-auto mt-3 h-28 w-28 rounded-xl bg-white/[0.03] ring-1 ring-white/10 shadow-lg shadow-black/20 mb-4"
                    whileHover={{ 
                      scale: shouldReduceMotion ? 1 : 1.05
                    }}
                    transition={{ duration: 0.25, type: "spring", stiffness: 220 }}
                  >
                    <Image
                      src={getAgentImagePath(agent, "nobg")}
                      alt={`${agentConfig.personality.superheroName || agent.name} Avatar`}
                      fill
                      sizes="112px"
                      className="object-contain p-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (process.env.NODE_ENV === 'development') {
                          console.warn(`[AgentLeagueCard] Image failed to load for agent ${agent.id}: ${target.src}`);
                        }
                        // Try placeholder image first
                        if (!target.src.includes('placeholder.png')) {
                          target.src = '/agents/placeholder.png';
                        } else {
                          // If placeholder also fails, hide image and show emoji
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLDivElement;
                          if (fallback) fallback.style.display = 'flex';
                        }
                      }}
                    />
                    <div 
                      className="agent-league-fallback-avatar absolute inset-0 hidden items-center justify-center rounded-xl bg-zinc-900/60 text-zinc-300"
                    >
                      <span className="text-2xl font-bold">{agentConfig.emoji || getAgentEmoji(agent.id)}</span>
                    </div>
                  </motion.div>

                  {/* Agent Name & Superhero Title */}
                  <motion.h3 
                    className="agent-league-name"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {agentConfig.personality.superheroName || agent.name}
                  </motion.h3>

                  {/* Catchphrase */}
                  <motion.p 
                    className="agent-league-catchphrase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    "{agentConfig.personality.catchphrase}"
                  </motion.p>

                  {/* Capability Icons */}
                  <motion.div 
                    className="agent-league-capabilities"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {agentConfig.capabilities.slice(0, 3).map((capability, idx) => (
                      <div 
                        key={idx}
                        className="agent-league-capability-item"
                        title={capability.category}
                      >
                        {getCapabilityIcon(capability.category)}
                        <span className="agent-league-capability-text">{capability.category.split(' ')[0]}</span>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div 
                    className="mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="agent-league-button-grid">
              {agentSupportsChat(agent.id) && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    if (onChat) {
                      onChat(agent);
                    } else {
                      // Route to agent chat view
                      router.push(agentPath(agent.id, 'chat'));
                    }
                  }}
                  className="agent-league-chat-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </motion.button>
              )}
              
              <motion.button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  if (onInfoClick) {
                    onInfoClick(agent);
                  } else if (onInfo) {
                    onInfo(agent);
                  } else {
                    // Route to dedicated agent backstory page
                    router.push(agentPath(agent.id, 'backstory'));
                  }
                }}
                className="agent-league-info-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Info className="w-4 h-4" />
                Info
              </motion.button>
            </div>
            
            <motion.button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                if (onClick) {
                  onClick(agent);
                } else if (onLaunch) {
                  onLaunch(agent);
                } else {
                  // Navigate to agent home page
                  router.push(agentPath(agent.id, 'home'));
                }
              }}
              className="agent-league-launch-button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Rocket className="w-4 h-4" />
              Launch Agent
            </motion.button>
          </motion.div>

          {/* Power Rangers Cosmic Hover Effects */}
          <motion.div 
            className="agent-league-hover-effect"
            animate={{
              background: [
                'linear-gradient(45deg, rgba(48, 213, 200, 0.05), rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.05))',
                'linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.05), rgba(48, 213, 200, 0.05))',
                'linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(48, 213, 200, 0.05), rgba(168, 85, 247, 0.1))'
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </CardBase>
      </motion.div>
    </AgentErrorBoundary>
  );
};

export default AgentLeagueCard;