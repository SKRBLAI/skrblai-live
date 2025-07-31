'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CosmicButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  disabled?: boolean;
  type?: 'submit' | 'button' | 'reset';
  glowColor?: string;
}

export default function CosmicButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  glowColor = 'teal-400'
}: CosmicButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-300';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-glow-sm hover:shadow-glow',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white',
    outline: 'border-2 border-gray-700 hover:border-electric-blue text-gray-300 hover:text-electric-blue',
    accent: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-glow-sm hover:shadow-glow',
    glass: `bg-transparent backdrop-blur-md border-2 border-${glowColor}/70 text-white hover:shadow-[0_0_25px_rgba(45,212,191,0.5),0_0_40px_rgba(56,189,248,0.3)] hover:border-teal-400/90 shadow-[0_0_15px_rgba(45,212,191,0.3),0_0_30px_rgba(56,189,248,0.2)]`
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl font-bold'
  };

  const buttonStyles = cn(`
    ${baseStyles}
    ${variant === 'glass' ? variantStyles.glass : variantStyles[variant]}
    ${sizeStyles[size]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `);

  const motionProps = {
    whileHover: disabled ? {} : { scale: 1.04, perspective: 1000, rotateY: -2, y: variant === 'glass' ? -3 : 0 },
    whileTap: disabled ? {} : { scale: 0.96, perspective: 1000, rotateY: 1 },
    transition: { type: 'spring' as const, stiffness: 350, damping: 25 },
    style: variant === 'glass' ? { background: 'transparent', boxShadow: '0 0 15px rgba(45,212,191,0.3), 0 0 30px rgba(56,189,248,0.2)' } : {}
  };

  if (href) {
    return (
      <Link href={href} passHref>
        <motion.a className={buttonStyles} {...motionProps}>
          {children}
        </motion.a>
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonStyles}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}
