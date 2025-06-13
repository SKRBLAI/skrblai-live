import React from "react";
import type { ReactElement } from 'react';
import dynamic from 'next/dynamic';

// Optional prop interface retained for backward compatibility in pages like Services
interface AgentsGridProps {
  agents?: any[]; // Currently unused; AgentLeagueDashboard handles its own data
}

// Dynamically load the AgentLeagueDashboard on the client only
const AgentLeagueDashboard = dynamic(() => import('./AgentLeagueDashboard.client'), { ssr: false });

export default function AgentsGrid(_props: AgentsGridProps): ReactElement {
  return (
    <div className="w-full flex flex-col items-center">
      <AgentLeagueDashboard />
    </div>
  );
}
