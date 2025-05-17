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
import { useState, useEffect } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({ children }: { children: ReactNode }) {
  // Track client-side mounting to prevent hydration errors
  const [mounted, setMounted] = useState(false);
  
  // Use effect to handle client side mounting
  useEffect(() => {
    setMounted(true);
    
    // Check if agentRegistry is properly loaded on the client
    try {
      const { agentRegistry } = require('@/lib/agents/agentRegistry');
      console.log(`[Root Layout] Agent Registry size: ${agentRegistry.length}`);
    } catch (err) {
      console.error('[Root Layout] Failed to load agent registry:', err);
    }
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
          {/* Global Background */}
          <div className="fixed inset-0 z-0">
            <FloatingParticles />
          </div>

          {/* Global Navigation */}
          <Navbar />

          {/* Main Content */}
          <div className="relative z-10">
            <PageTransition>
              {children}
            </PageTransition>
          </div>

          {/* Percy Widget */}
          {mounted && (
            <div className="percy-widget-container fixed bottom-4 right-4 z-50">
              <PercyWidget />
            </div>
          )}
        </PercyProvider>
      </body>
    </html>
  );
}
