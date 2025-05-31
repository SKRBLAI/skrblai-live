'use client';
import React, { useState } from 'react';
import { useUser, useSession } from '@supabase/auth-helpers-react';
import type { WorkflowTemplate } from '@/lib/automation/workflowQueue';

interface WorkflowTemplateCardProps {
  template: WorkflowTemplate & {
    hasAccess: boolean;
    upgradeRequired: string | null;
  };
}

export default function WorkflowTemplateCard({ template }: WorkflowTemplateCardProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const user = useUser();
  const session = useSession();

  const handleExecute = async () => {
    if (!template.hasAccess) {
      window.open('/pricing', '_blank');
      return;
    }

    setIsExecuting(true);
    
    try {
      const response = await fetch('/api/agents/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          agentId: template.agentId,
          task: 'workflow_template',
          payload: {},
          workflowTemplate: template.id,
          useQueue: true
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Show success message with job tracking
        console.log('Workflow queued:', result.jobId);
      }
    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-400">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
          <p className="text-gray-600 text-sm mt-1">{template.description}</p>
        </div>
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
          ~{template.estimatedDuration}min
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {template.steps.map((step, index) => (
          <span 
            key={step.id}
            className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
          >
            {index + 1}. {step.name}
          </span>
        ))}
      </div>

      {template.hasAccess ? (
        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 disabled:opacity-50"
        >
          {isExecuting ? 'Executing...' : 'Run Workflow'}
        </button>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <p className="text-amber-800 text-sm mb-2">
            Requires {template.upgradeRequired} subscription
          </p>
          <button 
            onClick={() => window.open('/pricing', '_blank')}
            className="bg-amber-500 text-white px-4 py-1 rounded text-sm hover:bg-amber-600"
          >
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
} 