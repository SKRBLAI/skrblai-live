"use client";
import { motion, AnimatePresence } from "framer-motion";
import getAgentEmoji from './AgentCard'; // Import the emoji helper
import { Agent } from '@/types/agent';
import React from "react";

interface AgentModalProps {
  agent: Agent | null;
  open: boolean;
  onClose: () => void;
}

export default function AgentModal({ agent, open, onClose }: AgentModalProps) {
  if (!agent) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 flex flex-col items-center"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="absolute top-4 right-4 text-xl text-gray-400 hover:text-teal-400 focus:outline-none"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
            <div className="-mt-16 mb-4">
  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 via-white/80 to-blue-400 shadow-lg flex items-center justify-center border-4 border-white/40 overflow-hidden">
    {('avatar' in agent && agent.avatar) || ('image' in agent && agent.image) ? (
      <img
        src={(agent as any).avatar || (agent as any).image}
        alt={agent.name}
        className="w-20 h-20 object-cover rounded-full"
        onError={e => (e.currentTarget.style.display = 'none')}
      />
    ) : (
      <span className="text-4xl drop-shadow-xl">{getAgentEmoji(agent.category)}</span>
    )}
  </div>
</div>
            <div className="text-center">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300">
                {agent.category}
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{agent.name}</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{agent.description}</p>
              {(agent.capabilities || agent.config?.capabilities) && (
  <motion.ul
    className="text-left mb-4 space-y-2"
    initial="hidden"
    animate="visible"
    variants={{
      visible: { transition: { staggerChildren: 0.13 } },
      hidden: {}
    }}
  >
    {(agent.capabilities || agent.config?.capabilities)?.map((cap: string, i: number) => (
      <motion.li
        key={i}
        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: i * 0.13 }}
      >
        <span className="text-teal-400">•</span> {cap}
      </motion.li>
    ))}
  </motion.ul>
)}
              <motion.button
                className="mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-teal-400 to-blue-500 text-white font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-300/40"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
                type="button"
              >
                Launch Agent
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
