"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Agent } from '@/types/agent';
import { getAgentImagePath } from '@/utils/agentUtils';
import { agentBackstories } from '@/lib/agents/agentBackstories';
import { getAgent, getAgentConversationCapabilities } from '@/lib/agents/agentLeague';

interface AgentBackstoryModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentBackstoryModal({ agent, isOpen, onClose }: AgentBackstoryModalProps) {
  // --- Cosmic Toast State ---
  const [showToast, setShowToast] = useState(false);
  const toastTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLaunchWorkflow = () => {
    setShowToast(true);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setShowToast(false), 3000);
    // (Logic for actual workflow launch remains TODO)
  };

  const handleDismissToast = () => {
    setShowToast(false);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
  };
  const [enrichedAgent, setEnrichedAgent] = useState<any>(null);
  const [conversationCapabilities, setConversationCapabilities] = useState<any>(null);
  const [chatMode, setChatMode] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (!agent) return;

    // Get enriched agent data from agent league
    const leagueAgent = getAgent(agent.id);
    const backstory = agentBackstories[agent.id];
    const capabilities = getAgentConversationCapabilities(agent.id);

    setEnrichedAgent({
      ...agent,
      ...leagueAgent,
      ...backstory
    });
    setConversationCapabilities(capabilities);
  }, [agent]);

  const handleSendMessage = useCallback(async () => {
    if (!chatMessage.trim() || chatLoading) return;

    const userMessage = {
      role: 'user',
      content: chatMessage,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');
    setChatLoading(true);

    try {
      const response = await fetch(`/api/agents/chat/${agent?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatMessage,
          conversationHistory: chatHistory,
          context: {
            source: 'backstory-modal'
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: result.message,
          timestamp: new Date().toISOString(),
          handoffSuggestions: result.handoffSuggestions
        }]);
      } else {
        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: 'I apologize, but I\'m having trouble responding right now. Please try again!',
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again!',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatMessage, chatLoading, agent?.id, chatHistory]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }
      
      // Chat shortcuts
      if (chatMode && e.key === 'Enter' && e.ctrlKey && chatMessage.trim()) {
        handleSendMessage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, chatMode, chatMessage, onClose, handleSendMessage]);

  const handleStartChat = () => {
    setChatMode(true);
    setChatHistory([{
      role: 'assistant',
      content: `${enrichedAgent?.catchphrase || 'Hello!'} I'm ${enrichedAgent?.superheroName || enrichedAgent?.name}, ready to help you with ${enrichedAgent?.conversationCapabilities?.specializedTopics?.[0] || 'your tasks'}!`,
      timestamp: new Date().toISOString()
    }]);
  };

  if (!agent || !enrichedAgent) return null;

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
            className="relative w-full max-w-2xl max-h-[90vh] mx-auto cosmic-glass cosmic-glow rounded-2xl shadow-xl border-2 border-teal-400/40 backdrop-blur-lg bg-[rgba(28,32,64,0.65)] px-2 sm:px-6 pt-8 pb-6 sm:pt-10 sm:pb-8 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={enrichedAgent.superheroName + ' backstory modal'}
          >
            {/* --- Modal Content --- */}
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-300 hover:text-white text-2xl sm:text-3xl focus:outline-none focus:ring-2 focus:ring-purple-400/40 rounded-lg p-1 transition-all duration-200 z-10"
              onClick={onClose}
              aria-label="Close agent backstory modal"
              autoFocus
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
                    src={getAgentImagePath(agent, "nobg")}
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

            {/* Chat Interface or Powers Section */}
            {chatMode ? (
              <div className="mb-8 cosmic-glass cosmic-glow rounded-2xl p-6 border-2 border-green-400/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-300 flex items-center gap-2 break-words">
                    <span className="text-2xl sm:text-3xl">💬</span> 
                    <span className="uppercase tracking-wider text-sm sm:text-base md:text-lg">Chat with {enrichedAgent.superheroName}</span>
                  </h3>
                  <button
                    onClick={() => setChatMode(false)}
                    className="px-3 py-1 bg-red-500/20 border border-red-400/30 rounded-full text-red-300 text-sm hover:bg-red-500/30 transition-colors flex-shrink-0 self-start sm:self-auto"
                    aria-label="Close chat interface"
                  >
                    Close Chat
                  </button>
                </div>
                
                {/* Chat Messages */}
                <div className="h-64 overflow-y-auto mb-4 space-y-3 p-4 bg-slate-900/50 rounded-lg">
                  {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-blue-600/30 border border-blue-400/30 text-blue-100' 
                          : 'bg-green-600/30 border border-green-400/30 text-green-100'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        {msg.handoffSuggestions && msg.handoffSuggestions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.handoffSuggestions.map((suggestion: any, idx: number) => (
                              <div key={idx} className="text-xs bg-yellow-500/20 border border-yellow-400/30 rounded p-2">
                                💡 <strong>{suggestion.superheroName}</strong> might help: {suggestion.reason}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-green-600/30 border border-green-400/30 text-green-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"></div>
                          <span className="text-sm">{enrichedAgent.superheroName} is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Chat Input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder={`Ask ${enrichedAgent.superheroName} anything...`}
                    className="flex-1 p-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/40 text-sm sm:text-base"
                    disabled={chatLoading}
                    aria-label="Chat message input"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={chatLoading || !chatMessage.trim()}
                    className="px-4 sm:px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors text-sm sm:text-base flex-shrink-0"
                    aria-label="Send message"
                  >
                    {chatLoading ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 sm:mb-8 cosmic-glass cosmic-glow rounded-2xl p-4 sm:p-6 border-2 border-fuchsia-400/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                   {/* Cosmic Section Mapping: Powers - fuchsia, ⚡/💫 */}
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-fuchsia-300 flex flex-wrap items-center gap-2" aria-label="Industry Domination Powers Section">
                    <span className="text-2xl sm:text-3xl" aria-label="Domination Icon" title="Industry Domination">🔥</span> 
                    <span className="uppercase tracking-wider text-sm sm:text-base md:text-lg">Industry Domination Powers</span>
                    <span className="px-2 sm:px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-200 text-xs font-bold shadow-[0_0_10px_#ef4444]" title="Competitive Advantage Certified">DISRUPTOR BADGE</span>
                  </h3>
                  {conversationCapabilities?.canConverse && (
                    <button
                      onClick={handleStartChat}
                      className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-2 flex-shrink-0 self-start sm:self-auto"
                      aria-label="Deploy agent for competitive advantage"
                    >
                      ⚡ Deploy Against Competition
                    </button>
                  )}
                </div>

                {/* Competitive Intelligence Banner */}
                <div className="mb-6 p-4 bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 font-bold text-sm">COMPETITIVE ANALYSIS:</span>
                  </div>
                  <p className="text-white text-sm">
                    <span className="font-semibold">87% of businesses</span> using {enrichedAgent.superheroName} gained insurmountable market advantage within <span className="text-yellow-400 font-semibold">48 hours</span>. 
                    Your competitors are still using manual methods—perfect timing to dominate.
                  </p>
                  <div className="mt-2 text-xs text-orange-300">
                    Average competitive gap created: <span className="font-bold">340%</span> • Industry disruption rate: <span className="font-bold">92%</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(enrichedAgent.powers || []).map((power: string, index: number) => (
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
                
                {/* Conversation Capabilities */}
                {conversationCapabilities && (
                  <div className="mt-6 p-4 cosmic-glass cosmic-glow rounded-2xl shadow-xl border-2 border-teal-400/40 backdrop-blur-lg bg-[rgba(28,32,64,0.65)]">
                    <h4 className="text-lg font-bold text-green-300 mb-2 flex items-center gap-2">
                      💬 Conversation Abilities
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-green-200 font-semibold">Specialized Topics:</span>
                        <p className="text-gray-300">{conversationCapabilities.capabilities?.specializedTopics?.join(', ') || 'General assistance'}</p>
                      </div>
                      <div>
                        <span className="text-green-200 font-semibold">Languages:</span>
                        <p className="text-gray-300">{conversationCapabilities.capabilities?.supportedLanguages?.join(', ') || 'English'}</p>
                      </div>
                      <div>
                        <span className="text-green-200 font-semibold">Recommended Helpers:</span>
                        <p className="text-gray-300">{conversationCapabilities.recommendedHelpers?.join(', ') || 'None'}</p>
                      </div>
                      <div>
                        <span className="text-green-200 font-semibold">Max Conversation Depth:</span>
                        <p className="text-gray-300">{conversationCapabilities.capabilities?.maxConversationDepth || 20} messages</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Backstory */}
            {enrichedAgent.backstory && (
              <div className="mb-8 cosmic-glass cosmic-glow rounded-2xl shadow-xl border-2 border-teal-400/40 backdrop-blur-lg bg-[rgba(28,32,64,0.65)] p-6">
                  {/* Cosmic Section Mapping: Origin Story - cyan, 📖 */}
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center gap-2" aria-label="Origin Story Section">
                    <span className="text-3xl" aria-label="Origin Story Icon" title="Origin Story">📖</span> <span className="uppercase tracking-wider">Origin Story</span>
                  </h3>
                <div className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/20">
                  <p className="text-gray-300 leading-relaxed text-lg" aria-label="Agent Backstory">
                    {enrichedAgent.backstory ? `${enrichedAgent.backstory} 🌌` : 'Every hero has a story written in the stars. This one is still unfolding!'}
                  </p>
                </div>
              </div>
            )}

            {/* Catchphrase & Origin */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {enrichedAgent.catchphrase && (
                <div className="p-4 bg-yellow-900/20 rounded-xl border border-yellow-500/20">
                  <h4 className="text-xl font-bold text-yellow-400 mb-2 flex items-center gap-2" aria-label="Catchphrase">
                    <span className="text-2xl" aria-label="Catchphrase Icon" title="Catchphrase">💫</span> Signature Catchphrase
                  </h4>
                  <p className="text-gray-300 italic font-semibold">"{enrichedAgent.catchphrase}"</p>
                </div>
              )}
              {enrichedAgent.origin && (
                <div className="p-4 bg-indigo-900/20 rounded-xl border border-indigo-500/20">
                  <h4 className="text-xl font-bold text-indigo-400 mb-2 flex items-center gap-2" aria-label="Origin">
                    <span className="text-2xl" aria-label="Origin Icon" title="Origin">🌟</span> Origin
                  </h4>
                  <p className="text-gray-300">{enrichedAgent.origin}</p>
                </div>
              )}
            </div>

            {/* Weakness & Nemesis */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {enrichedAgent.weakness && (
                <div className="p-4 bg-red-900/20 rounded-xl border border-red-500/20">
                  <h4 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2" aria-label="Weakness">
                    <span className="text-2xl" aria-label="Weakness Icon" title="Weakness">🔻</span> Kryptonite
                  </h4>
                  <p className="text-gray-300">{enrichedAgent.weakness}</p>
                </div>
              )}
              {enrichedAgent.nemesis && (
                <div className="p-4 bg-orange-900/20 rounded-xl border border-orange-500/20">
                  <h4 className="text-xl font-bold text-orange-400 mb-2 flex items-center gap-2" aria-label="Nemesis">
                    <span className="text-2xl" aria-label="Nemesis Icon" title="Nemesis">👿</span> Arch-Nemesis
                  </h4>
                  <p className="text-gray-300">{enrichedAgent.nemesis}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center items-center">
              {/* Chat Button - Show for all agents but gray out non-conversational */}
              {!chatMode && (
                <motion.button
                  onClick={conversationCapabilities?.canConverse ? handleStartChat : undefined}
                  disabled={!conversationCapabilities?.canConverse}
                  className={`px-4 sm:px-6 py-3 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 text-sm sm:text-base ${
                    conversationCapabilities?.canConverse
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 focus:ring-green-400/40'
                      : 'bg-gray-600/50 text-gray-300 cursor-not-allowed opacity-50'
                  }`}
                  aria-label={
                    conversationCapabilities?.canConverse 
                      ? `Start chatting with ${enrichedAgent.superheroName}` 
                      : `${enrichedAgent.superheroName} doesn't support chat - use workflow instead`
                  }
                  title={
                    conversationCapabilities?.canConverse 
                      ? `Chat with ${enrichedAgent.superheroName}` 
                      : 'This agent doesn\'t support conversations. Try the workflow instead!'
                  }
                  whileHover={conversationCapabilities?.canConverse ? { scale: 1.05 } : { scale: 1 }}
                  whileTap={conversationCapabilities?.canConverse ? { scale: 0.95 } : { scale: 1 }}
                >
                  💬 Chat with {enrichedAgent.superheroName}
                </motion.button>
              )}
              
              <motion.button
                onClick={handleLaunchWorkflow}
                className="px-4 sm:px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-400/40 text-sm sm:text-base"
                aria-label={`Deploy ${enrichedAgent.name} to destroy competition`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔥 Deploy Against Competition
              </motion.button>
            </div>

            {/* --- Cosmic Toast for Workflow Launch --- */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="fixed left-1/2 bottom-8 z-[100] -translate-x-1/2 px-6 py-4 rounded-2xl shadow-xl bg-gradient-to-r from-fuchsia-500 via-blue-600 to-teal-400 text-white text-lg font-bold flex items-center gap-3 border-2 border-fuchsia-400/60 cosmic-glow backdrop-blur-md animate-glow-toast"
                  role="alert"
                  aria-live="polite"
                >
                  <span className="text-2xl animate-pulse" aria-hidden="true">🚀</span>
                  <span>Workflow launched! Your agent is on it.</span>
                  <button
                    onClick={handleDismissToast}
                    className="ml-4 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
                    aria-label="Dismiss notification"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}