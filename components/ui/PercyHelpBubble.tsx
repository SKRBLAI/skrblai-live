// Floating Percy Help Bubble for Homepage Discoverability
'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PercyAvatar from '@/components/home/PercyAvatar';

export default function PercyHelpBubble() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const percyUsed = localStorage.getItem('percyOnboardingUsed');
      if (!percyUsed) {
        setTimeout(() => setVisible(true), 1800); // appear after slight delay
      }
      // Listen for onboarding usage
      window.addEventListener('percyOnboardingUsed', () => setVisible(false));
      return () => window.removeEventListener('percyOnboardingUsed', () => setVisible(false));
    }
  }, []);
  if (!visible) return null;
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('openPercyOnboarding'));
    setVisible(false);
    localStorage.setItem('percyOnboardingUsed', '1');
    window.dispatchEvent(new Event('percyOnboardingUsed'));
  };
  return (
    <motion.button
      type="button"
      className="fixed z-50 bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-700/90 to-blue-700/90 border-2 border-cyan-400/50 shadow-xl shadow-cyan-400/30 ring-2 ring-cyan-400/30 hover:ring-4 focus:ring-4 transition-all animate-pulse-slow"
      style={{ outline: 'none' }}
      onClick={handleClick}
      tabIndex={0}
      aria-label="Need help? Ask Percy!"
      initial={{ opacity: 0, scale: 0.7, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7, y: 40 }}
      transition={{ duration: 0.7 }}
    >
      <PercyAvatar size="sm" animate={true} />
      <span className="font-bold text-cyan-200 text-base drop-shadow-glow">Need help? Ask Percy!</span>
    </motion.button>
  );
}
