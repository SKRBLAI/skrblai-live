import React from 'react';
import { motion } from 'framer-motion';

interface SkrblAiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'static' | 'glow' | 'pulse' | 'wave' | 'gradient' | 'premium';
  showTagline?: boolean;
  className?: string;
}

const SkrblAiLogo: React.FC<SkrblAiLogoProps> = ({
  size = 'md',
  variant = 'static',
  showTagline = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  const baseLogoClasses = `
    font-extrabold 
    tracking-wider 
    select-none
    ${sizeClasses[size]}
  `;

  const getVariantClasses = () => {
    switch (variant) {
      case 'glow':
        return `
          bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500
          bg-clip-text text-transparent
          drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]
          animate-pulse-subtle
        `;
      case 'pulse':
        return `
          bg-gradient-to-r from-electric-blue to-teal-400
          bg-clip-text text-transparent
          animate-pulse-slow
        `;
      case 'wave':
        return `
          bg-gradient-to-r from-blue-400 via-cyan-400 via-purple-400 to-blue-400
          bg-clip-text text-transparent
          bg-[length:200%_100%]
          animate-gradient-wave
        `;
      case 'gradient':
        return `
          bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600
          bg-clip-text text-transparent
          bg-[length:200%_100%]
          animate-gradient-shift
        `;
      case 'premium':
        return `
          bg-gradient-to-r from-yellow-300 via-cyan-300 via-blue-400 to-purple-500
          bg-clip-text text-transparent
          bg-[length:300%_100%]
          animate-premium-shine
          drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]
          filter drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]
        `;
      default:
        return `
          bg-gradient-to-r from-electric-blue to-teal-400
          bg-clip-text text-transparent
        `;
    }
  };

  const taglineClasses = `
    text-sm font-medium text-gray-400 italic
    mt-1 tracking-wide
    ${variant === 'glow' ? 'animate-pulse-subtle' : ''}
    ${variant === 'premium' ? 'text-cyan-300 font-semibold' : ''}
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center ${className}`}
    >
      <motion.h1
        className={`${baseLogoClasses} ${getVariantClasses()}`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        SKRBL AI
      </motion.h1>
      
      {showTagline && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={taglineClasses}
        >
          "pronounced like scribble, just without vowels"
        </motion.p>
      )}
    </motion.div>
  );
};

export default SkrblAiLogo; 