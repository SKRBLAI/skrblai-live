"use client";
import { motion, AnimatePresence } from "framer-motion";
import { getAgentEmoji, getAgentImagePath } from '../../utils/agentUtils';
import { SafeAgent } from '../../types/agent';
import React, { useState, useCallback } from "react";
import { submitPercyFeedback } from "../../utils/feedback";

const feedbackMotion = {
  initial: { scale: 1 },
  hover: { scale: 1.1 },
  tap: { scale: 0.95 },
  success: { 
    scale: [1, 1.2, 1],
    transition: { duration: 0.5 }
  }
};

interface AgentModalProps {
  agent: SafeAgent | null;
  open: boolean;
  onClose: () => void;
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const feedbackVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.1 },
  tap: { scale: 0.9 },
  success: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
};

export default function AgentModal({ agent, open, onClose }: AgentModalProps) {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<'up' | 'down' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agentEmoji = getAgentEmoji(agent?.category || '');
  const capabilities = agent?.config?.capabilities || [];

  const handleFeedback = useCallback(async (type: 'up' | 'down') => {
    if (!agent || feedbackSubmitted) return;
    
    setFeedbackSubmitted(type);
    setIsSubmitting(true);
    
    try {
      await submitPercyFeedback(agent.id, `Feedback: ${type === 'up' ? '👍' : '👎'}`);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [agent, feedbackSubmitted]);

  if (!agent) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div 
            className="relative bg-gradient-to-br from-violet-800 via-purple-900 to-indigo-900/80 backdrop-blur-xl bg-opacity-80 border-2 border-teal-400/80 shadow-[0_0_24px_#30D5C8AA] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-transparent text-white/60 hover:text-[#00F0FF] hover:bg-teal-400/20 transition-colors focus:outline-none"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>

            <motion.div 
              className="-mt-16 mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 via-white/80 to-blue-400 shadow-lg flex items-center justify-center border-4 border-white/40 overflow-hidden">
                <img
                  src={getAgentImagePath(agent)}
                  alt={agent.name}
                  className="agent-modal-image agent-image w-20 h-20 object-contain rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '';
                    target.style.display = 'none';
                    // Show emoji fallback when image fails
                    const emoji = document.createElement('span');
                    emoji.className = 'text-4xl drop-shadow-xl';
                    emoji.textContent = getAgentEmoji(agent.category);
                    target.parentElement?.appendChild(emoji);
                  }}
                />
              </div>
            </motion.div>

            <div className="flex justify-between items-start mb-8">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 bg-teal-500/20 text-cyan-300">
                {agent.category}
              </div>
              <h2 className="text-2xl font-bold mb-2 text-[#00F0FF] drop-shadow-glow">
                {agent.name}
              </h2>
              <p className="text-white/90 mb-4">{agent.description}</p>

              {/* Capabilities Section */}
              {capabilities.length > 0 && (
                <div className="w-full mt-6">
                  <motion.h3 
                    className="text-lg font-semibold mb-3 text-cyan-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Capabilities
                  </motion.h3>
                  <motion.ul
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-2"
                  >
                    {capabilities.map((cap: string) => (
                      <motion.li
                        key={cap}
                        variants={itemVariants}
                        className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-teal-500/10 hover:border-teal-500/30 transition-colors"
                      >
                        <span className="text-cyan-300">•</span>
                        <span className="text-white/90">{cap}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              )}

              {/* Feedback Section */}
              <div className="w-full mt-6 flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-full ${
                    feedbackSubmitted === 'up' 
                      ? 'bg-teal-500/30 text-cyan-300' 
                      : 'bg-white/5 text-white/60 hover:text-cyan-300 hover:bg-white/10'
                  } transition-all`}
                  onClick={() => handleFeedback('up')}
                  disabled={isSubmitting || feedbackSubmitted !== null}
                >
                  <span className="text-2xl">👍</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-full ${
                    feedbackSubmitted === 'down' 
                      ? 'bg-red-500/30 text-orange-400' 
                      : 'bg-white/5 text-white/60 hover:text-orange-400 hover:bg-white/10'
                  } transition-all`}
                  onClick={() => handleFeedback('down')}
                  disabled={isSubmitting || feedbackSubmitted !== null}
                >
                  <span className="text-2xl">👎</span>
                </motion.button>
              </div>

              {feedbackSubmitted && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <p className="text-cyan-300 text-sm font-medium">
                    {feedbackSubmitted === 'up' 
                      ? '🎉 Thanks for the positive feedback!'
                      : '🙏 Thanks for your feedback. We\'ll use it to improve.'}
                  </p>
                  {feedbackSubmitted === 'down' && (
                    <div className="mt-3">
                      <textarea
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        placeholder="What could we improve?"
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent"
                        rows={3}
                      />
                      <button
                        className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors"
                        onClick={async () => {
                          if (!feedbackMessage.trim()) return;
                          try {
                            await submitPercyFeedback(agent.id, `Improvement: ${feedbackMessage}`);
                            setFeedbackMessage('');
                          } catch (error) {
                            console.error('Failed to submit feedback:', error);
                          }
                        }}
                      >
                        Send
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Quick Start Section */}
              <div className="w-full mt-8 border-t border-teal-500/20 pt-6">
                <motion.h3 
                  className="text-lg font-semibold mb-4 text-cyan-300"
                  variants={stepVariants}
                  initial="hidden"
                  animate="show"
                >
                  Quick Start
                </motion.h3>
                <motion.div 
                  className="space-y-4"
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div variants={stepVariants} className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg">
                    <span className="text-cyan-300 font-bold">1.</span>
                    <p className="text-sm text-white/90">Click "Launch Agent" to start</p>
                  </motion.div>
                  <motion.div variants={stepVariants} className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg">
                    <span className="text-cyan-300 font-bold">2.</span>
                    <p className="text-sm text-white/90">Describe your goal or upload content</p>
                  </motion.div>
                  <motion.div variants={stepVariants} className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg">
                    <span className="text-cyan-300 font-bold">3.</span>
                    <p className="text-sm text-white/90">Review and refine the generated results</p>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
