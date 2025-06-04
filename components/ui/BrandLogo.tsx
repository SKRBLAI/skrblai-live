import { motion } from 'framer-motion';

interface BrandLogoProps {
  className?: string;
  animate?: boolean;
}

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
        <span className="absolute inset-0 blur-[1.5px] text-teal-400/80 font-black text-2xl tracking-tight select-none pointer-events-none">
          SKRBL
        </span>
        <span className="relative text-white font-black text-2xl tracking-tight animate-pulse-subtle shadow-glow drop-shadow-cosmic">
          SKRBL
        </span>
      </span>
      <span className="relative inline-block font-inter" aria-label="AI logo text">
        {/* AI with matching glow effect */}
        <span className="absolute inset-0 blur-[1.5px] text-teal-400/80 font-black text-2xl tracking-tight select-none pointer-events-none">
          AI
        </span>
        <span className="relative text-teal-400 font-black text-2xl tracking-tight animate-pulse-subtle shadow-glow drop-shadow-cosmic">
          AI
        </span>
      </span>
      <span className="sr-only">SKRBL AI: Cosmic creativity, always on!</span>
    </MotionWrapper>
  );
}
