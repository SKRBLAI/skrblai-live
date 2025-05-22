'use client';

import React, { useState, useEffect, useRef } from 'react';
import agentRegistry from '@/lib/agents/agentRegistry';
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
import PercyAvatar from '@/components/home/PercyAvatar';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import { getAgentsByRole } from '@/utils/getAgentsByRole';
import { usePathname } from 'next/navigation';
import { saveIntentMemory, clearPercyMemory } from '@/utils/memory';
import { logPercyMessage, getPercyMessageHistory } from '@/utils/percy/logPercyMessage';
import styles from '@/styles/PercyWidget.module.css';

// Example: get user role (replace with real role logic as needed)
const userRole = typeof window !== 'undefined' ? (localStorage.getItem('userRole') || 'user') : 'user';
console.log('[Percy] Current user role:', userRole);

// Score and get best matching agents based on user goal/platform
function getBestAgents(goal: string, platform: string) {
  const agentList = getAgentsByRole(userRole);
  console.log('[Percy] Available Agents for Role:', agentList);
  // Log agent registry to diagnose issues
  console.log('Agent Registry loaded with:', agentRegistry.length, 'agents');
  if (agentRegistry.length === 0) {
    console.error('Agent Registry is empty - check imports');
  }
  
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  // Score agents by goal/platform match and by current path/category
  const lowerGoal = goal.toLowerCase();
  const lowerPlatform = platform.toLowerCase();
  const lowerPath = pathname.replace(/^\//, '').toLowerCase();
  let matches = agentList.filter(a => a.visible && (
    (a.category && lowerGoal && a.category.toLowerCase().includes(lowerGoal)) ||
    (a.name && lowerGoal && a.name.toLowerCase().includes(lowerGoal)) ||
    (a.intent && lowerGoal && a.intent.toLowerCase().includes(lowerGoal)) ||
    (a.category && lowerPlatform && a.category.toLowerCase().includes(lowerPlatform)) ||
    (a.name && lowerPlatform && a.name.toLowerCase().includes(lowerPlatform)) ||
    (a.intent && lowerPlatform && a.intent.toLowerCase().includes(lowerPlatform)) ||
    (Array.isArray(a.agentCategory) && a.agentCategory.length > 0 && a.agentCategory.some(cat => lowerPath.includes(cat)))
  ));
  if (matches.length > 0) {
    console.log('[Percy] Matched agent categories for path:', lowerPath, matches.map(a => a.agentCategory));
  }
  // Fallback: top 3 visible agents
  if (matches.length === 0) {
    matches = agentList.filter(a => a.visible).slice(0, 3);
    if (matches.length === 0) {
      console.warn('[Percy] No visible agents found for fallback.');
    } else {
      console.warn('[Percy] Fallback to top visible agents for path:', lowerPath, matches.map(a => a.name));
    }
  } else {
    matches = matches.slice(0, 3);
  }
  if (matches.length === 0) {
    console.warn('[Percy] No agent match found for goal/platform/path:', { goal, platform, path: lowerPath });
  } else {
    console.log('[Percy] Selected agents:', matches.map(a => a.name));
  }
  return matches;
}

// Enhanced agent matching for Percy onboarding and smart suggestions
export function getSmartAgentSuggestions({
  prompt = '',
  file = null,
  dropdown = '',
  userRole = typeof window !== 'undefined' ? (localStorage.getItem('userRole') || 'user') : 'user',
  routerResult
}: {
  prompt?: string;
  file?: File | { name?: string; type?: string; category?: string } | null;
  dropdown?: string;
  userRole?: string;
  routerResult?: any;
}) {
  const agentList = getAgentsByRole(userRole);
  const lowerPrompt = (prompt || '').toLowerCase();
  const dropdownValue = (dropdown || '').toLowerCase();
  const fileType = file && (file.type || (file.name && file.name.split('.').pop())) || '';
  const fileName = file && file.name ? file.name.toLowerCase() : '';
  const fileCategory = file && typeof file === 'object' && 'category' in file ? (file as any).category : '';
  const matches: any[] = [];
  const logs: string[] = [];

  // File upload logic
  if (file) {
    if (fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('book') || fileCategory === 'book') {
      logs.push('Matched file upload as Book Publishing');
      const agent = agentList.find(a => a.name.toLowerCase().includes('publishing'));
      if (agent) matches.push({
        name: agent.name,
        description: agent.description,
        why: 'File upload detected as book/document',
        action: () => routerResult?.routeToAgent && routerResult.routeToAgent(agent.intent || agent.id)
      });
    } else if (fileType.includes('txt') || fileType.includes('content') || fileCategory === 'content') {
      logs.push('Matched file upload as Content Automation');
      const agent = agentList.find(a => a.name.toLowerCase().includes('content'));
      if (agent) matches.push({
        name: agent.name,
        description: agent.description,
        why: 'File upload detected as content',
        action: () => routerResult?.routeToAgent && routerResult.routeToAgent(agent.intent || agent.id)
      });
    }
  }

  // Prompt/Dropdown logic
  const keywordMap = [
    { key: 'brand', agent: 'branding', why: 'Branding keyword detected' },
    { key: 'logo', agent: 'branding', why: 'Logo/branding keyword detected' },
    { key: 'content', agent: 'content', why: 'Content keyword detected' },
    { key: 'blog', agent: 'content', why: 'Blog/content keyword detected' },
    { key: 'publish', agent: 'publishing', why: 'Publishing keyword detected' },
    { key: 'book', agent: 'publishing', why: 'Book/publishing keyword detected' },
    { key: 'website', agent: 'site', why: 'Website keyword detected' },
    { key: 'web', agent: 'site', why: 'Web/website keyword detected' },
    { key: 'social', agent: 'social', why: 'Social media keyword detected' },
    { key: 'automation', agent: 'content', why: 'Automation/content keyword detected' },
    { key: 'video', agent: 'video', why: 'Video keyword detected' },
    { key: 'payment', agent: 'payment', why: 'Payment/finance keyword detected' },
    { key: 'proposal', agent: 'proposal', why: 'Proposal/business keyword detected' },
    { key: 'client', agent: 'client', why: 'Client/support keyword detected' },
    { key: 'analytics', agent: 'analytics', why: 'Analytics/marketing keyword detected' },
    { key: 'ad', agent: 'ad', why: 'Ad/marketing keyword detected' },
    { key: 'sync', agent: 'sync', why: 'Sync/system keyword detected' },
  ];
  for (const { key, agent, why } of keywordMap) {
    if ((lowerPrompt && lowerPrompt.includes(key)) || (dropdownValue && dropdownValue.includes(key))) {
      const found = agentList.find(a => a.name.toLowerCase().includes(agent) || a.id.toLowerCase().includes(agent));
      if (found && !matches.some(m => m.name === found.name)) {
        logs.push(`Matched prompt/dropdown: ${key} → ${found.name}`);
        matches.push({
          name: found.name,
          description: found.description,
          why,
          action: () => routerResult?.routeToAgent && routerResult.routeToAgent(found.intent || found.id)
        });
      }
    }
  }

  // Fallback: top visible agents
  if (matches.length === 0) {
    logs.push('No strong match found, using fallback agents');
    agentList.filter(a => a.visible).slice(0, 3).forEach(agent => {
      matches.push({
        name: agent.name,
        description: agent.description,
        why: 'Fallback: top visible agent',
        action: () => routerResult?.routeToAgent && routerResult.routeToAgent(agent.intent || agent.id)
      });
    });
  }

  // Limit to top 2–3
  const result = matches.slice(0, 3);
  // Log all routing decisions
  console.log('[Percy SmartMatch] Input:', { prompt, file, dropdown });
  logs.forEach(log => console.log('[Percy SmartMatch]', log));
  console.log('[Percy SmartMatch] Suggestions:', result.map(r => r.name));
  return result;
}

// Expose a test/mock function for onboarding scenarios
export function testPercyAgentMatching(routerResult?: any) {
  const cases = [
    { prompt: 'I want to publish a book', file: null, dropdown: '', label: 'Book Publishing' },
    { prompt: 'Help me with branding and logo', file: null, dropdown: '', label: 'Branding' },
    { prompt: 'I need social media automation', file: null, dropdown: '', label: 'Social Media' },
    { prompt: '', file: { name: 'mybook.pdf', type: 'application/pdf' }, dropdown: '', label: 'File Upload (Book)' },
    { prompt: '', file: { name: 'content.txt', type: 'text/plain' }, dropdown: '', label: 'File Upload (Content)' },
    { prompt: '', file: null, dropdown: 'video', label: 'Dropdown (Video)' },
    { prompt: '', file: null, dropdown: '', label: 'Fallback' },
  ];
  return cases.map(test => ({
    label: test.label,
    suggestions: getSmartAgentSuggestions({ ...test, routerResult })
  }));
}

function PercyWidget() {
  // Always call hooks at the top level
  const routerResult = usePercyRouter();
  const [open, setOpen] = useState(false);
  const [lastUsedIntent, setLastUsedIntent] = useState<string>('');
  const { setPercyIntent, closePercy } = usePercyContext();
  const pathname = usePathname();

  // Listen for agent selection events from AgentGrid
  useEffect(() => {
    function handleOpenPercyAgent(e: any) {
      const agentName = e?.detail?.agent;
      if (agentName) {
        setOpen(true);
        setLastUsedAgent(agentName);
        setLastUsedIntent(agentName);
        // Optionally, show a welcome message for the agent
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: `You selected the ${agentName} agent. How can I help you?` }
        ]);
      }
    }
    window.addEventListener('open-percy-agent', handleOpenPercyAgent);
    return () => window.removeEventListener('open-percy-agent', handleOpenPercyAgent);
  }, []);

  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; text: string }[]>([
    { role: 'assistant', text: 'Hi! I\'m Percy, your AI concierge. How can I help you today?' }
  ]);
  const [memory, setMemory] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [running, setRunning] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [pendingAgent, setPendingAgent] = useState<{ name: string; description: string } | null>(null);
  const [userProfile, setUserProfile] = useState<{ goal: string; platform: string }>({ goal: '', platform: '' });
  // Hide agent suggestions by default - only show after specific interactions
  const [showAgentSuggestions, setShowAgentSuggestions] = useState(false);
  const [suggestedAgents, setSuggestedAgents] = useState<any[]>([]);
  const [agentTooltip, setAgentTooltip] = useState<string | null>(null);
  const [lastUsedAgent, setLastUsedAgent] = useState<string | null>(null);
  const [intakeComplete, setIntakeComplete] = useState(false);
  const lastUsedAgentObj = lastUsedAgent ? agentRegistry.find(a => a.intent === lastUsedAgent || a.id === lastUsedAgent) : null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const agent = localStorage.getItem('lastUsedAgent');
      setLastUsedAgent(agent);
      const intake = localStorage.getItem('intakeComplete');
      setIntakeComplete(intake === 'true');
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
      // Don't automatically show agent suggestions
      if (complete && typeof window !== 'undefined') {
        const goal = localStorage.getItem('userGoal') || '';
        const platform = localStorage.getItem('userPlatform') || '';
        setUserProfile({ goal, platform });
        // Load but don't display agent matches
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

  // Prefill intent from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastIntent = localStorage.getItem('lastUsedAgent');
      if (lastIntent) {
        setPercyIntent(lastIntent);
        console.log('[Percy] Prefilled percyIntent from localStorage:', lastIntent);
      }
    }
  }, [setPercyIntent]);

  // Reset percyIntent on route change
  useEffect(() => {
    setPercyIntent('');
    console.log('[Percy] percyIntent reset on route change:', pathname);
  }, [pathname, setPercyIntent]);

  useEffect(() => {
    console.log('[Percy] Message history:', getPercyMessageHistory());
  }, []);

  if (!routerResult) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('PercyWidget: PercyProvider not found, skipping render.');
    }
    return null;
  }

  const { routeToAgent } = routerResult;

  // Update routing logic to save percyIntent and handle fallback
  const safeRouteToAgent = (intent: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastUsedAgent', intent);
    }
    console.log('[Percy] Routing to agent. Intent:', intent);
    const agent = agentRegistry.find(agent => agent.intent === intent);
    if (agent && agent.route) {
      console.log('[Percy] Found agent route:', agent.route);
      saveIntentMemory(intent);
      routerResult.routeToAgent(intent);
    } else {
      console.warn('[Percy] No route found for agent intent:', intent);
      if (routerResult && routerResult.routeToAgent) {
        routerResult.routeToAgent(''); // fallback to error route
      }
      if (typeof window !== 'undefined') {
        window.location.href = '/ask-percy?error=not-found';
      }
    }
  };

  // Process user input to determine intent and route to appropriate agent
  const processUserInput = (input: string) => {
    // Simple intent detection based on keywords
    // In a real-world scenario, this should use a more robust NLP solution
    const lowerInput = input.toLowerCase();
    
    if (!intakeComplete) {
      // First, guide the user through a mini-intake if not completed
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
      
      // If no specific intent is detected, show a helpful response
      setMessages(prev => [...prev, 
        { role: 'assistant', text: 'I\'m here to help you with marketing, content creation, branding, or website development. What specific area are you interested in?' }
      ]);
    } else {
      // For returning users who completed intake, provide quick routing
      setMessages(prev => [...prev, 
        { role: 'assistant', text: 'I\'ll help you with that. Let me suggest a few relevant agents...' }
      ]);
      // Now show agent suggestions based on their input
      setShowAgentSuggestions(true);
    }
  };

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
    const agentResult = await runAgentWorkflow(agent.id, payload);
    
    // Log workflow in Supabase
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
    
    // Log Percy message after agentResult
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
    // Refresh memory chips after run
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

  // Handle agent card click
  const handleAgentClick = (agent: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastSelectedAgent', agent.intent);
    }
    // Acknowledge selection in chat before routing
    setMessages((prev) => [...prev, 
      { role: 'assistant', text: `Great choice! I'm connecting you with ${agent.name} now...` }
    ]);
    // Route to PercyChat with personalized welcome
    setTimeout(() => safeRouteToAgent(agent.intent), 1000);
  };

  // Add Back to Start logic
  const handleBackToStart = () => {
    closePercy();
    setPercyIntent('');
    console.log('[Percy] Back to Start: isOpen=false, percyIntent=\'\'');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <>
      {showOnboarding && (
        <PercyOnboarding
          onComplete={({ goal, platform }) => {
            setShowOnboarding(false);
            setUserProfile({ goal, platform });
            setSuggestedAgents(getBestAgents(goal, platform));
            // Don't automatically show agent suggestions after onboarding
            // Let Percy guide the conversation first
          }}
        />
      )}
      {showUpsellModal && pendingAgent && (
        <UpsellModal agent={pendingAgent} onClose={() => setShowUpsellModal(false)} />
      )}
      {/* Agent suggestions - only shown after specific user interactions */}
      <AnimatePresence>
        {showAgentSuggestions && suggestedAgents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
            className="max-w-md fixed bottom-24 right-6 z-50"
          >
            <div className="bg-white/10 backdrop-blur border border-teal-400/20 rounded-xl p-4 shadow-2xl">
              <h3 className="text-lg font-semibold mb-3 text-white">Recommended agents:</h3>
              <div className="flex flex-col gap-2">
                {suggestedAgents.map((agent, idx) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1, duration: 0.3 }}
                    className="p-3 rounded-lg flex items-center gap-2 bg-white/10 hover:bg-teal-400/20 
                              border border-white/20 cursor-pointer transition-all"
                    onClick={() => handleAgentClick(agent)}
                  >
                    <div className="text-2xl">
                      {agent.category === 'Brand Development' ? '🎨' : 
                       agent.category === 'Content Creation' ? '✍️' : 
                       agent.category === 'Social Media' ? '📱' : 
                       agent.category === 'Website' ? '🌐' : '🤖'}
                    </div>
                    <div>
                      <div className="font-medium text-white">{agent.name}</div>
                      <div className="text-xs text-teal-200">{agent.description && agent.description.substring(0, 40)}...</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50">
        {/* Toggle Button with Enhanced Percy Animation */}
        <motion.button
          onClick={() => setOpen(!open)}
          className={`relative shadow-lg flex items-center gap-2 transition-all duration-300 ${
            open 
            ? "bg-white/10 backdrop-blur-md border border-white/30 text-white px-4 py-3 rounded-full" 
            : "bg-gradient-to-r from-electric-blue to-teal-400 text-white px-4 py-3 rounded-full"
          }`}
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
          {open ? (
            <>✖️ Close Percy</>
          ) : (
            <>
              <motion.div
                className="relative"
                animate={{
                  y: [0, -3, 0],
                  rotate: [0, 0, 0],
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
                  src="/images/agents-percy-fullbody-nobg-skrblai.png" 
                  alt="Percy" 
                  className="w-8 h-8 object-contain"
                />
              </motion.div>
              <span>Ask Percy</span>
            </>
          )}
        </motion.button>

        {/* Enhanced Chat Bubble */}
        <AnimatePresence>
          {open && (
            <motion.div 
              className="mt-4 w-80 bg-white/10 backdrop-blur-lg border border-electric-blue/30 rounded-xl shadow-2xl text-white overflow-hidden"
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
                    src="/images/agents-percy-fullbody-nobg-skrblai.png" 
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
                {/* Percy Chat History with Improved Styling */}
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
                
                {/* Recently Used Agent Badge */}
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
                
                {/* Enhanced Input Field */}
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
                
                {/* Logic-only Back to Start button (no UI change) */}
                <button type="button" className={styles.hiddenButton} onClick={handleBackToStart} aria-label="Back to Start" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
