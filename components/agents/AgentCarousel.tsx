import React from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { Agent } from '@/types/agent';
import { motion } from 'framer-motion';

interface AgentCarouselProps {
  agents: Agent[];
  onLaunch: (agent: Agent) => void;
  selectedAgentId?: string;
}

const AgentCarousel: React.FC<AgentCarouselProps> = ({ agents, onLaunch, selectedAgentId }) => {
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 3, spacing: 24 },
    breakpoints: {
      '(max-width: 640px)': {
        slides: { perView: 1.2, spacing: 16 },
      },
      '(max-width: 1024px)': {
        slides: { perView: 2, spacing: 20 },
      },
    },
  });

  return (
    <div className="relative w-full">
      <div ref={sliderRef} className="keen-slider px-2">
        {agents.map((agent, idx) => (
          <motion.div
            key={agent.id}
            className="keen-slider__slide flex justify-center items-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.5, delay: idx * 0.04 }}
            tabIndex={0}
            aria-label={`Agent ${agent.name}: ${agent.description}`}
            role="option"
            aria-selected={selectedAgentId === agent.id}
          >
            <div
              className={`group relative flex flex-col items-center justify-between w-64 p-6 rounded-2xl shadow-glow bg-gradient-to-br from-electric-blue/80 via-fuchsia-500/60 to-teal-400/80 border-2 border-teal-400 hover:from-fuchsia-600/90 hover:to-teal-500/90 transition-all duration-300 focus-within:ring-4 focus-within:ring-fuchsia-400 ${selectedAgentId === agent.id ? 'ring-4 ring-fuchsia-300 scale-105' : ''}`}
            >
              <div className="flex flex-col items-center mb-2">
                <img
                  src={`/images/agents/${agent.imageSlug}.png`}
                  alt={agent.name}
                  className="w-20 h-20 rounded-full object-cover shadow-glow bg-gradient-to-tr from-teal-400/60 to-fuchsia-500/60 border-4 border-white mb-2"
                  draggable={false}
                />
                <span className="block font-bold text-lg text-white drop-shadow-[0_0_8px_#38bdf8] text-center">
                  {agent.name}
                </span>
                <span className="block text-sm text-gray-200 text-center opacity-80">
                  {agent.description || ''}
                </span>
              </div>
              <button
                className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-electric-blue via-fuchsia-500 to-teal-400 text-white font-bold shadow-glow hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400 transition-all"
                onClick={() => onLaunch(agent)}
                tabIndex={0}
                aria-label={`Launch Agent ${agent.name}`}
              >
                Launch Agent
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Carousel navigation arrows */}
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-gradient-to-br from-fuchsia-700/80 to-teal-700/80 rounded-full shadow-glow focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400"
        onClick={() => instanceRef.current?.prev()}
        aria-label="Previous Agents"
        tabIndex={0}
      >
        <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      </button>
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-gradient-to-br from-fuchsia-700/80 to-teal-700/80 rounded-full shadow-glow focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400"
        onClick={() => instanceRef.current?.next()}
        aria-label="Next Agents"
        tabIndex={0}
      >
        <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  );
};

export default AgentCarousel;
