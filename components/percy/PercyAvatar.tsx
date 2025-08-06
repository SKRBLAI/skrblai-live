'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PercyAvatarProps {
  mood: 'neutral' | 'excited' | 'thinking' | 'confident' | 'celebrating';
  isThinking: boolean;
  size?: 'small' | 'medium' | 'large';
  onMoodChange?: (mood: string) => void;
}

const PercyAvatar: React.FC<PercyAvatarProps> = ({
  mood,
  isThinking,
  size = 'medium',
  onMoodChange
}) => {
  // Optimized mood configurations
  const moodConfig = useMemo(() => ({
    neutral: {
      glow: 'rgba(48, 213, 200, 0.6)',
      scale: 1,
      borderColor: '#30d5c8',
      animation: 'pulse'
    },
    excited: {
      glow: 'rgba(255, 107, 107, 0.8)',
      scale: 1.05,
      borderColor: '#ff6b6b',
      animation: 'bounce'
    },
    thinking: {
      glow: 'rgba(99, 102, 241, 0.7)',
      scale: 0.98,
      borderColor: '#6366f1',
      animation: 'breathe'
    },
    confident: {
      glow: 'rgba(34, 197, 94, 0.7)',
      scale: 1.02,
      borderColor: '#22c55e',
      animation: 'confident'
    },
    celebrating: {
      glow: 'rgba(245, 158, 11, 0.8)',
      scale: 1.1,
      borderColor: '#f59e0b',
      animation: 'celebration'
    }
  }), []);

  const currentMood = moodConfig[mood];
  
  // Size configurations
  const sizeConfig = {
    small: { width: 60, height: 60 },
    medium: { width: 120, height: 120 },
    large: { width: 180, height: 180 }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Avatar Container */}
      <motion.div
        className="relative rounded-full overflow-hidden border-4"
        style={{
          borderColor: currentMood.borderColor,
          boxShadow: `0 0 40px ${currentMood.glow}`,
          ...sizeConfig[size]
        }}
        animate={{
          scale: currentMood.scale,
          boxShadow: [
            `0 0 40px ${currentMood.glow}`,
            `0 0 60px ${currentMood.glow}`,
            `0 0 40px ${currentMood.glow}`
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {/* Percy Image */}
        <img
          src="/images/percy-avatar.webp"
          alt="Percy the Cosmic Concierge"
          className="w-full h-full object-cover"
          style={{ filter: `hue-rotate(${mood === 'excited' ? '320deg' : '0deg'})` }}
        />
        
        {/* Thinking Animation Overlay */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mood Indicator */}
      <motion.div
        className="mt-2 text-xs font-semibold text-center"
        style={{ color: currentMood.borderColor }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isThinking ? 'Analyzing...' : mood.charAt(0).toUpperCase() + mood.slice(1)}
      </motion.div>

      {/* Optimized Sparkle Effects - Only 3 instead of 8 */}
      {mood === 'celebrating' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: `${50 + Math.cos((i * Math.PI * 2) / 3) * 40}%`,
                top: `${50 + Math.sin((i * Math.PI * 2) / 3) * 40}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PercyAvatar;