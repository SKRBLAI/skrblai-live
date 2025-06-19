"use client";
import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import FloatingParticles from '@/components/ui/FloatingParticles';
import TrialButton from '@/components/ui/TrialButton';

type PageLayoutProps = {
  children: ReactNode;
  title?: string;
};

export default function ClientPageLayout({ children, title }: PageLayoutProps) {
  const pathname = usePathname();
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
            {/* 7-Day Trial Button — show on all pages except homepage */}
            {pathname !== "/" && (
              <div className="flex justify-center mb-8">
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
    </div>
  );
}
