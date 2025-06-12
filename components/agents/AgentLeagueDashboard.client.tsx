'use client';

import dynamic from 'next/dynamic';

// Dynamically import the heavy dashboard component on the client only
const AgentLeagueDashboard = dynamic(() => import('./AgentLeagueDashboard'), {
  ssr: false,
});

export default AgentLeagueDashboard; 