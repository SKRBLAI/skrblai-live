'use client';
import './globals.css';
import '../styles/components.css';
import PageTransition from '@/components/ui/PageTransition';
import PercyProvider from '@/components/assistant/PercyProvider';
import PercyWidget from '@/components/percy/PercyWidget';
import Navbar from '@/components/layout/Navbar';
import FloatingParticles from '@/components/ui/FloatingParticles';
import type { ReactNode } from "react";
import { Inter } from 'next/font/google';
import { useState, useEffect, useCallback } from 'react';
import { validateHomepageUI } from '@/utils/agentUtils';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({ children }: { children: ReactNode }) {
  // Core state for app
  const [mounted, setMounted] = useState(false);
  
  // Set mounted on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en" className={`${inter.variable} dark bg-[#0d1117]`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-transparent min-h-screen antialiased font-sans overflow-x-hidden">
        <PercyProvider>
          {/* Global Percy Background */}
          <div className="percy-bg-global" aria-hidden="true" />

          {/* Global Background */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <FloatingParticles />
          </div>

          {/* Global Navigation */}
          <Navbar />

          {/* Main Content */}
          <div className="relative z-10">
            <PageTransition>
              {mounted ? children : null}
            </PageTransition>
          </div>

          {/* Percy Widget */}
          <PercyWidget />
        </PercyProvider>
      </body>
    </html>
  );
}
