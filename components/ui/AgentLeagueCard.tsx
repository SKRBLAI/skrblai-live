'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Agent } from '@/types/agent';
import { getAgentImagePath, getAgentEmoji } from '@/utils/agentUtils';

interface AgentLeagueCardProps {
  agent: Agent;
  index?: number;
  className?: string;
  onChat?: (agent: Agent) => void;
  onHandoff?: (agent: Agent) => void;
}

const frameImages = [
  '/images/card-agents1.png',
  '/images/card-agents2.png',
];

const glow = {
  resting:
    '0 0 24px 4px rgba(0,245,212,0.48), 0 0 60px 10px rgba(0,102,255,0.28), 0 0 32px 8px rgba(232,121,249,0.18)',
  hover:
    '0 0 36px 8px rgba(0,245,212,0.70), 0 0 80px 20px rgba(0,102,255,0.38), 0 0 48px 12px rgba(232,121,249,0.28)',
};

const AgentLeagueCard: React.FC<AgentLeagueCardProps> = ({
  agent,
  index = 0,
  className = '',
  onChat,
  onHandoff,
}) => {
  const router = useRouter();
  const frameSrc = frameImages[index % frameImages.length];

  const avatarSrc = getAgentImagePath(agent.id);
  const showEmojiFallback = !avatarSrc;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 120, delay: 0.05 * index }}
      className={`relative w-[260px] sm:w-[300px] md:w-[330px] lg:w-[350px] h-[360px] sm:h-[400px] lg:h-[450px] flex-shrink-0 mx-auto ${className}`}
      style={{ filter: 'drop-shadow(' + glow.resting + ')' }}
    >
      {/* Cosmic Frame */}
      <Image
        src={frameSrc}
        alt="cosmic frame"
        fill
        priority={false}
        className="object-contain select-none pointer-events-none"
      />

      {/* Agent Avatar */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden flex items-center justify-center bg-gray-900 shadow-inner shadow-black/40">
        {showEmojiFallback ? (
          <span className="text-4xl md:text-5xl">{getAgentEmoji(agent.category)}</span>
        ) : (
          <Image
            src={avatarSrc}
            alt={`${agent.name} avatar`}
            width={128}
            height={128}
            className="object-cover"
          />
        )}
      </div>

      {/* Agent Name */}
      <motion.h3
        className="absolute top-[58%] left-1/2 -translate-x-1/2 text-lg md:text-xl font-extrabold bg-gradient-to-r from-electric-blue via-teal-400 to-electric-blue bg-clip-text text-transparent drop-shadow-[0_0_10px_var(--tw-gradient-stops)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 + 0.05 * index }}
      >
        {agent.name}
      </motion.h3>

      {/* CTA Buttons */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
        <MotionButton ariaLabel={`Chat with ${agent.name}`} onClick={() => onChat?.(agent)}>
          💬 Chat
        </MotionButton>
        <MotionButton ariaLabel={`${agent.name} info`} onClick={() => router.push(`/agent-backstory/${agent.id}`)}>
          ℹ️ Info
        </MotionButton>
        <MotionButton ariaLabel={`Handoff to ${agent.name}`} onClick={() => onHandoff?.(agent)}>
          🤝 Handoff
        </MotionButton>
      </div>
    </motion.div>
  );
};

interface BtnProps {
  children: React.ReactNode;
  ariaLabel: string;
  onClick?: () => void;
}

const MotionButton: React.FC<BtnProps> = ({ children, ariaLabel, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className="px-3 py-1 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white text-sm font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-teal-300"
    aria-label={ariaLabel}
    onClick={onClick}
    type="button"
  >
    {children}
  </motion.button>
);

export default AgentLeagueCard;
