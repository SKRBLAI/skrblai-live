import React, { useState } from 'react';
import { motion, MotionProps } from 'framer-motion';

export interface ChoiceCardProps extends MotionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
  'data-demo-target'?: string;
  'data-demo-action'?: string;
}

export default function ChoiceCard({ icon, label, onClick, className = '', ...props }: ChoiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <motion.div
      className="relative group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Sparkle particles on hover */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-white rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -20, -40],
                x: [0, Math.sin(i) * 10, Math.sin(i) * 20],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Success particle burst */}
      {showSuccess && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`success-${i}`}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                x: [0, (Math.cos((i / 12) * Math.PI * 2) * 60)],
                y: [0, (Math.sin((i / 12) * Math.PI * 2) * 60)],
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Animated cosmic border */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none z-20 animate-cosmic-border" />
      {/* Glow effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-teal-500/30 rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      
      <motion.button
        onClick={() => {
          setIsSelected(true);
          setShowSuccess(true);
          setTimeout(() => {
            setIsSelected(false);
            setShowSuccess(false);
          }, 800);
          onClick();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsSelected(true);
            setShowSuccess(true);
            setTimeout(() => {
              setIsSelected(false);
              setShowSuccess(false);
            }, 800);
            onClick();
          }
        }}
        role="button"
        aria-label={`Select ${label}`}
        whileHover={{
          scale: 1.13,
          rotateY: 8,
          rotateX: -3,
          z: 80,
          boxShadow: [
            '0 0 64px 12px #30d5c8cc, 0 0 24px 8px #38bdf8cc',
            '0 0 120px 32px #38bdf8cc, 0 0 160px 64px #0fffc4cc',
            '0 0 64px 12px #30d5c8cc'
          ],
          borderColor: '#38bdf8',
        }}
        whileTap={{
          scale: 0.92,
          rotateY: -4,
          rotateX: 2,
          boxShadow: '0 0 80px 24px #0fffc4cc',
          transition: { duration: 0.08 }
        }}
        animate={isSelected ? {
          scale: [1, 1.18, 1.05, 1],
          rotateZ: [0, 3, -2, 0],
          boxShadow: [
            '0 0 80px 24px #ffd700cc, 0 0 160px 64px #30d5c8cc',
            '0 0 120px 32px #38bdf8cc, 0 0 180px 80px #0fffc4cc',
            '0 0 80px 24px #ffd700cc',
            '0 0 64px 12px #30d5c8cc'
          ],
          borderColor: '#ffd700',
        } : {}}
        transition={{
          type: 'spring',
          stiffness: 320,
          damping: 22,
          boxShadow: { duration: 0.8 }
        }}
        className={`relative w-full h-40 md:h-48 lg:h-56 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-900/95 backdrop-blur-2xl border-4 border-cosmic-animate shadow-[0_0_64px_#30d5c8cc,0_0_32px_#38bdf8cc,inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col items-center justify-center cursor-pointer group-hover:border-teal-300/80 ${className} focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/80`}
        style={{
          perspective: '1200px',
          transformStyle: 'preserve-3d'
        }}
        tabIndex={0}
        {...props}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/10 via-transparent to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="relative flex flex-col items-center justify-center h-full space-y-4 z-10">
          <motion.div
            className="text-3xl md:text-4xl lg:text-5xl filter drop-shadow-[0_0_8px_rgba(48,213,200,0.6)]"
            animate={isHovered ? {
              scale: [1, 1.1, 1],
              rotateY: [0, 10, 0],
              filter: [
                'drop-shadow(0 0 8px rgba(48,213,200,0.6))',
                'drop-shadow(0 0 16px rgba(48,213,200,0.9)) drop-shadow(0 0 32px rgba(99,102,241,0.6))',
                'drop-shadow(0 0 8px rgba(48,213,200,0.6))'
              ]
            } : {}}
            transition={{ duration: 0.6 }}
          >
            {icon}
          </motion.div>
          
          <motion.span 
            className="text-white text-sm md:text-base lg:text-lg font-bold text-center leading-tight tracking-wide px-2 shadow-[0_0_12px_rgba(48,213,200,0.4),0_2px_4px_rgba(0,0,0,0.8)]"
            animate={isHovered ? {
              scale: [1, 1.05, 1],
              textShadow: [
                '0 0 12px rgba(48,213,200,0.4), 0 2px 4px rgba(0,0,0,0.8)',
                '0 0 20px rgba(48,213,200,0.8), 0 0 40px rgba(99,102,241,0.4), 0 2px 4px rgba(0,0,0,0.8)',
                '0 0 12px rgba(48,213,200,0.4), 0 2px 4px rgba(0,0,0,0.8)'
              ]
            } : {}}
            transition={{ duration: 0.6 }}
          >
            {label}
          </motion.span>
        </div>
        
        {/* 3D highlight edge */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
      </motion.button>
    </motion.div>
  );
}
