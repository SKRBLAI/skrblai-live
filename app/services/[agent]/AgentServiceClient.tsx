'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Agent } from '@/types/agent';
import { agentBackstories } from '../../../lib/agents/agentBackstories';
import { getAgentImagePath } from '../../../utils/agentUtils';
import GlassmorphicCard from '../../../components/shared/GlassmorphicCard';
import CosmicButton from '../../../components/shared/CosmicButton';
import { Play, Info, MessageCircle, Zap, TrendingUp, Users, Clock, Target, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AgentServiceClientProps {
  agent: Agent | undefined;
  params: { agent: string };
}

export default function AgentServiceClient({ agent, params }: AgentServiceClientProps) {
  const router = useRouter();
  const [showBackstory, setShowBackstory] = useState(false);
  const [liveUsers, setLiveUsers] = useState(Math.floor(Math.random() * 89) + 12);
  const [successRate, setSuccessRate] = useState(Math.floor(Math.random() * 15) + 85);
  const [urgencySpots, setUrgencySpots] = useState(Math.floor(Math.random() * 47) + 23);
  const [isLaunching, setIsLaunching] = useState(false);

  // Live metrics animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
      if (Math.random() > 0.8) {
        setUrgencySpots(prev => Math.max(1, prev - 1));
      }
      if (Math.random() > 0.9) {
        setSuccessRate(prev => Math.min(99, Math.max(85, prev + Math.floor(Math.random() * 3) - 1)));
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!agent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0d1117] to-[#161b22]">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="text-center max-w-lg mx-4"
        >
          <div className="text-6xl mb-6">🤖💫</div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Agent Not Found in The League
          </h1>
          <p className="text-gray-300 mb-8 text-lg">
            The agent "{params.agent}" isn't available or might be on a secret mission. 
            Let Percy help you find the perfect alternative!
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/agents" className="cosmic-btn-primary px-6 py-3 rounded-xl">
              Browse Agent League
            </Link>
            <Link href="/services" className="cosmic-btn-secondary px-6 py-3 rounded-xl">
              View All Services
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const backstory = agentBackstories[agent.id];
  const agentImagePath = getAgentImagePath(agent, "card");

  // Enhanced emoji mapping
  const emojiMap: { [key: string]: string } = {
    "Brand Development": "🎨",
    "Ebook Creation": "📚", 
    "Paid Marketing": "💸",
    "Business Intelligence": "📊",
    "Strategy & Growth": "🚀",
    "Support Automation": "🤖",
    "Sales Enablement": "📈",
    "Short-Form Video": "🎬",
    "Copywriting": "✍️",
    "Automation": "⚡",
    "Social Media Automation": "📱",
    "Web Automation": "🌐",
    "Back Office": "💼",
    "Concierge": "🤖",
    "Orchestration": "🔗",
  };
  const emoji = emojiMap[agent.category] || "🤖";

  // Agent capabilities showcase
  const capabilities = backstory?.powers || agent.capabilities || [
    'Advanced AI Processing',
    'Workflow Automation',
    'Task Optimization'
  ];

  // Mock workflow steps
  const workflowSteps = [
    { step: 1, title: "Agent Activation", description: "Initialize agent with your requirements", time: "30 seconds" },
    { step: 2, title: "Intelligence Analysis", description: "Agent analyzes your data and context", time: "2-5 minutes" },
    { step: 3, title: "Solution Generation", description: "Creates optimized solution for your needs", time: "3-10 minutes" },
    { step: 4, title: "Results Delivery", description: "Delivers completed work to your dashboard", time: "Instant" }
  ];

  const handleLaunchAgent = () => {
    setIsLaunching(true);
    // Simulate agent launch process
    setTimeout(() => {
      // Navigate to the actual agent workflow or dashboard
      if (agent.route) {
        router.push(agent.route);
      } else {
        router.push(`/dashboard?agent=${agent.id}&action=launch`);
      }
    }, 2000);
  };

  const handleStartChat = () => {
    // MMM Protocol: Remove chat functionality for workflow-only agents (n8n limits)
    // Publishing agent chat restored per user request
    const workflowOnlyAgents = ['site', 'clientsuccess', 'payment', 'proposal-agent'];
    
    if (workflowOnlyAgents.includes(agent.id)) {
      toast.success(`${agent.name} excels at automated workflows! Click the Launch button for instant results! ⚡`, {
        duration: 4000,
        icon: '🚀'
      });
      return;
    }
    
    router.push(`/agents/${agent.id}/chat`);
  };

  const handleViewBackstory = () => {
    router.push(`/agent-backstory/${agent.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#0d1117] relative">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 md:px-8 lg:px-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          {/* Live Activity Bar */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-bold">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              🔥 {liveUsers} using this agent now
            </div>
            <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
              ⚡ {urgencySpots} spots left today
            </div>
            <div className="flex items-center gap-2 bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-sm font-bold">
              📊 {successRate}% success rate
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Agent Info */}
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center gap-6 mb-8"
              >
                <div className="relative">
                  <Image
                    src={agentImagePath}
                    alt={agent.name}
                    width={120}
                    height={120}
                    className="rounded-2xl shadow-2xl border-4 border-cyan-400/30"
                    onError={(e) => {
                      e.currentTarget.src = '/images/agents-default-nobg-skrblai.webp';
                    }}
                  />
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-cyan-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                    LIVE
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{emoji}</span>
                    <div>
                      <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {backstory?.superheroName || agent.name}
                      </h1>
                      <div className="text-cyan-300 font-semibold text-lg">{agent.category}</div>
                    </div>
                  </div>
                  {backstory?.catchphrase && (
                    <div className="text-purple-300 italic text-lg font-medium mt-2">
                      "{backstory.catchphrase}"
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-gray-300 text-xl leading-relaxed mb-8"
              >
                {backstory?.backstory || agent.description}
              </motion.p>

              {/* Superpowers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mb-8"
              >
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  Superpowers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {capabilities.slice(0, 6).map((power, index) => (
                    <div key={index} className="flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg p-3 border border-purple-500/30">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-medium">{power}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <CosmicButton
                  onClick={handleLaunchAgent}
                  disabled={isLaunching}
                  className="flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold relative overflow-hidden group"
                >
                  {isLaunching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Launching Agent...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Launch {agent.name.replace('Agent', '').replace('-', ' ')}
                    </>
                  )}
                </CosmicButton>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleStartChat}
                    className={`flex items-center gap-2 px-6 py-4 rounded-xl border transition-all duration-200 font-semibold ${
                      ['site', 'clientsuccess', 'payment', 'proposal-agent'].includes(agent.id)
                        ? 'bg-gradient-to-r from-blue-600/20 to-teal-600/20 text-blue-300 border-blue-500/40 hover:from-blue-600/30 hover:to-teal-600/30 cursor-default'
                        : 'bg-purple-600/20 text-purple-300 border-purple-500/30 hover:bg-purple-600/30'
                    }`}
                    disabled={['site', 'clientsuccess', 'payment', 'proposal-agent'].includes(agent.id)}
                    title={['site', 'clientsuccess', 'payment', 'proposal-agent'].includes(agent.id) 
                      ? 'This agent specializes in automated workflows. Click Launch for instant results!' 
                      : 'Start a conversation with this agent'}
                  >
                    <MessageCircle className="w-5 h-5" />
                    {['site', 'clientsuccess', 'payment', 'proposal-agent'].includes(agent.id) 
                      ? 'Auto Mode' 
                      : 'Chat'}
                  </button>
                  <button
                    onClick={handleViewBackstory}
                    className="flex items-center gap-2 px-6 py-4 bg-cyan-600/20 text-cyan-300 rounded-xl border border-cyan-500/30 hover:bg-cyan-600/30 transition-all duration-200 font-semibold"
                  >
                    <Info className="w-5 h-5" />
                    Backstory
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right: Workflow Demo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <GlassmorphicCard className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-cyan-400" />
                  How {agent.name.replace('Agent', '')} Works
                </h3>
                <div className="space-y-6">
                  {workflowSteps.map((step, index) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + (index * 0.2), duration: 0.5 }}
                      className="flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-semibold">{step.title}</h4>
                          <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <Clock className="w-3 h-3" />
                            {step.time}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassmorphicCard>
            </motion.div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="max-w-7xl mx-auto mt-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Agent Performance Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GlassmorphicCard className="p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{successRate}%</div>
              <div className="text-gray-400">Success Rate</div>
            </GlassmorphicCard>
            <GlassmorphicCard className="p-6 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">{liveUsers}</div>
              <div className="text-gray-400">Active Users</div>
            </GlassmorphicCard>
            <GlassmorphicCard className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">4.9⭐</div>
              <div className="text-gray-400">User Rating</div>
            </GlassmorphicCard>
            <GlassmorphicCard className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
              <div className="text-gray-400">Availability</div>
            </GlassmorphicCard>
          </div>
        </motion.div>

        {/* Competitive Urgency & ROI Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="max-w-6xl mx-auto mt-16"
        >
          <GlassmorphicCard className="p-8 border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center justify-center gap-2">
                <Zap className="w-6 h-6" />
                Your Competitors Are Already Using AI Like This
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">{Math.floor(Math.random() * 50) + 150}</div>
                  <div className="text-gray-300 text-sm">Businesses gained advantage</div>
                  <div className="text-red-300 text-xs">in the last 24 hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">${Math.floor(Math.random() * 500) + 2000}K</div>
                  <div className="text-gray-300 text-sm">Average monthly ROI</div>
                  <div className="text-orange-300 text-xs">reported by users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{Math.floor(Math.random() * 10) + 15} hrs</div>
                  <div className="text-gray-300 text-sm">Time to profitability</div>
                  <div className="text-yellow-300 text-xs">average deployment</div>
                </div>
              </div>
              <p className="text-gray-300 text-lg mb-6">
                While you're reading this, <span className="text-red-400 font-bold">{Math.floor(Math.random() * 5) + 12} more businesses</span> just activated this exact agent. 
                <span className="text-white font-bold"> Don't let them leave you behind.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleLaunchAgent}
                  disabled={isLaunching}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                >
                  🚀 Launch Before Competition Does
                </button>
                <Link href="/pricing" className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300">
                  💰 View ROI Calculator
                </Link>
              </div>
            </div>
          </GlassmorphicCard>
        </motion.div>

        {/* Related Agents */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="max-w-7xl mx-auto mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            Need More Power? Combine with Other Agents
          </h2>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {backstory?.handoffPreferences?.slice(0, 3).map((agentId) => (
              <Link 
                key={agentId}
                href={`/services/${agentId}`}
                className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 text-white px-4 py-2 rounded-full border border-purple-500/30 hover:border-cyan-400/50 transition-all duration-200 font-medium"
              >
                {agentId.replace('-agent', '').replace('-', ' ')}
              </Link>
            )) || (
              <div className="text-gray-400">Additional agent combinations coming soon...</div>
            )}
          </div>
          <Link href="/agents" className="cosmic-btn-secondary px-8 py-3 rounded-xl font-bold">
            Explore Full Agent League
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
