'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface PercyAnimationsProps {
  enabled: boolean;
  intensity?: 'low' | 'medium' | 'high';
  showParticles?: boolean;
  showBorder?: boolean;
  className?: string;
}

const PercyAnimations: React.FC<PercyAnimationsProps> = ({
  enabled,
  intensity = 'medium',
  showParticles = true,
  showBorder = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Intersection observer for performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    const container = document.querySelector('[data-percy-animations]');
    if (container) observer.observe(container);
    
    return () => observer.disconnect();
  }, []);

  // Optimized particle configuration based on intensity
  const particleConfig = useMemo(() => {
    if (reducedMotion) return { count: 0, duration: 0 };
    
    switch (intensity) {
      case 'low':
        return { count: 2, duration: 8 };
      case 'medium':
        return { count: 3, duration: 6 };
      case 'high':
        return { count: 4, duration: 4 };
      default:
        return { count: 3, duration: 6 };
    }
  }, [intensity, reducedMotion]);

  // Don't render if disabled or user prefers reduced motion
  if (!enabled || reducedMotion) return null;

  return (
    <div 
      data-percy-animations
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {/* Optimized Cosmic Border */}
      {showBorder && isVisible && (
        <motion.div
          className="absolute -inset-2 z-30 rounded-[2.5rem] border-2 border-cyan-400/40"
          style={{
            background: 'linear-gradient(90deg, rgba(48,213,200,0.1) 0%, rgba(99,102,241,0.1) 50%, rgba(6,182,212,0.1) 100%)'
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            borderColor: [
              'rgba(48,213,200,0.4)',
              'rgba(99,102,241,0.6)',
              'rgba(48,213,200,0.4)'
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {/* Optimized Background Particles */}
      {showParticles && isVisible && (
        <div className="absolute inset-0">
          {[...Array(particleConfig.count)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-cyan-400/40 to-blue-400/40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: particleConfig.duration + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Performance-optimized ambient orbs - CSS transforms only */}
      {intensity === 'high' && isVisible && (
        <div className="absolute inset-0">
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute w-20 h-20 rounded-full"
              style={{
                left: `${20 + i * 60}%`,
                top: `${30 + i * 40}%`,
                background: `radial-gradient(circle, rgba(${i === 0 ? '48,213,200' : '99,102,241'},0.1) 0%, transparent 70%)`
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 6 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 1.5,
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle gradient overlay for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.1) 100%)'
        }}
      />
    </div>
  );
};

export default PercyAnimations;