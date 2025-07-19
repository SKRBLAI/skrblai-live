'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils/index';
import Pseudo3DCard, { Pseudo3DSize, Pseudo3DIntensity } from './Pseudo3DCard';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  glowColor?: string;
  // New 3D mode options
  mode3D?: boolean;
  pseudo3DSize?: Pseudo3DSize;
  pseudo3DIntensity?: Pseudo3DIntensity;
}

export default function GlassmorphicCard({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  glowColor = 'teal-400',
  mode3D = false,
  pseudo3DSize = 'md',
  pseudo3DIntensity = 'medium',
}: GlassmorphicCardProps) {
  // If 3D mode is enabled, use Pseudo3DCard wrapper
  if (mode3D) {
    return (
      <Pseudo3DCard
        size={pseudo3DSize}
        intensity={pseudo3DIntensity}
        hover={hoverEffect}
        onClick={onClick}
        className={className}
      >
        {children}
      </Pseudo3DCard>
    );
  }

  // Traditional glassmorphic style
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
