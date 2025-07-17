'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'floating'; // Added variant prop
}

export default function GlassmorphicCard({ 
  children, 
  className = '', 
  hoverEffect = true, 
  onClick,
  variant = 'floating' // Default to floating per requirements
}: GlassmorphicCardProps) {
  // Use appropriate CSS classes based on variant
  const cardBaseClass = variant === 'floating' 
    ? 'floating-card' 
    : 'cosmic-glass';
  
  // Reduce shadow effects on mobile
  const hoverClass = hoverEffect 
    ? 'hover:border-electric-blue/50 hover:shadow-glow-intense transition-all duration-300' 
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className={`
        ${cardBaseClass}
        rounded-2xl
        backdrop-blur-md
        p-8 md:p-12
        overflow-hidden
        ${hoverEffect ? 'hover:scale-[1.02]' : ''}
        ${hoverClass}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
