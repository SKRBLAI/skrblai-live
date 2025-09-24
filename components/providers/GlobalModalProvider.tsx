'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import ExitIntentModal from '../shared/ExitIntentModal';
import AgentBackstoryModal from '../agents/AgentBackstoryModal';
import { exitIntent } from '@/lib/analytics/track';
import type { SafeAgent } from '@/types/agent';

interface GlobalModalProviderProps {
  children: React.ReactNode;
}

interface AgentModalContextType {
  openAgentBackstory: (agent: SafeAgent) => void;
  closeAgentBackstory: () => void;
  isAgentBackstoryOpen: boolean;
  currentAgent: SafeAgent | null;
}

const AgentModalContext = createContext<AgentModalContextType | undefined>(undefined);

export const useAgentModal = () => {
  const context = useContext(AgentModalContext);
  if (!context) {
    throw new Error('useAgentModal must be used within a GlobalModalProvider');
  }
  return context;
};

export default function GlobalModalProvider({ children }: GlobalModalProviderProps) {
  const [isExitIntentOpen, setIsExitIntentOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isAgentBackstoryOpen, setIsAgentBackstoryOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<SafeAgent | null>(null);
  const pathname = usePathname();

  // Reset trigger state on route change
  useEffect(() => {
    setHasTriggered(false);
    setIsExitIntentOpen(false);
    // Also close agent backstory modal on route change
    setIsAgentBackstoryOpen(false);
    setCurrentAgent(null);
  }, [pathname]);

  // Agent modal handlers
  const openAgentBackstory = useCallback((agent: SafeAgent) => {
    setCurrentAgent(agent);
    setIsAgentBackstoryOpen(true);
  }, []);

  const closeAgentBackstory = useCallback(() => {
    setIsAgentBackstoryOpen(false);
    setCurrentAgent(null);
  }, []);

  // Exit intent detection
  useEffect(() => {
    if (typeof window === 'undefined' || hasTriggered) return;

    // Skip on mobile devices (no reliable mouse exit detection)
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) return;

    // Skip on certain pages
    const skipPages = ['/dashboard', '/agents/', '/auth/', '/api/', '/admin'];
    if (skipPages.some(page => pathname.includes(page))) return;

    let exitIntentTimer: ReturnType<typeof setTimeout>;
    let mouseLeaveTimer: ReturnType<typeof setTimeout>;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving from the top of the viewport
      if (e.clientY <= 0 && e.relatedTarget === null) {
        // Clear any existing timer
        if (mouseLeaveTimer) clearTimeout(mouseLeaveTimer);
        
        // Set a small delay to avoid false triggers
        mouseLeaveTimer = setTimeout(() => {
          if (!hasTriggered && !isExitIntentOpen) {
            setHasTriggered(true);
            setIsExitIntentOpen(true);
            
            // Track exit intent opening
            const vertical = pathname.includes('/sports') ? 'sports' : 'business';
            const offerType = pathname.includes('/pricing') ? 'launch40' : 'exit_capture';
            
            exitIntent.opened({
              page_path: pathname,
              offer_type: offerType,
              vertical
            });
          }
        }, 300);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show for certain high-intent pages
      const highIntentPages = ['/pricing', '/agents', '/sports'];
      if (highIntentPages.some(page => pathname.includes(page)) && !hasTriggered) {
        // Note: Most modern browsers ignore custom messages
        e.preventDefault();
        e.returnValue = '';
        
        // Set a timer to show our modal if they stay
        exitIntentTimer = setTimeout(() => {
          if (!hasTriggered && !isExitIntentOpen) {
            setHasTriggered(true);
            setIsExitIntentOpen(true);
            
            const vertical = pathname.includes('/sports') ? 'sports' : 'business';
            exitIntent.opened({
              page_path: pathname,
              offer_type: 'beforeunload',
              vertical
            });
          }
        }, 1000);
      }
    };

    // Add event listeners
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (exitIntentTimer) clearTimeout(exitIntentTimer);
      if (mouseLeaveTimer) clearTimeout(mouseLeaveTimer);
    };
  }, [pathname, hasTriggered, isExitIntentOpen]);

  // Handle modal close
  const handleCloseExitIntent = useCallback(() => {
    setIsExitIntentOpen(false);
  }, []);

  // Handle lead capture
  const handleLeadCapture = useCallback((email: string) => {
    const vertical = pathname.includes('/sports') ? 'sports' : 'business';
    const offerType = pathname.includes('/pricing') ? 'launch40' : 'exit_capture';
    
    exitIntent.leadCaptured({
      email,
      page_path: pathname,
      offer_type: offerType,
      vertical
    });
    
    console.log('Lead captured via exit intent:', email);
  }, [pathname]);

  const agentModalValue = {
    openAgentBackstory,
    closeAgentBackstory,
    isAgentBackstoryOpen,
    currentAgent
  };

  return (
    <AgentModalContext.Provider value={agentModalValue}>
      {children}
      
      {/* Global Exit Intent Modal */}
      <ExitIntentModal
        isOpen={isExitIntentOpen}
        onClose={handleCloseExitIntent}
        onCapture={handleLeadCapture}
      />
      
      {/* Global Agent Backstory Modal */}
      <AgentBackstoryModal
        agent={currentAgent}
        open={isAgentBackstoryOpen}
        onClose={closeAgentBackstory}
      />
    </AgentModalContext.Provider>
  );
}