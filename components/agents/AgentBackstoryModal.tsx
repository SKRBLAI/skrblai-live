"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Agent } from '@/types/agent';
import { getAgentImagePath } from '@/utils/agentUtils';

interface AgentBackstoryModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentBackstoryModal({ agent, isOpen, onClose }: AgentBackstoryModalProps) {
  if (!agent) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-gradient-to-br from-slate-900/95 via-purple-900/30 to-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-4xl w-full border-2 border-purple-500/30 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-300 hover:text-white text-3xl focus:outline-none focus:ring-2 focus:ring-purple-400/40 rounded-lg p-1 transition-all duration-200"
              onClick={onClose}
              aria-label="Close backstory"
            >
              ×
            </button>

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              {/* Agent Image */}
              <div className="relative w-48 h-48 md:w-64 md:h-64">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-full animate-pulse blur-xl opacity-50"></div>
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-purple-400/50 shadow-2xl agent-image-container">
                  <Image
                    src={getAgentImagePath(agent)}
                    alt={agent.superheroName || agent.name}
                    fill
                    className="agent-image"
                  />
                </div>
              </div>

              {/* Hero Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent" aria-label="Agent Superhero Name">
                  {agent.superheroName || agent.name}
                </h2>
                <p className="text-xl text-gray-300 mb-4 italic" aria-label="Agent Origin Story">
                  {agent.origin ? `Origin: ${agent.origin}` : `Forged in the cosmic cradle of the SKRBL AI universe, this hero's true beginnings are a swirling mystery!`}
                </p>
                {agent.catchphrase && (
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-400/30" aria-label="Agent Catchphrase">
                    <p className="text-lg font-bold text-purple-300">“{agent.catchphrase}” <span className="ml-2 text-fuchsia-300 animate-pulse">✨</span></p>
                  </div>
                )}
              </div>
            </div>

            {/* Powers Section */}
            {agent.powers && agent.powers.length > 0 && (
              <div className="mb-8 cosmic-glass cosmic-glow rounded-2xl p-6 border-2 border-fuchsia-400/30">
                <h3 className="text-2xl font-bold text-fuchsia-300 mb-4 flex items-center gap-2" aria-label="Superpowers Section">
                  <span className="text-3xl">⚡</span> <span className="uppercase tracking-wider">Superpowers</span>
                  <span className="ml-2 px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-200 text-xs font-bold shadow-[0_0_10px_#e879f9]" title="Certified Cosmic Ability">COSMIC BADGE</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {agent.powers.map((power, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-fuchsia-900/20 rounded-lg border border-fuchsia-500/20 shadow-[0_0_10px_#e879f9]"
                    >
                      <span className="text-fuchsia-400 text-xl" aria-hidden="true">💫</span>
                      <span className="text-gray-100 font-semibold" aria-label={`Superpower: ${power}`}>{power} <span className="ml-1 text-fuchsia-300">★</span></span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Backstory */}
            {agent.backstory && (
              <div className="mb-8 cosmic-glass cosmic-glow rounded-2xl p-6 border-2 border-cyan-400/30">
                <h3 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center gap-2" aria-label="Origin Story Section">
                  <span className="text-3xl">📖</span> <span className="uppercase tracking-wider">Origin Story</span>
                </h3>
                <div className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/20">
                  <p className="text-gray-300 leading-relaxed text-lg" aria-label="Agent Backstory">
                    {agent.backstory ? `${agent.backstory} 🌌` : 'Every hero has a story written in the stars. This one is still unfolding!'}
                  </p>
                </div>
              </div>
            )}

            {/* Weakness & Nemesis */}
            <div className="grid md:grid-cols-2 gap-6">
              {agent.weakness && (
                <div className="p-4 bg-red-900/20 rounded-xl border border-red-500/20">
                  <h4 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2" aria-label="Weakness">
                    <span className="text-2xl">🔻</span> Kryptonite
                  </h4>
                  <p className="text-gray-300">{agent.weakness}</p>
                </div>
              )}

              {agent.nemesis && (
                <div className="p-4 bg-orange-900/20 rounded-xl border border-orange-500/20">
                  <h4 className="text-xl font-bold text-orange-400 mb-2 flex items-center gap-2" aria-label="Nemesis">
                    <span className="text-2xl">👿</span> Arch-Nemesis
                  </h4>
                  <p className="text-gray-300">{agent.nemesis}</p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-8 text-center">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-fuchsia-400/40"
                aria-label="Close and return to main agent grid"
              >
                🚀 Return to Mission Control
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 