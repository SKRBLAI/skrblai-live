'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  glowColor?: string;
}

export default function GlassmorphicCard({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  glowColor = 'teal-400',
}: GlassmorphicCardProps) {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(`
        bg-transparent
        backdrop-blur-xl
        border-2 border-${glowColor}/70
        rounded-3xl
        shadow-[0_0_15px_rgba(45,212,191,0.3),0_0_30px_rgba(56,189,248,0.2)]
        ${hoverEffect ? 'hover:shadow-[0_0_25px_rgba(45,212,191,0.5),0_0_40px_rgba(56,189,248,0.3)] hover:border-teal-400/90 hover:-translate-y-1' : ''}
        transition-all duration-300
        p-6 md:p-8 mx-4 md:mx-6 lg:mx-8
        ${className}
      `)}
      style={{
        background: 'transparent',
        boxShadow: '0 0 15px rgba(45,212,191,0.3), 0 0 30px rgba(56,189,248,0.2)'
      }}
    >
      {children}
    </motion.div>
  );
}
