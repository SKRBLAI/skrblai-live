'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';

interface EnhancedStatCounterProps {
  /** Final number to count to */
  end: number;
  /** Duration of the counting animation in milliseconds */
  duration?: number;
  /** Text to display before the number */
  prefix?: string;
  /** Text to display after the number */
  suffix?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Whether to add commas for thousands separator */
  useCommas?: boolean;
  /** Enable cosmic glow effects */
  cosmicGlow?: boolean;
  /** Color theme for the counter */
  theme?: 'electric' | 'teal' | 'purple' | 'pink' | 'gold' | 'auto';
  /** Animation delay in milliseconds */
  delay?: number;
  /** Custom className */
  className?: string;
  /** Enable spring animation instead of linear */
  useSpring?: boolean;
  /** Enable pulsing effect on completion */
  pulseOnComplete?: boolean;
}

const themeColors = {
  electric: {
    text: 'text-electric-blue',
    glow: 'rgba(56, 189, 248, 0.6)',
    shadow: '0 0 20px rgba(56, 189, 248, 0.4)'
  },
  teal: {
    text: 'text-teal-400',
    glow: 'rgba(45, 212, 191, 0.6)',
    shadow: '0 0 20px rgba(45, 212, 191, 0.4)'
  },
  purple: {
    text: 'text-purple-400',
    glow: 'rgba(168, 85, 247, 0.6)',
    shadow: '0 0 20px rgba(168, 85, 247, 0.4)'
  },
  pink: {
    text: 'text-pink-400',
    glow: 'rgba(236, 72, 153, 0.6)',
    shadow: '0 0 20px rgba(236, 72, 153, 0.4)'
  },
  gold: {
    text: 'text-yellow-400',
    glow: 'rgba(251, 191, 36, 0.6)',
    shadow: '0 0 20px rgba(251, 191, 36, 0.4)'
  },
  auto: {
    text: 'text-white',
    glow: 'rgba(255, 255, 255, 0.6)',
    shadow: '0 0 20px rgba(255, 255, 255, 0.4)'
  }
};

export default function EnhancedStatCounter({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  useCommas = true,
  cosmicGlow = true,
  theme = 'auto',
  delay = 0,
  className = '',
  useSpring: useSpringAnimation = true,
  pulseOnComplete = true
}: EnhancedStatCounterProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Spring animation for smooth counting
  const springValue = useSpring(0, {
    stiffness: useSpringAnimation ? 100 : 400,
    damping: useSpringAnimation ? 30 : 40,
    mass: 1
  });

  // Transform spring value to formatted number
  const displayValue = useTransform(springValue, (value) => {
    const num = parseFloat(value.toFixed(decimals));
    const formatted = useCommas ? num.toLocaleString() : num.toString();
    return `${prefix}${formatted}${suffix}`;
  });

  // Animation variants for cosmic effects
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: delay / 1000,
        ease: "easeOut"
      }
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.6,
        repeat: 2,
        ease: "easeInOut"
      }
    }
  };

  const glowVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: cosmicGlow ? 1 : 0,
      transition: { duration: 1, delay: (delay + 500) / 1000 }
    },
    pulse: {
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Start animation when in view
  useEffect(() => {
    if (isInView && !hasAnimated) {
      const timer = setTimeout(() => {
        springValue.set(end);
        setHasAnimated(true);
        
        // Mark as complete after animation duration
        const completeTimer = setTimeout(() => {
          setIsComplete(true);
        }, duration);
        
        return () => clearTimeout(completeTimer);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [isInView, hasAnimated, end, springValue, delay, duration]);

  const currentTheme = themeColors[theme];

  return (
    <motion.span
      ref={ref}
      className={`relative inline-block font-bold ${currentTheme.text} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? (isComplete && pulseOnComplete ? "pulse" : "visible") : "hidden"}
    >
      {/* Cosmic glow background */}
      {cosmicGlow && (
        <motion.div
          className="absolute inset-0 rounded-lg blur-lg pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${currentTheme.glow} 0%, transparent 70%)`,
          }}
          variants={glowVariants}
          initial="hidden"
          animate={isInView ? (isComplete && pulseOnComplete ? "pulse" : "visible") : "hidden"}
        />
      )}

      {/* Number display with enhanced styling */}
      <motion.span
        className="relative z-10 inline-block"
        style={{
          textShadow: cosmicGlow ? currentTheme.shadow : 'none',
          filter: cosmicGlow ? 'brightness(1.1)' : 'none'
        }}
      >
        {displayValue}
      </motion.span>

      {/* Sparkle effect on completion */}
      {isComplete && cosmicGlow && (
        <motion.div
          className="absolute -top-2 -right-2 text-yellow-400"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0], 
            scale: [0, 1.2, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 1.5,
            ease: "easeOut"
          }}
        >
          ✨
        </motion.div>
      )}
    </motion.span>
  );
} 