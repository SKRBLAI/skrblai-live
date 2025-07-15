'use client';

import { Typewriter } from 'react-simple-typewriter';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TypewriterTextProps {
  /** Array of text strings to cycle through */
  words: string[];
  /** Speed of typing in milliseconds per character */
  typeSpeed?: number;
  /** Speed of deleting in milliseconds per character */
  deleteSpeed?: number;
  /** Delay before starting to delete in milliseconds */
  delaySpeed?: number;
  /** Whether to loop the animation */
  loop?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Action words that should pulse/glow when typed */
  actionWords?: string[];
  /** Enable enhanced cosmic effects */
  cosmicMode?: boolean;
}

export default function TypewriterText({
  words,
  typeSpeed = 80,
  deleteSpeed = 50,
  delaySpeed = 2000,
  loop = true,
  className = '',
  actionWords = ['DOMINATES', 'Extinct', 'AUTOMATE', 'DESTROYED', 'OBLITERATE'],
  cosmicMode = true
}: TypewriterTextProps) {
  const [currentText, setCurrentText] = useState('');
  const [showPulse, setShowPulse] = useState(false);

  // Enhanced glow effect for action words
  const processTextWithEffects = (text: string) => {
    if (!cosmicMode) return text;

    // Check if current text contains action words
    const hasActionWord = actionWords.some(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );

    if (hasActionWord !== showPulse) {
      setShowPulse(hasActionWord);
    }

    return text;
  };

  const glowVariants = {
    normal: {
      textShadow: '0 0 10px rgba(56, 189, 248, 0.4)',
      scale: 1,
    },
    pulse: {
      textShadow: [
        '0 0 20px rgba(56, 189, 248, 0.8)',
        '0 0 30px rgba(168, 85, 247, 0.6)',
        '0 0 40px rgba(56, 189, 248, 0.8)',
      ],
      scale: [1, 1.02, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const cosmicVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.span
      className={`relative inline-block ${className}`}
      variants={cosmicMode ? cosmicVariants : {}}
      initial={cosmicMode ? 'hidden' : {}}
      animate={cosmicMode ? 'visible' : {}}
    >
      {/* Cosmic background glow */}
      {cosmicMode && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-electric-blue/20 via-teal-400/20 to-fuchsia-500/20 blur-xl rounded-lg"
          animate={{
            opacity: showPulse ? [0.3, 0.6, 0.3] : 0.1,
            scale: showPulse ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: showPulse ? Infinity : 0,
            ease: 'easeInOut'
          }}
        />
      )}

      {/* Main typewriter text */}
      <motion.span
        className="relative z-10"
        variants={cosmicMode ? glowVariants : {}}
        animate={showPulse ? 'pulse' : 'normal'}
      >
        <Typewriter
          words={words}
          loop={loop}
          cursor
          cursorStyle={cosmicMode ? '|' : '_'}
          typeSpeed={typeSpeed}
          deleteSpeed={deleteSpeed}
          delaySpeed={delaySpeed}
          onLoopDone={() => {
            if (cosmicMode) {
              // Add subtle shake effect when cycle completes
              setShowPulse(false);
              setTimeout(() => setShowPulse(true), 100);
            }
          }}
          onType={(count: number) => {
            const currentWord = words[Math.floor(count / words.length)] || '';
            setCurrentText(currentWord);
            processTextWithEffects(currentWord);
          }}
        />
      </motion.span>

      {/* Cosmic cursor enhancement */}
      {cosmicMode && (
        <motion.span
          className="ml-1"
          animate={{
            opacity: [1, 0, 1],
            scale: showPulse ? [1, 1.2, 1] : 1,
          }}
          transition={{
            opacity: { duration: 1, repeat: Infinity },
            scale: { duration: 0.5, repeat: Infinity }
          }}
        >
          <span className="text-electric-blue">⚡</span>
        </motion.span>
      )}
    </motion.span>
  );
} 