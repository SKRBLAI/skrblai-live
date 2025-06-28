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

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger if mouse leaves from the top of the page
    if (e.clientY <= threshold && !hasBeenTriggered) {
      setIsExitIntent(true);
      setHasBeenTriggered(true);
    }
  }, [threshold, hasBeenTriggered]);

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