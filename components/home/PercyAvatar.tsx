'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface PercyAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

const PercyAvatar: React.FC<PercyAvatarProps> = ({ size = 'md', className = '', animate = true }) => {
  // Define size classes based on prop
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-32 h-32 md:w-40 md:h-40'
  };

  // Avatar container tilt/float
  const floatVariants = {
    animate: {
      rotate: [0, 2, -2, 0],
      y: [0, -6, 0, 6, 0],
      transition: {
        repeat: Infinity,
        duration: 7,
        ease: 'easeInOut' as const,
      },
    },
  };

  return (
    <motion.div
      variants={floatVariants}
      animate={animate ? "animate" : undefined}
      className={`relative ${sizeClasses[size]} bg-white/10 rounded-full p-2 backdrop-blur-sm border border-white/20 shadow-lg shadow-purple-500/20 ${className}`}
    >
      <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#0c1225] to-[#0a192f] flex items-center justify-center relative">
        {/* Use proper Percy image instead of SVG */}
        <motion.div
          className="relative w-full h-full"
          animate={animate ? {
            y: [0, -2, 0],
            filter: [
              'drop-shadow(0 0 5px rgba(45, 212, 191, 0.7))',
              'drop-shadow(0 0 10px rgba(56, 189, 248, 0.9))',
              'drop-shadow(0 0 5px rgba(45, 212, 191, 0.7))'
            ]
          } : undefined}
          transition={{
            y: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
            filter: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const }
          }}
        >
          <Image
            src="/images/agents-percy-nobg-skrblai.webp"
            alt="Percy AI Assistant"
            width={200}
            height={200}
            className="w-full h-full object-contain"
            priority
          />
        </motion.div>
        
        {/* Glowing aura effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-electric-blue/30 to-teal-400/30 rounded-full blur-sm"
          animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' as const }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-teal-400/10 rounded-full blur-md"
          animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' as const }}
        />
      </div>
    </motion.div>
  );
};

export default PercyAvatar;
