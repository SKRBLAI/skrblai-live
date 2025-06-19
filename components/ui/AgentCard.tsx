"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Agent } from '@/types/agent';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Lock } from 'lucide-react';
import { getAgentEmoji, getAgentImagePath } from '@/utils/agentUtils';
import AgentModal from './AgentModal';
import LockOverlay from '@/components/ui/LockOverlay';

// Cosmic Shadow Standard: Soft, premium, layered glow with teal, blue, and subtle fuchsia.
const GLOW_COLOR = '0 0 24px 4px rgba(0,245,212,0.48), 0 0 60px 10px rgba(0,102,255,0.28), 0 0 32px 8px rgba(232,121,249,0.18)';
const HOVER_GLOW = '0 0 36px 8px rgba(0,245,212,0.70), 0 0 80px 20px rgba(0,102,255,0.38), 0 0 48px 12px rgba(232,121,249,0.28)';

const getCardVariants = (index: number) => ({
  initial: { 
    scale: 0.97, 
    opacity: 0, 
    y: 24, 
    boxShadow: GLOW_COLOR,
    transition: { duration: 0.3, ease: 'easeOut' as const }
  },
  animate: { 
    scale: 1, 
    opacity: 1, 
    y: 0, 
    boxShadow: GLOW_COLOR,
    transition: { 
      duration: 0.5, 
      type: 'spring', 
      stiffness: 120,
      delay: 0.1 * index
    } 
  },
  hover: { 
    scale: 1.02,
    boxShadow: HOVER_GLOW,
    transition: { 
      type: 'spring', 
      stiffness: 400, 
      damping: 15,
      mass: 0.5
    }
  },
  tap: { 
    scale: 0.98,
    transition: { 
      type: 'spring',
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
      type: 'spring', 
      stiffness: 350, 
      damping: 22, 
      delay: 0.2 + index * 0.05,
      rotate: {
        type: 'spring',
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
      type: 'spring', 
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
      type: 'spring',
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
      type: 'spring',
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
      <motion.article
        ref={cardRef}
        className={`relative group cursor-pointer select-none cosmic-card ${className}`}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        tabIndex={0}
        onClick={handleCardClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        aria-label={agent.name}
      >
        <div className="relative group/avatar">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400 via-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
          <div className="w-28 h-28 rounded-full object-contain cosmic-glass cosmic-glow border-2 border-[#30D5C8] flex items-center justify-center mx-auto mb-2 overflow-hidden relative z-10">
            {imgSrc && (
              <img
                src={imgSrc}
                alt={usedFallback ? `${agent.name} avatar (fallback)` : `${agent.name} avatar`}
                aria-label={agent.name}
                title={usedFallback ? `${agent.name} avatar (fallback)` : `${agent.name} avatar`}
                className="object-cover w-full h-full rounded-full"
                style={{ imageRendering: 'crisp-edges' }}
                loading="lazy"
                width={112}
                height={112}
                onError={() => {
                  if (imgSrc !== '') {
                    setImgSrc('');
                    setUsedFallback(true);
                    if (process.env.NODE_ENV === 'development') {
                      console.warn(`AgentCard: PNG not found for ${agent.name} (${avatarSrc}), falling back to emoji`);
                    }
                  }
                }}
              />
            )}
            {!imgSrc && (
              <div className="flex items-center justify-center h-full text-4xl bg-gray-800 rounded-full">
                🤖
              </div>
            )}
            {isLocked && (
              <motion.span 
                className="absolute bottom-1.5 right-1.5 bg-white/90 rounded-full p-1 shadow-md"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 500,
                  damping: 20,
                  delay: 0.5
                }}
              >
                <Lock size={18} className="text-teal-600" />
              </motion.span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <motion.div 
            className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-300 backdrop-blur-sm border border-teal-400/20 shadow-sm"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 15
            }}
          >
            {agent.category}
          </motion.div>
          
          {/* Chat capability badge */}
          {agent.canConverse && (
            <motion.div
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 backdrop-blur-sm border border-green-400/20 shadow-sm"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: 'spring',
                stiffness: 400,
                damping: 15,
                delay: 0.1
              }}
              title="Conversational AI - Click to chat!"
            >
              💬
            </motion.div>
          )}
        </div>
        
        <motion.h3 
          className="text-lg font-extrabold mb-1 text-center bg-gradient-to-r from-[#1E90FF] via-[#30D5C8] to-[#1E90FF] bg-clip-text text-transparent drop-shadow-[0_0_10px_#1E90FF]"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.3 + (index || 0) * 0.02,
            ease: 'easeOut' as const
          }}
        >
          {agent.name}
        </motion.h3>
        
        <motion.div 
          variants={contentVariants}
          className="mt-2 text-gray-300/90 text-sm text-center min-h-[48px] leading-relaxed px-1"
          initial="initial"
          animate="animate"
          whileHover="hover"
        >
          {agent.description}
        </motion.div>
        
        <motion.div
          variants={ctaVariants}
          className="mt-5 flex justify-center w-full"
        >
          <motion.button
            className={`cosmic-btn-primary w-full max-w-xs ${isLocked ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed' : ''}`}
            onClick={handleCtaClick}
            disabled={isLocked}
            tabIndex={0}
            aria-label={isLocked ? 'Premium locked' : `Launch ${agent.name}`}
            variants={ctaVariants}
            type="button"
          >
            {isLocked ? (
              <motion.span 
                className="flex items-center gap-2 justify-center"
                animate={{
                  x: [0, -2, 2, -1, 1, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: 'loop',
                }}
              >
                <Lock size={16} className="flex-shrink-0" /> Unlock Premium
              </motion.span>
            ) : (
              <motion.span 
                className="flex items-center justify-center gap-2"
                whileHover={{ gap: '0.5rem' }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                Launch Agent 
                <motion.span 
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'easeInOut' as const
                  }}
                  aria-hidden
                >
                  🚀
                </motion.span>
              </motion.span>
            )}
          </motion.button>
        </motion.div>
        
        <motion.div 
          className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' as const }}
        />
        
        {/* Uniform blue accent bar */}
        <motion.div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-electric-blue to-teal rounded-full"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ 
            duration: 0.6, 
            delay: 0.5 + (index || 0) * 0.05,
            ease: 'easeOut' as const
          }}
          whileHover={{ 
            scaleX: 1.2, 
            height: 6,
            transition: { type: 'spring', stiffness: 400, damping: 15 }
          }}
        />
      </motion.article>
    </>
  );
};

export default AgentCard;
