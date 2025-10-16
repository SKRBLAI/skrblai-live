'use client';
// Note: Client components are inherently dynamic - no route config exports needed

import { motion } from 'framer-motion';
import DashboardSidebar from '../../../components/dashboard/DashboardSidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import CampaignMetrics from '../../../components/dashboard/CampaignMetrics';
import FileUploadCard from '../../../components/dashboard/FileUploadCard';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../components/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase';
import agentRegistry from '../../../lib/agents/agentRegistry';
import type { User } from '@supabase/supabase-js';

export default function MarketingDashboard() {
  const { user, isLoading: authIsLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userCampaigns, setUserCampaigns] = useState<any[]>([]);
  const [workflowLogs, setWorkflowLogs] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && !user) {
      router.push('/sign-in');
    }
    if (user) {
      setIsLoading(false);
    }
  }, [user, authIsLoading, router]);

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
    // Real-time subscription for marketing-campaigns
    const campaignsSub = supabase
      .channel('marketing-campaigns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketing-campaigns', filter: `userId=eq.${user.id}` }, (payload: any) => {
        fetchCampaigns();
      })
      .subscribe();
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

  // Use agentRegistry for dynamic agent logic if needed
  // All userCampaigns and workflowLogs are now user-specific and real-time

  return (
    <div className="min-h-screen bg-deep-navy">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white text-3xl font-bold mb-6 drop-shadow-[0_0_6px_rgba(165,120,255,0.75)]"
            >
              Marketing Analytics
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-300 mb-8"
            >
              Optimize your marketing strategy with AI-powered analytics and insights.
            </motion.p>

            <div className="glass-card p-6 rounded-xl mb-8 bg-gradient-to-br from-[#0c1225]/80 to-[#0a192f]/80">
              <h2 className="text-2xl font-bold text-white mb-4">Upload Your Marketing Materials</h2>
              <p className="text-gray-300 mb-6">Upload your marketing assets and data for AI-driven optimization and insights.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <FileUploadCard
                  title="Marketing Strategy"
                  description="Upload your marketing plan, strategy docs, or market research."
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>}
                  acceptedFileTypes=".doc,.docx,.pdf,.ppt,.pptx,.xls,.xlsx"
                  fileCategory="strategy"
                  intentType="improve_marketing"
                />
                
                <FileUploadCard
                  title="Analytics Data"
                  description="Upload analytics data, campaign performance metrics, or customer data."
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>}
                  acceptedFileTypes=".csv,.xls,.xlsx,.json,.pdf"
                  fileCategory="analytics"
                  intentType="improve_marketing"
                />
              </div>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-300 mb-8"
            >
              Optimize your marketing efforts with AI-powered insights and automation.
            </motion.p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="glass-card p-6 rounded-xl col-span-2"
              >
                <h2 className="text-xl font-semibold mb-4 text-white">Performance Overview</h2>
                <CampaignMetrics />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="glass-card p-6 rounded-xl"
              >
                <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-medium"
                  >
                    Create Campaign
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20"
                  >
                    Analyze Competitors
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20"
                  >
                    Generate Ad Copy
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20"
                  >
                    SEO Analysis
                  </motion.button>
                </div>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="glass-card p-6 rounded-xl"
              >
                <h2 className="text-xl font-semibold mb-4 text-white">Active Campaigns</h2>
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white font-medium">Summer Promotion</h3>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Active</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400 mb-3">
                      <span>Budget: $1,200</span>
                      <span>ROI: 3.2x</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-electric-blue to-teal-400 h-2 rounded-full w-[65%]"></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">65% Complete</span>
                      <span className="text-xs text-gray-400">18 days left</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white font-medium">Product Launch</h3>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Planning</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400 mb-3">
                      <span>Budget: $3,500</span>
                      <span>ROI: --</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-electric-blue to-teal-400 h-2 rounded-full w-1/4"></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">25% Complete</span>
                      <span className="text-xs text-gray-400">Starts in 14 days</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white font-medium">Email Nurture</h3>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Active</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400 mb-3">
                      <span>Budget: $800</span>
                      <span>ROI: 4.7x</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-electric-blue to-teal-400 h-2 rounded-full w-4/5"></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">80% Complete</span>
                      <span className="text-xs text-gray-400">Ongoing</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="glass-card p-6 rounded-xl"
              >
                <h2 className="text-xl font-semibold mb-4 text-white">Channel Performance</h2>
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white font-medium">Social Media</h3>
                      <span className="text-electric-blue font-medium">+24%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div className="bg-gradient-to-r from-electric-blue to-teal-400 h-3 rounded-full w-[78%]"></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">Engagement</span>
                      <span className="text-xs text-gray-400">78%</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white font-medium">Email Marketing</h3>
                      <span className="text-electric-blue font-medium">+12%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div className="bg-gradient-to-r from-electric-blue to-teal-400 h-3 rounded-full w-[65%]"></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">Open Rate</span>
                      <span className="text-xs text-gray-400">65%</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white font-medium">Search Ads</h3>
                      <span className="text-electric-blue font-medium">+8%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div className="bg-gradient-to-r from-electric-blue to-teal-400 h-3 rounded-full w-[42%]"></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">Click-through Rate</span>
                      <span className="text-xs text-gray-400">42%</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white font-medium">Content Marketing</h3>
                      <span className="text-electric-blue font-medium">+31%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div className="bg-gradient-to-r from-electric-blue to-teal-400 h-3 rounded-full w-[85%]"></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">Conversion Rate</span>
                      <span className="text-xs text-gray-400">85%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="glass-card p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">AI Recommendations</h2>
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-electric-blue flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Increase Instagram Ad Budget</h3>
                      <p className="text-gray-400 text-sm mt-1">Your Instagram ads are performing 37% better than other channels. Consider reallocating budget from underperforming channels.</p>
                      <div className="mt-3 flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 rounded-lg bg-electric-blue text-white text-sm font-medium"
                        >
                          Apply
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm font-medium"
                        >
                          Dismiss
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-electric-blue flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Optimize Email Subject Lines</h3>
                      <p className="text-gray-400 text-sm mt-1">AI analysis shows your email open rates could improve by 18% with more compelling subject lines. We've generated alternatives.</p>
                      <div className="mt-3 flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 rounded-lg bg-electric-blue text-white text-sm font-medium"
                        >
                          View Suggestions
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm font-medium"
                        >
                          Dismiss
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="glass-card p-6 rounded-xl mt-6 text-center"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Need More Marketing Insights?</h2>
              <p className="text-gray-300 mb-4">Get a personalized marketing optimization plan with our AI assistant</p>
              <Link href="/?intent=improve_marketing#percy" className="inline-block">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  className="py-3 px-6 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-medium"
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-2">Your Marketing Campaigns</h2>
            {userCampaigns.length === 0 ? (
              <p className="text-gray-400">No campaigns yet. Upload assets or create a campaign to get started.</p>
            ) : (
              <ul className="space-y-2">
                {userCampaigns.map((item: any) => (
                  <li key={item.id} className="bg-white/10 p-3 rounded text-white">
                    <div className="font-semibold">{item.campaignName || 'Untitled Campaign'}</div>
                    <div className="text-xs text-gray-300">{item.createdAt || item.created_at}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-2">Recent Activity</h2>
            {workflowLogs.length === 0 ? (
              <p className="text-gray-400">No recent activity.</p>
            ) : (
              <ul className="space-y-2">
                {workflowLogs.map((log: any) => (
                  <li key={log.id} className="bg-white/10 p-3 rounded text-white">
                    <div className="font-semibold">{log.agentId || 'Agent'}</div>
                    <div className="text-xs text-gray-300">{log.result || log.status}</div>
                    <div className="text-xs text-gray-400">{log.timestamp || log.created_at}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
