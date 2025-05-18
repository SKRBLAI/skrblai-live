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
    >
      <span className="relative inline-block font-inter">
        {/* SKRBL with glow effect */}
        <span className="absolute inset-0 blur-[2px] text-teal-400/70 font-black text-2xl tracking-tight">
          SKRBL
        </span>
        <span className="relative text-white font-black text-2xl tracking-tight animate-pulse-subtle shadow-glow">
          SKRBL
        </span>
      </span>
      <span className="relative inline-block font-inter">
        {/* AI with matching glow effect */}
        <span className="absolute inset-0 blur-[2px] text-teal-400/70 font-black text-2xl tracking-tight">
          AI
        </span>
        <span className="relative text-teal-400 font-black text-2xl tracking-tight animate-pulse-subtle shadow-glow">
          AI
        </span>
      </span>
    </MotionWrapper>
  );
}
