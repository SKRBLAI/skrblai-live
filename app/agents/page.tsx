import AgentLeagueDashboard from '@/components/agents/AgentLeagueDashboard.client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meet Your Agent League | SKRBL AI',
  description: 'Explore the full roster of SKRBL AI's cosmic Agent League and discover the perfect assistants for your workflow.',
};

export default function AgentsPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-[#0d1117] to-[#161b22]">
      <AgentLeagueDashboard />
    </main>
  );
}
