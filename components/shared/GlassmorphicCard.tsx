'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils/index';
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
  // Floating entry and loop variants for subtle 3D polish
  const variants: Variants = {
    initial: { opacity: 0, y: 20 },
    entry: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    float: {
      y: [0, -4, 0],
      transition: { duration: 4, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' as const }
    }
  };
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
    <motion.div style={{ willChange: 'transform, box-shadow' }} 
      onClick={onClick}
      variants={variants}
      initial="initial"
      animate={["entry","float"]}
      whileHover={hoverEffect ? { scale: 1.04, perspective: 1000, rotateX: 2, rotateY: -2 } : undefined}
      whileTap={hoverEffect ? { scale: 0.96, perspective: 1000, rotateX: -1, rotateY: 1 } : undefined}
      className={cn(`
        bg-transparent
        backdrop-blur-xl
        border-2 border-${glowColor}/70
        rounded-3xl
        shadow-[0_8px_16px_rgba(0,0,0,0.15),0_0_15px_rgba(45,212,191,0.3),0_0_30px_rgba(56,189,248,0.2)]
        ${hoverEffect ? 'hover:shadow-[0_12px_24px_rgba(0,0,0,0.2),0_0_25px_rgba(45,212,191,0.5),0_0_40px_rgba(56,189,248,0.3)] hover:border-teal-400/90' : ''}
        transition-shadow duration-300 ease-out
        p-6 md:p-8 mx-4 md:mx-6 lg:mx-8
        ${className}
      `)}
      
    >
      {children}
    </motion.div>
  );
}
