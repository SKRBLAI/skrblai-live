'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import PercyButton from './PercyButton';
import agentRegistry from '@/lib/agents/agentRegistry';
import FloatingParticles from '@/components/ui/FloatingParticles';

interface PercyChatProps {
  onComplete?: (data: { name: string; email: string; plan: string; intent: string }) => void;
}

interface Step {
  message: string;
  input?: boolean;
  field?: 'name' | 'email' | 'goal';
  options?: string[];
  action: (inputValue: string) => void;
}

import { usePercyContext } from '../contexts/PercyContext';

// Example prompts by agent intent
const AGENT_PROMPTS: Record<string, string[]> = {
  branding: [
    'Help me craft a brand story.',
    'Write a tagline for my company.',
    'Suggest a color palette for a tech brand.'
  ],
  content: [
    'Draft a blog post about AI trends.',
    'Create 5 LinkedIn headlines for a launch.',
    'Write a product description for a new app.'
  ],
  'video-content': [
    'Generate a YouTube video script outline.',
    'Suggest viral video hooks.',
    'Write a TikTok caption for a product demo.'
  ],
  'book-publishing': [
    'Outline a book about entrepreneurship.',
    'Suggest chapter titles for a self-help book.'
  ],
  website: [
    'Create a landing page for a SaaS startup.',
    'Suggest hero section copy for a portfolio site.'
  ],
  'social-bot': [
    'Plan a week of Instagram posts.',
    'Write a Twitter thread about AI.'
  ]
};
const DEFAULT_PROMPTS = [
  'Show me what you can automate.',
  'How can I grow my business with SKRBL AI?',
  'What agents do you recommend for content?'
];

const SMART_SUGGESTIONS = [
  { label: 'Need help picking an agent?', action: 'pick-agent' },
  { label: 'Want to start a new workflow?', action: 'start-workflow' },
  { label: 'Explore more features?', action: 'explore-features' }
];

// Workflow metadata for launchpad workflows
const WORKFLOWS = {
  'social-growth': {
    title: 'Social Media Growth Machine',
    description: 'Rapidly scale your social channels with coordinated AI agents for content, branding, and automation.',
    agents: [
      { name: 'SocialBot', avatar: '/avatars/social-bot.png' },
      { name: 'BrandingAgent', avatar: '/avatars/branding-agent.png' },
      { name: 'ContentAgent', avatar: '/avatars/content-agent.png' }
    ],
    initialPrompt: 'Let’s kickstart your social media growth! What platform or campaign do you want to focus on first?'
  },
  'content-factory': {
    title: 'Automated Content Factory',
    description: 'Produce, schedule, and publish high-quality content with zero manual effort.',
    agents: [
      { name: 'ContentAgent', avatar: '/avatars/content-agent.png' },
      { name: 'VideoContentAgent', avatar: '/avatars/video-content-agent.png' },
      { name: 'SocialBot', avatar: '/avatars/social-bot.png' }
    ],
    initialPrompt: 'Welcome to the Automated Content Factory! What type of content would you like to produce today?'
  },
  'brand-launch': {
    title: 'AI Brand Launch Strategy',
    description: 'Launch your brand with a unified AI-powered strategy across all platforms.',
    agents: [
      { name: 'BrandingAgent', avatar: '/avatars/branding-agent.png' },
      { name: 'AnalyticsAgent', avatar: '/avatars/analytics-agent.png' },
      { name: 'SitegenAgent', avatar: '/avatars/sitegen-agent.png' }
    ],
    initialPrompt: 'Ready to launch your brand? Tell us your brand name or vision to get started.'
  }
} as const;

type WorkflowId = keyof typeof WORKFLOWS;

type WorkflowAgent = {
  name: string;
  avatar: string;
};

export default function PercyChat({ onComplete }: PercyChatProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('');
  const [recommendedAgent, setRecommendedAgent] = useState<any>(null);
  const { routeToAgent } = usePercyContext();
  const [agentIntent, setAgentIntent] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [agentDesc, setAgentDesc] = useState<string | null>(null);
  const [examplePrompts, setExamplePrompts] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [chat, setChat] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  // Workflow state
  const [workflowId, setWorkflowId] = useState<WorkflowId | null>(null);
  const [workflowAgents, setWorkflowAgents] = useState<WorkflowAgent[]>([]);
  const [workflowTitle, setWorkflowTitle] = useState<string | null>(null);
  const [workflowDesc, setWorkflowDesc] = useState<string | null>(null);
  const [workflowInitialPrompt, setWorkflowInitialPrompt] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Smart Proposal Generator workflow state
  const [proposalStep, setProposalStep] = useState(0);
  const [proposalData, setProposalData] = useState({
    projectName: '',
    targetAudience: '',
    budget: '',
    notes: ''
  });
  const [isProposalComplete, setIsProposalComplete] = useState(false);

  // Proposal workflow steps
  const proposalSteps = [
    {
      label: 'Project Name',
      placeholder: 'e.g. AI-Powered Marketing Platform',
      field: 'projectName',
    },
    {
      label: 'Target Audience',
      placeholder: 'e.g. Small businesses, SaaS founders',
      field: 'targetAudience',
    },
    {
      label: 'Budget',
      placeholder: 'e.g. $5,000',
      field: 'budget',
    },
    {
      label: 'Key Notes',
      placeholder: 'e.g. Focus on automation, must integrate with Zapier...',
      field: 'notes',
    },
  ];

  // On mount, check for workflow param, else fallback to agent onboarding
  useEffect(() => {
    // Check for workflow param
    const workflowParam = searchParams?.get('workflow') as WorkflowId | null;
    if (workflowParam && WORKFLOWS[workflowParam]) {
      setWorkflowId(workflowParam);
      setWorkflowAgents(WORKFLOWS[workflowParam].agents.slice()); // convert readonly to mutable
      setWorkflowTitle(WORKFLOWS[workflowParam].title);
      setWorkflowDesc(WORKFLOWS[workflowParam].description);
      setWorkflowInitialPrompt(WORKFLOWS[workflowParam].initialPrompt);
      setChat([{ role: 'assistant', text: WORKFLOWS[workflowParam].initialPrompt }]);
      setStep(0);
      setAgentIntent(null); // disables agent onboarding UI
      setAgentName(null);
      setAgentDesc(null);
      setExamplePrompts([]);
      return;
    }
    // Default: agent onboarding
    let intent: string | null = null;
    if (typeof window !== 'undefined') {
      intent = localStorage.getItem('lastSelectedAgent');
    }
    setAgentIntent(intent);
    if (intent) {
      const agent = agentRegistry.find(a => a.intent === intent);
      setAgentName(agent?.name || null);
      setAgentDesc(agent?.description || null);
      setExamplePrompts(AGENT_PROMPTS[intent] || DEFAULT_PROMPTS);
    } else {
      setAgentName(null);
      setAgentDesc(null);
      setExamplePrompts(DEFAULT_PROMPTS);
    }
  }, [searchParams]);

  // Step logic
  const steps: Step[] = [
    {
      message: "What's your name?",
      input: true,
      field: 'name',
      action: (value: string) => {
        setName(value);
        setStep(1);
      }
    },
    {
      message: `Nice to meet you, ${name}! What's your email address?`,
      input: true,
      field: 'email',
      action: (value: string) => {
        setEmail(value);
        setStep(2);
      }
    },
    {
      message: "What is your business or main goal for using SKRBL AI?",
      input: true,
      field: 'goal',
      action: (value: string) => {
        setGoal(value);
        // Find best agent by keyword/category/intent match
        const lower = value.toLowerCase();
        let agent = agentRegistry.find(a => a.visible && (
          (a.category && lower.includes(a.category.toLowerCase())) ||
          (a.name && lower.includes(a.name.toLowerCase())) ||
          (a.intent && lower.includes(a.intent.toLowerCase()))
        ));
        // Fallback: match by keywords
        if (!agent) {
          if (lower.includes('brand')) agent = agentRegistry.find(a => a.intent === 'branding');
          else if (lower.includes('book')) agent = agentRegistry.find(a => a.intent === 'book-publishing');
          else if (lower.includes('content')) agent = agentRegistry.find(a => a.intent === 'content');
          else if (lower.includes('website')) agent = agentRegistry.find(a => a.intent === 'website');
          else if (lower.includes('social')) agent = agentRegistry.find(a => a.intent === 'social-bot');
        }
        setRecommendedAgent(agent);
        setStep(3);
      }
    },
    {
      message: recommendedAgent
        ? `Percy recommends: ${recommendedAgent.name}\n${recommendedAgent.description}`
        : "Let me find the best agent for you...",
      input: false,
      action: () => {},
    }
  ];

  // Mark onboarding complete in localStorage
  const handleStartNow = () => {
    if (recommendedAgent) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('percyOnboarding', 'complete');
        localStorage.setItem('lastSelectedAgent', recommendedAgent.intent);
      }
      if (onComplete) {
        onComplete({ name, email, plan: 'Initial Inquiry', intent: recommendedAgent.intent });
      }
      routeToAgent(recommendedAgent.intent);
    }
  };

  // Handle prompt click: fill input
  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle sending a message
  const handleSend = () => {
    if (!inputValue.trim()) return;
    setChat(prev => [...prev, { role: 'user', text: inputValue }]);
    setInputValue('');
    setIsTyping(true);
    // Simulate Percy typing and response
    setTimeout(() => {
      setChat(prev => [...prev, { role: 'assistant', text: getPercyResponse(inputValue) }]);
      setIsTyping(false);
    }, 1200);
  };

  // Smart suggestion logic: show after every 2-3 turns
  const showSmartSuggestions = chat.length > 0 && chat.length % 3 === 0;

  // Smart suggestion chip click
  const handleSuggestion = (action: string) => {
    if (action === 'pick-agent') {
      setInputValue('Help me pick an agent.');
      if (inputRef.current) inputRef.current.focus();
    } else if (action === 'start-workflow') {
      setInputValue('Start a new workflow.');
      if (inputRef.current) inputRef.current.focus();
    } else if (action === 'explore-features') {
      window.location.href = '/services';
    }
  };

  // Clear chat
  const handleClearChat = () => {
    setChat([]);
    setInputValue('');
    setStep(0);
    setName('');
    setEmail('');
    setGoal('');
    setRecommendedAgent(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('percyOnboarding');
      localStorage.removeItem('lastSelectedAgent');
    }
  };

  // Percy response simulation (can be replaced with real AI)
  function getPercyResponse(input: string) {
    if (input.toLowerCase().includes('agent')) return 'Sure! Tell me a bit about your business and I\'ll recommend the best agent.';
    if (input.toLowerCase().includes('workflow')) return 'Let\'s start a new workflow. What would you like to automate?';
    if (input.toLowerCase().includes('feature')) return 'Check out all the features SKRBL AI offers on our Services page!';
    return 'Great! I\'m here to help. Ask me anything or try one of the suggestions below.';
  }

  // Personalized welcome message
  const welcomeMsg = agentName
    ? `Awesome! Let's get started with ${agentName}. What would you like me to help you with first?`
    : "Hi there! I'm Percy. How can I help you automate today?";

  // Handle proposal input change
  const handleProposalInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProposalData(prev => ({ ...prev, [name]: value }));
  };

  // Handle proposal step continue
  const handleProposalContinue = () => {
    if (proposalStep < proposalSteps.length - 1) {
      setProposalStep(proposalStep + 1);
    } else {
      // Complete: store in localStorage and redirect
      setIsProposalComplete(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smartProposalData', JSON.stringify(proposalData));
        window.location.href = '/proposal/preview';
      }
    }
  };

  // If smart-proposal intent, show proposal workflow
  if (agentIntent === 'smart-proposal') {
    return (
      <div className="relative">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <FloatingParticles />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 rounded-2xl max-w-xl w-full relative overflow-hidden"
        >
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent drop-shadow-glow"
          >
            Smart Proposal Generator
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center text-teal-200 mb-8"
          >
            Percy will help you create a beautiful business proposal in just a few steps.
          </motion.p>
          <div className="space-y-8">
            {proposalSteps.map((stepObj, idx) => (
              <AnimatePresence key={stepObj.field}>
                {proposalStep === idx && (
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col gap-4"
                  >
                    <label className="text-lg font-semibold text-white mb-2">{stepObj.label}</label>
                    {stepObj.field === 'notes' ? (
                      <textarea
                        name={stepObj.field}
                        value={proposalData[stepObj.field as keyof typeof proposalData]}
                        onChange={handleProposalInput}
                        rows={4}
                        className="bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 glass-card"
                        placeholder={stepObj.placeholder}
                        autoFocus
                      />
                    ) : (
                      <input
                        name={stepObj.field}
                        type="text"
                        value={proposalData[stepObj.field as keyof typeof proposalData]}
                        onChange={handleProposalInput}
                        className="bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 glass-card"
                        placeholder={stepObj.placeholder}
                        autoFocus
                      />
                    )}
                    <PercyButton
                      onClick={handleProposalContinue}
                      label={proposalStep === proposalSteps.length - 1 ? 'Finish & Preview' : 'Continue'}
                      disabled={!proposalData[stepObj.field as keyof typeof proposalData]}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Workflow Launchpad Mode
  if (workflowId && workflowTitle && workflowAgents.length > 0) {
    return (
      <div className="relative">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <FloatingParticles />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 rounded-2xl max-w-xl w-full relative overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent drop-shadow-glow mb-2">
              {workflowTitle}
            </h2>
            <p className="text-center text-teal-200 text-sm mb-3">{workflowDesc}</p>
            <div className="flex justify-center gap-4 mb-2">
              {workflowAgents.map(agent => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-electric-blue to-teal-400 flex items-center justify-center overflow-hidden border-2 border-electric-blue/40">
                    <img src={agent.avatar} alt={agent.name} width={48} height={48} />
                  </div>
                  <span className="text-xs text-white mt-1">{agent.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          {/* Chat Bubbles */}
          <div className="space-y-3 mb-6">
            {chat.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`max-w-[90%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'} flex`}
              >
                <div className={`glass-card px-4 py-3 rounded-2xl border ${msg.role === 'assistant' ? 'border-teal-400/40' : 'border-white/20'} shadow-md relative`}>
                  {msg.role === 'assistant' && idx === chat.length - 1 && isTyping ? (
                    <span className="inline-flex items-center gap-1 text-teal-200">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce delay-100">.</span>
                      <span className="animate-bounce delay-200">.</span>
                    </span>
                  ) : (
                    <span className="text-white whitespace-pre-line">{msg.text}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          {/* Input + Clear Chat Button */}
          <div className="flex items-center gap-2 mt-2 relative">
            <motion.input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onKeyDown={e => { if (e.key === 'Enter') handleWorkflowSend(); }}
              placeholder="Type your message..."
              className={`flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none transition-all ${inputFocused ? 'ring-2 ring-teal-400 shadow-lg scale-105' : ''}`}
              style={{ minWidth: 0 }}
              autoComplete="off"
            />
            <motion.button
              onClick={handleWorkflowSend}
              whileHover={{ scale: 1.08 }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-400 to-purple-500 text-white font-bold shadow-glow border-2 border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all"
            >
              Send
            </motion.button>
            <motion.button
              onClick={handleWorkflowClear}
              whileHover={{ scale: 1.08, boxShadow: '0 0 12px #14ffe9' }}
              className="ml-2 px-3 py-2 rounded-lg bg-white/10 border border-teal-400/40 text-white font-medium shadow-md glass-card hover:bg-teal-500/20 hover:text-teal-200 transition-all"
              aria-label="Clear Chat"
            >
              Clear
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Workflow chat logic
  function handleWorkflowSend() {
    if (!inputValue.trim()) return;
    setChat(prev => [...prev, { role: 'user', text: inputValue }]);
    setInputValue('');
    setIsTyping(true);
    setTimeout(() => {
      setChat(prev => [...prev, { role: 'assistant', text: getPercyWorkflowResponse(inputValue) }]);
      setIsTyping(false);
    }, 1100);
  }
  function handleWorkflowClear() {
    setChat(workflowInitialPrompt ? [{ role: 'assistant', text: workflowInitialPrompt }] : []);
    setInputValue('');
  }
  // Workflow-specific Percy response (placeholder logic)
  function getPercyWorkflowResponse(input: string) {
    // You can expand this logic to be workflow-specific
    if (input.toLowerCase().includes('video')) return 'Great, let’s plan your next video!';
    if (input.toLowerCase().includes('brand')) return 'BrandingAgent: Let’s work on your brand identity.';
    if (input.toLowerCase().includes('content')) return 'ContentAgent: Here are some content ideas.';
    if (input.toLowerCase().includes('analytics')) return 'AnalyticsAgent: Let’s review your metrics.';
    return 'Workflow team is ready! Ask for help, or describe your next step.';
  }

  // Default: agent onboarding and regular chat
  return (
    <div className="relative">
      {/* Floating Particles Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <FloatingParticles />
      </div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 rounded-2xl max-w-xl w-full relative overflow-hidden"
      >
        {/* Personalized Percy Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <p className="text-xl text-white font-semibold text-center mb-2">
            {welcomeMsg}
          </p>
          {agentDesc && (
            <p className="text-center text-teal-200 text-sm mb-2">{agentDesc}</p>
          )}
        </motion.div>
        {/* Example Prompts */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center mb-6"
          initial="hidden"
          animate="visible"
        >
          {examplePrompts.map((prompt, idx) => (
            <motion.button
              key={prompt}
              onClick={() => handlePromptClick(prompt)}
              className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium glass-card border border-teal-400/30 hover:bg-teal-500/20 hover:text-teal-200 transition-all shadow-md"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.12, duration: 0.4, type: 'spring' }}
              whileHover={{ scale: 1.06, boxShadow: '0 0 12px #14ffe9' }}
            >
              {prompt}
            </motion.button>
          ))}
        </motion.div>
        {/* Chat Bubbles */}
        <div className="space-y-3 mb-6">
          {chat.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`max-w-[90%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'} flex`}
            >
              <div className={`glass-card px-4 py-3 rounded-2xl border ${msg.role === 'assistant' ? 'border-teal-400/40' : 'border-white/20'} shadow-md relative`}> 
                {msg.role === 'assistant' && idx === chat.length - 1 && isTyping ? (
                  <span className="inline-flex items-center gap-1 text-teal-200">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </span>
                ) : (
                  <span className="text-white">{msg.text}</span>
                )}
              </div>
            </motion.div>
          ))}
          {/* Smart Suggestion Chips */}
          <AnimatePresence>
            {showSmartSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.4 }}
                className="flex flex-wrap gap-2 justify-center mt-2"
              >
                {SMART_SUGGESTIONS.map((s, idx) => (
                  <motion.button
                    key={s.action}
                    onClick={() => handleSuggestion(s.action)}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium glass-card border border-teal-400/30 hover:bg-teal-500/20 hover:text-teal-200 transition-all shadow-md"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1, duration: 0.3, type: 'spring' }}
                    whileHover={{ scale: 1.06, boxShadow: '0 0 12px #14ffe9' }}
                  >
                    {s.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Input + Clear Chat Button */}
        <div className="flex items-center gap-2 mt-2 relative">
          <motion.input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Type your message..."
            className={`flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none transition-all ${inputFocused ? 'ring-2 ring-teal-400 shadow-lg scale-105' : ''}`}
            style={{ minWidth: 0 }}
            autoComplete="off"
          />
          <motion.button
            onClick={handleSend}
            whileHover={{ scale: 1.08 }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-400 to-purple-500 text-white font-bold shadow-glow border-2 border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all"
          >
            Send
          </motion.button>
          {/* Clear Chat Button */}
          <motion.button
            onClick={handleClearChat}
            whileHover={{ scale: 1.08, boxShadow: '0 0 12px #14ffe9' }}
            className="ml-2 px-3 py-2 rounded-lg bg-white/10 border border-teal-400/40 text-white font-medium shadow-md glass-card hover:bg-teal-500/20 hover:text-teal-200 transition-all"
            aria-label="Clear Chat"
          >
            Clear
          </motion.button>
        </div>
        {/* Onboarding steps */}
        <div className="space-y-4 mt-8">
          {steps.slice(0, step + 1).map((s, i) => (
            <div key={i} className="space-y-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 p-4 rounded-lg"
              >
                <p className="text-white whitespace-pre-line">{s.message}</p>
              </motion.div>
              {i === step && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col space-y-2"
                >
                  {s.input ? (
                    <input
                      ref={inputRef}
                      type={s.field === 'email' ? 'email' : 'text'}
                      value={s.field === 'name' ? name : s.field === 'email' ? email : s.field === 'goal' ? goal : inputValue}
                      onChange={(e) => {
                        if (s.field === 'name') setName(e.target.value);
                        else if (s.field === 'email') setEmail(e.target.value);
                        else if (s.field === 'goal') setGoal(e.target.value);
                        else setInputValue(e.target.value);
                      }}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder={s.field === 'name' ? 'Your name' : s.field === 'email' ? 'your@email.com' : 'e.g. Grow my brand, automate content...'}
                    />
                  ) : (
                    recommendedAgent && (
                      <PercyButton
                        onClick={handleStartNow}
                        label={`Start Now with ${recommendedAgent.name}`}
                      />
                    )
                  )}
                  {s.input && (
                    <PercyButton
                      onClick={() => s.action(s.field === 'name' ? name : s.field === 'email' ? email : s.field === 'goal' ? goal : inputValue)}
                      label="Continue"
                      disabled={
                        (s.field === 'name' && !name) ||
                        (s.field === 'email' && !email) ||
                        (s.field === 'goal' && !goal)
                      }
                    />
                  )}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
