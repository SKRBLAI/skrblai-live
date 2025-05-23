import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface AgentModalProps {
  agent: any | null;
  open: boolean;
  onClose: () => void;
  onTry: (intent: string) => void;
}

export default function AgentModal({ agent, open, onClose, onTry }: AgentModalProps) {
  // Focus trap and demo state
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    closeButtonRef.current?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && focusable && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!agent) return null;
  const isLocked = agent.unlocked === false;
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

  const handleDemo = async () => {
    setDemoLoading(true);
    setDemoResult(null);
    // TODO: Replace with real API/demo logic if available
    setTimeout(() => {
      setDemoResult("This is a sample demo result for " + agent.name + ".");
      setDemoLoading(false);
    }, 1400);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-labelledby="agent-modal-title"
        >
          <motion.div
            ref={modalRef}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="glass-card w-full max-w-md md:max-w-lg p-4 md:p-8 rounded-2xl shadow-2xl relative mx-2"
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
          >
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-teal-400 text-2xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-full w-10 h-10 flex items-center justify-center bg-black/10"
              aria-label="Close modal"
              tabIndex={0}
            >
              ×
            </button>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl select-none" aria-hidden="true">{emoji}</span>
              <div>
                <h2 id="agent-modal-title" className="text-2xl font-bold bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent mb-1">{agent.name}</h2>
                <div className="text-teal-300 font-semibold text-base">{agent.category}</div>
              </div>
            </div>
            <p className="text-gray-300 mb-6">{agent.description}</p>
            {isLocked && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center z-20">
                <span className="text-4xl mb-2">🔒</span>
                <span className="text-white font-bold text-lg">This agent is locked</span>
              </motion.div>
            )}
            <div className="flex flex-col gap-3">
              <button
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold shadow-glow hover:scale-105 hover:shadow-xl transition-all duration-200 disabled:opacity-60"
                onClick={() => onTry(agent.intent || agent.id)}
                disabled={isLocked}
                aria-disabled={isLocked}
              >
                Try Now
              </button>
              <button
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-sky-400 to-teal-300 text-white font-semibold shadow-glow hover:scale-105 hover:shadow-xl transition-all duration-200 disabled:opacity-60"
                onClick={handleDemo}
                disabled={isLocked || demoLoading}
                aria-disabled={isLocked || demoLoading}
              >
                {demoLoading ? (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    Loading Demo...
                  </motion.span>
                ) : demoResult ? "Demo Again" : "Demo / Preview"}
              </button>
              {demoResult && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-black/30 border border-teal-400 rounded-xl p-4 mt-2 text-white shadow-inner">
                  <span className="block font-medium text-teal-300 mb-1">Demo Result:</span>
                  <span className="block text-base">{demoResult}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

