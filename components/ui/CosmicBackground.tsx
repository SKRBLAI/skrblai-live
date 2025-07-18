"use client";
import { motion, Transition, TargetAndTransition } from "framer-motion";
import React, { useState, useEffect } from 'react';

interface Particle {
  id: number;
  style: React.CSSProperties;
  animate: TargetAndTransition;
  transition: Transition;
}

export default function CosmicBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

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
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-electric-blue/30 to-teal-500/30 blur-3xl top-[10%] left-[5%]"
        animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl top-[40%] right-[10%]"
        animate={{ x: [0, -50, 0], y: [0, 100, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-3xl bottom-[20%] left-[15%]"
        animate={{ x: [0, 70, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      {/* Animated floating stars/particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-teal-400/20 shadow-lg"
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
