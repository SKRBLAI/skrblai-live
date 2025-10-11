'use client';

import PageTransition from '../components/ui/PageTransition';
import PercyProvider from '../components/assistant/PercyProvider';
import { BannerProvider } from '../components/context/BannerContext';
import { AuthProvider } from '../components/context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import GlobalModalProvider from '../components/providers/GlobalModalProvider';
import UnifiedPercyChat from '../components/percy/UnifiedPercyChat';
import type { ReactNode } from "react";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { OnboardingProvider } from '../contexts/OnboardingContext';

export default function ClientLayout({ children }: { children: ReactNode }) {
  // Core state for app
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  // Set mounted on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AuthProvider>
      <PercyProvider>
        <BannerProvider>
          <OnboardingProvider>
            <GlobalModalProvider>
              {/* Global Navigation */}
              <Navbar />

              {/* Main Content */}
              <main id="main-content" className="min-h-screen overflow-x-hidden">
                <div className="pt-safe pb-safe">
                  <div className="relative z-10">
                    <PageTransition>
                      {mounted ? children : (
                        <div className="min-h-screen flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-300">Loading...</p>
                          </div>
                        </div>
                      )}
                    </PageTransition>
                  </div>
                </div>
              </main>

              {/* Site Footer */}
              <Footer />

              {/* Global Percy Chat Widget */}
              <UnifiedPercyChat 
                hideOnRoutes={['/']}
                position="bottom-right"
              />
            </GlobalModalProvider>
          </OnboardingProvider>
        </BannerProvider>
      </PercyProvider>
    </AuthProvider>
  );
}