"use client";
import React, { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import FloatingParticles from '../ui/FloatingParticles';
import CosmicStarfield from '../background/CosmicStarfield';
import AnimatedBackground from '../../app/AnimatedBackground';
import TrialButton from '../ui/TrialButton';
import ExitIntentModal from '../shared/ExitIntentModal';
import { useExitIntent } from '../../hooks/useExitIntent';

type PageLayoutProps = {
  children: ReactNode;
  title?: string;
};

export default function ClientPageLayout({ children, title }: PageLayoutProps) {
  const pathname = usePathname();
  
  // Exit Intent System
  const { isExitIntent, resetExitIntent } = useExitIntent({
    enabled: pathname ? (pathname !== '/sign-up' && pathname !== '/login') : false, // Don't show on auth pages
    delay: 5000, // Wait 5 seconds before enabling
    threshold: 15
  });

  const handleExitCapture = async (email: string) => {
    console.log('Exit intent email captured:', email);
    // Additional tracking/processing can be added here
  };

  return (
    <div className="min-h-screen relative text-white overflow-hidden ClientPageLayout">
      {/* Enhanced Cosmic Starfield Background - Same as homepage */}
      <CosmicStarfield 
        starCount={120}
        parallax={true}
        speed={0.8}
        twinkling={true}
        optimized={true}
        className="z-0"
      />
      
      {/* Enhanced Background Effects - Same as homepage */}
      <div className="absolute inset-0 z-5 opacity-10 sm:opacity-15">
        <FloatingParticles particleCount={18} />
      </div>
      
      {/* Overlay gradients - Same as homepage */}
      <div className="absolute inset-0 z-5 bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.08),transparent)]" />
      <div className="absolute inset-0 z-5 bg-gradient-to-b from-[#0d1117]/60 via-[#0d1117]/80 to-[#0d1117]/90" />

      {/* Main Content - NO container wrapper, let cosmic background show through */}
      <main className="relative z-10 min-h-screen pt-20 sm:pt-24 md:pt-28">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {title && (
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-electric-blue to-teal-500 bg-clip-text text-transparent text-center"
            >
              {title}
            </motion.h1>
          )}
          {/* 3-Day Trial Button — show on all pages except homepage, contact, and dashboard */}
          {pathname && pathname !== "/" && pathname !== "/contact" && !pathname.startsWith("/dashboard") && (
            <div className="flex justify-center py-4">
              <TrialButton />
            </div>
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeInOut' as const }}
              className="relative z-10"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Animated Background - Same as homepage */}
        <AnimatedBackground />
      </main>

      {/* Exit Intent Modal */}
      <ExitIntentModal
        isOpen={isExitIntent}
        onClose={resetExitIntent}
        onCapture={handleExitCapture}
      />
    </div>
  );
}
