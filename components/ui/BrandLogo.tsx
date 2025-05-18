import { motion } from 'framer-motion';
import { Pacifico } from 'next/font/google';

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

interface BrandLogoProps {
  className?: string;
  animate?: boolean;
}

export default function BrandLogo({ className = '', animate = true }: BrandLogoProps) {
  const MotionWrapper = animate ? motion.span : 'span';
  
  return (
    <MotionWrapper 
      className={`${className} flex items-center`}
      {...(animate ? { whileHover: { scale: 1.05 } } : {})}
    >
      <span className="relative inline-block">
        <span className={`${pacifico.className} text-white text-2xl tracking-wide`}>
          SKRBL
        </span>
      </span>
      <span className="relative inline-block ml-1">
        <span className="absolute inset-0 blur-[2px] text-teal-400/70 font-bold tracking-tight">AI</span>
        <span className="relative text-teal-400 font-bold tracking-tight animate-pulse-subtle shadow-glow">AI</span>
      </span>
    </MotionWrapper>
  );
}
