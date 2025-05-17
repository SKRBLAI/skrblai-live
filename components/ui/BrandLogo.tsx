import { motion } from 'framer-motion';

interface BrandLogoProps {
  className?: string;
  animate?: boolean;
}

export default function BrandLogo({ className = '', animate = true }: BrandLogoProps) {
  const MotionWrapper = animate ? motion.span : 'span';
  
  return (
    <MotionWrapper 
      className={className}
      {...(animate ? { whileHover: { scale: 1.05 } } : {})}
    >
      <span className="relative inline-block">
        <span className="absolute inset-0 blur-[2px] text-teal-400/50 font-bold tracking-tight font-cursive">SKRBL</span>
        <span className="relative text-teal-400 font-bold tracking-tight font-cursive animate-pulse-subtle">SKRBL</span>
      </span>
      <span className="relative inline-block ml-1">
        <span className="absolute inset-0 blur-[2px] text-white/50 font-bold tracking-tight font-sans">AI</span>
        <span className="relative text-white font-bold tracking-tight font-sans">AI</span>
      </span>
    </MotionWrapper>
  );
}
