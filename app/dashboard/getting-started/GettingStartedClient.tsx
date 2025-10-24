'use client';

import { motion } from 'framer-motion';
import DashboardSidebar from '../../../components/dashboard/DashboardSidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase';
import agentRegistry from '../../../lib/agents/agentRegistry';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

interface GettingStartedClientProps {
  user: User;
}

export default function GettingStartedClient({ user }: GettingStartedClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
  const [workflowLogs, setWorkflowLogs] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    
    // Fetch user-specific onboarding data
    const fetchOnboarding = async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('userId', user.id)
        .single();
      if (!error) setOnboardingStatus(data);
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
    fetchOnboarding();
    fetchLogs();
    // Real-time subscription for workflow logs
    const logsSub = supabase
      .channel('workflowLogs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workflowLogs', filter: `userId=eq.${user.id}` }, (payload: any) => {
        fetchLogs();
      })
      .subscribe();
    
    setIsLoading(false);
    
    return () => {
      supabase.removeChannel(logsSub);
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
                <h1 className="text-3xl font-bold text-white mb-2">Getting Started</h1>
                <p className="text-gray-400">Welcome to your AI-powered dashboard</p>
              </div>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/80 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>

            {/* Onboarding Steps */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-semibold text-white mb-4">Complete Your Setup</h2>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-slate-700/50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Account Created</h3>
                    <p className="text-gray-400 text-sm">Your account has been successfully created</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-slate-700/50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Complete Profile</h3>
                    <p className="text-gray-400 text-sm">Add your profile information and preferences</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-slate-700/50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Explore Features</h3>
                    <p className="text-gray-400 text-sm">Discover all the AI agents and tools available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-2">Browse Agents</h3>
                <p className="text-gray-400 text-sm mb-4">Explore our collection of AI agents</p>
                <Link
                  href="/agents"
                  className="inline-flex items-center text-electric-blue hover:text-electric-blue/80 transition-colors"
                >
                  Get Started
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-2">Create Content</h3>
                <p className="text-gray-400 text-sm mb-4">Start creating with our AI tools</p>
                <Link
                  href="/dashboard/content"
                  className="inline-flex items-center text-electric-blue hover:text-electric-blue/80 transition-colors"
                >
                  Get Started
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-2">View Analytics</h3>
                <p className="text-gray-400 text-sm mb-4">Track your progress and performance</p>
                <Link
                  href="/dashboard/analytics"
                  className="inline-flex items-center text-electric-blue hover:text-electric-blue/80 transition-colors"
                >
                  Get Started
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
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