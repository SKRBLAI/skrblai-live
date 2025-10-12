'use client';

export const dynamic = 'force-dynamic';

import { motion } from 'framer-motion';
import DashboardSidebar from '../../../components/dashboard/DashboardSidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase';
import agentRegistry from '../../../lib/agents/agentRegistry';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

export default function GettingStartedDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
  const [workflowLogs, setWorkflowLogs] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = getBrowserSupabase();
      if (!supabase) {
        router.push('/sign-in');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[SKRBL AUTH] Dashboard route protection standardized.');
        router.push('/sign-in');
        return;
      }
      setUser(user);
      setIsLoading(false);
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    
    // Fetch user-specific onboarding data
    const fetchOnboarding = async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('onboardingComplete, onboardingStep, onboardingGoal')
        .eq('userId', user.id)
        .maybeSingle();
      if (!error) setOnboardingStatus(data || null);
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
    // Real-time subscription for onboarding status
    const onboardingSub = supabase
      .channel('user_settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_settings', filter: `userId=eq.${user.id}` }, (payload: any) => {
        fetchOnboarding();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(logsSub);
      supabase.removeChannel(onboardingSub);
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
  // All onboardingStatus and workflowLogs are now user-specific and real-time

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
              className="text-3xl font-bold mb-6 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent"
            >
              Welcome to Your 3-Day Free Trial
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card p-6 rounded-xl mb-8"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Getting Started</h2>
              <p className="text-gray-300 mb-6">
                Welcome to SKRBL AI! Your 3-day free trial gives you access to many of  our premium features. Here's how to make the most of it:
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-electric-blue rounded-full flex items-center justify-center mr-4">
                    <span className="font-bold text-white">1</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Define Your Goals</h3>
                    <p className="text-gray-400">{onboardingStatus?.onboardingGoal ? `Your goal: ${onboardingStatus.onboardingGoal}` : 'Select what you want to accomplish with SKRBL AI'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-electric-blue rounded-full flex items-center justify-center mr-4">
                    <span className="font-bold text-white">2</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Generate Your First Content</h3>
                    <p className="text-gray-400">Try our AI-powered content generation tools</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-electric-blue rounded-full flex items-center justify-center mr-4">
                    <span className="font-bold text-white">3</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Schedule and Publish</h3>
                    <p className="text-gray-400">Set up your content calendar and start publishing</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="glass-card p-6 rounded-xl"
              >
                <h2 className="text-xl font-semibold mb-4 text-white">Choose Your Path</h2>
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="feature-button"
                  >
                    Social Media Growth
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="feature-button"
                  >
                    Book Publishing
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="feature-button"
                  >
                    Website Creation
                  </motion.button>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="glass-card p-6 rounded-xl"
              >
                <h2 className="text-xl font-semibold mb-4 text-white">Trial Status</h2>
                <div className="mb-4">
                  <p className="text-gray-400 mb-2">Days Remaining</p>
                  <div className="progress-bar">
                    <div className="progress-bar-fill progress-bar-fill-100"></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">Day 1</span>
                    <span className="text-xs text-gray-400">Day 7</span>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-white mb-1">Features Included:</p>
                  <ul className="text-gray-400 space-y-1">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Unlimited AI content generation
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Social media scheduling
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Analytics dashboard
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Email support
                    </li>
                  </ul>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="feature-button"
                >
                  Upgrade to Full Plan
                </motion.button>
              </motion.div>
            </div>
            {/* User-specific workflow logs */}
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
          </motion.div>
        </main>
      </div>
    </div>
  );
}
