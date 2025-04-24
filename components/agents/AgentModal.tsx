import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect } from "react";
import agentRegistry from "@/lib/agents/agentRegistry";

interface AgentModalProps {
  agentId: string | null;
  open: boolean;
  onClose: () => void;
  onTry: (intent: string) => void;
}

export default function AgentModal({ agentId, open, onClose, onTry }: AgentModalProps) {
  const agent = agentRegistry.find(a => a.id === agentId);
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!agent) return null;
  const emoji = {
    "Brand Development": "🎨",
    "Ebook Creation": "📚",
    "Paid Marketing": "💸",
    "Business Intelligence": "📊",
    "Strategy & Growth": "🚀",
    "Support Automation": "🤖",
    "Sales Enablement": "📈",
    "Short-Form Video": "🎬",
    "Copywriting": "✍️",
    "Automation": "⚡",
    "Social Media Automation": "📱",
    "Web Automation": "🌐",
    "Back Office": "💼",
    "Concierge": "🤖",
    "Orchestration": "🔗",
  }[agent.category] || "🤖";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="glass-card max-w-md w-full p-8 rounded-2xl shadow-2xl relative"
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-teal-400 text-2xl font-bold focus:outline-none"
              aria-label="Close modal"
            >
              ×
            </button>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{emoji}</span>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent mb-1">{agent.name}</h2>
                <div className="text-teal-300 font-semibold text-base">{agent.category}</div>
              </div>
            </div>
            <p className="text-gray-300 mb-6">{agent.description}</p>
            <button
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold shadow-glow hover:scale-105 hover:shadow-xl transition-all duration-200"
              onClick={() => onTry(agent.intent || agent.id)}
            >
              Try Now
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
