'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkrblAiTextProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  variant?: 'default' | 'glow' | 'pulse' | 'wave';
  children?: React.ReactNode;
}

export default function SkrblAiText({ 
  className = '', 
  size = 'md', 
  variant = 'glow',
  children 
}: SkrblAiTextProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  const baseStyles = `
    font-bold
    bg-gradient-to-r
    from-cyan-400
    via-electric-blue
    to-teal-400
    bg-clip-text
    text-transparent
    inline-block
    ${sizeClasses[size]}
  `;

  const glowStyles = `
    drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]
    drop-shadow-[0_0_16px_rgba(45,212,191,0.6)]
    drop-shadow-[0_0_24px_rgba(56,189,248,0.4)]
  `;

  const variants = {
    default: {
      scale: 1,
      filter: 'brightness(1)',
    },
    glow: {
      scale: [1, 1.02, 1],
      filter: [
        'brightness(1) drop-shadow(0 0 8px rgba(56,189,248,0.8))',
        'brightness(1.2) drop-shadow(0 0 16px rgba(45,212,191,0.9))',
        'brightness(1) drop-shadow(0 0 8px rgba(56,189,248,0.8))'
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1] as const
      }
    },
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1] as const
      }
    },
    wave: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1] as const
      }
    }
  };

  return (
    <motion.span
      className={`${baseStyles} ${glowStyles} ${className}`}
      variants={variants}
      animate={variant}
      style={{
        backgroundSize: '200% 200%',
        textShadow: '0 0 10px rgba(56,189,248,0.5), 0 0 20px rgba(45,212,191,0.3)'
      }}
    >
      {children || 'SKRBL AI'}
    </motion.span>
  );
} 