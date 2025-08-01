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

      {/* Glow effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <motion.button
        onClick={() => {
          setIsSelected(true);
          setTimeout(() => setIsSelected(false), 200);
          onClick();
        }}
        whileHover={{ 
          scale: 1.08,
          rotateY: 5,
          rotateX: -2,
          z: 50,
          boxShadow: [
            '0 0 40px rgba(48,213,200,0.6)',
            '0 0 60px rgba(48,213,200,0.8), 0 0 100px rgba(99,102,241,0.4)',
            '0 0 40px rgba(48,213,200,0.6)'
          ]
        }}
        whileTap={{ 
          scale: 0.95,
          rotateY: -2,
          rotateX: 1,
          transition: { duration: 0.1 }
        }}
        animate={isSelected ? {
          scale: [1, 1.1, 1],
          boxShadow: [
            '0 0 40px rgba(48,213,200,0.6)',
            '0 0 80px rgba(255,255,255,0.8), 0 0 120px rgba(48,213,200,1)',
            '0 0 40px rgba(48,213,200,0.6)'
          ]
        } : {}}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 25,
          boxShadow: { duration: 0.8 }
        }}
        className={`relative w-full h-32 md:h-36 lg:h-40 rounded-2xl bg-gradient-to-br from-[rgba(21,23,30,0.85)] via-[rgba(30,35,45,0.8)] to-[rgba(21,23,30,0.9)] backdrop-blur-xl border-2 border-teal-400/50 shadow-[0_0_32px_#30d5c8aa,inset_0_1px_0_rgba(255,255,255,0.1)] transition-all flex flex-col items-center justify-center cursor-pointer group-hover:border-teal-300/70 ${className}`}
        style={{ 
          perspective: '1000px', 
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(135deg, rgba(21,23,30,0.85) 0%, rgba(30,35,45,0.8) 50%, rgba(21,23,30,0.9) 100%)'
        }}
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
            className="text-white text-sm md:text-base lg:text-lg font-bold text-center leading-tight tracking-wide px-2"
            style={{
              textShadow: '0 0 12px rgba(48,213,200,0.4), 0 2px 4px rgba(0,0,0,0.8)',
              fontSize: `clamp(0.75rem, 2.5vw, 1rem)`
            }}
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
