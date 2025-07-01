'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface CosmicBrandLogoProps {
  className?: string;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export default function CosmicBrandLogo({ 
  className = '', 
  animate = true, 
  size = 'md',
  showTagline = true 
}: CosmicBrandLogoProps) {
  const [videoError, setVideoError] = useState(false);
  
  // Size configurations matching your cosmic theme
  const sizeConfig = {
    sm: {
      video: 'w-28 max-h-12 sm:w-32 sm:max-h-14',
      container: 'space-x-2',
      text: 'text-lg',
      tagline: 'text-xs'
    },
    md: {
      video: 'w-36 max-h-16 sm:w-48 sm:max-h-20',
      container: 'space-x-3',
      text: 'text-xl sm:text-2xl',
      tagline: 'text-sm'
    },
    lg: {
      video: 'w-44 max-h-20 sm:w-56 sm:max-h-24',
      container: 'space-x-4',
      text: 'text-2xl sm:text-3xl',
      tagline: 'text-base'
    },
    xl: {
      video: 'w-52 max-h-24 sm:w-64 sm:max-h-28',
      container: 'space-x-4',
      text: 'text-3xl sm:text-4xl',
      tagline: 'text-lg'
    }
  };

  const config = sizeConfig[size];

  const MotionWrapper = animate ? motion.div : 'div';

  return (
    <MotionWrapper
      className={`${className} group relative flex flex-col items-center ${config.container}`}
      {...(animate ? { 
        whileHover: { scale: 1.02 },
        transition: { type: "spring", stiffness: 400, damping: 25 }
      } : {})}
      aria-label="SKRBL AI - Cosmic Creativity, Always On!"
    >
      {/* Cosmic glow background */}
      <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Main logo container */}
      <div className="relative z-10 flex items-center">
        {!videoError ? (
          /* Video Logo with Cosmic Enhancement */
          <div className="relative">
            {/* Cosmic backdrop */}
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-600/10 rounded-lg blur-sm" />
            
            <video
              src="/Static%20assets/newbrandlogo-tagline-skrblai.mp4"
              autoPlay
              loop
              muted
              playsInline
              poster="/Static%20assets/skrblai-brandlogo-tag.png"
              className={`${config.video} h-auto relative z-10 drop-shadow-cosmic transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]`}
              onError={() => setVideoError(true)}
              style={{
                filter: 'brightness(1.1) contrast(1.1) saturate(1.2)',
              }}
            />
            
            {/* Cosmic shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
          </div>
        ) : (
          /* Fallback Text Logo with Cosmic Styling */
          <div className="relative flex items-center gap-1">
            {/* Cosmic backdrop */}
            <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-lg blur-md" />
            
            <div className="relative z-10 flex items-center gap-1">
              {/* SKRBL with cosmic glow */}
              <span className="relative inline-block font-inter">
                <span className="absolute inset-0 blur-[2px] text-cyan-400/80 font-black ${config.text} tracking-tight select-none pointer-events-none">
                  SKRBL
                </span>
                <span className={`relative text-white font-black ${config.text} tracking-tight drop-shadow-cosmic`}>
                  SKRBL
                </span>
              </span>
              
              {/* AI with cosmic glow */}
              <span className="relative inline-block font-inter">
                <span className="absolute inset-0 blur-[2px] text-cyan-400 font-black ${config.text} tracking-tight select-none pointer-events-none">
                  AI
                </span>
                <span className={`relative text-cyan-400 font-black ${config.text} tracking-tight drop-shadow-cosmic animate-pulse-subtle`}>
                  AI
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Cosmic Tagline */}
      {showTagline && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative mt-1"
        >
          {/* Tagline glow backdrop */}
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <span className={`relative font-medium bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent ${config.tagline} tracking-wide drop-shadow-glow`}>
            Cosmic Creativity, Always On!
          </span>
        </motion.div>
      )}

      {/* Subtle cosmic particles effect */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-2 left-2 w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
        <div className="absolute top-4 right-3 w-0.5 h-0.5 bg-blue-400 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-3 left-4 w-0.5 h-0.5 bg-purple-400 rounded-full animate-pulse delay-700" />
      </div>
    </MotionWrapper>
  );
} 