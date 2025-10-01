const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'electric-blue': '#1E90FF',
        'deep-navy': '#0B132B',
        'teal': '#30D5C8',
        'soft-gray': '#F7F7F7',
        dark: {
          900: 'var(--color-dark-900)',
          800: 'var(--color-dark-800)',
          700: 'var(--color-dark-700)',
        },
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'spin-slow': 'spin 20s linear infinite',
      },
      boxShadow: {
        'glow': '0 0 10px rgba(45, 212, 191, 0.5), 0 0 20px rgba(45, 212, 191, 0.3), 0 0 30px rgba(45, 212, 191, 0.1)',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': {
            opacity: 1
          },
          '50%': {
            opacity: 0.8
          }
        },
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'gradient-y': {
          '0%, 100%': { 'background-position': '50% 0%' },
          '50%': { 'background-position': '50% 100%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-gradient-to-br', 'from-gray-900', 'to-teal-500',
    'animate-fade-in', 'hover:scale-105',
    'transition', 'duration-300', 'glass-card', 'neon-border', 'neon-text',
    'bg-deep-navy', 'bg-electric-blue', 'from-electric-blue', 'to-electric-blue',
    'bg-gradient-to-r', 'from-electric-blue', 'to-teal-500',
    'bg-white/5', 'backdrop-blur-lg', 'rounded-xl', 'border', 'shadow-xl',
    'hover:border-electric-blue/40', 'border-electric-blue', 'shadow-[var(--neon-blue-glow)]',
    'hover:shadow-[var(--neon-teal-glow)]', 'transition-shadow', 'duration-300',
    'bg-transparent', 'border-2', 'border-teal', 'text-teal', 'px-6', 'py-3',
    'rounded-lg', 'font-semibold', 'hover:bg-teal-500/10', 'hover:scale-105',
    'transition-all', 'transform', 'bg-deep-navy/90', 'p-6', 'backdrop-blur-md',
    'border-electric-blue/20', 'shadow-lg', 'bg-white/5', 'backdrop-blur-lg',
    'rounded-xl', 'border-white/10', 'shadow-xl', 'bg-gradient-to-r',
    'from-electric-blue', 'to-teal-500', 'bg-clip-text', 'text-transparent',
    'font-bold', 'transition-all', 'duration-300', 'hover:translate-y-[-5px]',
    'hover:shadow-xl', 'hover:scale-105', 'relative', 'overflow-hidden',
    'rounded-xl', 'border', 'border-2', 'border-electric-blue', 'shadow-[var(--neon-blue-glow)]',
    'hover:shadow-[var(--neon-teal-glow)]', 'transition-shadow', 'duration-300',
    // Add any additional classes you use dynamically or via @apply
  ],
};