'use client';

import { motion } from 'framer-motion';

interface PercyButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  secondary?: boolean;
}

export default function PercyButton({ label, onClick, disabled = false, secondary = false }: PercyButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
        disabled 
          ? 'bg-white/10 text-white/50' 
          : secondary
            ? 'bg-white/10 text-white hover:bg-white/20' 
            : 'bg-gradient-to-r from-electric-blue to-teal-400 text-white hover:shadow-lg hover:shadow-electric-blue/20'
      }`}
    >
      {label}
    </motion.button>
  );
} 