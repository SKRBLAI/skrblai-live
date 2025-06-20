"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface PercyFigureProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  showGlow?: boolean;
  showText?: boolean;
}

export default function PercyFigure({
  className = "",
  size = "md",
  animate = true, 
  showGlow = true,
  showText = false
}: PercyFigureProps) {
  // Size mapping for different screen sizes
  const sizeMap = {
    sm: "w-28 md:w-32",
    md: "w-36 md:w-44",
    lg: "w-48 md:w-56",
    xl: "w-64 md:w-72"
  };

  // Animation settings
  const floatAnimation = animate ? {
    y: [0, -12, 0, 12, 0],
    transition: {
      repeat: Infinity,
      duration: 8,
      ease: "easeInOut" as const
    }
  } : {};

  // Glow effects
  const glowEffect = showGlow ? 
    "drop-shadow-[0_0_48px_#2dd4bf] filter-cosmic-glow" : "";

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <motion.div
        className="relative"
        initial={animate ? { opacity: 0, y: 20 } : {}}
        animate={animate ? { opacity: 1, ...floatAnimation } : {}}
      >
        <Image
          src="/images/agents-percy-nobg-skrblai.webp"
          alt="Percy the AI Concierge"
          width={300}
          height={400}
          className={`${sizeMap[size]} ${glowEffect}`}
          style={showGlow ? { 
            filter: 'drop-shadow(0 0 60px #2dd4bf) drop-shadow(0 0 36px #38bdf8)'
          } : {}}
          priority
        />
      </motion.div>

      {showText && (
        <motion.div
          className="text-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="block text-2xl font-bold text-gradient-blue">Percy</span>
          <span className="block text-teal-300 text-sm">Your AI Concierge</span>
        </motion.div>
      )}
    </div>
  );
}
