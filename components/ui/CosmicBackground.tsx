"use client";
import { motion, Transition, TargetAndTransition } from "framer-motion";
import React, { useState, useEffect } from 'react';

interface Particle {
  id: number;
  style: React.CSSProperties;
  animate: TargetAndTransition;
  transition: Transition;
}

interface CosmicBackgroundProps {
  archetype?: 'athlete' | 'creator' | 'entrepreneur' | 'default';
}

export default function CosmicBackground({ archetype = 'default' }: CosmicBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Gradient configurations based on archetype
  const gradients = {
    athlete: {
      orb1: 'from-blue-900/20 via-cyan-900/10 to-blue-900/20',
      orb2: 'from-cyan-600/20 via-blue-600/10 to-cyan-600/20',
      orb3: 'from-blue-700/20 via-cyan-700/10 to-blue-700/20',
      particle: 'bg-cyan-400/20'
    },
    creator: {
      orb1: 'from-purple-900/20 via-pink-900/10 to-purple-900/20',
      orb2: 'from-pink-600/20 via-purple-600/10 to-pink-600/20',
      orb3: 'from-purple-700/20 via-pink-700/10 to-purple-700/20',
      particle: 'bg-pink-400/20'
    },
    entrepreneur: {
      orb1: 'from-green-900/20 via-emerald-900/10 to-green-900/20',
      orb2: 'from-emerald-600/20 via-green-600/10 to-emerald-600/20',
      orb3: 'from-green-700/20 via-emerald-700/10 to-green-700/20',
      particle: 'bg-emerald-400/20'
    },
    default: {
      orb1: 'from-electric-blue/30 to-teal-500/30',
      orb2: 'from-purple-500/20 to-pink-500/20',
      orb3: 'from-amber-500/20 to-orange-500/20',
      particle: 'bg-teal-400/20'
    }
  };

  const currentGradient = gradients[archetype];

  useEffect(() => {
    const generateParticles = () => {
      return [...Array(30)].map((_, i) => ({
        id: i,
        style: {
          width: `${Math.random() * 6 + 6}px`,
          height: `${Math.random() * 6 + 6}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          filter: 'blur(1.5px)',
        },
        animate: {
          y: [0, Math.random() * 40 - 20, 0],
          x: [0, Math.random() * 40 - 20, 0],
          opacity: [0.7, 1, 0.7],
        },
        transition: {
          duration: Math.random() * 5 + 4,
          repeat: Infinity,
          repeatType: "mirror" as const,
          delay: Math.random() * 2,
        },
      }));
    };
    setParticles(generateParticles());
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden transition-all duration-1000">
      {/* Animated Gradient Orbs with archetype-based colors */}
      <motion.div
        className={`absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r ${currentGradient.orb1} blur-3xl top-[10%] left-[5%] transition-all duration-1000`}
        animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className={`absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r ${currentGradient.orb2} blur-3xl top-[40%] right-[10%] transition-all duration-1000`}
        animate={{ x: [0, -50, 0], y: [0, 100, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className={`absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r ${currentGradient.orb3} blur-3xl bottom-[20%] left-[15%] transition-all duration-1000`}
        animate={{ x: [0, 70, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      {/* Animated floating stars/particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${currentGradient.particle} shadow-lg transition-colors duration-1000`}
          style={p.style}
          animate={p.animate}
          transition={p.transition}
        />
      ))}
      {/* Grid overlay with subtle pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
    </div>
  );
}
