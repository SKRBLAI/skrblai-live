'use client';

import { motion } from 'framer-motion';
import { ReactNode, JSX } from 'react';

interface CosmicHeadingProps {
  children: ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
  centered?: boolean;
}

export default function CosmicHeading({ 
  children, 
  className = '', 
  level = 1,
  centered = true 
}: CosmicHeadingProps) {
  const baseStyles = `
    font-extrabold
    bg-gradient-to-r
    from-electric-blue
    to-teal-400
    bg-clip-text
    text-transparent
    ${centered ? 'text-center' : ''}
  `;

  const sizeStyles = {
    1: 'text-4xl md:text-6xl mb-6',
    2: 'text-3xl md:text-5xl mb-4',
    3: 'text-2xl md:text-4xl mb-3'
  };

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <HeadingTag className={`${baseStyles} ${sizeStyles[level]} ${className}`}>
        {children}
      </HeadingTag>
    </motion.div>
  );
}
