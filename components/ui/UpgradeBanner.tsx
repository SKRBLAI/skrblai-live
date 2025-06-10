import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface UpgradeBannerProps {
  headline?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  onDismiss?: () => void;
}

export default function UpgradeBanner({
  headline = '🌟 Unlock "Star" by SKRBL Premium',
  description = ' Access unlimited agents, premium workflows, and priority support. Upgrade now for the full cosmic experience!',
  ctaText = 'See Plans',
  ctaHref = '/pricing',
  onDismiss,
}: UpgradeBannerProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="cosmic-glass cosmic-gradient border-2 border-[#1E90FF] shadow-[0_0_18px_#1E90FF80] rounded-xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 mb-8 relative"
          role="region"
          aria-label="Upgrade to Premium"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block px-3 py-1 rounded-full bg-[#1E90FF] text-white text-xs font-bold shadow-[0_0_10px_#1E90FF80]">Premium</span>
              <span className="text-lg font-extrabold bg-gradient-to-r from-[#1E90FF] via-[#30D5C8] to-[#1E90FF] bg-clip-text text-transparent drop-shadow-[0_0_10px_#1E90FF]">{headline}</span>
            </div>
            <div className="text-[#30D5C8] text-sm font-medium max-w-xl">{description}</div>
          </div>
          <Link href={ctaHref} className="cosmic-btn-primary px-6 py-3 rounded-xl font-bold text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:ring-offset-2">
            {ctaText}
          </Link>
          <button
            className="absolute top-2 right-2 text-white/60 hover:text-white text-lg bg-black/20 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
            aria-label="Dismiss upgrade banner"
            onClick={() => { setVisible(false); if (onDismiss) onDismiss(); }}
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
