'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

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
    leading-tight
    overflow-visible
    ${centered ? 'text-center' : ''}
  `;

  const sizeStyles = {
    1: 'text-4xl md:text-6xl mb-6 leading-tight',
    2: 'text-3xl md:text-5xl mb-4 leading-tight',
    3: 'text-2xl md:text-4xl mb-3 leading-snug'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="no-text-cutoff"
    >
      {React.createElement(
        `h${level}`,
        { className: `${baseStyles} ${sizeStyles[level]} ${className}` },
        children
      )}
    </motion.div>
  );
}
