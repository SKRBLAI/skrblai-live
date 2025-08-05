import React, { CSSProperties } from 'react';
import { motion } from 'framer-motion';

export interface CardBaseProps {
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  ariaLabel?: string;
}

const CardBase: React.FC<CardBaseProps> = ({ className = '', style, children, onClick, ariaLabel }) => (
  <motion.div
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    aria-label={ariaLabel} style={style}
    whileHover={onClick ? { y: -8, scale: 1.02, boxShadow: '0 0 48px rgba(99,102,241,0.15)' } : {}}
    whileTap={onClick ? { scale: 0.98 } : {}}
    className={`cosmic-glass cosmic-gradient cosmic-glow rounded-2xl p-8 border-2 border-[#30D5C8] shadow-[0_0_32px_#a21caf40] transition-all duration-300 cursor-pointer ${className}`}
  >
    {children}
  </motion.div>
);

export default CardBase;
