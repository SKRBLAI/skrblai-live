'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import CardBase from './CardBase';

import { MessageCircle, Info, Rocket, Star, TrendingUp, Users, Zap, Sparkles, Crown, Award, Brain, Target, Palette, BarChart3, BookOpen, Globe, Smartphone, Video, DollarSign, Shield } from 'lucide-react';
import { Agent } from '../../types/agent';
import '../../styles/components/agent-card.css';
import { getAgentImagePath, getAgentEmoji } from '../../utils/agentUtils';
import { agentBackstories } from '../../lib/agents/agentBackstories';
import { agentLeague, type AgentConfiguration } from '../../lib/agents/agentLeague';
import AgentLaunchButton from '../agents/AgentLaunchButton';
import { agentIntelligenceEngine, type AgentIntelligence } from '../../lib/agents/agentIntelligence';
import CosmicButton from '../shared/CosmicButton';
import GlassmorphicCard from '../shared/GlassmorphicCard';
import Pseudo3DCard, { Pseudo3DFeature, Pseudo3DStats } from '../shared/Pseudo3DCard';
import Image from 'next/image';


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
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [agentIntelligence, setAgentIntelligence] = useState<AgentIntelligence | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // Get full agent configuration from Agent League (data-driven approach)
  const agentConfig = agentLeague.getAgent(agent.id);
  const backstory = agentBackstories[agent.id];
  
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
    return (
      <div className="h-80 flex items-center justify-center bg-gradient-to-br from-violet-800 via-purple-900 to-indigo-900/80 backdrop-blur-xl bg-opacity-80 border-2 border-teal-400/80 shadow-[0_0_24px_#30D5C8AA] rounded-2xl">
        <div className="text-white/60">Agent data unavailable</div>
      </div>
    );
  }

  return (
    <motion.div
        className={`relative min-h-80 h-auto ${className}`}
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
        <CardBase className="h-full relative overflow-hidden group float-slow" ariaLabel={`Agent: ${agentConfig.personality.superheroName || agent.name}`}>
          <motion.div 
            className="h-full relative overflow-hidden group bg-gradient-to-br from-violet-800/90 via-purple-900/90 to-indigo-900/80 backdrop-blur-xl border-2 border-teal-400/80 shadow-[0_0_36px_#30D5C8AA,0_0_72px_#5B3DF544] hover:shadow-[0_0_72px_#30D5C8AA,0_8px_64px_#5B3DF566] rounded-2xl transition-all duration-500 agent-card-glow float-slow"
            style={{
                  background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(75, 0, 130, 0.3) 25%, rgba(138, 43, 226, 0.4) 50%, rgba(72, 61, 139, 0.3) 75%, rgba(25, 25, 112, 0.2) 100%)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: `
                    0 0 40px rgba(48, 213, 200, 0.4),
                    0 0 80px rgba(91, 61, 245, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                  `
                }}
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
                  <div className="absolute top-3 right-3 z-20">
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
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full px-3 py-1 text-xs border border-cyan-400/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-cyan-300 font-medium">{liveUsers} online</span>
                  </div>
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full px-3 py-1 text-xs border border-purple-400/30">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-purple-300 font-medium">{agentConfig.powers.length} powers</span>
                  </div>
                </div>

                {/* Power Rangers Agent Image with Cosmic Effects */}
                <div className="flex flex-col items-center pt-6 pb-6 px-3">
                  <motion.div
                    className="relative w-24 h-24 mb-4"
                    whileHover={{ 
                      scale: shouldReduceMotion ? 1 : 1.15,
                      rotateY: shouldReduceMotion ? 0 : 15
                    }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                  >
                    {/* Cosmic Glow Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/40 to-purple-600/40 rounded-full blur-lg animate-pulse"></div>
                    
                    {/* Single Clean Ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-cyan-400/50"
                      animate={{ 
                        borderColor: [
                          'rgba(48, 213, 200, 0.5)',
                          'rgba(168, 85, 247, 0.5)',
                          'rgba(48, 213, 200, 0.5)'
                        ]
                      }}
                      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    />
                    
                    {/* Multiple Orbiting Particles */}
                    <motion.span
                      className="absolute -top-1 left-1/2 h-1.5 w-1.5 bg-cyan-400 rounded-full shadow-lg"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                      style={{ originX: 0.5, originY: 2.5 }}
                    />
                    <motion.span
                      className="absolute top-1/2 -right-1 h-1 w-1 bg-purple-400 rounded-full shadow-lg"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
                      style={{ originX: -2, originY: 0.5 }}
                    />
                    
                    <Image
                      src={getAgentImagePath(agent.id)}
                      alt={`${agentConfig.personality.superheroName || agent.name} Avatar`}
                      width={96}
                      height={96}
                      className="relative z-10 rounded-full border-2 border-teal-400/70 shadow-[0_0_20px_rgba(48,213,200,0.5)] hover:shadow-[0_0_30px_rgba(48,213,200,0.8)] transition-all duration-300"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLDivElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="hidden absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full items-center justify-center text-3xl text-white border-2 border-teal-400/70 shadow-lg"
                      style={{ display: 'none' }}
                    >
                      {agentConfig.emoji || getAgentEmoji(agent.id)}
                    </div>
                  </motion.div>

                  {/* Agent Name & Superhero Title */}
                  <motion.h3 
                    className="text-lg font-bold bg-gradient-to-r from-[#00F0FF] via-purple-400 to-[#00F0FF] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,240,255,0.6)] mb-1 text-center px-2 leading-tight"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ 
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                      lineHeight: '1.2'
                    }}
                  >
                    {agentConfig.personality.superheroName || agent.name}
                  </motion.h3>

                  {/* Catchphrase */}
                  <motion.p 
                    className="text-xs text-cyan-300 font-medium mb-2 text-center italic px-2 leading-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ 
                      lineHeight: '1.3',
                      maxHeight: '2.6em',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    "{agentConfig.personality.catchphrase}"
                  </motion.p>

                  {/* Capability Icons */}
                  <motion.div 
                    className="flex items-center gap-2 mb-3 flex-wrap justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {agentConfig.capabilities.slice(0, 3).map((capability, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 border border-cyan-400/30"
                        title={capability.category}
                      >
                        {getCapabilityIcon(capability.category)}
                        <span className="text-xs text-cyan-300">{capability.category.split(' ')[0]}</span>
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
                    <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={() => {
                  if (onChat) {
                    onChat(agent);
                  } else {
                    // Free Scan Flow - route to Percy onboarding with scan intent
                    router.push(`/?scan=${agent.id}`);
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-500/80 to-blue-600/80 hover:from-cyan-400/90 hover:to-blue-500/90 text-white text-xs font-bold rounded-lg border border-cyan-400/50 backdrop-blur-sm shadow-[0_0_15px_rgba(48,213,200,0.3)] hover:shadow-[0_0_25px_rgba(48,213,200,0.5)] transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </motion.button>
              
              <motion.button
                onClick={() => {
                  if (onInfo) {
                    onInfo(agent);
                  } else {
                    // FIXED: INFO button routes to agent backstory via service page
                    router.push(`/services/${agent.id}?tab=backstory`);
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/80 to-pink-600/80 hover:from-purple-400/90 hover:to-pink-500/90 text-white text-xs font-bold rounded-lg border border-purple-400/50 backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Info className="w-4 h-4" />
                Info
              </motion.button>
            </div>
            
            <motion.button
              onClick={() => {
                if (onLaunch) {
                  onLaunch(agent);
                } else {
                  // Launch Agent - route to unified service page
                  router.push(`/services/${agent.id}`);
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500/80 to-emerald-600/80 hover:from-green-400/90 hover:to-emerald-500/90 text-white text-sm font-bold rounded-lg border border-green-400/50 backdrop-blur-sm shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all duration-300"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Rocket className="w-4 h-4" />
              Launch Agent
            </motion.button>
          </motion.div>

          {/* Power Rangers Cosmic Hover Effects */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
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
  );
};

export default AgentLeagueCard;