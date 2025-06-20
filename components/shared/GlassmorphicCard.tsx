'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function GlassmorphicCard({ children, className = '', hoverEffect = true }: GlassmorphicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        cosmic-glass
        rounded-2xl
        backdrop-blur-md
        p-8 md:p-12
        border
        border-gray-800/50
        shadow-glow
        overflow-hidden
        ${hoverEffect ? 'hover:border-electric-blue/50 hover:shadow-glow-intense hover:scale-105 transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
