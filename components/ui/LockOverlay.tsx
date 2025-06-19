'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function LockOverlay({ badge = 'Pro', tooltip = 'Upgrade to unlock', showBadge = true }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-end justify-between z-30 bg-black/30 backdrop-blur-sm rounded-2xl pointer-events-auto"
      aria-label="Agent locked"
    >
      {/* Badge */}
      {showBadge && (
        <span className="absolute top-3 right-3 bg-gradient-to-r from-fuchsia-500 via-blue-600 to-teal-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/20 select-none" aria-label="Premium Agent">
          {badge}
        </span>
      )}
      {/* Lock Icon Centered */}
      <div className="flex flex-1 items-center justify-center w-full">
        <motion.span
          whileHover={{ scale: 1.12 }}
          className="flex flex-col items-center"
        >
          <Lock size={38} className="text-white/90 drop-shadow-lg mb-1" aria-hidden="true" />
          <span className="text-white/80 text-xs font-semibold mt-1 px-2 py-0.5 rounded bg-black/60 shadow-md animate-pulse" role="tooltip">
            {tooltip}
          </span>
        </motion.span>
      </div>
    </motion.div>
  );
}
