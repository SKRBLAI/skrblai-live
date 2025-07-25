"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Agent } from '../types/agent';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Lock } from 'lucide-react';
import { getAgentEmoji, getAgentImagePath } from '../utils/agentUtils';
import AgentModal from './ui/AgentModal';
import LockOverlay from './ui/LockOverlay';
import GlassmorphicCard from './shared/GlassmorphicCard';

// Cosmic Shadow Standard: Soft, premium, layered glow with teal, blue, and subtle fuchsia.
const GLOW_COLOR = '0 0 24px 4px rgba(0,245,212,0.48), 0 0 60px 10px rgba(0,102,255,0.28), 0 0 32px 8px rgba(232,121,249,0.18)';
const HOVER_GLOW = '0 0 36px 8px rgba(0,245,212,0.70), 0 0 80px 20px rgba(0,102,255,0.38), 0 0 48px 12px rgba(232,121,249,0.28)';

const getCardVariants = (index: number) => ({
  initial: { 
    scale: 0.97, 
    opacity: 0, 
    y: 24,
    transition: { duration: 0.3, ease: 'easeOut' as const }
  },
  animate: { 
    scale: 1, 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      type: 'spring' as const,
      stiffness: 120,
      delay: 0.1 * index
    } 
  },
  hover: { 
    scale: 1.02,
    transition: { 
      type: 'spring' as const, 
      stiffness: 400, 
      damping: 15,
      mass: 0.5
    }
  },
  tap: { 
    scale: 0.98,
    transition: { 
      type: 'spring' as const,
      stiffness: 500,
      damping: 20
    } 
  }
});

const getAvatarVariants = (index: number) => ({
  initial: { 
    y: -10, 
    opacity: 0, 
    scale: 0.95,
    rotate: 5
  },
  animate: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    transition: { 
      type: 'spring' as const, 
      stiffness: 350, 
      damping: 22, 
      delay: 0.2 + index * 0.05,
      rotate: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12
      }
    } 
  },
  hover: { 
    y: -8, 
    scale: 1.04,
    rotate: [0, -3, 3, -2, 2, 0],
    transition: { 
      type: 'spring' as const, 
      stiffness: 400, 
      damping: 15,
      rotate: {
        duration: 1.2
      }
    } 
  }
});

const getContentVariants = (index: number) => ({
  initial: { 
    y: 4, 
    opacity: 0.8,
    transition: { duration: 0.3 }
  },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: 0.4,
      delay: 0.3 + index * 0.03,
      ease: 'easeOut' as const
    }
  },
  hover: { 
    y: -4,
    transition: { 
      type: 'spring' as const,
      stiffness: 300,
      damping: 15
    } 
  }
});

const getCtaVariants = (index: number) => ({
  initial: { 
    opacity: 0, 
    y: 12,
    scale: 0.96
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      delay: 0.4 + index * 0.02,
      ease: 'easeOut' as const
    }
  },
  hover: { 
    scale: 1.02,
    transition: { 
      type: 'spring' as const,
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.98
  }
});

interface AgentCardProps {
  agent: Agent;
  index?: number;
  isPremiumUnlocked?: boolean;
  className?: string;
  onClick?: () => void;
  onInfo?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  index = 0,
  isPremiumUnlocked = true,
  className = '',
  onClick = () => {},
  onInfo
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-40, 40], [12, -12]);
  const rotateY = useTransform(x, [-40, 40], [-12, 12]);
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const handleResize = () => setIsDark(document.documentElement.classList.contains('dark'));
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const { imageSlug, id = "", gender = 'neutral', name } = agent;
  const avatarSrc = getAgentImagePath(agent);
  const [imgSrc, setImgSrc] = useState(avatarSrc);
  const [usedFallback, setUsedFallback] = useState(false);
  
  useEffect(() => {
    setImgSrc(avatarSrc);
    setUsedFallback(false);
  }, [avatarSrc]);

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    x.set(px - rect.width / 2);
    y.set(py - rect.height / 2);
  };
  
  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  const handleCardClick = () => {
    if (agent.premium && !isPremiumUnlocked) return;
    if (onInfo) {
      onInfo();
    } else {
      setModalOpen(true);
    }
  };
  
  const handleCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (agent.premium && !isPremiumUnlocked) return;
    onClick();
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (agent.premium && !isPremiumUnlocked) return;
    if (onInfo) {
      onInfo();
    } else {
      setModalOpen(true);
    }
  };
  
  const emoji = agent?.icon ?? getAgentEmoji(agent.category) ?? '🤖';
  const isLocked = agent.premium && !isPremiumUnlocked;

  const cardVariants = getCardVariants(index);
  const avatarVariants = getAvatarVariants(index);
  const contentVariants = getContentVariants(index);
  const ctaVariants = getCtaVariants(index);

  return (
    <>
      <AgentModal agent={agent} open={modalOpen} onClose={() => setModalOpen(false)} />
      
      <div
        className={`relative cursor-pointer select-none bg-gradient-to-br from-violet-800 via-purple-900 to-indigo-900/80 backdrop-blur-xl bg-opacity-80 border-2 border-teal-400/80 shadow-[0_0_24px_#30D5C8AA] hover:shadow-[0_0_48px_#30D5C8AA,0_4px_48px_#5B3DF555] rounded-2xl transition-all ${className}`}
        onClick={handleCardClick}
      >
        <motion.div
          ref={cardRef}
          className="relative w-full h-full p-6"
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            transformPerspective: 1000
          }}
        >
          {/* Content */}
          <div className="p-1 md:p-2">
            {/* Agent Avatar */}
            <motion.div 
              className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 md:mb-6"
              variants={avatarVariants}
              style={{ transformStyle: 'preserve-3d', zIndex: 10 }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-violet-700/30 via-purple-800/30 to-indigo-800/30 backdrop-blur-lg border-2 border-teal-400/80 shadow-[0_0_24px_#30D5C8AA]">
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt={`${name} AI Agent`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (!usedFallback) {
                        setImgSrc(`/images/agents/${id || gender}.png`);
                        setUsedFallback(true);
                      } else {
                        e.currentTarget.src = `/images/agents/neutral.png`;
                      }
                    }}
                  />
                )}
              </div>
              
              {/* Emoji Indicator */}
              <div 
                className="absolute -bottom-2 -right-2 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg border-2 border-white/10"
                style={{ transform: 'translateZ(20px)' }}
              >
                {emoji}
              </div>
            </motion.div>
            
            {/* Agent Info */}
            <motion.div 
              className="text-center mb-4"
              variants={contentVariants}
            >
              <h3 className="text-lg md:text-xl font-bold mb-1 text-[#00F0FF] drop-shadow-glow">
                {name}
              </h3>
              <p className="text-sm md:text-base text-white/90 line-clamp-2">
                {agent.description || `AI-powered ${agent.category} assistant`}
              </p>
            </motion.div>
            
            {/* CTA Button */}
            <motion.div 
              className="mt-4 flex justify-center"
              variants={ctaVariants}
            >
              <button
                onClick={handleCtaClick}
                className="px-4 py-2 md:px-6 md:py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-medium text-sm md:text-base hover:shadow-glow transition-all duration-300"
              >
                {isLocked ? 'Unlock Agent' : 'Launch Agent'}
              </button>
            </motion.div>
          </div>
          
          {/* Lock Overlay for Premium Agents */}
          {isLocked && (
            <LockOverlay />
          )}
        </motion.div>
      </div>
    </>
  );
};

export default AgentCard; 