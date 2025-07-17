'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

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
      className={`
        floating-container
        rounded-2xl
        p-6 md:p-8 lg:p-10
        overflow-hidden
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
} 