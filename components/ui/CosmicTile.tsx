'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export interface CosmicTileProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  bullets?: string[];
  footer?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  size?: 'md' | 'lg';
  className?: string;
}

export default function CosmicTile({
  title,
  subtitle,
  badge,
  icon,
  bullets,
  footer,
  onClick,
  href,
  disabled = false,
  size = 'md',
  className = ''
}: CosmicTileProps) {
  const baseClasses = `
    relative group cursor-pointer h-full flex flex-col
    rounded-2xl ring-1 ring-white/10 
    hover:ring-fuchsia-400/40 transition-all duration-300
    backdrop-blur-sm bg-white/0 bg-slate-900/20
    ${size === 'lg' ? 'p-8' : 'p-6'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  const content = (
    <>
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ zIndex: -1 }}
      />
      
      {/* Badge */}
      {badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-white/20 bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse"
          >
            {badge}
          </motion.div>
        </div>
      )}
      
      {/* Icon */}
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-500 shadow-glow group-hover:scale-110 transition-transform">
            {icon}
          </div>
        </div>
      )}
      
      {/* Title - Always centered */}
      <h3 className="text-xl font-bold text-white text-center mb-2 overflow-visible pr-4">
        {title}
      </h3>
      
      {/* Subtitle */}
      {subtitle && (
        <p className="text-sm text-gray-400 text-center mb-4 overflow-visible pr-4">
          {subtitle}
        </p>
      )}
      
      {/* Bullets */}
      {bullets && bullets.length > 0 && (
        <ul className="space-y-2 mb-6 text-left flex-grow overflow-visible" role="list">
          {bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start text-gray-300 text-sm overflow-visible pr-4">
              <span className="mr-2 text-base font-bold text-green-400" aria-hidden="true">
                ✓
              </span>
              <span className="flex-1 leading-tight overflow-visible">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      )}
      
      {/* Footer */}
      {footer && (
        <div className="mt-auto overflow-visible pr-4">
          {footer}
        </div>
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={baseClasses} role="group">
        {content}
      </Link>
    );
  }

  if (onClick && !disabled) {
    return (
      <button 
        onClick={onClick} 
        className={baseClasses}
        disabled={disabled}
        role="group"
        aria-label={`Select ${title}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={baseClasses} role="group">
      {content}
    </div>
  );
}