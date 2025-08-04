// Global type declarations for SKRBL AI

// Google Analytics gtag global function
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

// This export is needed to make this file a module
export {};