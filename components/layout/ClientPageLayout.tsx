"use client";
import React, { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import FloatingParticles from '@/components/ui/FloatingParticles';
import TrialButton from '@/components/ui/TrialButton';
import ExitIntentModal from '@/components/shared/ExitIntentModal';
import { useExitIntent } from '@/hooks/useExitIntent';

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
    <div className="relative min-h-screen overflow-hidden bg-[#0d1117]">
      {/* Background Effects - RE-ENABLED FOR PHASE 2 TESTING */}
      <div className="absolute inset-0 z-0 opacity-40">
        <FloatingParticles />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/90 to-[#0d1117]/80" />

      {/* Main Content */}
      <main className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-lg bg-white/5 rounded-2xl shadow-xl border border-white/10 overflow-hidden"
        >
          <div className="p-6 md:p-8 lg:p-10">
            {title && (
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-electric-blue to-teal-500 bg-clip-text text-transparent"
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
          </div>
        </motion.div>
      </main>

      {/* ✨ NEW: Exit Intent Modal */}
      <ExitIntentModal
        isOpen={isExitIntent}
        onClose={resetExitIntent}
        onCapture={handleExitCapture}
      />
    </div>
  );
}
