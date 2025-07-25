'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent } from '@/types/agent';
import PercyAvatar from '../home/PercyAvatar';

interface AgentInputModalProps {
  agent: Agent | null;
  onClose: () => void;
  onSubmit: (input: string) => Promise<void>;
}

export default function AgentInputModal({ agent, onClose, onSubmit }: AgentInputModalProps) {
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  if (!agent) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit(input);
    } catch (error) {
      console.error('Error running agent:', error);
    }
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative max-w-2xl mx-auto mt-20 px-4"
        >
          <div className="glass-card p-6 rounded-xl backdrop-blur-lg border border-sky-500/10">
            <div className="flex items-center mb-6">
              <PercyAvatar size="sm" className="mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
                <p className="text-gray-300 text-sm">{agent.description}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-white font-medium mb-2">Capabilities:</h4>
              <div className="flex flex-wrap gap-2">
                {agent.config?.capabilities?.map((capability, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm bg-sky-500/10 text-teal-400"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`What would you like ${agent.name} to help you with?`}
                className="w-full h-32 p-4 rounded-lg bg-deep-navy/50 border border-sky-500/10 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-colors"
              />
              <div className="flex justify-end gap-4 mt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white font-semibold"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-teal-300 text-deep-navy font-semibold shadow-lg hover:shadow-teal-500/20 disabled:opacity-50"
                >
                  {isLoading ? 'Running...' : 'Run Agent'}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 