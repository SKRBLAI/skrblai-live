'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, scaleIn } from '@/utils/animations';

interface Agent {
  name: string;
  role: string;
  description: string;
  emoji: string;
  color: string;
}

const agents: Agent[] = [
  {
    name: 'Percy AI',
    role: 'Lead Assistant',
    description: 'Your primary AI assistant for managing content and business growth strategies.',
    emoji: '🤖',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Content Creator',
    role: 'Content Generator',
    description: 'Transforms ideas into polished content across multiple formats and platforms.',
    emoji: '✍️',
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Branding AI',
    role: 'Brand Designer',
    description: 'Creates complete brand identities including colors, typography, and voice guidelines.',
    emoji: '🎨',
    color: 'from-amber-500 to-orange-500'
  },
  {
    name: 'Video Content',
    role: 'Video Specialist',
    description: 'Produces video scripts and content strategies for various formats and platforms.',
    emoji: '🎥',
    color: 'from-emerald-500 to-green-500'
  },
  {
    name: 'Social Bot',
    role: 'Social Media Manager',
    description: 'Manages social media presence and engagement across multiple platforms.',
    emoji: '📱',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    name: 'Analytics AI',
    role: 'Data Analyst',
    description: 'Tracks and analyzes content performance metrics to optimize strategies.',
    emoji: '📊',
    color: 'from-red-500 to-rose-500'
  },
  {
    name: 'Publishing AI',
    role: 'Publishing Expert',
    description: 'Handles content publishing, formatting, and distribution across channels.',
    emoji: '📚',
    color: 'from-yellow-500 to-amber-500'
  },
  {
    name: 'Ad Creative',
    role: 'Ad Specialist',
    description: 'Creates compelling ad copy and creative assets for marketing campaigns.',
    emoji: '🎯',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    name: 'Biz AI',
    role: 'Business Strategist',
    description: 'Provides business insights and strategic recommendations for growth.',
    emoji: '💼',
    color: 'from-violet-500 to-purple-500'
  },
  {
    name: 'Client Success',
    role: 'Support Specialist',
    description: 'Ensures client satisfaction and provides ongoing support and guidance.',
    emoji: '🌟',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    name: 'Payment Manager',
    role: 'Finance Handler',
    description: 'Manages payments, subscriptions, and financial transactions securely.',
    emoji: '💳',
    color: 'from-pink-500 to-rose-500'
  },
  {
    name: 'Proposal Generator',
    role: 'Sales Assistant',
    description: 'Creates customized business proposals and sales documents.',
    emoji: '📝',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    name: 'Site Generator',
    role: 'Web Developer',
    description: 'Builds and optimizes websites with AI-powered features and automation.',
    emoji: '🌐',
    color: 'from-green-500 to-teal-500'
  },
  {
    name: 'Percy Sync',
    role: 'Integration Manager',
    description: 'Manages data synchronization and integration between different services.',
    emoji: '🔄',
    color: 'from-purple-500 to-indigo-500'
  }
];

const AgentGrid = () => {
  return (
    <section className="py-32 px-6 relative overflow-hidden bg-deep-navy">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-electric-blue/5 to-transparent" />
      
      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        viewport={{ once: true }}
      >
        <motion.div variants={fadeInUp} className="text-center mb-20">
          <h2 className="text-5xl font-bold mb-6 font-poppins neon-text">
            Meet Your SKRBL AI Team
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-inter leading-relaxed">
            AI-powered content creation and automation for your business growth
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.name}
              variants={scaleIn}
              className="group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="glass-card h-full transform transition-all duration-500 hover:scale-105 hover:shadow-2xl relative overflow-hidden group-hover:border-electric-blue/30">
                <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className="relative z-10 p-6 flex flex-col h-full">
                  <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{agent.emoji}</div>
                  <h3 className="text-2xl font-semibold mb-3 font-poppins bg-gradient-to-r from-electric-blue to-teal bg-clip-text text-transparent group-hover:text-white transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-teal mb-4 font-medium tracking-wide">
                    {agent.role}
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    {agent.description}
                  </p>
                  <button
                    className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-bold shadow-lg hover:scale-105 hover:bg-teal-500 transition-all"
                    onClick={() => {
                      localStorage.setItem('lastUsedAgent', agent.name);
                      window.dispatchEvent(new CustomEvent('open-percy-agent', { detail: { agent: agent.name } }));
                    }}
                  >
                    Try Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default AgentGrid;
