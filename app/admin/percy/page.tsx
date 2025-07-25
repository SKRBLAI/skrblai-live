'use client';
import { useState, useEffect } from 'react';
import { downloadLeadsCSV } from '../../../lib/utils/leadExport';

export default function PercyAdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        // Use API route instead of direct Supabase access
        const response = await fetch('/api/analytics/percy?days=7');
        const data = await response.json();
        setMetrics(data.metrics);
      } catch (error) {
        console.error('Failed to load metrics:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadMetrics();
  }, []);

  const handleExportLeads = async () => {
    try {
      await downloadLeadsCSV({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        minScore: 50
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Percy Analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Percy Performance Dashboard</h1>
          <button
            onClick={handleExportLeads}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
          >
            📊 Export Leads (Last 7 Days)
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-cyan-400/20">
            <h3 className="text-gray-400 text-sm uppercase tracking-wide mb-2">Total Conversations</h3>
            <p className="text-3xl font-bold text-white">{metrics?.totalConversations || 0}</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-cyan-400/20">
            <h3 className="text-gray-400 text-sm uppercase tracking-wide mb-2">Lead Conversion</h3>
            <p className="text-3xl font-bold text-cyan-400">{metrics?.leadConversionRate?.toFixed(1) || 0}%</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-cyan-400/20">
            <h3 className="text-gray-400 text-sm uppercase tracking-wide mb-2">Step 1 Completion</h3>
            <p className="text-3xl font-bold text-green-400">{metrics?.step1ConversionRate?.toFixed(1) || 0}%</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-cyan-400/20">
            <h3 className="text-gray-400 text-sm uppercase tracking-wide mb-2">Step 3 Completion</h3>
            <p className="text-3xl font-bold text-purple-400">{metrics?.step3ConversionRate?.toFixed(1) || 0}%</p>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="bg-slate-800 p-6 rounded-xl border border-cyan-400/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Percy Conversation Funnel</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <span className="text-white font-medium">Started Conversation</span>
              <span className="text-cyan-400 font-bold">{metrics?.totalConversations || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <span className="text-white font-medium">Completed Step 1</span>
              <span className="text-green-400 font-bold">
                {(metrics?.totalConversations || 0) - (metrics?.dropOffPoints?.step1 || 0)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <span className="text-white font-medium">Completed Step 2</span>
              <span className="text-blue-400 font-bold">
                {(metrics?.totalConversations || 0) - (metrics?.dropOffPoints?.step1 || 0) - (metrics?.dropOffPoints?.step2 || 0)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <span className="text-white font-medium">Completed Step 3</span>
              <span className="text-purple-400 font-bold">
                {(metrics?.totalConversations || 0) - (metrics?.dropOffPoints?.step1 || 0) - (metrics?.dropOffPoints?.step2 || 0) - (metrics?.dropOffPoints?.step3 || 0)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg">
              <span className="text-white font-medium">💰 Captured Leads</span>
              <span className="text-green-400 font-bold text-xl">
                {(metrics?.totalConversations || 0) - (metrics?.dropOffPoints?.step1 || 0) - (metrics?.dropOffPoints?.step2 || 0) - (metrics?.dropOffPoints?.step3 || 0) - (metrics?.dropOffPoints?.leadForm || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Drop-off Analysis */}
        <div className="bg-slate-800 p-6 rounded-xl border border-red-400/20">
          <h2 className="text-xl font-bold text-white mb-6">🔍 Drop-off Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-4">Biggest Drop-off Points</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-red-500/10 rounded-lg">
                  <span className="text-gray-300">After Step 1</span>
                  <span className="text-red-400 font-bold">{metrics?.dropOffPoints?.step1 || 0} users</span>
                </div>
                <div className="flex justify-between p-3 bg-red-500/10 rounded-lg">
                  <span className="text-gray-300">After Step 2</span>
                  <span className="text-red-400 font-bold">{metrics?.dropOffPoints?.step2 || 0} users</span>
                </div>
                <div className="flex justify-between p-3 bg-red-500/10 rounded-lg">
                  <span className="text-gray-300">Lead Form</span>
                  <span className="text-red-400 font-bold">{metrics?.dropOffPoints?.leadForm || 0} users</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">💡 Optimization Opportunities</h3>
              <div className="space-y-2 text-gray-300 text-sm">
                <p>• {(metrics?.step1ConversionRate || 0) < 70 ? 'Consider simplifying Step 1 options' : 'Step 1 performing well'}</p>
                <p>• {(metrics?.step2ConversionRate || 0) < 60 ? 'Industry options may be too complex' : 'Industry selection working'}</p>
                <p>• {(metrics?.leadConversionRate || 0) < 25 ? 'Lead form needs optimization' : 'Lead conversion is healthy'}</p>
                <p>• {(metrics?.totalConversations || 0) < 10 ? 'Need more traffic to Percy' : 'Good conversation volume'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 