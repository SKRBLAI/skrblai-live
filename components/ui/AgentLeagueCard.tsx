'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageCircle, Info, Rocket } from 'lucide-react';
import { Agent } from '@/types/agent';
import { getAgentImagePath, getAgentEmoji } from '@/utils/agentUtils';
import { agentBackstories } from '@/lib/agents/agentBackstories';
import AgentLaunchButton from '@/components/agents/AgentLaunchButton';

interface AgentLeagueCardProps {
  agent: Agent;
  index?: number;
  className?: string;
  onChat?: (agent: Agent) => void;
  onInfo?: (agent: Agent) => void;
  onHandoff?: (agent: Agent) => void;
  onLaunch?: (agent: Agent) => void;
}

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
  onLaunch,
  onHandoff,
  selected = false,
}) => {
  const [flipped, setFlipped] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const backstory = agentBackstories[agent.id] || null;
  const router = useRouter();

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

  // Debug: Log agent props before rendering
  console.log('[AgentLeagueCard] Rendering agent props:', agent);

  // Get the agent slug for the frame asset
  const agentSlug = agent.imageSlug || 
    agent.id.replace(/-agent$/, '').replace(/Agent$/, '').toLowerCase();

  // Path for the new frame asset
  const frameAssetPath = `/images/Agents-${agentSlug}-Buttons.png`;
  
  // Use agent.imageSlug if present, else getAgentImagePath
  const avatarSrc = agent.imageSlug
    ? `/images/agents/${agent.imageSlug}.png`
    : getAgentImagePath(agent.id);
  
  const placeholderImg = '/images/agents/placeholder.png';

  // Image error handler for frame asset
  const handleFrameImgError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('[AgentLeagueCard] Failed to load frame asset:', frameAssetPath, 'for agent:', agent.id);
    // Try webp format as fallback
    event.currentTarget.src = `/images/agents-${agentSlug}-nobg-skrblai.webp`;
    // Set onerror again for the webp fallback
    event.currentTarget.onerror = () => {
      console.error('[AgentLeagueCard] Failed to load webp fallback as well, using default frame');
      event.currentTarget.src = '/images/Agents-default-Buttons.png';
    };
  };

  // Image error handler for agent avatar
  const handleAvatarImgError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('[AgentLeagueCard] Failed to load avatar image:', avatarSrc, 'for agent:', agent.id);
    event.currentTarget.src = placeholderImg;
  };

  // Action handlers
  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInfo) {
      onInfo(agent);
    } else {
      router.push(`/agent-backstory/${agent.id}`);
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChat) {
      onChat(agent);
    }
  };

  const handleLaunchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLaunch) {
      onLaunch(agent);
    } else if (onHandoff) {
      // Fallback to handoff if launch is not available
      onHandoff(agent);
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
      className={`relative w-72 h-96 flex-shrink-0 mx-auto rounded-3xl shadow-xl overflow-hidden perspective-1000 ${selected ? 'ring-4 ring-fuchsia-400/80 ring-offset-2' : ''} ${className}`}
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
          {/* New Button Frame Asset */}
          <div className="w-full h-full relative">
            <img
              src={frameAssetPath}
              alt={`${agent.name} card frame`}
              className="w-full h-full object-contain"
              onError={handleFrameImgError}
            />
            
            {/* Agent Avatar - positioned inside the frame */}
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={avatarSrc}
                alt={`${agent.name} avatar`}
                className="w-full h-full object-cover"
                onError={handleAvatarImgError}
              />
            </div>
            
            {/* Agent Name */}
            <motion.h3
              className="absolute top-[46%] left-1/2 -translate-x-1/2 text-lg font-extrabold bg-gradient-to-r from-electric-blue via-teal-400 to-electric-blue bg-clip-text text-transparent drop-shadow-[0_0_10px_var(--tw-gradient-stops)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + 0.05 * index }}
            >
              {agent.name}
            </motion.h3>

            {/* Interactive Button Overlays */}
            <div className="absolute bottom-[12%] left-0 right-0 flex justify-center gap-6">
              {/* Learn Button */}
              <motion.button
                className="w-[85px] h-[36px] rounded-lg bg-transparent hover:bg-white/10 hover:shadow-[0_0_12px_rgba(255,255,255,0.2)] focus:bg-white/10 transition-all"
                onClick={handleInfoClick}
                aria-label={`Learn about ${agent.name}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="sr-only">LEARN</span>
              </motion.button>
              
              {/* Chat Button */}
              <motion.button
                className="w-[85px] h-[36px] rounded-lg bg-transparent hover:bg-white/10 hover:shadow-[0_0_12px_rgba(255,255,255,0.2)] focus:bg-white/10 transition-all"
                onClick={handleChatClick}
                aria-label={`Chat with ${agent.name}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="sr-only">CHAT</span>
              </motion.button>
              
              {/* Launch Button - Now using AgentLaunchButton */}
              <div className="w-[85px] h-[36px]">
                <AgentLaunchButton
                  agent={agent}
                  onLaunch={handleLaunchClick}
                  variant="card"
                  className="!w-full !h-full !px-0 !py-0 !bg-transparent hover:!bg-white/10 hover:!shadow-[0_0_12px_rgba(255,255,255,0.2)] focus:!bg-white/10"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Back Side - Backstory */}
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
              <button
                className="px-4 py-2 rounded-lg bg-gradient-to-br from-electric-blue to-fuchsia-500 text-white text-xs font-bold shadow-md hover:brightness-110 transition-all"
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); setFlipped(false); }}
              >
                Back
              </button>
            </>
          ) : (
            <div className="text-sm text-center">No backstory available.</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AgentLeagueCard;
