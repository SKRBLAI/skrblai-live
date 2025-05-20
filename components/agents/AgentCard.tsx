'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface AgentCardProps {
  name: string;
  isPercy?: boolean;
  gender: 'male' | 'female' | 'neutral'; // Updated to include 'neutral'
  role?: string;
}

export default function AgentCard({ name, isPercy = false, gender, role }: AgentCardProps) {
  // Map agent name to slug for PNG avatar
  const slugMap: Record<string, string> = {
    Percy: 'percy',
    BrandingAgent: 'branding',
    ContentCreatorAgent: 'content',
    AnalyticsAgent: 'analytics',
    PublishingAgent: 'publishing',
    SocialBotAgent: 'social',
    AdCreativeAgent: 'ad',
    ProposalGeneratorAgent: 'proposal',
    PaymentManagerAgent: 'payment',
    ClientSuccessAgent: 'client',
    SiteGenAgent: 'sitegen',
    BizAgent: 'biz',
    VideoContentAgent: 'video',
    PercyAgent: 'percy',
    PercySyncAgent: 'sync',
  };
  const slug = slugMap[name] || name.toLowerCase();
  const avatarPath = `/images/agents-${slug}-skrblai.png`;
  // Adjust silhouette path for neutral gender
  const silhouetteGender = (gender === 'neutral') ? 'male' : gender; // Fallback neutral to male silhouette for now
  const silhouettePath = `/images/agents/${silhouetteGender}-silhouette.png`;
  // State for fallback
  const [imgSrc, setImgSrc] = useState(avatarPath);
  
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
            src={imgSrc}
            alt={`${name} avatar`}
            fill
            className="object-contain"
            onError={() => setImgSrc(silhouettePath)}
          />
        </div>

        {/* Agent Name */}
        <h3 className={`
          text-xl font-bold mb-2 text-center
          ${isPercy ? 'text-2xl text-gradient-blue' : 'text-white'}
        `}>
          {name}
        </h3>
        {/* Agent Role/Title as microtext or tooltip */}
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
