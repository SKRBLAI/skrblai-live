'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface PercyContextType {
  isOpen: boolean;
  percyIntent: string;
  openPercy: () => void;
  closePercy: () => void;
  setPercyIntent: (intent: string) => void;
}

const PercyContext = createContext<PercyContextType | undefined>(undefined);

export function PercyProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [percyIntent, setPercyIntent] = useState('');

  const openPercy = useCallback(() => setIsOpen(true), []);
  const closePercy = useCallback(() => setIsOpen(false), []);

  return (
    <PercyContext.Provider value={{ isOpen, percyIntent, openPercy, closePercy, setPercyIntent }}>
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
