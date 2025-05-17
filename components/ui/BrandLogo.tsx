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
      <span className="text-teal-400 glow-teal">SKRBL</span>
      <span className="text-white ml-1">AI</span>
    </MotionWrapper>
  );
}
