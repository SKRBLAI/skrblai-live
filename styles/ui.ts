// styles/ui.ts — design tokens (merged)
export const btnPrimary   = 'inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold bg-gradient-to-r from-violet-500 to-emerald-400 text-white hover:opacity-90 transition';
export const btnGhost     = 'inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition';
export const cardBase     = 'rounded-3xl border border-white/10 bg-black/30 backdrop-blur';
export const cardGlass    = 'rounded-3xl border border-white/10 bg-white/5 backdrop-blur';
export const cardNeon     = 'rounded-3xl border border-emerald-400/30 bg-emerald-400/5 shadow-[0_0_40px_-10px_rgba(16,185,129,.6)]';
export const containerPad = 'px-4 sm:px-6 lg:px-8';

// Fluid type + hero helpers
export const h1ClampStrong = 'text-[clamp(1.8rem,4.6vw,3.2rem)] font-extrabold leading-tight';
export const h2ClampSub    = 'text-[clamp(1rem,2.6vw,1.25rem)] text-white/70 leading-relaxed';
export const chip          = 'rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] md:text-sm backdrop-blur';
export const heroCard      = 'rounded-3xl border border-white/10 bg-black/30 shadow-[0_0_40px_-10px_rgba(0,255,120,0.25)]';

export const colors = {
  // SDM Brand Colors
  neonGreen: '#39FF14',
  neonGreenRgb: '57, 255, 20',
  darkBg: '#0a0a0a',
  glassBg: 'rgba(15, 23, 42, 0.8)',
  glassAccent: 'rgba(30, 41, 59, 0.9)',
  
  // Glassmorphic backgrounds
  glass: {
    primary: 'rgba(15, 23, 42, 0.8)',
    secondary: 'rgba(30, 41, 59, 0.7)',
    accent: 'rgba(51, 65, 85, 0.6)',
    hover: 'rgba(71, 85, 105, 0.5)',
  },
  
  // Borders
  border: {
    primary: 'rgba(148, 163, 184, 0.2)',
    accent: 'rgba(57, 255, 20, 0.3)',
    hover: 'rgba(57, 255, 20, 0.5)',
  }
};

export const shadows = {
  glow: `0 0 20px rgba(${colors.neonGreenRgb}, 0.3)`,
  glowHover: `0 0 30px rgba(${colors.neonGreenRgb}, 0.5)`,
  glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
  glassHover: '0 12px 40px rgba(0, 0, 0, 0.4)',
};

// Shared button styles
export const buttonStyles = {
  btnPrimary: `
    px-6 py-3 
    bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 
    hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500
    text-white font-semibold rounded-xl
    border border-transparent
    shadow-lg hover:shadow-xl
    transition-all duration-300
    backdrop-blur-sm
  `,
  
  btnGhost: `
    px-6 py-3
    bg-transparent
    border border-slate-400/30 hover:border-green-400/50
    text-slate-300 hover:text-green-400
    font-medium rounded-xl
    backdrop-blur-sm
    transition-all duration-300
    hover:bg-green-400/10
  `,
  
  btnNeon: `
    px-6 py-3
    bg-gradient-to-r from-green-500/20 to-emerald-500/20
    border border-green-400/50 hover:border-green-400/80
    text-green-400 hover:text-green-300
    font-semibold rounded-xl
    backdrop-blur-sm
    transition-all duration-300
    hover:bg-green-400/20
    hover:shadow-[0_0_20px_rgba(57,255,20,0.3)]
  `
};

// Shared card styles
export const cardStyles = {
  cardBase: `
    bg-gradient-to-br from-slate-900/80 via-purple-900/20 to-slate-900/80
    backdrop-blur-xl rounded-2xl
    border border-purple-400/30
    shadow-[0_0_40px_rgba(147,51,234,0.15)]
    hover:border-blue-400/50
    transition-all duration-300
  `,
  
  cardGlass: `
    bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60
    backdrop-blur-xl rounded-2xl
    border border-slate-400/20
    shadow-lg
    hover:border-green-400/30
    transition-all duration-300
  `,
  
  cardNeon: `
    bg-gradient-to-br from-slate-900/80 via-green-900/10 to-slate-900/80
    backdrop-blur-xl rounded-2xl
    border border-green-400/30
    shadow-[0_0_30px_rgba(57,255,20,0.15)]
    hover:border-green-400/50
    transition-all duration-300
  `
};

// Animation utilities
export const animations = {
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  },
  
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8 }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6 }
  }
};

// Text styles
export const textStyles = {
  heading: 'text-white font-bold',
  subheading: 'text-slate-300 font-medium',
  body: 'text-slate-400',
  accent: 'text-green-400',
  gradient: 'bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent'
};

// Utility functions
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const getButtonClass = (variant: 'primary' | 'ghost' | 'neon' = 'primary'): string => {
  switch (variant) {
    case 'ghost':
      return buttonStyles.btnGhost;
    case 'neon':
      return buttonStyles.btnNeon;
    default:
      return buttonStyles.btnPrimary;
  }
};

export const getCardClass = (variant: 'base' | 'glass' | 'neon' = 'base'): string => {
  switch (variant) {
    case 'glass':
      return cardStyles.cardGlass;
    case 'neon':
      return cardStyles.cardNeon;
    default:
      return cardStyles.cardBase;
  }
};