import React from 'react'; // Ensures React is available for JSX
import { motion, AnimatePresence } from 'framer-motion';

interface UpsellModalProps {
  agent: { name: string; description: string };
  onClose: () => void;
}

export default function UpsellModal({ agent, onClose }: UpsellModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.33, type: 'spring', stiffness: 180, damping: 20 }}
          className="cosmic-glass cosmic-gradient p-8 rounded-2xl text-white border-2 border-[#30D5C8] shadow-[0_0_32px_#1E90FF80] max-w-md w-full relative"
        >
          <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#1E90FF] text-white text-xs font-bold shadow-[0_0_10px_#1E90FF80] select-none">Premium</span>
          <h2 className="text-2xl font-extrabold mb-2 bg-gradient-to-r from-[#1E90FF] via-[#30D5C8] to-[#1E90FF] bg-clip-text text-transparent drop-shadow-[0_0_10px_#1E90FF] flex items-center gap-2">
            <span role="img" aria-label="rocket">🚀</span> Unlock {agent.name}
          </h2>
          <p className="text-sm mb-4 text-[#30D5C8]">
            This agent is available to <span className="font-bold text-white">SKRBL Premium</span> members. Upgrade now to access advanced workflows like:
          </p>
          <ul className="list-disc list-inside text-sm text-[#30D5C8] mb-4">
            <li>{agent.description}</li>
          </ul>
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => window.location.href = '/pricing'} className="cosmic-btn-primary px-5 py-2 rounded-xl font-bold">See Plans</button>
            <button onClick={onClose} className="cosmic-glass border border-[#30D5C8] px-5 py-2 rounded-xl text-white hover:bg-[#1E90FF20] transition">Not Now</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
