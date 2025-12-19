'use client';

import { motion } from 'framer-motion';
import DashboardSidebar from '../../../components/dashboard/DashboardSidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import CampaignMetrics from '../../../components/dashboard/CampaignMetrics';
import FileUploadCard from '../../../components/dashboard/FileUploadCard';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase';
import agentRegistry from '../../../lib/agents/agentRegistry';
import type { NormalizedUser } from '@/lib/auth/requireUser';

interface MarketingClientProps {
  user: NormalizedUser;
}

export default function MarketingClient({ user }: MarketingClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [userCampaigns, setUserCampaigns] = useState<any[]>([]);
  const [workflowLogs, setWorkflowLogs] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    
    // Fetch user-specific campaigns
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from('marketing-campaigns')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });
      if (!error) setUserCampaigns(data || []);
    };
    // Fetch workflow logs for this user
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('workflowLogs')
        .select('*')
        .eq('userId', user.id)
        .order('timestamp', { ascending: false });
      if (!error) setWorkflowLogs(data || []);
    };
    fetchCampaigns();
    fetchLogs();
    // Real-time subscription for workflow logs
    const logsSub = supabase
      .channel('workflowLogs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workflowLogs', filter: `userId=eq.${user.id}` }, (payload: any) => {
        fetchLogs();
      })
      .subscribe();
    // Real-time subscription for campaigns
    const campaignsSub = supabase
      .channel('marketing-campaigns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketing-campaigns', filter: `userId=eq.${user.id}` }, (payload: any) => {
        fetchCampaigns();
      })
      .subscribe();
    
    setIsLoading(false);
    
    return () => {
      supabase.removeChannel(logsSub);
      supabase.removeChannel(campaignsSub);
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-electric-blue/30 mb-4"></div>
          <div className="h-4 w-24 bg-electric-blue/30 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-navy">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Marketing Dashboard</h1>
                <p className="text-gray-400">Create and manage your marketing campaigns</p>
              </div>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/80 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>

            {/* File Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-2">Upload Marketing Assets</h3>
                <p className="text-gray-400 text-sm mb-4">Upload images, videos, and creative materials for your campaigns</p>
                <input
                  type="file"
                  accept="image/*,video/*,.pdf,.ai,.psd"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('Marketing assets uploaded:', file);
                      // Handle marketing assets upload
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
                />
              </div>
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-2">Upload Audience Data</h3>
                <p className="text-gray-400 text-sm mb-4">Upload customer lists and audience segments</p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('Audience data uploaded:', file);
                      // Handle audience data upload
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
                />
              </div>
            </div>

            {/* Campaign Metrics */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-semibold text-white mb-4">Campaign Performance</h2>
              <CampaignMetrics />
            </div>

            {/* User Campaigns */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-semibold text-white mb-4">Your Campaigns</h2>
              {userCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userCampaigns.map((campaign, index) => (
                    <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-2">{campaign.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{campaign.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          campaign.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : campaign.status === 'paused'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No campaigns created yet</p>
                  <p className="text-sm text-gray-500">Start creating campaigns to see them here</p>
                </div>
              )}
            </div>

            {/* Workflow Logs */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
              {workflowLogs.length > 0 ? (
                <div className="space-y-3">
                  {workflowLogs.slice(0, 5).map((log, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-b-0">
                      <div>
                        <p className="text-white text-sm">{log.message}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.status === 'success' 
                          ? 'bg-green-500/20 text-green-400' 
                          : log.status === 'error'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}