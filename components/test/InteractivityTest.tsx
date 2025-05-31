'use client';
import React from 'react';
import { trackAgentInteraction, trackPercyInteraction } from '@/lib/analytics/userJourney';

export default function InteractivityTest() {
  const testAnalytics = () => {
    // Test Percy interaction tracking
    trackPercyInteraction('test_interaction', { test: true }, 'test-user', 'client');
    
    // Test agent interaction tracking
    trackAgentInteraction('test-agent', 'test_action', 'test-user', 'client');
    
    console.log('✅ Analytics tracking test completed');
  };

  const testAgentLaunch = async () => {
    try {
      const response = await fetch('/api/agents/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'BrandingAgent',
          task: 'launch',
          payload: {},
          featureType: 'premium-agents',
          useQueue: true
        })
      });
      
      const result = await response.json();
      console.log('✅ Agent launch test result:', result);
    } catch (error) {
      console.log('❌ Agent launch test failed:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-4">🔧 Interactivity Test Panel</h3>
      <div className="space-y-2">
        <button 
          onClick={testAnalytics}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Analytics
        </button>
        <button 
          onClick={testAgentLaunch}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Agent Launch
        </button>
      </div>
    </div>
  );
} 