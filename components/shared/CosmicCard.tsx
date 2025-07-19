'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CosmicCardProps {
  children: ReactNode;
  variant?: 'glow' | 'glass';
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  motionProps?: MotionProps;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const variantStyles = {
  glow: {
    base: 'bg-transparent backdrop-blur-xl border-2 border-teal-400/70 rounded-3xl shadow-[0_0_25px_rgba(45,212,191,0.4),0_0_50px_rgba(56,189,248,0.3),0_0_80px_rgba(30,144,255,0.2)]',
    hover: 'hover:shadow-[0_0_35px_rgba(45,212,191,0.6),0_0_70px_rgba(56,189,248,0.4),0_0_100px_rgba(30,144,255,0.3)] hover:border-teal-400/90 hover:-translate-y-2 hover:scale-[1.02]',
    mobile: 'md:shadow-[0_0_25px_rgba(45,212,191,0.4),0_0_50px_rgba(56,189,248,0.3)] shadow-[0_0_15px_rgba(45,212,191,0.3),0_0_25px_rgba(56,189,248,0.2)]'
  },
  glass: {
    base: 'bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.1),0_0_30px_rgba(45,212,191,0.1)]',
    hover: 'hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(0,0,0,0.15),0_0_40px_rgba(45,212,191,0.15)] hover:-translate-y-1',
    mobile: 'shadow-[0_0_10px_rgba(0,0,0,0.1),0_0_20px_rgba(45,212,191,0.1)]'
  }
};

const sizeStyles = {
  sm: 'p-4 md:p-6',
  md: 'p-6 md:p-8',
  lg: 'p-8 md:p-10 lg:p-12',
  xl: 'p-10 md:p-12 lg:p-16'
};

export default function CosmicCard({
  children,
  variant = 'glass',
  className = '',
  hoverEffect = true,
  onClick,
  motionProps = {},
  size = 'md'
}: CosmicCardProps) {
  const styles = variantStyles[variant];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onClick={onClick}
      {...motionProps}
      className={cn(
        // Base styles
        styles.base,
        // Size styles
        sizeStyles[size],
        // Hover effects
        hoverEffect ? styles.hover : '',
        // Mobile optimizations
        styles.mobile,
        // Transitions
        'transition-all duration-500 ease-out',
        // Cursor
        onClick ? 'cursor-pointer' : '',
        // Custom classes
        className
      )}
      style={{
        background: variant === 'glow' ? 'transparent' : undefined,
        zIndex: 10,
        position: 'relative'
      }}
    >
      {children}
    </motion.div>
  );
}

// Export variants for easy access
export const CosmicCardGlow = (props: Omit<CosmicCardProps, 'variant'>) => (
  <CosmicCard {...props} variant="glow" />
);

export const CosmicCardGlass = (props: Omit<CosmicCardProps, 'variant'>) => (
  <CosmicCard {...props} variant="glass" />
);
