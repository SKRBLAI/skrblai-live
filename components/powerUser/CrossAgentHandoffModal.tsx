'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ArrowRight, Zap, Clock, Star, CheckCircle, 
  AlertCircle, Users, Target, TrendingUp, Sparkles
} from 'lucide-react';
import { analyzeHandoffIntent, executeHandoff } from '../../lib/powerUser/crossAgentHandoffs';
import { getAgent } from '../../lib/agents/agentLeague';
import toast from 'react-hot-toast';

interface CrossAgentHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceAgentId: string;
  userId: string;
  sessionId: string;
  userTier: string;
  currentWorkflowData?: any;
  onHandoffComplete?: (targetAgentId: string, executionId: string) => void;
}

interface HandoffRecommendation {
  agentId: string;
  agentName: string;
  superheroName: string;
  confidence: number;
  reasoning: string;
  estimatedDuration: number;
  requiredTier: string;
  handoffType: 'sequential' | 'parallel' | 'conditional';
  prerequisites?: string[];
  expectedOutputs: string[];
}

interface WorkflowChain {
  id: string;
  name: string;
  description: string;
  agents: Array<{
    agentId: string;
    order: number;
    conditions?: string[];
    parallelWith?: string[];
    outputMapping?: Record<string, string>;
  }>;
  estimatedDuration: number;
  requiredTier: string;
  successRate: number;
  userRating: number;
}

export default function CrossAgentHandoffModal({
  isOpen,
  onClose,
  sourceAgentId,
  userId,
  sessionId,
  userTier,
  currentWorkflowData,
  onHandoffComplete
}: CrossAgentHandoffModalProps) {
  const [userIntent, setUserIntent] = useState('');
  const [recommendations, setRecommendations] = useState<HandoffRecommendation[]>([]);
  const [workflowChain, setWorkflowChain] = useState<WorkflowChain | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [step, setStep] = useState<'intent' | 'recommendations' | 'confirmation'>('intent');

  const sourceAgent = getAgent(sourceAgentId);

  useEffect(() => {
    if (isOpen) {
      setStep('intent');
      setUserIntent('');
      setRecommendations([]);
      setWorkflowChain(null);
      setSelectedAgent(null);
    }
  }, [isOpen]);

  const handleAnalyzeIntent = async () => {
    if (!userIntent.trim()) {
      toast.error('Please describe what you want to accomplish');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeHandoffIntent({
        sourceAgentId,
        userIntent: userIntent.trim(),
        sessionContext: {
          userId,
          sessionId,
          userTier,
          previousAgents: [], // Would track from session
          totalHandoffs: 0
        }
      });

      if (result.success && result.targetAgent) {
        setRecommendations([result.targetAgent, ...(result.alternativeAgents || [])]);
        setWorkflowChain(result.workflowChain || null);
        setSelectedAgent(result.targetAgent.agentId);
        setStep('recommendations');
      } else {
        toast.error(result.error || 'No suitable agents found for your request');
      }
    } catch (error) {
      console.error('[Handoff Modal] Error analyzing intent:', error);
      toast.error('Failed to analyze your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteHandoff = async () => {
    if (!selectedAgent) return;

    setExecuting(true);
    try {
      const result = await executeHandoff(
        `handoff_${Date.now()}`,
        selectedAgent,
        {
          sourceAgentId,
          userIntent,
          currentWorkflowData,
          sessionContext: {
            userId,
            sessionId,
            userTier,
            previousAgents: [],
            totalHandoffs: 0
          }
        },
        currentWorkflowData
      );

      if (result.success && result.executionId) {
        toast.success('Handoff initiated successfully!');
        onHandoffComplete?.(selectedAgent, result.executionId);
        onClose();
      } else {
        toast.error(result.error || 'Failed to execute handoff');
      }
    } catch (error) {
      console.error('[Handoff Modal] Error executing handoff:', error);
      toast.error('Failed to execute handoff. Please try again.');
    } finally {
      setExecuting(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500/20 text-green-400';
    if (confidence >= 60) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'starter': return 'bg-blue-500/20 text-blue-400';
      case 'star': return 'bg-yellow-500/20 text-yellow-400';
      case 'all_star': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-electric-blue/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-electric-blue" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Cross-Agent Handoff</h2>
                  <p className="text-gray-400">
                    Continue your workflow with the perfect agent
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Step 1: Intent Input */}
              {step === 'intent' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">
                      What would you like to accomplish next?
                    </h3>
                    <p className="text-gray-400">
                      Describe your goal and we'll recommend the best agent to continue your workflow
                    </p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {sourceAgent?.name.charAt(0) || 'A'}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{sourceAgent?.name}</div>
                        <div className="text-gray-400 text-sm">Current Agent</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-3">
                      Describe your next goal:
                    </label>
                    <textarea
                      value={userIntent}
                      onChange={(e) => setUserIntent(e.target.value)}
                      placeholder="e.g., Create social media posts for this content, Optimize this for SEO, Design graphics for this campaign..."
                      className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-electric-blue focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleAnalyzeIntent}
                      disabled={loading || !userIntent.trim()}
                      className="px-6 py-3 bg-electric-blue hover:bg-electric-blue/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <span>Find Best Agent</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Recommendations */}
              {step === 'recommendations' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Recommended Agents
                    </h3>
                    <p className="text-gray-400">
                      Based on your goal: "{userIntent}"
                    </p>
                  </div>

                  {/* Workflow Chain Suggestion */}
                  {workflowChain && (
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <TrendingUp className="w-6 h-6 text-purple-400" />
                        <div>
                          <h4 className="text-white font-bold">{workflowChain.name}</h4>
                          <p className="text-gray-400 text-sm">{workflowChain.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-400">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {workflowChain.estimatedDuration}min
                          </span>
                          <span className="text-green-400">
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            {workflowChain.successRate}% success
                          </span>
                          <span className="text-yellow-400">
                            <Star className="w-4 h-4 inline mr-1" />
                            {workflowChain.userRating}/5
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${getTierBadgeColor(workflowChain.requiredTier)}`}>
                          {workflowChain.requiredTier}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Agent Recommendations */}
                  <div className="space-y-3">
                    {recommendations.map((agent, index) => (
                      <motion.div
                        key={agent.agentId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedAgent === agent.agentId
                            ? 'border-electric-blue bg-electric-blue/10'
                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedAgent(agent.agentId)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold">
                                {agent.superheroName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-white font-bold">{agent.superheroName}</h4>
                              <p className="text-gray-400 text-sm">{agent.agentName}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceBadge(agent.confidence)}`}>
                              {agent.confidence}% match
                            </span>
                            {selectedAgent === agent.agentId && (
                              <CheckCircle className="w-5 h-5 text-electric-blue" />
                            )}
                          </div>
                        </div>

                        <p className="text-gray-300 text-sm mb-3">{agent.reasoning}</p>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-400">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {agent.estimatedDuration}min
                            </span>
                            <span className="text-gray-400">
                              <Zap className="w-3 h-3 inline mr-1" />
                              {agent.handoffType}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded ${getTierBadgeColor(agent.requiredTier)}`}>
                            {agent.requiredTier}
                          </span>
                        </div>

                        {agent.prerequisites && agent.prerequisites.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-gray-400 text-xs mb-1">Prerequisites:</p>
                            <div className="flex flex-wrap gap-1">
                              {agent.prerequisites.map((prereq, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                                  {prereq}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep('intent')}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep('confirmation')}
                      disabled={!selectedAgent}
                      className="px-6 py-3 bg-electric-blue hover:bg-electric-blue/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                      Continue with Selected Agent
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {step === 'confirmation' && selectedAgent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {(() => {
                    const agent = recommendations.find(r => r.agentId === selectedAgent);
                    if (!agent) return null;

                    return (
                      <>
                        <div className="text-center">
                          <h3 className="text-xl font-bold text-white mb-2">
                            Ready to Hand Off
                          </h3>
                          <p className="text-gray-400">
                            Confirm the handoff to continue your workflow
                          </p>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-center justify-center space-x-6 mb-6">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2">
                                <span className="text-white font-bold text-lg">
                                  {sourceAgent?.name.charAt(0) || 'A'}
                                </span>
                              </div>
                              <p className="text-white font-medium">{sourceAgent?.name}</p>
                              <p className="text-gray-400 text-sm">Current</p>
                            </div>

                            <ArrowRight className="w-8 h-8 text-electric-blue" />

                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mb-2">
                                <span className="text-white font-bold text-lg">
                                  {agent.superheroName.charAt(0)}
                                </span>
                              </div>
                              <p className="text-white font-medium">{agent.superheroName}</p>
                              <p className="text-gray-400 text-sm">Next</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Confidence:</span>
                              <span className={`font-medium ${getConfidenceColor(agent.confidence)}`}>
                                {agent.confidence}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Estimated Duration:</span>
                              <span className="text-white">{agent.estimatedDuration} minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Handoff Type:</span>
                              <span className="text-white capitalize">{agent.handoffType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Required Tier:</span>
                              <span className={`px-2 py-1 rounded text-xs ${getTierBadgeColor(agent.requiredTier)}`}>
                                {agent.requiredTier}
                              </span>
                            </div>
                          </div>

                          {agent.expectedOutputs.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                              <p className="text-gray-400 text-sm mb-2">Expected Outputs:</p>
                              <div className="flex flex-wrap gap-2">
                                {agent.expectedOutputs.map((output, i) => (
                                  <span key={i} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                                    {output}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => setStep('recommendations')}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                          >
                            ← Back
                          </button>
                          <button
                            onClick={handleExecuteHandoff}
                            disabled={executing}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                          >
                            {executing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Executing Handoff...</span>
                              </>
                            ) : (
                              <>
                                <span>Execute Handoff</span>
                                <Zap className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 