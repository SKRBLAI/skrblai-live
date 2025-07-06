'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function EmpowermentBanner() {
  const [open, setOpen] = useState<boolean>(false);

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
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed inset-x-4 sm:inset-x-6 md:inset-x-8 bottom-4 z-40 rounded-xl bg-black/70 backdrop-blur-md text-gray-200 flex items-center justify-between px-4 py-3 shadow-lg"
        >
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-5 h-5 text-electric-blue" />
            <span>Need a boost? Try our AI Empowerment tips!</span>
          </div>
          <button onClick={dismiss} aria-label="Close" className="ml-4 text-gray-400 hover:text-gray-200">
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}