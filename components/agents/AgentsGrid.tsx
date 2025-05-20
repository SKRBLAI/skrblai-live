'use client';
import AgentConstellation from './AgentConstellation';
import AgentCard from './AgentCard'; // Added import for AgentCard

// Define agents data locally for the mobile fallback grid
const localAgents = [
  { name: 'BrandingAgent', role: 'Brand Strategist', gender: 'female' as const, isPercy: false },
  { name: 'ContentCreatorAgent', role: 'Content Master', gender: 'male' as const, isPercy: false },
  { name: 'AnalyticsAgent', role: 'Data Analyst', gender: 'female' as const, isPercy: false },
  { name: 'PublishingAgent', role: 'Publishing Expert', gender: 'male' as const, isPercy: false },
  { name: 'SocialBotAgent', role: 'Social Media Guru', gender: 'female' as const, isPercy: false },
  { name: 'AdCreativeAgent', role: 'Ad Specialist', gender: 'male' as const, isPercy: false },
  { name: 'ProposalGeneratorAgent', role: 'Proposal Expert', gender: 'female' as const, isPercy: false },
  { name: 'PaymentManagerAgent', role: 'Finance Manager', gender: 'male' as const, isPercy: false },
  { name: 'ClientSuccessAgent', role: 'Success Manager', gender: 'female' as const, isPercy: false },
  { name: 'SiteGenAgent', role: 'Web Developer', gender: 'male' as const, isPercy: false },
  { name: 'BizAgent', role: 'Business Strategist', gender: 'female' as const, isPercy: false },
  { name: 'VideoContentAgent', role: 'Video Producer', gender: 'male' as const, isPercy: false },
  // PercyAgent and PercySyncAgent are typically part of the constellation, not usually in a simple grid.
  // Add them here if they should also appear in the mobile fallback grid.
];

export default function AgentsGrid() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gradient-blue">
          Meet the Agents of SKRBL AI
        </h1>
        <p className="text-xl text-teal-300">
          A League of Digital Superheroes, Ready to Serve.
        </p>
      </div>
      {/* Cosmic Agent Constellation (visible on md and up typically) */}
      <div className="hidden md:block">
        <AgentConstellation />
      </div>
      
      {/* Mobile fallback: stack agents in a grid */}
      <div className="md:hidden mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4 z-10">
        {localAgents.filter(a => !a.isPercy).map((agent) => (
          <AgentCard
            key={agent.name}
            name={agent.name}
            isPercy={agent.isPercy}
            gender={agent.gender}
            role={agent.role}
          />
        ))}
      </div>
    </div>
  );
}
