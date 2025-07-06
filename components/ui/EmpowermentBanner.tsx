'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// tiny utility component for subtle cosmic particles
function CosmicParticles() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
    >
      {Array.from({ length: 40 }).map((_, i) => (
        <circle
          key={i}
          cx={Math.random() * 100}
          cy={Math.random() * 10}
          r={Math.random() * 0.6 + 0.2}
          fill="url(#g)"
        />
      ))}
      <defs>
        <radialGradient id="g">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function EmpowermentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('hideCoachBanner') === 'true') return;
    const timer = setTimeout(() => setOpen(true), 3000); // delay show
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setOpen(false);
    sessionStorage.setItem('hideCoachBanner', 'true');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed inset-x-4 sm:inset-x-6 md:inset-x-8 bottom-4 z-40 rounded-xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md text-gray-200 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 shadow-[0_2px_8px_rgba(0,0,0,0.4)] overflow-hidden"
        >
          {/* cosmic subtle particles */}
          <CosmicParticles />
          <div className="flex items-center gap-2 text-xs sm:text-sm relative z-10">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-electric-blue animate-pulse" />
            <span className="whitespace-nowrap">Need a boost? Try our AI Empowerment tips!</span>
          </div>
          <button
            onClick={dismiss}
            aria-label="Close"
            className="ml-3 sm:ml-4 text-gray-400 hover:text-gray-200 focus:outline-none"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}