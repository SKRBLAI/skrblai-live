'use client';
import React from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import PercyProvider from '../../components/assistant/PercyProvider';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';

import Link from 'next/link';
import TrialButton from '@/components/ui/TrialButton';
import PercyAvatar from '@/components/ui/PercyAvatar';

export default function BrandingPage(): JSX.Element {
  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="relative min-h-screen w-full bg-gradient-to-b from-[#0d1117] to-[#161b22] overflow-x-hidden flex flex-col items-center justify-center">
          <FloatingParticles />
          <div className="absolute right-6 top-6 z-20 hidden md:block">
            <PercyAvatar className="w-20 h-20" />
          </div>
          <div className="max-w-2xl w-full mx-auto mt-24 mb-12">
            <div className="glass-card bg-white/5 backdrop-blur-xl border-2 border-teal-400/20 rounded-2xl shadow-cosmic px-8 py-10 flex flex-col items-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 skrblai-heading drop-shadow-glow">AI Brand Development</h1>
              <p className="text-lg text-gray-300 text-center mb-8">Unleash your brand's potential with SKRBL AI. Design logos, craft your brand voice, and set your visual identity—all with cosmic intelligence.</p>
              <TrialButton className="mt-2 mb-6 w-full max-w-xs" />
              <div className="flex flex-row gap-4 w-full justify-center mt-2">
                <Link href="/" aria-label="Back to Home">
                  <button className="cosmic-btn-secondary px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-fuchsia-500 shadow-cosmic focus:outline-none focus:ring-2 focus:ring-fuchsia-400/70 transition-all">
                    ← Back to Home
                  </button>
                </Link>
                <Link href="/services/agents" aria-label="Meet Percy">
                  <button className="cosmic-btn-secondary px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-400 to-teal-400 shadow-cosmic focus:outline-none focus:ring-2 focus:ring-cyan-400/70 transition-all">
                    Meet Percy
                  </button>
                </Link>
              </div>
              {/* Micro-feedback area for future use (e.g., toast/snackbar) */}
              <div className="mt-6 w-full" aria-live="polite" aria-atomic="true"></div>
            </div>
          </div>
        </div>
      </motion.div>
    </PageLayout>
  );
}
