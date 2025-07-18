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
}

export default function FloatingContainer({ 
  children, 
  className = '', 
  hoverEffect = true, 
  onClick,
  motionProps = {}
}: FloatingContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      {...motionProps}
      className={cn(`
        cosmic-glass-teal
        overflow-hidden
        p-6 md:p-8 lg:p-10
        ${hoverEffect ? 'hover:shadow-[0_16px_48px_rgba(0,212,255,0.28)]' : ''}
        ${className}
      `)}
    >
      {children}
    </motion.div>
  );
} 