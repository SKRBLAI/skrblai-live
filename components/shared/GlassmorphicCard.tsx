'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'floating'; // 'floating' = true glassmorphism
}

export default function GlassmorphicCard({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  variant = 'floating', // Default to floating per your design system
}: GlassmorphicCardProps) {
  // Variant styles
  const variantClasses = {
    default: `
      cosmic-glass
      p-8 md:p-12
      border border-gray-800/50
      shadow-glow
      rounded-3xl
      ${hoverEffect ? 'hover:border-electric-blue/50 hover:shadow-glow-intense hover:scale-105 transition-all duration-300' : ''}
    `,
    floating: `
      bg-white/8
      border border-white/20
      backdrop-blur-xl
      shadow-[0_8px_32px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.05)]
      rounded-3xl
      p-6 md:p-8
      mx-4 md:mx-6 lg:mx-8
      ${hoverEffect ? 'hover:border-white/30 hover:shadow-[0_12px_48px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,0.08)] hover:scale-[1.02] transition-all duration-300' : ''}
    `,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className={cn(
        variantClasses[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
