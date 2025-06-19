'use client';

import React from 'react';
import { motion } from 'framer-motion';

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

  // Eye flicker and glow
  const eyeVariants = {
    flicker: {
      opacity: [1, 0.7, 1, 0.9, 1],
      filter: [
        'drop-shadow(0 0 6px #64FFDA)',
        'drop-shadow(0 0 12px #14ffe9)',
        'drop-shadow(0 0 8px #a259ff)',
        'drop-shadow(0 0 10px #14ffe9)',
        'drop-shadow(0 0 6px #64FFDA)'
      ],
      transition: {
        repeat: Infinity,
        duration: 2.8,
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
        {/* Human/AI hybrid silhouette */}
        <svg
          className="w-3/4 h-3/4 text-white/80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C9.38 2 7.25 4.13 7.25 6.75C7.25 9.32 9.26 11.4 11.81 11.49C11.87 11.48 11.93 11.48 12 11.48C12.06 11.48 12.12 11.48 12.18 11.49C14.73 11.4 16.74 9.32 16.74 6.75C16.75 4.13 14.62 2 12 2Z"
            fill="currentColor"
          />
          <path
            d="M17.08 14.1499C14.29 12.2899 9.74 12.2899 6.93 14.1499C5.66 15.0099 4.96 16.1499 4.96 17.3799C4.96 18.6099 5.66 19.7399 6.92 20.5899C8.32 21.5299 10.16 21.9999 12 21.9999C13.84 21.9999 15.68 21.5299 17.08 20.5899C18.34 19.7299 19.04 18.5999 19.04 17.3599C19.03 16.1299 18.34 14.9999 17.08 14.1499Z"
            fill="currentColor"
          />
          {/* Glowing eyes with Framer Motion flicker */}
          <motion.circle
            cx="9" cy="7" r="1.25"
            fill="#64FFDA"
            variants={eyeVariants}
            animate="flicker"
          />
          <motion.circle
            cx="15" cy="7" r="1.25"
            fill="#64FFDA"
            variants={eyeVariants}
            animate="flicker"
          />
          {/* Digital elements */}
          <path
            d="M2 12H4M6 4L7.5 5.5M18 4L16.5 5.5M22 12H20M12 2V4"
            stroke="#64FFDA"
            strokeWidth="0.75"
            strokeLinecap="round"
          />
        </svg>
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
