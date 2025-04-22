'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/router';

interface PercyContextType {
  isOpen: boolean;
  percyIntent: string;
  openPercy: () => void;
  closePercy: () => void;
  setPercyIntent: (intent: string) => void;
  routeToAgent: (intent: string) => void;
}

const PercyContext = createContext<PercyContextType | undefined>(undefined);

export function PercyProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [percyIntent, setPercyIntent] = useState('');
  const router = useRouter();

  const openPercy = useCallback(() => setIsOpen(true), []);
  const closePercy = useCallback(() => setIsOpen(false), []);
  const routeToAgent = useCallback((intent: string) => {
    setPercyIntent(intent);
    switch (intent) {
      case 'book-publishing':
        router.push('/services/book-publishing');
        break;
      case 'branding':
        router.push('/services/branding');
        break;
      case 'content-automation':
        router.push('/services/content-automation');
        break;
      case 'web-creation':
        router.push('/services/website-creation');
        break;
      default:
        router.push('/ask-percy');
    }
  }, [router]);

  return (
    <PercyContext.Provider value={{ isOpen, percyIntent, openPercy, closePercy, setPercyIntent, routeToAgent }}>
      {children}
    </PercyContext.Provider>
  );
}

export function usePercyContext() {
  const context = useContext(PercyContext);
  if (context === undefined) {
    throw new Error('usePercyContext must be used within a PercyProvider');
  }
  return context;
}
