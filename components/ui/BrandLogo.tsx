import { motion } from 'framer-motion';

interface BrandLogoProps {
  className?: string;
  animate?: boolean;
}

export default function BrandLogo({ className = '', animate = true }: BrandLogoProps) {
  const MotionWrapper = animate ? motion.span : 'span';
  
  return (
    <MotionWrapper 
      className={`font-cursive ${className}`}
      {...(animate ? { whileHover: { scale: 1.05 } } : {})}
    >
      <span className="bg-gradient-to-r from-teal-400 to-electric-blue bg-clip-text text-transparent glow-teal font-bold tracking-tight">SKRBL</span>
      <span className="text-white ml-1 font-bold tracking-tight">AI</span>
    </MotionWrapper>
  );
}
