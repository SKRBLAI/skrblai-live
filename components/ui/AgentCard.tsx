"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Agent } from '@/types/agent';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Lock } from 'lucide-react';
import { getAgentEmoji } from '@/utils/agentUtils';
import AgentModal from './AgentModal';

const GLOW_COLOR = '0 0 16px 2px rgba(0, 245, 212, 0.4), 0 0 40px 4px rgba(0, 102, 255, 0.2)';
const HOVER_GLOW = '0 0 24px 4px rgba(0, 245, 212, 0.6), 0 0 60px 8px rgba(0, 102, 255, 0.3)';

const getCardVariants = (index: number) => ({
  initial: { 
    scale: 0.97, 
    opacity: 0, 
    y: 24, 
    boxShadow: GLOW_COLOR,
    transition: { duration: 0.3, ease: 'easeOut' }
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
      delay: 0.1 * index // Stagger animations based on index
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
    rotate: [0, -3, 3, -2, 2, 0], // Subtle wiggle on hover
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
      ease: 'easeOut'
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
      ease: 'easeOut'
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
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  index = 0,
  isPremiumUnlocked = true,
  className = '',
  onClick = () => {}
}) => {
  // Modal state (could be lifted to parent for full control)
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

  // Avatar PNG fallback logic
  // WINDSURF: Avatar slug logic per spec
  const slug = agent.id
    ? agent.id.replace(/Agent$/, '').toLowerCase()
    : agent.name.toLowerCase().replace(/\s+/g, '-');
  // Fallback always uses male silhouette (no gender on Agent type)
  // To support gender-based fallback, add a gender field to Agent in the future
  const fallbackImg = `/images/male-silhouette.png`;
  const avatarSrc = `/images/agents-${slug}-skrblai.png`;
  const [imgSrc, setImgSrc] = useState(avatarSrc);
  // Track if fallback was triggered for alt/tooltip
  const [usedFallback, setUsedFallback] = useState(false);
  useEffect(() => {
    setImgSrc(avatarSrc);
    setUsedFallback(false);
  }, [avatarSrc]);

  // Only apply tilt on desktop
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
    setModalOpen(true);
  };
  const handleCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (agent.premium && !isPremiumUnlocked) return;
    onClick();
  };
  const emoji = agent?.icon ?? getAgentEmoji(agent.category) ?? '🤖';
  const isLocked = agent.premium && !isPremiumUnlocked;

  // Initialize variants with index
  const cardVariants = getCardVariants(index);
  const avatarVariants = getAvatarVariants(index);
  const contentVariants = getContentVariants(index);
  const ctaVariants = getCtaVariants(index);

  return (
    <>
      <AgentModal agent={agent} open={modalOpen} onClose={() => setModalOpen(false)} />
      <motion.article
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={`relative group cursor-pointer select-none ${className}`}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        tabIndex={0}
        onClick={handleCardClick}
        aria-label={agent.name}
      >
        {/* Avatar Floating Above Card */}
        <motion.div
          className="absolute left-1/2 -top-12 -translate-x-1/2 z-20"
          variants={avatarVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
        >
          <div className="relative group/avatar">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400 via-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
            {/* PNG Avatar with fallback */}
            <div className="w-28 h-28 rounded-full object-contain bg-white/10 shadow-md border border-teal-500 flex items-center justify-center mx-auto mb-2 overflow-hidden relative z-10">
              {imgSrc && (
                <img
                  src={imgSrc}
                  alt={usedFallback ? `${agent.name} avatar (fallback)` : `${agent.name} avatar`}
                  aria-label={agent.name}
                  title={usedFallback ? `${agent.name} avatar (fallback)` : `${agent.name} avatar`}
                  className="object-contain w-28 h-28 rounded-full mx-auto mb-2"
                  onError={() => {
                    if (imgSrc !== fallbackImg) {
                      setImgSrc(fallbackImg);
                      setUsedFallback(true);
                      if (process.env.NODE_ENV === 'development') {
                        // eslint-disable-next-line no-console
                        console.warn(`AgentCard: PNG not found for ${agent.name} (${avatarSrc}), falling back to ${fallbackImg}`);
                      }
                    }
                  }}
                /> // WINDSURF: Avatar audit - slug, fallback, alt, aria, tooltip, size
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
        </motion.div>
        <motion.div 
          className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 bg-teal-500/20 text-teal-300 backdrop-blur-sm border border-teal-400/20 shadow-sm"
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
        {/* Agent Name */}
        <motion.h3 
          className="text-lg font-bold mb-1 text-center text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.3 + (index || 0) * 0.02,
            ease: 'easeOut'
          }}
        >
          {agent.name}
        </motion.h3>
        {/* Description */}
        <motion.div 
          variants={contentVariants}
          className="mt-2 text-gray-300/90 text-sm text-center min-h-[48px] leading-relaxed px-1"
          initial="initial"
          animate="animate"
          whileHover="hover"
        >
          {agent.description}
        </motion.div>
        {/* CTA Button */}
        <motion.div
          variants={ctaVariants}
          className="mt-5 flex justify-center w-full"
        >
          <motion.button
            className={`px-4 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-400/50 ${
              isLocked 
                ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-electric-blue to-teal-500 hover:shadow-xl hover:shadow-teal-500/20 hover:brightness-110'
            }`}
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
                    ease: 'easeInOut'
                  }}
                  aria-hidden
                >
                  🚀
                </motion.span>
              </motion.span>
            )}
          </motion.button>
        </motion.div>
        {/* Glass overlay for extra polish */}
        <motion.div 
          className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </motion.article>
    </>
  );
};

export default AgentCard;
