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
}

export default function GlassmorphicPanel({
  children,
  className = '',
  title,
  hoverEffect = false,
  onClick,
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
        border-2 border-teal-400/70
        rounded-2xl
        shadow-[0_8px_32px_rgba(0,212,255,0.18)]
        ${hoverEffect ? 'hover:shadow-[0_16px_48px_rgba(0,212,255,0.28)]' : ''}
        transition-all duration-300
        overflow-hidden
        ${className}
      `)}
    >
      {title && (
        <div className="border-b border-teal-400/30 px-6 py-4 bg-teal-500/10 backdrop-blur-md">
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
} 