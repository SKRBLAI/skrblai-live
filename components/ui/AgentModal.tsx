"use client";
import { motion, AnimatePresence } from "framer-motion";
import { getAgentEmoji, getAgentImagePath } from '@/utils/agentUtils';
import { Agent } from '@/types/agent';
import React, { useState, useCallback } from "react";
import { submitPercyFeedback } from "@/utils/feedback";

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
  agent: Agent | null;
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
            className="relative bg-gray-900/95 border border-teal-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-teal-400 hover:bg-white/10 focus:outline-none transition-colors"
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
                  className="agent-image w-20 h-20 object-contain rounded-full"
                  style={{ transform: 'scale(0.85)' }}
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
              <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 bg-teal-500/20 text-teal-300">
                {agent.category}
              </div>
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {agent.name}
              </h2>
              <p className="text-gray-300 mb-4">{agent.description}</p>

              {/* Capabilities Section */}
              {capabilities.length > 0 && (
                <div className="w-full mt-6">
                  <motion.h3 
                    className="text-lg font-semibold mb-3 text-teal-400"
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
                        <span className="text-teal-400">•</span>
                        <span className="text-gray-300">{cap}</span>
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
                      ? 'bg-teal-500/30 text-teal-300' 
                      : 'bg-white/5 text-gray-400 hover:text-teal-400 hover:bg-white/10'
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
                      ? 'bg-red-500/30 text-red-300' 
                      : 'bg-white/5 text-gray-400 hover:text-red-400 hover:bg-white/10'
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
                  <p className="text-teal-400 text-sm font-medium">
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
                  className="text-lg font-semibold mb-4 text-teal-400"
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
                    <span className="text-teal-400 font-bold">1.</span>
                    <p className="text-sm text-gray-300">Click "Launch Agent" to start</p>
                  </motion.div>
                  <motion.div variants={stepVariants} className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg">
                    <span className="text-teal-400 font-bold">2.</span>
                    <p className="text-sm text-gray-300">Describe your goal or upload content</p>
                  </motion.div>
                  <motion.div variants={stepVariants} className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg">
                    <span className="text-teal-400 font-bold">3.</span>
                    <p className="text-sm text-gray-300">Review and refine the generated results</p>
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
