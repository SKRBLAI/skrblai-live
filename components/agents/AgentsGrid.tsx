import React, { useState } from "react";
import SimpleAgentGrid from "./SimpleAgentGrid";
import type { Agent } from '@/types/agent';

interface AgentsGridProps {
  agents?: Agent[];
}

export default function AgentsGrid({ agents = [] }: AgentsGridProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="w-full flex flex-col items-center">
      <SimpleAgentGrid
        agents={agents}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
      />
    </div>
  );
}
