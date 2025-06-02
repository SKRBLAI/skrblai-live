'use client';

import React, { useState, useEffect, useRef } from 'react';
import AgentCarousel from '../agents/AgentCarousel';
import { supabase } from '@/utils/supabase';
import { usePercyRouter } from '@/contexts/PercyContext';
import { runAgentWorkflow } from '@/lib/agents/runAgentWorkflow';
import { getCurrentUser } from '@/utils/supabase-auth';
import { sendEmailAction } from '@/actions/sendEmail';
import { saveChatMemory } from '@/lib/percy/saveChatMemory';
import { getRecentPercyMemory } from '@/lib/percy/getRecentMemory';
import PercyOnboarding from './PercyOnboarding';
import UpsellModal from './UpsellModal';
import { motion, AnimatePresence } from 'framer-motion';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import { usePathname } from 'next/navigation';
import { saveIntentMemory, clearPercyMemory } from '@/utils/memory';
import { logPercyMessage, getPercyMessageHistory } from '@/utils/percy/logPercyMessage';
import styles from '@/styles/PercyWidget.module.css';
import type { Agent } from '@/types/agent';

const useApiAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/agents', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch agents');
        const data = await res.json();
        setAgents(data.agents || []);
      } catch {
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);
  return { agents, loading };
};

function getBestAgents(goal: string, platform: string, agents: Agent[]): Agent[] {
  if (!Array.isArray(agents)) return [];
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const lowerGoal = (goal || '').toLowerCase();
  const lowerPlatform = (platform || '').toLowerCase();
  const lowerPath = pathname.replace(/^\/|\/$/g, '').toLowerCase();
  let matches = agents.filter(a => a.visible && (
    (a.category && lowerGoal && a.category.toLowerCase().includes(lowerGoal)) ||
    (a.name && lowerGoal && a.name.toLowerCase().includes(lowerGoal)) ||
    (a.intent && lowerGoal && a.intent.toLowerCase().includes(lowerGoal)) ||
    (a.category && lowerPlatform && a.category.toLowerCase().includes(lowerPlatform)) ||
    (a.name && lowerPlatform && a.name.toLowerCase().includes(lowerPlatform)) ||
    (a.intent && lowerPlatform && a.intent.toLowerCase().includes(lowerPlatform)) ||
    (Array.isArray(a.agentCategory) && a.agentCategory.length > 0 && a.agentCategory.some((cat: string) => lowerPath.includes(cat)))
  ));
  if (matches.length === 0) {
    matches = agents.filter(a => a.visible).slice(0, 3);
  } else {
    matches = matches.slice(0, 3);
  }
  return matches;
}

function PercyWidget() {
  const routerResult = usePercyRouter();
  const [open, setOpen] = useState(false);
  const [lastUsedIntent, setLastUsedIntent] = useState<string>('');
  const { setPercyIntent, closePercy } = usePercyContext();
  const pathname = usePathname();
  const { agents } = useApiAgents();

  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; text: string }[]>([
    { role: 'assistant', text: 'Hi! I\'m Percy, your AI concierge. How can I help you today?' }
  ]);
  const [memory, setMemory] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [running, setRunning] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [pendingAgent, setPendingAgent] = useState<Agent | null>(null);
  const [userProfile, setUserProfile] = useState<{ goal: string; platform: string }>({ goal: '', platform: '' });
  const [showAgentSuggestions, setShowAgentSuggestions] = useState(false);
  const [suggestedAgents, setSuggestedAgents] = useState<Agent[]>([]);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [lastUsedAgent, setLastUsedAgent] = useState<string | null>(null);
  const [intakeComplete, setIntakeComplete] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const agent = localStorage.getItem('lastUsedAgent');
      setLastUsedAgent(agent);
      const intake = localStorage.getItem('intakeComplete');
      setIntakeComplete(intake === 'true');
    }
  }, []);

  // Onboarding and intent logic
  useEffect(() => {
    async function checkOnboarding() {
      let complete = false;
      if (typeof window !== 'undefined') {
        complete = localStorage.getItem('onboardingComplete') === 'true';
      }
      try {
        const user = await getCurrentUser();
        if (user) {
          const { data, error } = await supabase
            .from('user_settings')
            .select('onboardingComplete')
            .eq('userId', user.id)
            .maybeSingle();
          if (!error && data) complete = data.onboardingComplete;
        }
      } catch {
        // intentionally left blank (non-critical)
      }
      setShowOnboarding(!complete);
      if (complete && typeof window !== 'undefined') {
        const goal = localStorage.getItem('userGoal') || '';
        const platform = localStorage.getItem('userPlatform') || '';
        setUserProfile({ goal, platform });
        setSuggestedAgents(getBestAgents(goal, platform, agents));
      }
    }
    checkOnboarding();
  }, [agents]);

  useEffect(() => {
    setPercyIntent('');
    // eslint-disable-next-line
  }, [pathname, setPercyIntent]);

  if (!routerResult) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('PercyWidget: PercyProvider not found, skipping render.');
    }
    return null;
  }

  const { routeToAgent } = routerResult;

  // Routing logic
  const safeRouteToAgent = (intent: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastUsedAgent', intent);
    }
    const agent = agents.find(agent => agent.intent === intent);
    if (agent && agent.route) {
      saveIntentMemory(intent);
      routerResult.routeToAgent(intent);
    } else {
      if (routerResult && routerResult.routeToAgent) {
        routerResult.routeToAgent('');
      }
      if (typeof window !== 'undefined') {
        window.location.href = '/ask-percy?error=not-found';
      }
    }
  };

  // User input handler
  const processUserInput = (input: string) => {
    const lowerInput = input.toLowerCase();
    if (!intakeComplete) {
      if (lowerInput.includes('marketing') || lowerInput.includes('advertise') || lowerInput.includes('promote')) {
        setMessages(prev => [...prev,
          { role: 'assistant', text: 'I see you\'re interested in marketing! What specifically are you looking to improve? Social media, content marketing, or paid advertising?' }
        ]);
        return;
      }
      if (lowerInput.includes('social') || lowerInput.includes('instagram') || lowerInput.includes('facebook')) {
        setMessages(prev => [...prev,
          { role: 'assistant', text: 'Great! Our Social Bot agent can help you with social media marketing. Let me connect you.' }
        ]);
        setTimeout(() => safeRouteToAgent('social_media'), 1500);
        localStorage.setItem('intakeComplete', 'true');
        setIntakeComplete(true);
        return;
      }
      if (lowerInput.includes('content') || lowerInput.includes('blog') || lowerInput.includes('article')) {
        setMessages(prev => [...prev,
          { role: 'assistant', text: 'Perfect! Our Content Creator agent specializes in blog posts and articles. I\'ll connect you right away.' }
        ]);
        setTimeout(() => safeRouteToAgent('content_creation'), 1500);
        localStorage.setItem('intakeComplete', 'true');
        setIntakeComplete(true);
        return;
      }
      if (lowerInput.includes('brand') || lowerInput.includes('logo') || lowerInput.includes('design')) {
        setMessages(prev => [...prev,
          { role: 'assistant', text: 'I understand you need branding help! Our Branding agent can assist with your brand identity. Let me take you there.' }
        ]);
        setTimeout(() => safeRouteToAgent('branding'), 1500);
        localStorage.setItem('intakeComplete', 'true');
        setIntakeComplete(true);
        return;
      }
      if (lowerInput.includes('website') || lowerInput.includes('site') || lowerInput.includes('web')) {
        setMessages(prev => [...prev,
          { role: 'assistant', text: 'Sounds like you need website help! Our SiteGen agent is perfect for this. Connecting you now.' }
        ]);
        setTimeout(() => safeRouteToAgent('website'), 1500);
        localStorage.setItem('intakeComplete', 'true');
        setIntakeComplete(true);
        return;
      }
      setMessages(prev => [...prev,
        { role: 'assistant', text: 'I\'m here to help you with marketing, content creation, branding, or website development. What specific area are you interested in?' }
      ]);
    } else {
      setMessages(prev => [...prev,
        { role: 'assistant', text: 'I\'ll help you with that. Let me suggest a few relevant agents...' }
      ]);
      setShowAgentSuggestions(true);
    }
  };

  const handleIntent = async (intent: string) => {
    const agent = agents.find((a) => a.intent === intent);
    if (!agent) {
      setMessages((prev) => [...prev, { role: 'assistant', text: `Sorry, I couldn't find an agent for "${intent}".` }]);
      return;
    }
    const user = await getCurrentUser();
    if (!user) {
      setMessages((prev) => [...prev, { role: 'assistant', text: `Please sign in to use Percy workflows.` }]);
      return;
    }
    const { data: userData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('userId', user.id)
      .maybeSingle();
    if (agent.premium && (!userData || userData.role !== 'premium')) {
      setPendingAgent(agent);
      setShowUpsellModal(true);
      return;
    }
    setRunning(true);
    setMessages((prev) => [...prev, { role: 'assistant', text: `Running ${agent.name} agent for you...` }]);
    const payload = { projectName: 'SKRBL AI' };
    const agentResult = await runAgentWorkflow(agent.id, payload);

    await supabase
      .from('workflowLogs')
      .insert({
        userId: user.id,
        agentId: agent.id,
        result: agentResult.result,
        status: agentResult.status,
        timestamp: new Date().toISOString()
      });

    if (user.email) {
      await sendEmailAction(user.email, agent.id, agentResult.result);
    }
    await saveChatMemory(agent.intent ?? '', 'Agent execution');
    localStorage.setItem('lastUsedAgent', agent.intent ?? '');

    try {
      if (user && typeof agent.intent === 'string' && agent.intent.length > 0) {
        const { data: usageData } = await supabase
          .from('agent_usage')
          .select('count')
          .eq('userId', user.id)
          .eq('intent', agent.intent)
          .maybeSingle();
        const prevCount = usageData ? usageData.count || 0 : 0;
        await supabase
          .from('agent_usage')
          .upsert({
            userId: user.id,
            intent: agent.intent,
            count: prevCount + 1,
            updatedAt: new Date().toISOString()
          }, { onConflict: 'userId,intent' });
      }
    } catch {
      // intentionally left blank (non-critical)
    }

    logPercyMessage({
      intent,
      message: agentResult.result,
      agentId: agent.id,
    });

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', text: `✅ ${agent.name} completed! Result: ${agentResult.result}` }
    ]);
    setRunning(false);
    const history = await getRecentPercyMemory();
    setMemory(history);
  };

  const handleUserInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRef.current) {
      const value = inputRef.current.value.trim();
      if (value) {
        setMessages((prev) => [...prev, { role: 'user', text: value }]);
        processUserInput(value);
        inputRef.current.value = '';
      }
    }
  };

  const handleAgentClick = (agent: Agent) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastSelectedAgent', agent.intent || '');
    }
    setMessages((prev) => [...prev,
      { role: 'assistant', text: `Great choice! I'm connecting you with ${agent.name} now...` }
    ]);
    setTimeout(() => safeRouteToAgent(agent.intent || ''), 1000);
  };

  const handleBackToStart = () => {
    closePercy();
    setPercyIntent('');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const lastUsedAgentObj = lastUsedAgent ? agents.find(a => a.intent === lastUsedAgent || a.id === lastUsedAgent) : null;

  return (
    <>
      {showOnboarding && (
        <PercyOnboarding
          onComplete={({ goal, platform }) => {
            setShowOnboarding(false);
            setUserProfile({ goal, platform });
            setSuggestedAgents(getBestAgents(goal, platform, agents));
          }}
        />
      )}
      {showUpsellModal && pendingAgent && (
        <UpsellModal agent={pendingAgent} onClose={() => setShowUpsellModal(false)} />
      )}
      <AnimatePresence>
        {showAgentSuggestions && suggestedAgents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
            className="max-w-md fixed bottom-24 right-6 z-[110]"
          >
            <div className="bg-white/10 backdrop-blur border border-teal-400/20 rounded-xl p-4 shadow-2xl">
              <h3 className="text-lg font-semibold mb-3 text-white">Pick an agent to try, or start with Percy.</h3>
              <div className="w-full flex flex-col items-center">
                <div className="w-full">
                  <AgentCarousel
                    agents={suggestedAgents}
                    onLaunch={(agent: Agent) => {
                      setActiveAgent(agent);
                      setShowAgentSuggestions(false);
                      handleAgentClick(agent);
                    }}
                    selectedAgentId={activeAgent?.id}
                  />
                </div>
                {/* No duplicate preview modal here */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Percy Widget Toggle Button */}
      <motion.button
        className={`fixed bottom-10 right-10 shadow-lg flex items-center gap-2 transition-all duration-300 z-[130] ${
          open
            ? "bg-white/10 backdrop-blur-md border border-white/30 text-white px-4 py-3 rounded-full"
            : "bg-white/10 backdrop-blur-md border border-electric-blue/30 text-white px-4 py-3 rounded-full"
        }`}
        onClick={() => setOpen((o) => !o)}
        whileHover={{
          scale: 1.05,
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.7), 0 0 10px rgba(244, 114, 182, 0.5)'
        }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: open
            ? '0 4px 20px rgba(45, 212, 191, 0.3)'
            : [
                '0 4px 15px rgba(56, 189, 248, 0.4)',
                '0 4px 25px rgba(244, 114, 182, 0.5)',
                '0 4px 15px rgba(56, 189, 248, 0.4)'
              ],
          transition: {
            boxShadow: {
              repeat: Infinity,
              duration: 3,
              ease: 'easeInOut'
            }
          }
        }}
      >
        <motion.div
          className="relative"
          animate={{
            y: [0, -3, 0],
            filter: [
              'drop-shadow(0 0 1px rgba(45, 212, 191, 0.7))',
              'drop-shadow(0 0 3px rgba(56, 189, 248, 0.9))',
              'drop-shadow(0 0 1px rgba(45, 212, 191, 0.7))'
            ]
          }}
          transition={{
            y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            filter: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          <img
            src="/images/agents-percy-nobg-skrblai.png"
            alt="Percy"
            className="w-8 h-8 object-contain"
          />
        </motion.div>
        <span>{open ? 'Close Percy' : 'Ask Percy'}</span>
      </motion.button>
      {/* Enhanced Chat Bubble */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="mt-4 w-80 bg-white/10 backdrop-blur-lg border border-electric-blue/30 rounded-xl shadow-2xl text-white overflow-hidden fixed bottom-24 right-10 z-[140]"
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Percy Avatar Header */}
            <div className="bg-gradient-to-r from-electric-blue/30 via-fuchsia-500/20 to-teal-400/30 p-3 flex items-center gap-3 border-b border-white/10">
              <motion.div
                animate={{
                  y: [0, -2, 0],
                  filter: [
                    'drop-shadow(0 0 5px rgba(45, 212, 191, 0.7))',
                    'drop-shadow(0 0 10px rgba(56, 189, 248, 0.9))',
                    'drop-shadow(0 0 5px rgba(45, 212, 191, 0.7))'
                  ]
                }}
                transition={{
                  y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  filter: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }}
              >
                <img
                  src="/images/agents-percy-nobg-skrblai.png"
                  alt="Percy"
                  className="w-10 h-10 object-contain"
                />
              </motion.div>
              <div>
                <h3 className="font-medium">Percy</h3>
                <p className="text-xs text-teal-200">Your AI Concierge</p>
              </div>
              {running && (
                <div className="ml-auto">
                  <motion.div
                    className="h-3 w-3 bg-teal-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="mb-3 max-h-60 overflow-y-auto pr-1 space-y-3">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    className={`${
                      msg.role === 'assistant'
                        ? 'bg-white/10 text-teal-200 rounded-tl-xl rounded-tr-xl rounded-br-xl p-2 max-w-[85%]'
                        : 'bg-electric-blue/30 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl p-2 max-w-[85%] ml-auto'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                  >
                    {msg.text}
                  </motion.div>
                ))}
              </div>
              {lastUsedAgentObj && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">Recently Used</p>
                  <motion.button
                    onClick={() => handleIntent(lastUsedAgentObj.intent as string)}
                    className="px-3 py-1 text-xs bg-white/20 hover:bg-teal-500 rounded-full flex items-center gap-1"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(20, 184, 166, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-xs">⚡</span>
                    {lastUsedAgentObj.name}
                  </motion.button>
                </div>
              )}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={running ? "Percy is working..." : "How can I help you today?"}
                  disabled={running}
                  onKeyDown={handleUserInput}
                  className="w-full p-3 text-sm rounded-lg bg-white/10 border border-electric-blue/30 text-white placeholder-gray-300 focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all duration-200"
                />
                <motion.div
                  className="absolute right-3 bottom-3 text-xs text-gray-400 flex items-center"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="mr-1">Press</span>
                  <span className="bg-white/20 rounded px-1">Enter ↵</span>
                </motion.div>
              </div>
              <button type="button" className={styles.hiddenButton} onClick={handleBackToStart} aria-label="Back to Start" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={clearPercyMemory}
          className="text-xs mt-2 text-red-500 hover:underline"
        >
          Clear Percy Memory
        </button>
      )}
    </>
  );
}

export default PercyWidget;
