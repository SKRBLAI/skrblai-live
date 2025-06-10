'use client';

import { useState } from 'react';
import WorkflowLaunchButton from './WorkflowLaunchButton';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface HandoffSuggestion {
  agentId: string;
  agentName: string;
  superheroName: string;
  capabilities: string[];
  triggerMessage: string;
  confidence: number;
}

interface HandoffSuggestionsPanelProps {
  suggestions: HandoffSuggestion[];
  sourceAgent: string;
  sourceAgentName: string;
  onHandoffTrigger?: (agentId: string, suggestion: HandoffSuggestion) => void;
  className?: string;
  maxDisplayed?: number;
}

// =============================================================================
// HANDOFF SUGGESTIONS PANEL COMPONENT
// =============================================================================

export default function HandoffSuggestionsPanel({
  suggestions = [],
  sourceAgent,
  sourceAgentName,
  onHandoffTrigger,
  className = '',
  maxDisplayed = 3
}: HandoffSuggestionsPanelProps) {
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<HandoffSuggestion | null>(null);

  if (suggestions.length === 0) {
    return null;
  }

  const displayedSuggestions = isExpanded ? suggestions : suggestions.slice(0, maxDisplayed);
  const hasMoreSuggestions = suggestions.length > maxDisplayed;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleSuggestionClick = (suggestion: HandoffSuggestion) => {
    setSelectedSuggestion(suggestion);
    onHandoffTrigger?.(suggestion.agentId, suggestion);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400 bg-green-400/20';
    if (confidence >= 60) return 'text-yellow-400 bg-yellow-400/20';
    return 'text-orange-400 bg-orange-400/20';
  };

  const getAgentEmoji = (agentId: string) => {
    const emojiMap: Record<string, string> = {
      'percy-agent': '🎭',
      'branding-agent': '🎨',
      'content-creator-agent': '✍️',
      'social-bot-agent': '📱',
      'analytics-agent': '📊',
      'ad-creative-agent': '🎯',
      'video-content-agent': '🎬',
      'publishing-agent': '📚',
      'sitegen-agent': '🌐',
      'proposal-generator-agent': '📋',
      'payment-manager-agent': '💳',
      'client-success-agent': '🤝',
      'biz-agent': '📈'
    };
    return emojiMap[agentId] || '🤖';
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={`bg-deep-navy/60 rounded-xl border border-electric-blue/20 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-electric-blue rounded-full animate-pulse" />
          <h3 className="text-sm font-semibold text-electric-blue">
            Next Steps Available
          </h3>
          <span className="bg-electric-blue/20 text-electric-blue text-xs px-2 py-1 rounded-full">
            {suggestions.length}
          </span>
        </div>
        
        {hasMoreSuggestions && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-soft-gray/60 hover:text-electric-blue transition-colors"
          >
            {isExpanded ? 'Show Less' : `+${suggestions.length - maxDisplayed} More`}
          </button>
        )}
      </div>

      {/* Handoff Context */}
      <div className="bg-soft-gray/5 rounded-lg p-3 mb-4">
        <p className="text-sm text-soft-gray/80">
          🎉 <span className="font-medium">{sourceAgentName}</span> has completed their task! 
          These agents can help with the next phase:
        </p>
      </div>

      {/* Suggestions List */}
      <div className="space-y-3">
        {displayedSuggestions.map((suggestion, index) => (
          <div
            key={suggestion.agentId}
            className={`group bg-white/5 rounded-lg p-3 border border-transparent hover:border-electric-blue/30 transition-all duration-200 ${
              selectedSuggestion?.agentId === suggestion.agentId ? 'border-electric-blue/50 bg-electric-blue/5' : ''
            }`}
          >
            {/* Agent Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">{getAgentEmoji(suggestion.agentId)}</span>
                <div>
                  <h4 className="font-medium text-sm">{suggestion.superheroName}</h4>
                  <p className="text-xs text-soft-gray/60">{suggestion.agentName}</p>
                </div>
              </div>

              {/* Confidence Badge */}
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                {suggestion.confidence}% match
              </div>
            </div>

            {/* Trigger Message */}
            <p className="text-sm text-soft-gray/80 mb-3 italic">
              "{suggestion.triggerMessage}"
            </p>

            {/* Capabilities */}
            {suggestion.capabilities.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {suggestion.capabilities.slice(0, 4).map((capability, capIndex) => (
                    <span
                      key={capIndex}
                      className="inline-block bg-electric-blue/10 text-electric-blue text-xs px-2 py-1 rounded border border-electric-blue/20"
                    >
                      {capability.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {suggestion.capabilities.length > 4 && (
                    <span className="inline-block bg-soft-gray/10 text-soft-gray/60 text-xs px-2 py-1 rounded">
                      +{suggestion.capabilities.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <WorkflowLaunchButton
                agentId={suggestion.agentId}
                agentName={suggestion.agentName}
                superheroName={suggestion.superheroName}
                hasWorkflow={true} // Assume handoff suggestions have workflows
                workflowCapabilities={suggestion.capabilities}
                variant="secondary"
                size="sm"
                className="flex-1"
                initialPrompt={`Continue from ${sourceAgentName}: ${suggestion.triggerMessage}`}
                onWorkflowComplete={(result) => {
                  console.log(`[Handoff] Workflow completed for ${suggestion.agentId}:`, result);
                }}
              />
              
              <button
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-xs text-electric-blue hover:text-electric-blue/80 hover:bg-electric-blue/5 rounded-lg transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Expansion Animation */}
      {isExpanded && hasMoreSuggestions && (
        <div className="mt-3 pt-3 border-t border-soft-gray/20">
          <p className="text-xs text-soft-gray/60 text-center">
            Showing all {suggestions.length} available handoffs
          </p>
        </div>
      )}

      {/* Quick Action Bar */}
      <div className="mt-4 pt-3 border-t border-soft-gray/20">
        <div className="flex items-center justify-between">
          <p className="text-xs text-soft-gray/60">
            💡 Each agent brings unique superpowers to your workflow
          </p>
          
          <button
            onClick={() => setSelectedSuggestion(null)}
            className="text-xs text-electric-blue hover:text-electric-blue/80 transition-colors"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Selected Suggestion Detail Modal */}
      {selectedSuggestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-deep-navy rounded-xl border border-electric-blue/20 p-6 max-w-lg w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getAgentEmoji(selectedSuggestion.agentId)}</span>
                <div>
                  <h3 className="text-lg font-semibold">{selectedSuggestion.superheroName}</h3>
                  <p className="text-sm text-soft-gray/60">{selectedSuggestion.agentName}</p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedSuggestion(null)}
                className="text-soft-gray/60 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Confidence Score */}
              <div>
                <h4 className="text-sm font-medium mb-2">Handoff Confidence</h4>
                <div className="bg-soft-gray/10 rounded-lg h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-electric-blue to-teal transition-all duration-500"
                    style={{ width: `${selectedSuggestion.confidence}%` }}
                  />
                </div>
                <p className="text-xs text-soft-gray/60 mt-1">
                  {selectedSuggestion.confidence}% compatibility with your workflow
                </p>
              </div>

              {/* Message */}
              <div>
                <h4 className="text-sm font-medium mb-2">Handoff Message</h4>
                <p className="text-sm text-soft-gray/80 bg-soft-gray/5 rounded-lg p-3 italic">
                  "{selectedSuggestion.triggerMessage}"
                </p>
              </div>

              {/* All Capabilities */}
              <div>
                <h4 className="text-sm font-medium mb-2">Agent Capabilities</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedSuggestion.capabilities.map((capability, index) => (
                    <div key={index} className="bg-electric-blue/10 text-electric-blue text-xs px-3 py-2 rounded-lg border border-electric-blue/20">
                      {capability.replace(/_/g, ' ')}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <WorkflowLaunchButton
                  agentId={selectedSuggestion.agentId}
                  agentName={selectedSuggestion.agentName}
                  superheroName={selectedSuggestion.superheroName}
                  hasWorkflow={true}
                  workflowCapabilities={selectedSuggestion.capabilities}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  initialPrompt={`Handoff from ${sourceAgentName}: ${selectedSuggestion.triggerMessage}`}
                  onWorkflowComplete={(result) => {
                    setSelectedSuggestion(null);
                    console.log(`[Handoff Detail] Workflow completed:`, result);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 