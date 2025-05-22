'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface PercyButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  secondary?: boolean;
  className?: string;
  showPercy?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function PercyButton({ 
  label, 
  onClick, 
  disabled = false, 
  secondary = false, 
  className = '',
  showPercy = false,
  size = 'md'
}: PercyButtonProps) {
  // Size classes based on the size prop
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6',
    lg: 'py-4 px-8 text-lg'
  };

  // Percy image size based on button size
  const percySize = {
    sm: { width: 20, height: 20 },
    md: { width: 24, height: 24 },
    lg: { width: 28, height: 28 }
  };

  return (
    <motion.button
      whileHover={{ 
        scale: disabled ? 1 : 1.03,
        boxShadow: disabled ? 'none' : '0 0 15px rgba(56, 189, 248, 0.6), 0 0 8px rgba(244, 114, 182, 0.4)'
      }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        relative
        rounded-lg font-medium transition-all duration-300
        ${disabled 
          ? 'bg-white/10 text-white/50' 
          : secondary
            ? 'bg-white/10 text-white hover:bg-white/20' 
            : 'bg-gradient-to-r from-electric-blue to-teal-400 text-white hover:shadow-lg hover:shadow-electric-blue/20'
        }
        ${className}
      `.trim()}
    >
      <div className="flex items-center justify-center">
        {showPercy && (
          <div className="mr-2 relative">
            <motion.div
              animate={{
                y: [0, -2, 0],
                filter: [
                  'drop-shadow(0 0 1px rgba(45, 212, 191, 0.9))',
                  'drop-shadow(0 0 3px rgba(56, 189, 248, 0.9))',
                  'drop-shadow(0 0 1px rgba(45, 212, 191, 0.9))'
                ],
              }}
              transition={{
                y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                filter: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
              }}
            >
              <Image 
                src="/images/agents-percy-fullbody-nobg-skrblai.png"
                alt="Percy"
                width={percySize[size].width}
                height={percySize[size].height}
                className="object-contain"
              />
            </motion.div>
          </div>
        )}
        <span>{label}</span>
      </div>
      
      {/* Subtle animated border for non-disabled, primary buttons */}
      {!disabled && !secondary && (
        <motion.div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 0 1px rgba(56, 189, 248, 0.3)',
              '0 0 0 2px rgba(45, 212, 191, 0.5)',
              '0 0 0 1px rgba(56, 189, 248, 0.3)'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
    </motion.button>
  );
}