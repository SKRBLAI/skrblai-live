import React, { useState } from "react";
import AgentConstellation from "./AgentConstellation";
import type { Agent } from '@/types/agent';

export default function AgentsGrid() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="w-full flex flex-col items-center">
      <AgentConstellation
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
      />
    </div>
  );
}
