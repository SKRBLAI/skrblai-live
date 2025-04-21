'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { usePercyContext } from '@/contexts/PercyContext';

interface BrandingCardProps {
  title: string;
  description: string;
  icon: string;
  intent: string;
  index: number;
}

export default function BrandingCard({ title, description, icon, intent, index }: BrandingCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { openPercy, setPercyIntent } = usePercyContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCardClick = useCallback(() => {
    setPercyIntent(intent);
    openPercy();
  }, [intent, openPercy, setPercyIntent]);

  if (!isMounted) {
    return <div className="glass-card p-6 rounded-2xl animate-pulse h-48" />;
  }

  return (
    <motion.div
      className="glass-card p-6 cursor-pointer hover:bg-gray-800/60 transition-colors"
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="flex items-start space-x-4">
        <span className="text-3xl" role="img" aria-label={`${title} icon`}>
          {icon}
        </span>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-300">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
