'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FloatingContainerProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  motionProps?: MotionProps;
  glowColor?: string;
}

export default function FloatingContainer({ 
  children, 
  className = '', 
  hoverEffect = true, 
  onClick,
  motionProps = {},
  glowColor = 'teal-400'
}: FloatingContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      {...motionProps}
      className={cn(`
        bg-transparent
        backdrop-blur-xl
        border-2 border-${glowColor}/70
        rounded-3xl
        shadow-[0_0_15px_rgba(45,212,191,0.3),0_0_30px_rgba(56,189,248,0.2)]
        ${hoverEffect ? 'hover:shadow-[0_0_25px_rgba(45,212,191,0.5),0_0_40px_rgba(56,189,248,0.3)] hover:border-teal-400/90 hover:-translate-y-1' : ''}
        transition-all duration-300
        overflow-hidden
        p-6 md:p-8 lg:p-10
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