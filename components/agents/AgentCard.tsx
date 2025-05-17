'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface AgentCardProps {
  name: string;
  isPercy?: boolean;
  gender: 'male' | 'female';
}

export default function AgentCard({ name, isPercy = false, gender }: AgentCardProps) {
  const silhouettePath = `/images/agents/${gender}-silhouette.png`;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        relative overflow-hidden rounded-xl border border-white/10 backdrop-blur-sm
        ${isPercy ? 'col-span-2 row-span-2 md:col-span-3' : ''}
        ${isPercy ? 'bg-gradient-to-br from-electric-blue/20 to-teal-500/20' : 'bg-white/5'}
        transition-all duration-300 group
      `}
    >
      {/* Glow Effect */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ${isPercy ? 'bg-gradient-to-r from-electric-blue/20 via-teal-500/20 to-electric-blue/20' : 'bg-white/5'}
      `} />

      <div className="relative p-6 flex flex-col items-center">
        {/* Agent Silhouette */}
        <div className={`
          relative w-48 h-48 mb-4
          ${isPercy ? 'w-64 h-64' : 'w-48 h-48'}
        `}>
          <Image
            src={silhouettePath}
            alt={`${name} silhouette`}
            fill
            className="object-contain"
          />
        </div>

        {/* Agent Name */}
        <h3 className={`
          text-xl font-bold mb-2 text-center
          ${isPercy ? 'text-2xl text-gradient-blue' : 'text-white'}
        `}>
          {name}
        </h3>

        {/* Coming Soon Text */}
        <p className="text-gray-400 text-sm mb-4 text-center">
          Role and abilities coming soon...
        </p>

        {/* Summon Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            px-6 py-2 rounded-lg font-medium transition-all duration-300
            ${isPercy 
              ? 'bg-electric-blue text-white hover:bg-electric-blue/90 shadow-glow' 
              : 'bg-white/10 text-white hover:bg-white/20'}
          `}
        >
          Summon Agent
        </motion.button>
      </div>
    </motion.div>
  );
}
