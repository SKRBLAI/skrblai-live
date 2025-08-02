'use client';

import React, { ReactNode, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '../../lib/utils/index';

export type Pseudo3DSize = 'sm' | 'md' | 'lg' | 'xl' | 'hero';
export type Pseudo3DIntensity = 'subtle' | 'medium' | 'strong';

interface Pseudo3DCardProps {
  children: React.ReactNode;
  size?: Pseudo3DSize;
  intensity?: Pseudo3DIntensity;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  advancedTilt?: boolean;
}

export default function Pseudo3DCard({
  children,
  size = 'md',
  intensity = 'medium',
  hover = true,
  className,
  onClick,
  style,
  advancedTilt = true,
}: Pseudo3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [8, -8]);
  const rotateY = useTransform(x, [-50, 50], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!advancedTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const posX = e.clientX - rect.left;
    const posY = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    x.set(posX - midX);
    y.set(posY - midY);
  };
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const floatAnim = {
    y: [0, -6, 0],
    transition: { duration: 4, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' as const }
  };

  const mergedStyle = advancedTilt
    ? { ...style, rotateX: rotateX.get(), rotateY: rotateY.get() }
    : style;

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'pseudo-3d-base',
        `pseudo-3d-${size}`,
        `pseudo-3d-${intensity}`,
        hover && 'pseudo-3d-hover',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      style={mergedStyle}
      animate={advancedTilt ? { y: 0 } : floatAnim}
      whileHover={advancedTilt ? { y: -6 } : undefined}
      onMouseMove={advancedTilt ? handleMouseMove : undefined}
      onMouseLeave={advancedTilt ? handleMouseLeave : undefined}
      whileTap={hover ? { scale: 0.96 } : undefined}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 25,
      }}
    >
      {/* Animated Rim Glow */}
      <motion.div
        className="pseudo-3d-rim-glow"
        animate={hover ? { boxShadow: [
          '0 0 0px 0px #30d5c8',
          '0 0 24px 4px #30d5c8, 0 0 40px 10px #8e7cff',
          '0 0 32px 8px #e0c3fc, 0 0 56px 16px #30d5c8',
          '0 0 0px 0px #30d5c8'
        ] } : {}}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
        style={{ pointerEvents: 'none', position: 'absolute', inset: 0, borderRadius: 'inherit', zIndex: 1 }}
      />
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