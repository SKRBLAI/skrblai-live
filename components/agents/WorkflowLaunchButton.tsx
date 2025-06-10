'use client';

import { useState } from 'react';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';
import toast from 'react-hot-toast';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface WorkflowLaunchButtonProps {
  agentId: string;
  agentName: string;
  superheroName: string;
  hasWorkflow: boolean;
  requiresPremium?: boolean;
  workflowCapabilities?: string[];
  className?: string;
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  onWorkflowComplete?: (result: any) => void;
  onHandoffSuggestion?: (suggestions: any[]) => void;
  initialPrompt?: string;
  requiredTier?: 'reserve' | 'starter' | 'star' | 'all_star';
}

interface WorkflowResult {
  success: boolean;
  executionId: string;
  agentId: string;
  agentName: string;
  superheroName: string;
  status: string;
  data?: any;
  error?: string;
  workflowInfo: {
    hasWorkflow: boolean;
    capabilities: string[];
    estimatedDuration: number;
  };
  handoffSuggestions: any[];
  metrics: {
    executionTime: number;
    cost?: number;
    requestProcessingTime: number;
  };
}

// =============================================================================
// WORKFLOW LAUNCH BUTTON COMPONENT
// =============================================================================

export default function WorkflowLaunchButton({
  agentId,
  agentName,
  superheroName,
  hasWorkflow,
  requiresPremium = false,
  workflowCapabilities = [],
  className = '',
  variant = 'primary',
  size = 'md',
  onWorkflowComplete,
  onHandoffSuggestion,
  initialPrompt = '',
  requiredTier = 'starter'
}: WorkflowLaunchButtonProps) {
  
  const [isLaunching, setIsLaunching] = useState(false);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [userPrompt, setUserPrompt] = useState(initialPrompt);
  const [executionResult, setExecutionResult] = useState<WorkflowResult | null>(null);
  
  const { user, accessLevel } = useDashboardAuth();

  // =============================================================================
  // ACCESS LEVEL HELPERS
  // =============================================================================

  const TIER_HIERARCHY = ['client', 'reserve', 'starter', 'star', 'all_star', 'admin'];

  const hasAccessToTier = (userTier: string, requiredTier: string): boolean => {
    const userIndex = TIER_HIERARCHY.indexOf(userTier);
    const requiredIndex = TIER_HIERARCHY.indexOf(requiredTier);
    return userIndex >= requiredIndex;
  };

  const getTierDisplayName = (tier: string): string => {
    const tierNames: Record<string, string> = {
      'client': 'Free',
      'reserve': 'Reserve',
      'starter': 'Starter', 
      'star': 'Star',
      'all_star': 'All-Star',
      'admin': 'Admin'
    };
    return tierNames[tier] || tier;
  };

  // =============================================================================
  // STYLING & VARIANTS
  // =============================================================================

  const getButtonStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    
    const variants = {
      primary: hasWorkflow 
        ? 'bg-gradient-to-r from-electric-blue to-teal text-white hover:from-electric-blue/90 hover:to-teal/90 shadow-lg hover:shadow-xl'
        : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-400 hover:to-gray-500',
      secondary: 'bg-white/10 text-electric-blue border border-electric-blue/30 hover:bg-electric-blue/10',
      minimal: 'text-electric-blue hover:text-electric-blue/80 hover:bg-electric-blue/5'
    };
    
    return `${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`;
  };

  // =============================================================================
  // WORKFLOW EXECUTION
  // =============================================================================

  const handleLaunchWorkflow = async () => {
    if (!user) {
      toast.error('Please sign in to use agent workflows');
      return;
    }

    if (requiresPremium && !hasAccessToTier(accessLevel, requiredTier)) {
      toast.error(`${superheroName} requires ${getTierDisplayName(requiredTier)} access or higher`);
      return;
    }

    if (!hasWorkflow) {
      toast('This agent is in preview mode - n8n workflow coming soon!', {
        icon: '🚧',
        duration: 4000
      });
      return;
    }

    if (!userPrompt.trim()) {
      setShowPromptInput(true);
      return;
    }

    setIsLaunching(true);
    const toastId = toast.loading(`Activating ${superheroName}...`);

    try {
      console.log(`[WorkflowLaunch] Triggering workflow for ${agentId}:`, {
        agentName,
        userPrompt,
        hasWorkflow,
        userTier: accessLevel,
        requiredTier
      });

      const response = await fetch(`/api/agents/workflow/${agentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt,
          userId: user.id,
          userRole: accessLevel,
          sessionId: `session_${Date.now()}`,
          payload: {
            source: 'workflow-launch-button',
            capabilities: workflowCapabilities,
            requiredTier
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result: WorkflowResult = await response.json();
      setExecutionResult(result);

      // Handle different result types
      if (result.success) {
        if (result.status === 'completed') {
          toast.success(`${superheroName} completed the task!`, { id: toastId });
        } else {
          toast.success(`${superheroName} is working on it! Check back soon.`, { id: toastId });
        }

        // Trigger callbacks
        onWorkflowComplete?.(result);
        
        if (result.handoffSuggestions?.length > 0) {
          onHandoffSuggestion?.(result.handoffSuggestions);
          
          // Show handoff suggestions toast
          setTimeout(() => {
            toast(`💡 ${result.handoffSuggestions.length} agents can help with next steps!`, {
              duration: 5000,
              icon: '🔗'
            });
          }, 2000);
        }
      } else {
        toast.error(result.error || 'Workflow execution failed', { id: toastId });
      }

      // Clear prompt input
      setUserPrompt('');
      setShowPromptInput(false);

    } catch (error: any) {
      console.error('[WorkflowLaunch] Error:', error);
      toast.error(error.message || 'Failed to launch workflow', { id: toastId });
    } finally {
      setIsLaunching(false);
    }
  };

  // =============================================================================
  // ACCESS CHECK HELPERS
  // =============================================================================

  const canUseAgent = () => {
    if (!user) return false;
    if (requiresPremium && !hasAccessToTier(accessLevel, requiredTier)) return false;
    return true;
  };

  const getButtonText = () => {
    if (isLaunching) return 'Activating...';
    if (!hasWorkflow) return '🚧 Preview Mode';
    if (!canUseAgent()) return `🔒 ${getTierDisplayName(requiredTier)} Required`;
    return `⚡ Launch ${superheroName}`;
  };

  const getTooltipText = () => {
    if (!user) return 'Sign in to use workflows';
    if (!hasWorkflow) return 'Workflow configuration in progress';
    if (requiresPremium && !hasAccessToTier(accessLevel, requiredTier)) {
      return `Upgrade to ${getTierDisplayName(requiredTier)} to access this agent`;
    }
    return `Activate ${superheroName} with n8n workflow automation`;
  };

  // =============================================================================
  // RENDER PROMPT INPUT MODAL
  // =============================================================================

  if (showPromptInput) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-deep-navy rounded-xl border border-electric-blue/20 p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">
            What would you like {superheroName} to do?
          </h3>
          
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder={`Tell ${superheroName} what you need help with...`}
            className="w-full h-24 bg-soft-gray/10 border border-electric-blue/20 rounded-lg p-3 text-sm resize-none"
            autoFocus
          />
          
          {workflowCapabilities.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-soft-gray/60 mb-2">Capabilities:</p>
              <div className="flex flex-wrap gap-1">
                {workflowCapabilities.slice(0, 3).map((capability, index) => (
                  <span
                    key={index}
                    className="inline-block bg-electric-blue/20 text-electric-blue text-xs px-2 py-1 rounded"
                  >
                    {capability.replace(/_/g, ' ')}
                  </span>
                ))}
                {workflowCapabilities.length > 3 && (
                  <span className="inline-block bg-soft-gray/20 text-soft-gray/60 text-xs px-2 py-1 rounded">
                    +{workflowCapabilities.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleLaunchWorkflow}
              disabled={!userPrompt.trim() || isLaunching}
              className="flex-1 bg-gradient-to-r from-electric-blue to-teal text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {isLaunching ? 'Launching...' : 'Launch Workflow'}
            </button>
            <button
              onClick={() => {
                setShowPromptInput(false);
                setUserPrompt('');
              }}
              className="px-4 py-2 bg-soft-gray/20 text-soft-gray/80 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================================
  // RENDER MAIN BUTTON
  // =============================================================================

  return (
    <div className="relative group">
      <button
        onClick={handleLaunchWorkflow}
        disabled={isLaunching || (!hasWorkflow && variant !== 'minimal')}
        className={getButtonStyles()}
        title={getTooltipText()}
      >
        {isLaunching && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {getButtonText()}
      </button>

      {/* Execution Result Display */}
      {executionResult && executionResult.status === 'running' && (
        <div className="absolute top-full left-0 mt-2 bg-deep-navy/95 border border-electric-blue/20 rounded-lg p-3 min-w-64 z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-electric-blue rounded-full animate-pulse" />
            <span className="text-sm font-medium">Workflow Running</span>
          </div>
          <p className="text-xs text-soft-gray/60">
            {superheroName} is working on your request...
          </p>
          <p className="text-xs text-electric-blue mt-1">
            ID: {executionResult.executionId}
          </p>
        </div>
      )}

      {/* Tooltip for capabilities */}
      {workflowCapabilities.length > 0 && variant !== 'minimal' && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-deep-navy/95 border border-electric-blue/20 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <div className="text-xs">
            <p className="font-medium mb-1">{superheroName} can help with:</p>
            <ul className="space-y-1">
              {workflowCapabilities.slice(0, 3).map((capability, index) => (
                <li key={index} className="text-soft-gray/60">
                  • {capability.replace(/_/g, ' ')}
                </li>
              ))}
            </ul>
            {requiresPremium && (
              <p className="text-xs text-electric-blue mt-2 border-t border-electric-blue/20 pt-2">
                Requires {getTierDisplayName(requiredTier)} tier or higher
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 