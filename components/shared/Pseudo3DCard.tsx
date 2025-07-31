'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils/index';

export type Pseudo3DSize = 'sm' | 'md' | 'lg' | 'xl' | 'hero';
export type Pseudo3DIntensity = 'subtle' | 'medium' | 'strong';

interface Pseudo3DCardProps {
  children: ReactNode;
  size?: Pseudo3DSize;
  intensity?: Pseudo3DIntensity;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function Pseudo3DCard({
  children,
  size = 'md',
  intensity = 'medium',
  hover = true,
  className,
  onClick,
  style,
}: Pseudo3DCardProps) {
  const baseClasses = [
    'pseudo-3d-base',
    `pseudo-3d-${size}`,
    `pseudo-3d-${intensity}`,
    hover && 'pseudo-3d-hover',
    onClick && 'cursor-pointer',
  ].filter(Boolean);

  return (
    <motion.div
      className={cn(...baseClasses, className)}
      onClick={onClick}
      style={style}
      whileHover={hover ? { scale: 1.04, perspective: 1000, rotateX: 2, rotateY: -2 } : undefined}
      whileTap={hover ? { scale: 0.96, perspective: 1000, rotateX: -1, rotateY: 1 } : undefined}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 25,
      }}
    >
      {/* Rim Glow Effect */}
      <div className="pseudo-3d-rim-glow" />
      
      {/* Shadow Layer */}
      <div className="pseudo-3d-shadow-layer" />
      
      {/* Cast Shadow */}
      <div className="pseudo-3d-cast-shadow" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// Convenience components for common use cases
export function Pseudo3DHero({ children, className, ...props }: Omit<Pseudo3DCardProps, 'size'>) {
  return (
    <Pseudo3DCard size="hero" intensity="strong" className={className} {...props}>
      {children}
    </Pseudo3DCard>
  );
}

export function Pseudo3DFeature({ children, className, ...props }: Omit<Pseudo3DCardProps, 'size'>) {
  return (
    <Pseudo3DCard size="lg" intensity="medium" className={className} {...props}>
      {children}
    </Pseudo3DCard>
  );
}

export function Pseudo3DStats({ children, className, ...props }: Omit<Pseudo3DCardProps, 'size' | 'intensity'>) {
  return (
    <Pseudo3DCard size="sm" intensity="subtle" className={className} {...props}>
      {children}
    </Pseudo3DCard>
  );
} 