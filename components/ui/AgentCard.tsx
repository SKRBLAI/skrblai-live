"use client";
import React from 'react';
import { Agent } from '@/types/agent';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import AgentModal from './AgentModal';

const GLOW_COLOR = '0 0 24px 4px #00F5D4, 0 0 60px 6px #0066FF44';
const HOVER_GLOW = '0 0 40px 8px #00F5D4, 0 0 100px 10px #0066FF66';

const cardVariants = {
  initial: { scale: 1, boxShadow: GLOW_COLOR },
  hover: { 
    scale: 1.05,
    boxShadow: HOVER_GLOW,
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  },
  tap: { scale: 0.98 }
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

// Helper function to get emoji based on agent category
function getAgentEmoji(category: string): string {
  const categoryEmojis: Record<string, string> = {
    'content': '✍️',
    'branding': '🎨',
    'social': '📱',
    'analytics': '📊',
    'video': '🎥',
    'assistant': '🤖',
    'publishing': '📚',
    'business': '💼',
    'website': '🌐',
  };
  
  return categoryEmojis[category.toLowerCase()] || '🤖';
}

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
}

export { getAgentEmoji, AgentCard as default };
export default function AgentCard({ agent, onClick }: AgentCardProps) {
  // Modal state (could be lifted to parent for full control)
  const [modalOpen, setModalOpen] = useState(false);
  // Tooltip state
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{x: number, y: number}>({x: 0, y: 0});
  // Determine theme from document root class (set by parent theme provider)
  const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false;
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-40, 40], [12, -12]);
  const rotateY = useTransform(x, [-40, 40], [-12, 12]);

  // Only apply tilt on desktop
  const handlePointerMove = (e: React.PointerEvent) => {
    if (window.innerWidth < 768) return;
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

  return (
    <>
      <AgentModal agent={agent} open={modalOpen} onClose={() => setModalOpen(false)} />
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative group cursor-pointer"
        onClick={() => setModalOpen(true)}
      >
        <motion.div
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="relative p-6 h-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm overflow-hidden transition-all duration-300 ease-out">
            <motion.div 
              variants={contentVariants}
              className="mt-4 text-gray-300 text-sm">
              {agent.description}
            </motion.div>
            <motion.div
              variants={ctaVariants}
              className="mt-6 flex justify-center">
              <button 
                className="px-4 py-2 bg-gradient-to-r from-electric-blue to-teal-400 rounded-lg font-semibold text-white shadow-glow hover:brightness-110 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                Launch Agent 🚀
              </button>
            </motion.div>
            <div className="pt-12 pb-2 flex flex-col items-center">
              {/* Category Tag */}
              <div className={`
                inline-block px-3 py-1 rounded-full text-xs font-medium mb-2
                ${isDark 
                  ? 'bg-teal-500/20 text-teal-300' 
                  : 'bg-teal-100 text-teal-800'
                }
              `}>
                {agent.category}
              </div>
              {/* Agent Name */}
              <h3 className={`
                text-lg font-bold mb-1 text-center
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}>
                {agent.name}
              </h3>
            </div>
            <motion.div 
              className="absolute left-1/2 -top-10 -translate-x-1/2 z-10"
              initial={{ y: -8 }}
              animate={{ y: [ -8, 0, -8 ] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 via-white/70 to-blue-400 shadow-lg flex items-center justify-center border-4 border-white/30">
                <span className="text-3xl drop-shadow-xl">
                  {getAgentEmoji(agent.category)}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
        {/* CTA Button */}
        <motion.button
          className="mt-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 px-5 py-2 rounded-lg bg-gradient-to-r from-teal-400 to-blue-500 text-white font-semibold shadow-lg shadow-teal-400/30 focus:outline-none focus:ring-2 focus:ring-teal-300/40"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          tabIndex={-1}
          aria-label={`Ask ${agent.name}`}
          type="button"
          onMouseEnter={e => {
            setShowTooltip(true);
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
          }}
          onMouseLeave={() => setShowTooltip(false)}
          onBlur={() => setShowTooltip(false)}
          onTouchStart={e => {
            setShowTooltip(true);
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
          }}
          onTouchEnd={() => setShowTooltip(false)}
        >
          Ask Agent
        </motion.button>
        {/* Tooltip bubble */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.18 }}
              className="absolute left-1/2 -translate-x-1/2 -top-10 z-20 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold shadow-lg pointer-events-none"
              style={{ minWidth: 120 }}
            >
              Launch {agent.name}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Glass overlay for extra polish */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none bg-white/10 backdrop-blur-xl" style={{ zIndex: 1 }} />
      </motion.div>
    </>
  );
}
