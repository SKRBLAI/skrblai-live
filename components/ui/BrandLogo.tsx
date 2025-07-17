'use client';

import { motion } from 'framer-motion';

interface BrandLogoProps {
  className?: string;
  animate?: boolean;
}

// NOTE: For best clarity, avoid scaling this logo with CSS transforms (e.g., scale-125). Instead, increase font size via text-2xl/text-3xl/etc. for larger logo variants.
export default function BrandLogo({ className = '', animate = true }: BrandLogoProps) {
  const MotionWrapper = animate ? motion.span : 'span';
  
  return (
    <MotionWrapper 
      className={`${className} flex items-center gap-1`}
      {...(animate ? { whileHover: { scale: 1.05 } } : {})}
      aria-label="SKRBL AI Brand Logo"
      tabIndex={0}
      role="img"
    >
      <span className="relative inline-block font-inter" aria-label="SKRBL logo text">
        {/* SKRBL with glow effect */}
        <span className="absolute inset-0 blur-[1px] text-teal-400/80 font-extrabold text-2xl tracking-tight select-none pointer-events-none z-0">
          SKRBL
        </span>
        <span className="relative text-white font-extrabold text-2xl tracking-tight animate-pulse-subtle shadow-glow drop-shadow-cosmic antialiased subpixel-antialiased z-10">
          SKRBL
        </span>
      </span>
      <span className="relative inline-block font-inter" aria-label="AI logo text">
        {/* AI with matching glow effect */}
        <span className="absolute inset-0 blur-[1px] text-teal-400/80 font-extrabold text-2xl tracking-tight select-none pointer-events-none z-0">
          AI
        </span>
        <span className="relative text-teal-400 font-extrabold text-2xl tracking-tight animate-pulse-subtle shadow-glow drop-shadow-cosmic antialiased subpixel-antialiased z-10">
          AI
        </span>
      </span>
      <span className="sr-only">SKRBL AI: Cosmic creativity, always on!</span>
    </MotionWrapper>
  );
}
