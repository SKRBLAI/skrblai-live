import { motion } from 'framer-motion';
import Image from 'next/image';

interface SkillSmithAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: 'w-10 h-10',
  md: 'w-24 h-24',
  lg: 'w-40 h-40',
};

export default function SkillSmithAvatar({ size = 'md', className = '', animate = true }: SkillSmithAvatarProps) {
  return (
    <motion.div
      className={`relative ${sizeClasses[size]} mx-auto mb-6 select-none ${className}`}
      animate={animate ? {
        scale: [1, 1.04, 1],
        filter: 'brightness(1.12) drop-shadow(0 0 24px #FF7F50)',
      } : undefined}
      transition={{ duration: 2.2, repeat: Infinity }}
    >
      {animate && (
        <motion.div
          className="absolute inset-0 rounded-full z-10"
          animate={{
            scale: [1, 1.07, 1],
            boxShadow: [
              '0 0 0px #FF7F50',
              '0 0 32px 6px #FF7F5090',
              '0 0 0px #FF7F50'
            ]
          }}
          transition={{ duration: 3.2, repeat: Infinity }}
        />
      )}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        animate={animate ? { y: [0, 2, -2, 0] } : undefined}
        transition={{ duration: 2.2, repeat: Infinity }}
      >
        <Image
          src="/images/agents-skillsmith-nobg-skrblai.webp"
          alt="SkillSmith Mascot"
          width={96}
          height={96}
          className="object-contain"
          priority
        />
      </motion.div>
    </motion.div>
  );
}
