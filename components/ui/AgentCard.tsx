"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Agent } from '@/types/agent';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Lock } from 'lucide-react';
import { getAgentEmoji } from '@/utils/agentUtils';
import AgentModal from './AgentModal';

const GLOW_COLOR = '0 0 24px 4px #00F5D4, 0 0 60px 6px #0066FF44';
const HOVER_GLOW = '0 0 40px 8px #00F5D4, 0 0 100px 10px #0066FF66';

const cardVariants = {
  initial: { scale: 0.97, opacity: 0, y: 24, boxShadow: GLOW_COLOR },
  animate: { scale: 1, opacity: 1, y: 0, boxShadow: GLOW_COLOR, transition: { duration: 0.5, type: 'spring', stiffness: 120 } },
  hover: { 
    scale: 1.04,
    boxShadow: HOVER_GLOW,
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  },
  tap: { scale: 0.98 }
};

const avatarVariants = {
  initial: { y: -10, opacity: 0, scale: 0.95 },
  animate: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 22, delay: 0.15 } },
  hover: { y: -8, scale: 1.04, transition: { type: 'spring', stiffness: 350, damping: 22 } }
};

const contentVariants = {
  initial: { y: 0 },
  hover: { y: -8 }
};

const ctaVariants = {
  initial: { opacity: 0, y: 20 },
  hover: { 
    opacity: 1, 
    y: 0,
    transition: { delay: 0.1 }
  }
};


interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
  isPremiumUnlocked?: boolean;
  index?: number;
}

export default function AgentCard({ agent, onClick, isPremiumUnlocked = false, index = 0 }: AgentCardProps) {
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
  return (
    <>
      <AgentModal agent={agent} open={modalOpen} onClose={() => setModalOpen(false)} />
      <motion.article
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative group cursor-pointer select-none"
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
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 via-white/70 to-blue-400 shadow-lg flex items-center justify-center border-4 border-white/30 relative">
            <span className="text-4xl drop-shadow-xl">
              {emoji}
            </span>
            {isLocked && (
              <span className="absolute bottom-1.5 right-1.5 bg-white/80 rounded-full p-1"><Lock size={22} className="text-teal-500" /></span>
            )}
          </div>
        </motion.div>
        {/* Card Body */}
        <section className="relative flex flex-col items-center justify-between p-6 pt-16 h-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm overflow-hidden shadow-glow transition-all duration-300 ease-out">
          {/* Category Tag */}
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 bg-teal-500/20 text-teal-300">
            {agent.category}
          </div>
          {/* Agent Name */}
          <h3 className="text-lg font-bold mb-1 text-center text-white">
            {agent.name}
          </h3>
          {/* Description */}
          <motion.div 
            variants={contentVariants}
            className="mt-2 text-gray-300 text-sm text-center min-h-[48px]"
          >
            {agent.description}
          </motion.div>
          {/* CTA Button */}
          <motion.div
            variants={ctaVariants}
            className="mt-5 flex justify-center w-full"
          >
            <button
              className={`px-4 py-2 rounded-lg font-semibold text-white shadow-glow transition-all duration-300 bg-gradient-to-r from-electric-blue to-teal-400 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-teal-300/40 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-110'}`}
              onClick={handleCtaClick}
              disabled={isLocked}
              tabIndex={0}
              aria-label={isLocked ? 'Premium locked' : `Launch ${agent.name}`}
            >
              {isLocked ? (
                <span className="flex items-center gap-2 justify-center"><Lock size={18} /> Unlock Premium</span>
              ) : (
                <>Launch Agent <span aria-hidden>🚀</span></>
              )}
            </button>
          </motion.div>
        </section>
        {/* Glass overlay for extra polish */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none bg-white/10 backdrop-blur-xl z-10" />
      </motion.article>
    </>
  );
}
