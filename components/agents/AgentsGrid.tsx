'use client';
import { motion } from 'framer-motion';
import AgentCard from './AgentCard';

const agents = [
  { name: 'Percy', role: 'The Concierge', isPercy: true },
  { name: 'BrandingAgent', role: 'Brand Strategist' },
  { name: 'ContentCreatorAgent', role: 'Content Master' },
  { name: 'AnalyticsAgent', role: 'Data Analyst' },
  { name: 'PublishingAgent', role: 'Publishing Expert' },
  { name: 'SocialBotAgent', role: 'Social Media Guru' },
  { name: 'AdCreativeAgent', role: 'Ad Specialist' },
  { name: 'ProposalGeneratorAgent', role: 'Proposal Expert' },
  { name: 'PaymentManagerAgent', role: 'Finance Manager' },
  { name: 'ClientSuccessAgent', role: 'Success Manager' },
  { name: 'SiteGenAgent', role: 'Web Developer' },
  { name: 'BizAgent', role: 'Business Strategist' },
  { name: 'VideoContentAgent', role: 'Video Producer' },
  { name: 'PercyAgent', role: 'Assistant' },
  { name: 'PercySyncAgent', role: 'Sync Manager' },
];

export default function AgentsGrid() {
  // Function to alternate between male and female, with Percy always male
  const getGender = (index: number): 'male' | 'female' => {
    if (agents[index].isPercy) return 'male';
    return index % 2 === 0 ? 'male' : 'female';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Hero Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gradient-blue">
          Meet the Agents of SKRBL AI
        </h1>
        <p className="text-xl text-teal-300">
          A League of Digital Superheroes, Ready to Serve.
        </p>
      </motion.div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={agent.isPercy ? 'md:col-span-2 lg:col-span-2' : ''}
          >
            <AgentCard
              name={agent.name}
              isPercy={agent.isPercy}
              gender={getGender(index)}
              role={agent.role}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
