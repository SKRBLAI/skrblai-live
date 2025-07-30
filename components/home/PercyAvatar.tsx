'use client';

import React from 'react';
import { motion, AnimatePresence, cubicBezier } from 'framer-motion';
import Image from 'next/image';

interface PercyAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
  mood?: 'excited' | 'analyzing' | 'celebrating' | 'confident' | 'scanning' | 'thinking' | 'waving' | 'nodding';
  showParticles?: boolean;
}

const PercyAvatar: React.FC<PercyAvatarProps> = ({ 
  size = 'md', 
  className = '', 
  animate = true,
  mood = 'excited',
  showParticles = false
}) => {
  // Define size classes based on prop
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-32 h-32 md:w-40 md:h-40'
  };

  // Mood-based animation variants
  const getMoodAnimation = () => {
    switch (mood) {
      case 'thinking':
        return {
          rotate: [0, -5, 5, -3, 3, 0],
          y: [0, -2, 0, -1, 0],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: cubicBezier(0.42, 0, 0.58, 1),
          }
        };
      case 'celebrating':
        return {
          scale: [1, 1.1, 1, 1.05, 1],
          rotate: [0, -10, 10, -5, 5, 0],
          y: [0, -8, 0, -4, 0],
          transition: {
            duration: 1.5,
            repeat: 3,
            ease: cubicBezier(0.42, 0, 0.58, 1),
          }
        };
      case 'nodding':
        return {
          rotateY: [0, 15, -15, 10, -10, 0],
          y: [0, -3, 0, -2, 0],
          transition: {
            duration: 2,
            repeat: 2,
            ease: cubicBezier(0.42, 0, 0.58, 1),
          }
        };
      case 'waving':
        return {
          rotate: [0, 15, -15, 10, -10, 5, -5, 0],
          x: [0, 3, -3, 2, -2, 0],
          transition: {
            duration: 2.5,
            repeat: 2,
            ease: cubicBezier(0.42, 0, 0.58, 1),
          }
        };
      case 'analyzing':
        return {
          rotateY: [0, 360],
          y: [0, -3, 0],
          transition: {
            rotateY: { duration: 4, repeat: Infinity, ease: cubicBezier(0, 0, 1, 1) },
            y: { duration: 2, repeat: Infinity, ease: cubicBezier(0.42, 0, 0.58, 1) }
          }
        };
      case 'scanning':
        return {
          scale: [1, 1.05, 1],
          y: [0, -4, 0],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: cubicBezier(0.42, 0, 0.58, 1),
          }
        };
      default: // excited
        return {
          rotate: [0, 2, -2, 0],
          y: [0, -6, 0, 6, 0],
          transition: {
            repeat: Infinity,
            duration: 7,
            ease: cubicBezier(0.42, 0, 0.58, 1),
          }
        };
    }
  };

  // Glow intensity based on mood
  const getGlowIntensity = () => {
    switch (mood) {
      case 'celebrating':
        return {
          opacity: [0.7, 1, 0.7],
          scale: [1, 1.2, 1],
          boxShadow: [
            '0 0 20px rgba(45, 212, 191, 0.8)',
            '0 0 40px rgba(56, 189, 248, 1)',
            '0 0 20px rgba(45, 212, 191, 0.8)'
          ]
        };
      case 'thinking':
      case 'analyzing':
        return {
          opacity: [0.5, 0.9, 0.5],
          scale: [1, 1.1, 1],
          boxShadow: [
            '0 0 15px rgba(147, 51, 234, 0.6)',
            '0 0 30px rgba(147, 51, 234, 0.9)',
            '0 0 15px rgba(147, 51, 234, 0.6)'
          ]
        };
      default:
        return {
          opacity: [0.7, 1, 0.7],
          scale: [1, 1.08, 1]
        };
    }
  };

  return (
    <motion.div
      animate={animate ? getMoodAnimation() : undefined}
      className={`relative ${sizeClasses[size]} rounded-full shadow-cosmic bg-white/10 border-2 border-cyan-400/30 p-1 ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#0c1225] to-[#0a192f] flex items-center justify-center relative">
        {/* Percy Image with Enhanced Animations */}
        <motion.div
          className="relative w-full h-full"
          animate={animate ? {
            y: mood === 'celebrating' ? [0, -4, 0] : [0, -2, 0],
            filter: mood === 'celebrating' ? [
              'drop-shadow(0 0 10px rgba(45, 212, 191, 0.9)) hue-rotate(0deg)',
              'drop-shadow(0 0 20px rgba(56, 189, 248, 1)) hue-rotate(180deg)',
              'drop-shadow(0 0 10px rgba(45, 212, 191, 0.9)) hue-rotate(360deg)'
            ] : [
              'drop-shadow(0 0 5px rgba(45, 212, 191, 0.7))',
              'drop-shadow(0 0 10px rgba(56, 189, 248, 0.9))',
              'drop-shadow(0 0 5px rgba(45, 212, 191, 0.7))'
            ]
          } : undefined}
          transition={{
            y: { duration: mood === 'celebrating' ? 1 : 2, repeat: Infinity, ease: cubicBezier(0.42, 0, 0.58, 1) },
            filter: { duration: mood === 'celebrating' ? 2 : 3, repeat: Infinity, ease: cubicBezier(0.42, 0, 0.58, 1) }
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
        
        {/* Enhanced Multi-layer Glow Effects */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-electric-blue/30 to-teal-400/30 rounded-full blur-sm"
          animate={getGlowIntensity()}
          transition={{
            repeat: Infinity,
            duration: mood === 'celebrating' ? 1.5 : 2.8,
            ease: cubicBezier(0.42, 0, 0.58, 1)
          }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-teal-400/10 rounded-full blur-md"
          animate={{ 
            opacity: [0.5, 0.8, 0.5], 
            scale: [1, 1.12, 1],
            ...(mood === 'celebrating' && {
              rotate: [0, 360],
              background: [
                'linear-gradient(45deg, rgba(30, 144, 255, 0.1), rgba(48, 213, 200, 0.1))',
                'linear-gradient(135deg, rgba(255, 20, 147, 0.1), rgba(0, 255, 255, 0.1))',
                'linear-gradient(225deg, rgba(148, 0, 211, 0.1), rgba(255, 165, 0, 0.1))',
                'linear-gradient(315deg, rgba(30, 144, 255, 0.1), rgba(48, 213, 200, 0.1))'
              ]
            })
          }}
          transition={{ 
            repeat: Infinity, 
            duration: mood === 'celebrating' ? 3 : 3.2, 
            ease: cubicBezier(0.42, 0, 0.58, 1),
            background: { duration: 4, repeat: Infinity }
          }}
        />

        {/* Thinking Indicator */}
        {mood === 'thinking' && (
          <motion.div
            className="absolute -top-2 -right-2 flex space-x-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <motion.div
              className="w-2 h-2 bg-purple-400 rounded-full"
              animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-purple-400 rounded-full"
              animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 bg-purple-400 rounded-full"
              animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </motion.div>
        )}

        {/* Celebration Particles */}
        <AnimatePresence>
          {(mood === 'celebrating' || showParticles) && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  initial={{ 
                    opacity: 0,
                    scale: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.cos((i * 45) * Math.PI / 180) * 30,
                    y: Math.sin((i * 45) * Math.PI / 180) * 30,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeOut'
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PercyAvatar;
