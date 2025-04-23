import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        'electric-blue': '#1E90FF',
        'teal': '#30D5C8',
        'deep-navy': '#0B132B',
        'soft-gray': '#F7F7F7',
      },
      boxShadow: {
        'neon-blue': '0 0 5px rgba(30, 144, 255, 0.5), 0 0 20px rgba(30, 144, 255, 0.3)',
        'neon-teal': '0 0 5px rgba(48, 213, 200, 0.5), 0 0 20px rgba(48, 213, 200, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(30, 144, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(30, 144, 255, 0.8)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;