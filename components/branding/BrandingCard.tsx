'use client';

import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePercyContext } from '@/contexts/PercyContext';

interface BrandingCardProps {
  title: string;
  description: string;
  icon: string;
  intent: string;
  index: number;
}

export default function BrandingCard({ title, description, icon, intent, index }: BrandingCardProps) {
  const { openPercy, setPercyIntent } = usePercyContext();

  const handleCardClick = useCallback(() => {
    setPercyIntent(intent);
    openPercy();
  }, [intent, openPercy, setPercyIntent]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
      whileHover={{ 
        y: -16,
        rotateX: 6,
        rotateY: 6,
        scale: 1.07,
        boxShadow: '0 6px 32px 0 rgba(0,180,255,0.09)'
      }}
      whileTap={{ 
        y: -2,
        rotateX: 1,
        rotateY: 1,
        scale: 0.97,
        boxShadow: '0 2px 8px 0 rgba(0,180,255,0.04)'
      }}
      className="glass-card interactive p-6 rounded-2xl transform-gpu cursor-pointer transition-all duration-200"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`${title} - Click to start branding process`}
    >
      <div className="h-12 w-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
        <span
          className="text-2xl select-none"
          role="img"
          aria-label={title}
          style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, NotoColorEmoji, Android Emoji, EmojiSymbols, emoji, sans-serif' }}
        >
          {icon}
        </span>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
      
      {/* Interactive indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-2 h-2 bg-blue-400 rounded-full"
        />
      </div>
    </motion.div>
  );
}
