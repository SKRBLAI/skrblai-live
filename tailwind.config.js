import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
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
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config; 