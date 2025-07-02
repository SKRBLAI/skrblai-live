import React from 'react';

interface SkrblAiTextProps {
  variant?: 'static' | 'glow' | 'pulse' | 'gradient' | 'premium' | 'wave';
  size?: 'inherit' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  children?: React.ReactNode;
  className?: string;
}

const SkrblAiText: React.FC<SkrblAiTextProps> = ({
  variant = 'static',
  size = 'inherit',
  children = 'SKRBL AI',
  className = ''
}) => {
  // Context-aware sizing - inherit means it matches parent font-size
  const sizeClasses = {
    inherit: '', // Inherits parent font-size completely
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl'
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'glow':
        return `
          bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500
          bg-clip-text text-transparent
          drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]
          animate-pulse-subtle
        `;
      case 'pulse':
        return `
          bg-gradient-to-r from-electric-blue to-teal-400
          bg-clip-text text-transparent
          animate-pulse-slow
        `;
      case 'wave':
        return `
          bg-gradient-to-r from-blue-400 via-cyan-400 via-purple-400 to-blue-400
          bg-clip-text text-transparent
          bg-[length:200%_100%]
          animate-gradient-wave
        `;
      case 'gradient':
        return `
          bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600
          bg-clip-text text-transparent
          bg-[length:200%_100%]
          animate-gradient-shift
        `;
      case 'premium':
        return `
          bg-gradient-to-r from-yellow-300 via-cyan-300 via-blue-400 to-purple-500
          bg-clip-text text-transparent
          bg-[length:300%_100%]
          animate-premium-shine
          drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]
          filter drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]
        `;
      default:
        return `
          bg-gradient-to-r from-electric-blue to-teal-400
          bg-clip-text text-transparent
        `;
    }
  };

  return (
    <span 
      className={`
        font-bold tracking-wide inline-block
        ${size === 'inherit' ? '' : sizeClasses[size]} 
        ${getVariantClasses()} 
        ${className}
      `}
      style={size === 'inherit' ? { fontSize: 'inherit', lineHeight: 'inherit' } : {}}
    >
      {children}
    </span>
  );
};

export default SkrblAiText; 