'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import agentRegistry from '@/lib/agents/agentRegistry';
import { PercyContext } from '@/components/assistant/PercyProvider';

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
    const agent = agentRegistry.find(agent => agent.intent === intent);
    if (agent?.route) {
      router.push(agent.route);
    } else {
      router.push('/ask-percy?error=not-found');
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

// Named hook for direct routing use
export function usePercyRouter() {
  const { routeToAgent } = usePercyContext();
  return { routeToAgent };
}
