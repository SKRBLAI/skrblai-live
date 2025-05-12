'use client';

import React, { useState, useEffect, useRef } from 'react';
import agentRegistry from '@/lib/agents/agentRegistry';
import { usePercyRouter } from '@/contexts/PercyContext';
import { runAgentWorkflow } from '@/lib/agents/runAgentWorkflow';
import { getCurrentUser } from '@/utils/supabase-auth';
import { sendEmailAction } from '@/actions/sendEmail';
import { saveChatMemory } from '@/lib/percy/saveChatMemory';
import { getRecentPercyMemory } from '@/lib/percy/getRecentMemory';
import PercyOnboarding from './PercyOnboarding';
import UpsellModal from './UpsellModal';
import { motion, AnimatePresence } from 'framer-motion';
import PercyAvatar from '@/components/home/PercyAvatar';


function getBestAgents(goal: string, platform: string) {
  // Score agents by goal/platform match
  const lowerGoal = goal.toLowerCase();
  const lowerPlatform = platform.toLowerCase();
  let matches = agentRegistry.filter(a => a.visible && (
    (a.category && lowerGoal && a.category.toLowerCase().includes(lowerGoal)) ||
    (a.name && lowerGoal && a.name.toLowerCase().includes(lowerGoal)) ||
    (a.intent && lowerGoal && a.intent.toLowerCase().includes(lowerGoal)) ||
    (a.category && lowerPlatform && a.category.toLowerCase().includes(lowerPlatform)) ||
    (a.name && lowerPlatform && a.name.toLowerCase().includes(lowerPlatform)) ||
    (a.intent && lowerPlatform && a.intent.toLowerCase().includes(lowerPlatform))
  ));
  // Fallback: top 3 visible agents
  if (matches.length === 0) {
    matches = agentRegistry.filter(a => a.visible).slice(0, 3);
  } else {
    matches = matches.slice(0, 3);
  }
  return matches;
}

function PercyWidget() {
  // Always call hooks at the top level
  const routerResult = usePercyRouter();
  const [open, setOpen] = useState(false);
  const [lastUsedIntent, setLastUsedIntent] = useState<string>('');
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; text: string }[]>([]);
  const [memory, setMemory] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [running, setRunning] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [pendingAgent, setPendingAgent] = useState<{ name: string; description: string } | null>(null);
  const [userProfile, setUserProfile] = useState<{ goal: string; platform: string }>({ goal: '', platform: '' });
  const [showAgentSuggestions, setShowAgentSuggestions] = useState(false);
  const [suggestedAgents, setSuggestedAgents] = useState<any[]>([]);
  const [agentTooltip, setAgentTooltip] = useState<string | null>(null);
  const [lastUsedAgent, setLastUsedAgent] = useState<string | null>(null);
  const lastUsedAgentObj = lastUsedAgent ? agentRegistry.find(a => a.intent === lastUsedAgent || a.id === lastUsedAgent) : null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const agent = localStorage.getItem('lastUsedAgent');
      setLastUsedAgent(agent);
    }
  }, []);

  // Check onboardingComplete from Supabase and localStorage
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
            
          if (!error && data) {
            complete = data.onboardingComplete;
          }
        }
      } catch (e) {
        // Ignore Supabase onboarding check errors, fallback to localStorage only
      }
      setShowOnboarding(!complete);
      setShowAgentSuggestions(complete);
      if (complete && typeof window !== 'undefined') {
        const goal = localStorage.getItem('userGoal') || '';
        const platform = localStorage.getItem('userPlatform') || '';
        setUserProfile({ goal, platform });
        setSuggestedAgents(getBestAgents(goal, platform));
      }
    }
    checkOnboarding();
  }, []);

  // Fetch Supabase-powered Percy memory on open
  useEffect(() => {
    if (!routerResult) return;

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lastUsedAgent');
      setLastUsedIntent(stored ?? '');
      setUserProfile({
        goal: localStorage.getItem('userGoal') || '',
        platform: localStorage.getItem('userPlatform') || ''
      });
    }
    async function fetchMemory() {
      const history = await getRecentPercyMemory();
      setMemory(history);
    }
    if (open) fetchMemory();
  }, [open, routerResult]);

  // Initialize local state based on window availability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lastUsedAgent');
      setLastUsedIntent(stored ?? '');
      setUserProfile({
        goal: localStorage.getItem('userGoal') || '',
        platform: localStorage.getItem('userPlatform') || ''
      });
      setShowOnboarding(localStorage.getItem('onboardingComplete') !== 'true');
    }
  }, []);

  // Fetch Percy memory when widget opens
  useEffect(() => {
    if (!open || !routerResult) return;

    async function fetchMemory() {
      const history = await getRecentPercyMemory();
      setMemory(history);
    }
    fetchMemory();
  }, [open, routerResult]);

  if (!routerResult) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('PercyWidget: PercyProvider not found, skipping render.');
    }
    return null;
  }

  const { routeToAgent } = routerResult;

  // Percy-initiated workflow handler with upsell modal
  const handleIntent = async (intent: string) => {
    const agent = agentRegistry.find((a) => a.intent === intent);
    if (!agent) {
      setMessages((prev) => [...prev, { role: 'assistant', text: `Sorry, I couldn't find an agent for "${intent}".` }]);
      return;
    }
    
    const user = await getCurrentUser();
    if (!user) {
      setMessages((prev) => [...prev, { role: 'assistant', text: `Please sign in to use Percy workflows.` }]);
      return;
    }
    
    // Check if user has premium role
    const { data: userData, error: userError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('userId', user.id)
      .maybeSingle();
      
    // PREMIUM CHECK: Show upsell if agent is premium and user is not premium
    if (agent.premium && (!userData || userData.role !== 'premium')) {
      setPendingAgent(agent);
      setShowUpsellModal(true);
      return;
    }
    
    setRunning(true);
    setMessages((prev) => [...prev, { role: 'assistant', text: `Running ${agent.name} agent for you...` }]);
    const payload = { projectName: 'SKRBL AI' };
    const result = await runAgentWorkflow(agent.id, payload);
    
    // Log workflow in Supabase
    await supabase
      .from('workflowLogs')
      .insert({
        userId: user.id,
        agentId: agent.id,
        result: result.result,
        status: result.status,
        timestamp: new Date().toISOString()
      });
      
    if (user.email) {
      await sendEmailAction(user.email, agent.id, result.result);
    }
    await saveChatMemory(agent.intent ?? '', 'Agent execution');
    localStorage.setItem('lastUsedAgent', agent.intent ?? '');
    
    // Track agent usage in Supabase
    try {
      if (user && typeof agent.intent === 'string' && agent.intent.length > 0) {
        // Get existing usage count
        const { data: usageData, error: usageError } = await supabase
          .from('agent_usage')
          .select('count')
          .eq('userId', user.id)
          .eq('intent', agent.intent)
          .maybeSingle();
          
        const prevCount = (!usageError && usageData) ? usageData.count || 0 : 0;
        
        // Upsert usage data
        await supabase
          .from('agent_usage')
          .upsert({
            userId: user.id,
            intent: agent.intent,
            count: prevCount + 1,
            updatedAt: new Date().toISOString()
          }, { onConflict: 'userId,intent' });
      }
    } catch (e) {/* ignore */}
    
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', text: `✅ ${agent.name} completed! Result: ${result.result}` }
    ]);
    setRunning(false);
    // Refresh memory chips after run
    const history = await getRecentPercyMemory();
    setMemory(history);
  };

  const handleUserInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRef.current) {
      const value = inputRef.current.value.trim();
      if (value) {
        setMessages((prev) => [...prev, { role: 'user', text: value }]);
        await handleIntent(value.toLowerCase());
        inputRef.current.value = '';
      }
    }
  };

  // Handle agent card click
  const handleAgentClick = (agent: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastSelectedAgent', agent.intent);
    }
    // Route to PercyChat with personalized welcome
    routeToAgent(agent.intent);
    // Optionally: pass personalized prompt to PercyChat (implementation depends on PercyChat context)
  };

  return (
    <>
      {showOnboarding && (
        <PercyOnboarding
          onComplete={({ goal, platform }) => {
            setShowOnboarding(false);
            setUserProfile({ goal, platform });
            setSuggestedAgents(getBestAgents(goal, platform));
            setShowAgentSuggestions(true);
          }}
        />
      )}
      {showUpsellModal && pendingAgent && (
        <UpsellModal agent={pendingAgent} onClose={() => setShowUpsellModal(false)} />
      )}
      {/* Inline agent suggestions after onboarding */}
      <AnimatePresence>
        {showAgentSuggestions && suggestedAgents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto mt-8 flex flex-col items-center"
          >
            <h3 className="text-2xl font-bold mb-6 text-center text-white">Percy recommends these agents for you:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
              {suggestedAgents.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.15, duration: 0.5, type: 'spring' }}
                  className="glass-card p-5 rounded-xl flex flex-col items-center border border-teal-400/40 shadow-lg relative group cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleAgentClick(agent)}
                  onMouseEnter={() => setAgentTooltip(agent.id)}
                  onMouseLeave={() => setAgentTooltip(null)}
                >
                  <PercyAvatar size="sm" />
                  <div className="mt-3 text-lg font-bold text-white flex items-center gap-2">
                    <span>{agent.name}</span>
                    <span className="text-2xl">{agent.category === 'Brand Development' ? '🎨' : agent.category === 'Ebook Creation' ? '📚' : agent.category === 'Paid Marketing' ? '💸' : agent.category === 'Business Intelligence' ? '📊' : agent.category === 'Strategy & Growth' ? '🚀' : agent.category === 'Support Automation' ? '🤖' : agent.category === 'Sales Enablement' ? '📈' : agent.category === 'Short-Form Video' ? '🎬' : agent.category === 'Copywriting' ? '✍️' : agent.category === 'Automation' ? '⚡' : agent.category === 'Social Media Automation' ? '📱' : agent.category === 'Web Automation' ? '🌐' : agent.category === 'Back Office' ? '💼' : '🤖'}</span>
                  </div>
                  <div className="text-xs text-teal-200 mt-1 mb-2">{agent.category}</div>
                  {/* Why this agent tooltip/modal */}
                  <AnimatePresence>
                    {agentTooltip === agent.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-[#181f2a] border border-teal-400/40 rounded-xl shadow-xl p-4 z-50 text-white text-sm"
                      >
                        <div className="font-semibold mb-1 text-teal-300">Why this agent?</div>
                        <div>{agent.description}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Toggle Button */}
        <button
          onClick={() => setOpen(!open)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-3 rounded-full shadow-lg"
        >
          {open ? '✖️ Close Percy' : '💬 Ask Percy'}
        </button>

        {/* Chat Bubble */}
        {open && (
          <div className="mt-4 w-80 bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 shadow-2xl text-white">
            <p className="text-sm mb-2">👋 Hi! I'm Percy. What can I help you with today?</p>
            {/* Firestore-Powered Percy Memory Chips */}
            {memory.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">🧠 Top Used Agents</p>
                <div className="flex flex-wrap gap-2">
                  {memory
                    .sort((a, b) => (b.count || 0) - (a.count || 0))
                    .slice(0, 5)
                    .map((entry, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleIntent(entry.intent)}
                        className="px-3 py-1 text-xs bg-white/20 hover:bg-teal-500 rounded-full"
                      >
                        {entry.intent}
                      </button>
                    ))}
                </div>
              </div>
            )}
            {/* Recently Used Agent */}
            {lastUsedAgentObj && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">Recently Used</p>
                <button
                  onClick={() => handleIntent(lastUsedAgentObj.intent as string)}
                  className="px-3 py-1 text-xs bg-white/20 hover:bg-teal-500 rounded-full"
                >
                  {lastUsedAgentObj.name}
                </button>
              </div>
            )}
            {/* Suggested Agent Chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedAgents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => handleIntent(agent.intent as string)}
                  className="px-3 py-1 text-xs bg-white/20 hover:bg-teal-500 rounded-full transition"
                >
                  {agent.name}
                </button>
              ))}
            </div>

            {/* Percy Chat History */}
            <div className="mb-3 max-h-40 overflow-y-auto">
              {messages.map((msg, idx) => (
                <div key={idx} className={msg.role === 'assistant' ? 'text-teal-200 text-xs mb-1' : 'text-white text-xs mb-1 text-right'}>
                  {msg.text}
                </div>
              ))}
            </div>
            {/* Manual Input */}
            <input
              ref={inputRef}
              type="text"
              placeholder={running ? "Percy is working..." : "Type something..."}
              disabled={running}
              onKeyDown={handleUserInput}
              className="w-full p-2 text-sm rounded-md bg-white/10 border border-white/30 text-white placeholder-gray-300"
            />
          </div>
        )}
      </div>
    </>
  );
}

export default PercyWidget;
