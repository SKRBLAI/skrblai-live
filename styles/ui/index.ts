import { cn } from '../../lib/utils';

/**
 * Standard glassmorphic card styles
 */
export function getCardClass(className?: string) {
  return cn(`
    bg-transparent
    backdrop-blur-xl
    border-2 border-teal-400/70
    rounded-3xl
    shadow-[0_8px_16px_rgba(0,0,0,0.15),0_0_15px_rgba(45,212,191,0.3),0_0_30px_rgba(56,189,248,0.2)]
    hover:shadow-[0_12px_24px_rgba(0,0,0,0.2),0_0_25px_rgba(45,212,191,0.5),0_0_40px_rgba(56,189,248,0.3)]
    hover:border-teal-400/90
    transition-shadow duration-300 ease-out
    p-6 md:p-8
    ${className || ''}
  `);
}

/**
 * Standard glassmorphic button styles
 */
export function getButtonClass(variant: 'primary' | 'secondary' | 'glass' | 'neon' | 'ghost' = 'glass', className?: string) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 px-6 py-3';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-glow-sm hover:shadow-glow',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white',
    glass: 'bg-transparent backdrop-blur-md border-2 border-teal-400/70 text-white hover:shadow-[0_0_25px_rgba(45,212,191,0.5),0_0_40px_rgba(56,189,248,0.3)] hover:border-teal-400/90 shadow-[0_0_15px_rgba(45,212,191,0.3),0_0_30px_rgba(56,189,248,0.2)]',
    neon: 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)]',
    ghost: 'border-2 border-gray-700 hover:border-teal-400 text-gray-300 hover:text-white bg-transparent'
  };

  return cn(`
    ${baseStyles}
    ${variantStyles[variant]}
    ${className || ''}
  `);
}

// Hero card styles
export const heroCard = 'bg-transparent backdrop-blur-xl border-2 border-teal-400/70 rounded-3xl shadow-[0_8px_16px_rgba(0,0,0,0.15),0_0_15px_rgba(45,212,191,0.3),0_0_30px_rgba(56,189,248,0.2)] p-6 md:p-8';

// Typography styles
export const h1ClampStrong = 'text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent';
export const h2ClampSub = 'text-xl md:text-2xl lg:text-3xl text-gray-300 font-medium';

// Button styles
export const btnPrimary = 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl';
export const btnGhost = 'border-2 border-gray-700 hover:border-teal-400 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300';

// Chip styles
export const chip = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30';

// Container styles
export const containerPad = 'px-4 md:px-6 lg:px-8 xl:px-12';

// Re-export cn for convenience
export { cn } from '../../lib/utils';