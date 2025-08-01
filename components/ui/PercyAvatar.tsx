'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface PercyAvatarProps {
  src?: string;
  alt?: string; // image URL and alt text
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isThinking?: boolean;
  animate?: boolean;
  glow?: boolean; // adds gradient ring/glow
}

export default function PercyAvatar({ src = '/images/percy-chameleon.png', alt = 'Percy AI Assistant', size = 'md', className = '', isThinking = false, animate = true, glow = false }: PercyAvatarProps) {
  const sizeClasses: Record<string, string> = {
    sm: 'w-10 h-10',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
  };

  // Wrapper div adds optional glow ring
  return (
    <motion.div
      className={`relative ${sizeClasses[size]} mx-auto mb-6 select-none ${className}`}
      animate={animate ? {
        scale: [1, 1.04, 1],
        filter: isThinking
          ? 'brightness(1.15) drop-shadow(0 0 24px #30D5C8)' : 'none',
      } : undefined}
      transition={{ duration: 2.2, repeat: Infinity }}
    >
      {/* Subtle breathing */}
      {animate && (
        <motion.div
          className="absolute inset-0 rounded-full z-10"
          animate={{
            scale: [1, 1.07, 1],
            boxShadow: [
              '0 0 0px #30D5C8',
              '0 0 32px 6px #30D5C8AA',
              '0 0 0px #30D5C8'
            ]
          }}
          transition={{ duration: 3.2, repeat: Infinity }}
        />
      )}
      {glow && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 animate-pulse" />
      )}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        animate={animate ? { y: [0, 2, -2, 0] } : undefined}
        transition={{ duration: 2.2, repeat: Infinity }}
      >
        <Image
          src={src}
          alt={alt}
          width={96}
          height={96}
          className="object-contain"
          priority
        />
        {/* Eye animation overlay */}
        {animate && (
          <motion.div
            className="absolute left-1/2 top-1/2 w-6 h-3 bg-black/80 rounded-b-full opacity-80"
            style={{ transform: 'translate(-50%, -50%)' }}
            animate={{ y: [0, 0.5, -0.5, 0], scaleX: [1, 1.08, 0.96, 1] }}
            transition={{ duration: 2.1, repeat: Infinity }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
