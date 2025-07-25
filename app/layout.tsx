'use client';
import './globals.css';
import '../styles/components.css';
import '../styles/cosmic-theme.css';
import '../styles/pseudo-3d-effects.css';
import PageTransition from '../components/ui/PageTransition';
import PercyProvider from '../components/assistant/PercyProvider';
import { BannerProvider } from '../components/context/BannerContext';
import { AuthProvider } from '../components/context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CosmicBackground from '../components/ui/CosmicBackground';
import ParticleGlowBackground from '../components/ui/ParticleGlowBackground';
import type { ReactNode } from "react";
import { Inter } from 'next/font/google';
import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { validateHomepageUI } from '../utils/agentUtils';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({ children }: { children: ReactNode }) {
  // Core state for app
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  // Set mounted on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Pages that use ClientPageLayout and should have their own cosmic background
  const clientPageLayoutPages = ['/about', '/features', '/content-automation', '/branding', '/book-publishing', '/academy', '/services', '/contact', '/pricing'];
  const isClientPageLayoutPage = pathname && clientPageLayoutPages.some(page => pathname.startsWith(page));
  const isHomepage = pathname === '/';

  return (
    <html lang="en" className={`${inter.variable} dark overflow-x-hidden`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
        <meta name="theme-color" content="#0d1117" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="cosmic-starfield min-h-screen antialiased font-sans overflow-x-hidden page-layout">
        <AuthProvider>
          <PercyProvider>
            <BannerProvider>
          {/* Global cosmic backgrounds for all pages */}
          <CosmicBackground />
          <ParticleGlowBackground />

          {/* Global Navigation */}
          <Navbar />

          {/* Main Content */}
          <div className="relative z-10">
            <PageTransition>
              {mounted ? children : null}
            </PageTransition>
          </div>

          {/* Site Footer */}
          <Footer />

          {/* Percy Widget removed - now integrated into ConversationalPercyOnboarding */}
                  </BannerProvider>
          </PercyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
