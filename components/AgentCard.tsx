import { useRouter } from 'next/router';
import type { Agent } from '@/types/agent';

export default function AgentCard({ agent }: { agent: Agent }) {
  const router = useRouter();

  const handleSummon = () => {
    // Log the selected agent for debugging
    console.log(`Summoning agent: ${agent.name} (ID: ${agent.id})`);
    
    // Route to the agent's specific route if defined, otherwise fallback to dashboard
    const targetRoute = agent.route || `/dashboard/${agent.id}`;
    router.push(targetRoute);
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl">{agent.emoji || '🤖'}</div>
        <div>
          <h3 className="font-medium">{agent.name}</h3>
          <p className="text-sm text-gray-500">{agent.description}</p>
        </div>
      </div>
      <button
        onClick={handleSummon}
        className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
      >
        Summon
      </button>
    </div>
  );
} 