'use client';

import React, { useState, useEffect, useRef } from 'react';
import agentRegistry from '@/lib/agents/agentRegistry';
import { usePercyRouter } from '@/contexts/PercyContext';
import { runAgentWorkflow } from '@/lib/agents/runAgentWorkflow';
import { sendWorkflowResultEmail } from '@/lib/email/sendWorkflowResult';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { savePercyMemory } from '@/lib/percy/saveChatMemory';
import { getRecentPercyMemory } from '@/lib/percy/getRecentMemory';
import PercyOnboarding from './PercyOnboarding';
import UpsellModal from './UpsellModal';

function PercyWidget() {
  // Always call hooks at the top level
  const routerResult = usePercyRouter();
  const [open, setOpen] = useState(false);
  const [lastUsedIntent, setLastUsedIntent] = useState<string>('');
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; text: string }[]>([]);
  const [memory, setMemory] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [running, setRunning] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    typeof window !== 'undefined' && localStorage.getItem('onboardingComplete') !== 'true'
  );
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [pendingAgent, setPendingAgent] = useState<{ name: string; description: string } | null>(null);
  const [userProfile, setUserProfile] = useState<{ goal: string; platform: string }>({ goal: '', platform: '' });

  // Fetch Firestore-powered Percy memory on open
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

  if (!routerResult) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('PercyWidget: PercyProvider not found, skipping render.');
    }
    return null;
  }

  const { routeToAgent } = routerResult;

  // Suggest agents based on onboarding answers (goal/platform)
  const suggestedAgents = agentRegistry
    .filter(a => a.visible && (!userProfile.goal || a.category?.toLowerCase().includes(userProfile.goal)))
    .slice(0, 4);
  const lastUsedAgent = lastUsedIntent ? agentRegistry.find(agent => agent.intent === lastUsedIntent && agent.visible) : null;

  // Extend agent type to include premium
  type PercyAgent = typeof agentRegistry[number] & { premium?: boolean };

  // Percy-initiated workflow handler with upsell modal
  const handleIntent = async (intent: string) => {
    const agent = agentRegistry.find((a) => a.intent === intent) as PercyAgent | undefined;
    if (!agent) {
      setMessages((prev) => [...prev, { role: 'assistant', text: `Sorry, I couldn’t find an agent for "${intent}".` }]);
      return;
    }
    const auth = getAuth();
    const user = auth.currentUser as any;
    if (!user) {
      setMessages((prev) => [...prev, { role: 'assistant', text: `Please sign in to use Percy workflows.` }]);
      return;
    }
    // PREMIUM CHECK: Show upsell if agent is premium and user is not premium
    if (agent.premium && user.stripeRole !== 'premium') {
      setPendingAgent(agent);
      setShowUpsellModal(true);
      return;
    }
    setRunning(true);
    setMessages((prev) => [...prev, { role: 'assistant', text: `Running ${agent.name} agent for you...` }]);
    const payload = { projectName: 'SKRBL AI' };
    const result = await runAgentWorkflow(agent.id, payload);
    await addDoc(collection(db, 'workflowLogs'), {
      userId: user.uid,
      agentId: agent.id,
      result: result.result,
      status: result.status,
      timestamp: new Date()
    });
    await sendWorkflowResultEmail({ email: user.email, agentId: agent.id, result: result.result });
    await savePercyMemory(agent.intent ?? '');
    localStorage.setItem('lastUsedAgent', agent.intent ?? '');
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

  return (
    <>
      {showOnboarding && (
        <PercyOnboarding
          onComplete={({ goal, platform }) => {
            setShowOnboarding(false);
            setUserProfile({ goal, platform });
          }}
        />
      )}
      {showUpsellModal && pendingAgent && (
        <UpsellModal agent={pendingAgent} onClose={() => setShowUpsellModal(false)} />
      )}
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
            <p className="text-sm mb-2">👋 Hi! I’m Percy. What can I help you with today?</p>
            {/* Firestore-Powered Percy Memory Chips */}
            {memory.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">🧠 Previously Used Agents</p>
                <div className="flex flex-wrap gap-2">
                  {memory.map((entry, idx) => (
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
            {lastUsedAgent && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">Recently Used</p>
                <button
                  onClick={() => handleIntent(lastUsedAgent.intent as string)}
                  className="px-3 py-1 text-xs bg-white/20 hover:bg-teal-500 rounded-full"
                >
                  {lastUsedAgent.name}
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
