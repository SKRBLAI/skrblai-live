'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphicPanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  glowColor?: string;
}

export default function GlassmorphicPanel({
  children,
  className = '',
  title,
  hoverEffect = false,
  onClick,
  glowColor = 'teal-400',
}: GlassmorphicPanelProps) {
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
        overflow-hidden
        ${className}
      `)}
      style={{
        background: 'transparent',
        boxShadow: '0 0 15px rgba(45,212,191,0.3), 0 0 30px rgba(56,189,248,0.2)'
      }}
    >
      {title && (
        <div className="border-b border-teal-400/40 px-6 py-4 bg-transparent backdrop-blur-md">
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>
      )}
      <div className="p-6 bg-transparent">
        {children}
      </div>
    </motion.div>
  );
} 