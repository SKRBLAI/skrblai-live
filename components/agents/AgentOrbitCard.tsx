'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AgentImage from '../shared/AgentImage';
import { agentPath } from '../../utils/agentRouting';
import { Rocket } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  superheroName?: string;
  catchphrase?: string;
}

interface AgentOrbitCardProps {
  agent: Agent;
  index: number;
  isVisible: boolean;
}

export default function AgentOrbitCard({ agent, index, isVisible }: AgentOrbitCardProps) {
  const router = useRouter();

  const handleLaunch = () => {
    router.push(agentPath(agent.id, 'backstory'));
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="relative w-20 h-20 md:w-24 md:h-24"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.1 }}
    >
      {/* Agent Image */}
      <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 overflow-hidden group cursor-pointer">
        <AgentImage
          agentId={agent.id}
          alt={agent.superheroName || agent.name}
          fill
          className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Hover overlay with launch button */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.button
            onClick={handleLaunch}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-2 rounded-full shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Rocket className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Agent name tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {agent.superheroName || agent.name}
        </div>
      </div>
    </motion.div>
  );
}