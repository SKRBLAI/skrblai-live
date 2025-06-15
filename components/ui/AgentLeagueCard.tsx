'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageCircle, Info, Handshake } from 'lucide-react';
import { Agent } from '@/types/agent';
import { getAgentImagePath, getAgentEmoji } from '@/utils/agentUtils';
import { agentBackstories } from '@/lib/agents/agentBackstories';

interface AgentLeagueCardProps {
  agent: Agent;
  index?: number;
  className?: string;
  onChat?: (agent: Agent) => void;
  onInfo?: (agent: Agent) => void;
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

const AgentLeagueCard: React.FC<AgentLeagueCardProps & { selected?: boolean }> = ({
  agent,
  index = 0,
  className = '',
  onChat,
  onInfo,
  onHandoff,
  selected = false,
}) => {
  const [flipped, setFlipped] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const backstory = agentBackstories[agent.id] || null;

  // Keyboard accessibility: flip on Enter/Space
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cardRef.current || document.activeElement !== cardRef.current) return;
      if (e.key === 'Enter' || e.key === ' ') {
        setFlipped(f => !f);
      }
      if (flipped && (e.key === 'Escape' || e.key === 'Backspace')) {
        setFlipped(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipped]);
  const router = useRouter();
  const frameSrc = frameImages[index % frameImages.length];

  // Debug: Log agent props before rendering
  console.log('[AgentLeagueCard] Rendering agent props:', agent);

  // Use agent.imageSlug if present, else getAgentImagePath
  const avatarSrc = agent.imageSlug
    ? `/images/agents/${agent.imageSlug}.png`
    : getAgentImagePath(agent.id);
  const showEmojiFallback = !avatarSrc;

  // Placeholder image path
  const placeholderImg = '/images/agents/placeholder.png';

  // Image error handler
  const handleImgError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('[AgentLeagueCard] Failed to load image:', avatarSrc, 'for agent:', agent.id);
    event.currentTarget.src = placeholderImg;
  };

  const handleInfoClick = () => {
    if (onInfo) {
      onInfo(agent);
    } else {
      // Default behavior: navigate to agent backstory page
      router.push(`/agent-backstory/${agent.id}`);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      tabIndex={0}
      initial={{ opacity: 0, y: 24, scale: 0.95, rotateY: 0, rotateX: 0 }}
      animate={flipped ? { opacity: 1, y: 0, scale: 1, rotateY: 0, rotateX: 0 } : {
        opacity: 1,
        y: [0, -8, 0, 8, 0], // gentle levitation
        scale: 1,
        rotateY: [0, 6, 0, -6, 0], // slow cosmic sway
        rotateX: [0, 2, 0, -2, 0],
        transition: {
          y: { duration: 9, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
          rotateY: { duration: 13, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
          rotateX: { duration: 11, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
          opacity: { duration: 0.6 },
          scale: { duration: 0.6 },
        }
      }}
      whileHover={flipped ? {} : { scale: 1.08, rotateY: 0, rotateX: 0, boxShadow: `0 0 48px 12px rgba(0,245,212,0.35), 0 0 80px 20px rgba(0,102,255,0.28)` }}
      whileFocus={flipped ? {} : { scale: 1.08, rotateY: 0, rotateX: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 120, delay: 0.05 * index }}
      className={`relative w-72 h-96 flex-shrink-0 mx-auto rounded-3xl shadow-xl border-2 border-cosmic-gradient overflow-hidden bg-gradient-to-b from-[#10182a]/80 via-[#181f35]/90 to-[#0d1117]/95 backdrop-blur-lg perspective-1000 ${selected ? 'ring-4 ring-fuchsia-400/80 ring-offset-2' : ''} ${className}`}
      style={{ filter: 'drop-shadow(' + glow.resting + ')' }}
      aria-label={flipped ? `${agent.name} details` : `${agent.name} card`}
      onClick={() => flipped && setFlipped(false)}
    >
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(.4,2,.6,1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front Side */}
        <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
          {/* Agent Avatar with fallback and error handling */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-24 h-24 rounded-full bg-gradient-to-br from-electric-blue via-fuchsia-500 to-teal-400 flex items-center justify-center shadow-glow">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={agent.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow"
                onError={handleImgError}
              />
            ) : (
              <span className="text-4xl" aria-label={agent.name + ' emoji'}>{getAgentEmoji(agent.id)}</span>
            )}
          </div>
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
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 md:gap-5">
            <CosmicActionButton ariaLabel={`Chat with ${agent.name}`} onClick={() => onChat?.(agent)}>
              <MessageCircle className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">Chat</span>
            </CosmicActionButton>
            <CosmicActionButton ariaLabel={`${agent.name} info`} onClick={(e: React.MouseEvent) => { e.stopPropagation(); setFlipped(true); }}>
              <Info className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">Info</span>
            </CosmicActionButton>
            <CosmicActionButton ariaLabel={`Handoff to ${agent.name}`} onClick={() => onHandoff?.(agent)}>
              <Handshake className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">Handoff</span>
            </CosmicActionButton>
          </div>
        </div>
        {/* Back Side */}
        <div
          className="absolute inset-0 w-full h-full flex flex-col justify-center items-center px-5 py-6 bg-gradient-to-b from-[#181f35]/95 via-[#1a1747]/90 to-[#0d1117]/95 rounded-3xl shadow-inner text-white z-10"
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            minHeight: '100%',
          }}
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); setFlipped(false); }}
        >
          {backstory ? (
            <>
              <h4 className="text-xl font-extrabold mb-1 bg-gradient-to-r from-fuchsia-400 via-electric-blue to-teal-400 bg-clip-text text-transparent text-center">
                {backstory.superheroName}
              </h4>
              <div className="text-xs text-fuchsia-200 mb-2 text-center">{`"${backstory.catchphrase}"`}</div>
              <div className="text-xs mb-2 text-center">{backstory.origin}</div>
              <div className="flex flex-wrap gap-1 justify-center mb-2">
                {backstory.powers.map((p, i) => (
                  <span key={i} className="px-2 py-1 rounded-full bg-fuchsia-800/30 text-xs font-bold border border-fuchsia-400/30">{p}</span>
                ))}
              </div>
              <div className="text-xs text-fuchsia-300 mb-1">Weakness: <span className="font-semibold text-white">{backstory.weakness}</span></div>
              <div className="text-xs text-teal-300 mb-1">Nemesis: <span className="font-semibold text-white">{backstory.nemesis}</span></div>
              <div className="text-xs text-gray-200 mt-2 mb-4 line-clamp-4 text-center">{backstory.backstory}</div>
              <CosmicActionButton ariaLabel={`Back to ${agent.name} card`} onClick={(e: React.MouseEvent) => { e.stopPropagation(); setFlipped(false); }}>
                <span className="font-bold">Back</span>
              </CosmicActionButton>
            </>
          ) : (
            <div className="text-sm text-center">No backstory available.</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

interface BtnProps {
  children: React.ReactNode;
  ariaLabel: string;
  onClick?: (e: React.MouseEvent) => void;
}

const CosmicActionButton: React.FC<BtnProps> = ({ children, ariaLabel, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.13, boxShadow: '0 0 18px 6px rgba(0,245,212,0.42), 0 0 32px 8px rgba(232,121,249,0.18)' }}
    whileTap={{ scale: 0.97 }}
    className="w-12 h-12 md:w-auto md:h-auto flex items-center justify-center px-0 md:px-5 py-0 md:py-2 rounded-full md:rounded-full bg-gradient-to-br from-electric-blue via-fuchsia-500 to-teal-400 text-white text-base font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 border-2 border-white/10 transition-all duration-150"
    aria-label={ariaLabel}
    onClick={onClick}
    type="button"
  >
    {children}
  </motion.button>
);

export default AgentLeagueCard;
