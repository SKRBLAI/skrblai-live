'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
<<<<<<< HEAD
  variant?: 'default' | 'floating'; // Added variant prop
=======
  variant?: 'default' | 'floating';
>>>>>>> 3392048d6e6c37559f4ff6afa6b328a9f2683954
}

export default function GlassmorphicCard({ 
  children, 
  className = '', 
  hoverEffect = true, 
  onClick,
<<<<<<< HEAD
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
=======
  variant = 'default'
}: GlassmorphicCardProps) {
  const baseClasses = `
    rounded-3xl
    backdrop-blur-xl
    border
    overflow-hidden
    relative
    ${hoverEffect ? 'transition-all duration-300' : ''}
  `;

  const variantClasses = {
    default: `
      cosmic-glass
      p-8 md:p-12
      border-gray-800/50
      shadow-glow
      ${hoverEffect ? 'hover:border-electric-blue/50 hover:shadow-glow-intense hover:scale-105' : ''}
    `,
    floating: `
      bg-white/8
      border-white/20
      shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)]
      p-6 md:p-8
      mx-4 md:mx-6 lg:mx-8
      ${hoverEffect ? 'hover:border-white/30 hover:shadow-[0_12px_48px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1)] hover:scale-[1.02]' : ''}
    `
  };
>>>>>>> 3392048d6e6c37559f4ff6afa6b328a9f2683954

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
<<<<<<< HEAD
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
=======
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
>>>>>>> 3392048d6e6c37559f4ff6afa6b328a9f2683954
    >
      {children}
    </motion.div>
  );
}
