'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseExitIntentOptions {
  enabled?: boolean;
  sensitivity?: number;
  delay?: number;
  threshold?: number;
}

export function useExitIntent(options: UseExitIntentOptions = {}) {
  const {
    enabled = true,
    sensitivity = 20,
    delay = 1000,
    threshold = 10
  } = options;

  const [isExitIntent, setIsExitIntent] = useState(false);
  const [hasBeenTriggered, setHasBeenTriggered] = useState(false);
  
  // Check if mobile/tablet
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  
  // Check session storage for already shown
  const hasShownThisSession = typeof window !== 'undefined' && sessionStorage.getItem('exit-intent-shown') === 'true';

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Don't show on mobile or if already shown this session
    if (isMobile || hasShownThisSession) return;
    
    // Don't trigger if user is typing in an input
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return;
    }
    
    // Only trigger if mouse leaves from the top of the page
    if (e.clientY <= 0 && !hasBeenTriggered) {
      setIsExitIntent(true);
      setHasBeenTriggered(true);
      // Mark as shown in session storage
      sessionStorage.setItem('exit-intent-shown', 'true');
    }
  }, [threshold, hasBeenTriggered, isMobile, hasShownThisSession]);

  const handleMouseEnter = useCallback(() => {
    // Reset if user comes back quickly
    if (isExitIntent) {
      setIsExitIntent(false);
    }
  }, [isExitIntent]);

  const resetExitIntent = useCallback(() => {
    setIsExitIntent(false);
  }, []);

  const resetTrigger = useCallback(() => {
    setHasBeenTriggered(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Add a delay before enabling exit intent detection
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('mouseenter', handleMouseEnter);
    }, delay);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [enabled, delay, handleMouseLeave, handleMouseEnter]);

  return {
    isExitIntent,
    hasBeenTriggered,
    resetExitIntent,
    resetTrigger
  };
} 