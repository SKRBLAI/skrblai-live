'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getAgentImagePath } from "@/utils/agentUtils";

// Agent interface, matching your type in agentUtils
interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  capabilities: string[];
  visible: boolean;
  imageSlug?: string;
}

interface AgentCardProps {
  name: string;
  imageSlug: string;
  isPercy?: boolean;
  gender: 'male' | 'female' | 'neutral';
  role?: string;
}

// Utility: Provide a default/fake Agent for image fallback
function getDefaultAgent(id: string, imageSlug: string, name: string): Agent {
  return {
    id,
    name,
    description: `${name} agent`,
    category: 'misc',
    capabilities: [],
    visible: true,
    imageSlug,
  };
}

export default function AgentCard({
  name,
  imageSlug,
  isPercy = false,
  gender,
  role,
}: AgentCardProps) {
  const silhouettePath = `/images/${gender === 'neutral' ? 'male' : gender}-silhouette.png`;

  // Use passed imageSlug directly for image path without calling getAgentImagePath
  const imagePath = getAgentImagePath({ id: '', imageSlug, name } as Agent);
  const [imgSrc, setImgSrc] = useState(imagePath);

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-xl border-2
        ${isPercy ? 'col-span-2 row-span-2 md:col-span-3 border-electric-blue/60' : 'border-teal-400/40'}
        ${isPercy ? 'bg-gradient-to-br from-electric-blue/20 to-teal-500/20' : 'bg-white/5'}
        shadow-glow group transition-all duration-300
      `}
    >
      {/* Animated Glow Border */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl"
        initial={{ boxShadow: '0 0 0px #2dd4bf' }}
        animate={{
          boxShadow: isPercy
            ? '0 0 32px 8px #2dd4bf'
            : '0 0 20px 4px #38bdf8',
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatType: 'mirror',
        }}
        style={{ zIndex: 1 }}
      />
      <div className="relative p-6 flex flex-col items-center z-10">
        {/* Agent Image */}
        <div
          className={`relative mb-4 ${isPercy ? 'w-64 h-64' : 'w-48 h-48'}`}
          tabIndex={0}
          aria-label={name}
        >
          <Image
            src={imgSrc}
            alt={`${name} avatar`}
            fill
            className="object-contain rounded-full shadow-glow"
            onError={() => setImgSrc('')}
            sizes={isPercy ? '256px' : '192px'}
            priority={isPercy}
          />
          {!imgSrc && (
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:'2rem',background:'#222'}}>🤖</div>
          )}
          {/* Tooltip for agent name/role */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
            {name} {role ? <span className="text-teal-400">({role})</span> : ''}
          </div>
        </div>
        {/* Agent Name */}
        <h3 className={`text-xl font-bold mb-2 text-center ${isPercy ? 'text-2xl text-gradient-blue' : 'text-white'}`}>
          {name}
        </h3>
        {/* Agent Role/Title as microtext */}
        {role && (
          <span
            className="text-teal-300 text-xs mb-2 block"
            title={role}
            aria-label={role}
          >
            {role}
          </span>
        )}
        {/* Summon Button */}
        <motion.button
          whileHover={{ scale: 1.09 }}
          whileTap={{ scale: 0.95 }}
          className={`
            px-6 py-2 rounded-lg font-medium transition-all duration-200
            ${isPercy
              ? 'bg-electric-blue text-white hover:bg-electric-blue/90 shadow-glow hover:shadow-[0_0_12px_rgba(0,255,255,0.6)] hover:scale-105'
              : 'bg-white/10 text-white hover:bg-white/20 hover:shadow-[0_0_12px_rgba(0,255,255,0.6)] hover:scale-105'}
          `}
          aria-label="Summon Agent"
        >
          Summon Agent
        </motion.button>
      </div>
    </motion.div>
  );
}
