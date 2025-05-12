'use client';
import './globals.css';
import PercyProvider from '@/components/assistant/PercyProvider';
import PercyWidget from '@/components/percy/PercyWidget';
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
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-deep-navy min-h-screen antialiased font-sans">
        <PercyProvider>
          {children}
          {mounted && (
            <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
              {/* Percy Concierge Widget - always visible */}
              <PercyWidget />
            </div>
          )}
        </PercyProvider>
      </body>
    </html>
  );
}
