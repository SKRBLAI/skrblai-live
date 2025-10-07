'use client';

/**
 * 🎯 ACCURACY DASHBOARD - ADMIN MONITORING
 * 
 * Real-time dashboard for monitoring N8N agent workflow accuracy,
 * quality metrics, and performance insights across all SKRBL AI agents.
 */

import React, { useState, useEffect } from 'react';
import { getBrowserSupabase } from '@/lib/supabase';

interface AccuracyMetrics {
  agentId: string;
  agentName: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageAccuracyScore: number;
  averageConfidenceScore: number;
  completionRate: number;
  requiresAttention: boolean;
}

interface RecentEvaluation {
  id: string;
  executionId: string;
  agentId: string;
  agentName: string;
  accuracyStatus: 'pass' | 'fail' | 'warning' | 'retry';
  accuracyScore: number;
  confidenceScore: number;
  validationErrors: string[];
  timestamp: string;
  escalationTriggered: boolean;
}

export default function AccuracyDashboard() {
  const [metrics, setMetrics] = useState<AccuracyMetrics[]>([]);
  const [recentEvaluations, setRecentEvaluations] = useState<RecentEvaluation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccuracyMetrics = async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      console.warn('Supabase not configured, skipping accuracy metrics fetch');
      setLoading(false);
      return;
    }

    try {
      // Fetch workflow accuracy summary
      const { data: summaryData } = await supabase
        .from('workflow_accuracy_summary')
        .select('*')
        .eq('summary_period', 'daily')
        .order('last_updated', { ascending: false });

      if (summaryData) {
        const processedMetrics: AccuracyMetrics[] = summaryData.map(item => ({
          agentId: item.agent_id,
          agentName: item.agent_name,
          totalExecutions: item.total_executions || 0,
          successfulExecutions: item.successful_executions || 0,
          failedExecutions: item.failed_executions || 0,
          averageAccuracyScore: item.average_accuracy_score || 0,
          averageConfidenceScore: item.average_confidence_score || 0,
          completionRate: item.completion_rate || 0,
          requiresAttention: item.requires_attention || false
        }));
        setMetrics(processedMetrics);
      }

      // Fetch recent evaluations
      const { data: evaluationData } = await supabase
        .from('agent_evaluation_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (evaluationData) {
        const processedEvaluations: RecentEvaluation[] = evaluationData.map(item => ({
          id: item.id,
          executionId: item.execution_id,
          agentId: item.agent_id,
          agentName: item.agent_name,
          accuracyStatus: item.accuracy_status,
          accuracyScore: item.accuracy_score || 0,
          confidenceScore: item.confidence_score || 0,
          validationErrors: item.validation_errors || [],
          timestamp: item.timestamp,
          escalationTriggered: item.escalation_triggered || false
        }));
        setRecentEvaluations(processedEvaluations);
      }

    } catch (error) {
      console.error('Failed to fetch accuracy metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccuracyMetrics();
    const interval = setInterval(fetchAccuracyMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'fail': return 'text-red-600 bg-red-100';
      case 'retry': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded mb-6"></div>
            <div className="grid grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              🎯 Accuracy Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Real-time monitoring of N8N agent workflow accuracy and performance
            </p>
          </div>
          
          <button
            onClick={fetchAccuracyMetrics}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Overall Health Summary */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Active Agents</h3>
            <p className="text-2xl font-bold text-cyan-400">{metrics.length}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Avg Accuracy</h3>
            <p className={`text-2xl font-bold ${getScoreColor(
              metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.averageAccuracyScore, 0) / metrics.length : 0
            )}`}>
              {metrics.length > 0 ? 
                Math.round(metrics.reduce((sum, m) => sum + m.averageAccuracyScore, 0) / metrics.length) : 0}%
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Total Executions</h3>
            <p className="text-2xl font-bold text-blue-400">
              {metrics.reduce((sum, m) => sum + m.totalExecutions, 0)}
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Needs Attention</h3>
            <p className={`text-2xl font-bold ${
              metrics.filter(m => m.requiresAttention).length > 0 ? 'text-red-400' : 'text-green-400'
            }`}>
              {metrics.filter(m => m.requiresAttention).length}
            </p>
          </div>
        </div>

        {/* Agent Metrics Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg mb-8">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold">Agent Performance Metrics</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left p-4">Agent</th>
                  <th className="text-left p-4">Executions</th>
                  <th className="text-left p-4">Success Rate</th>
                  <th className="text-left p-4">Accuracy Score</th>
                  <th className="text-left p-4">Confidence</th>
                  <th className="text-left p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.agentId} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4">
                      <div>
                        <div className="font-semibold">{metric.agentName}</div>
                        <div className="text-sm text-gray-400">{metric.agentId}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>Total: {metric.totalExecutions}</div>
                        <div className="text-green-400">Success: {metric.successfulExecutions}</div>
                        <div className="text-red-400">Failed: {metric.failedExecutions}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${getScoreColor(metric.completionRate)}`}>
                        {Math.round(metric.completionRate)}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${getScoreColor(metric.averageAccuracyScore)}`}>
                        {Math.round(metric.averageAccuracyScore)}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${getScoreColor(metric.averageConfidenceScore)}`}>
                        {Math.round(metric.averageConfidenceScore)}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        metric.requiresAttention ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {metric.requiresAttention ? '⚠️ Attention' : '✅ Healthy'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold">Recent Evaluations</h2>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {recentEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="p-4 border-b border-gray-800 hover:bg-gray-800/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold">{evaluation.agentName}</span>
                    <span className="text-gray-400 text-sm ml-2">
                      {new Date(evaluation.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(evaluation.accuracyStatus)}`}>
                      {evaluation.accuracyStatus.toUpperCase()}
                    </span>
                    {evaluation.escalationTriggered && (
                      <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-600">
                        🚨 ESCALATED
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm">
                  <span>Accuracy: <span className={getScoreColor(evaluation.accuracyScore)}>
                    {Math.round(evaluation.accuracyScore)}%
                  </span></span>
                  <span>Confidence: <span className={getScoreColor(evaluation.confidenceScore)}>
                    {Math.round(evaluation.confidenceScore)}%
                  </span></span>
                </div>
                
                {evaluation.validationErrors.length > 0 && (
                  <div className="mt-2">
                    <span className="text-red-400 text-sm">Errors:</span>
                    <ul className="text-xs text-gray-400 ml-4 mt-1">
                      {evaluation.validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          Last updated: {new Date().toLocaleString()} • Auto-refresh: 30s
        </div>
      </div>
    </div>
  );
}
