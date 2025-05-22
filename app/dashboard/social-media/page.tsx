'use client';

export const dynamic = 'force-dynamic';

import { motion } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PostScheduler from '@/components/dashboard/PostScheduler';
import CampaignMetrics from '@/components/dashboard/CampaignMetrics';
import FileUploadCard from '@/components/dashboard/FileUploadCard';

import { useEffect, useState } from 'react';
import { auth, getCurrentUser } from '@/utils/supabase-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import agentRegistry from '@/lib/agents/agentRegistry';
import type { User } from '@supabase/supabase-js';

export default function SocialMediaDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userContent, setUserContent] = useState<any[]>([]);
  const [workflowLogs, setWorkflowLogs] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (!user) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[SKRBL AUTH] Dashboard route protection standardized.');
        }
        router.push('/auth');
        return;
      }
      setUser(user);
      setIsLoading(false);
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    // Fetch user-specific content
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('social-content')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });
      if (!error) setUserContent(data || []);
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
    fetchContent();
    fetchLogs();
    // Real-time subscription for workflow logs
    const logsSub = supabase
      .channel('workflowLogs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workflowLogs', filter: `userId=eq.${user.id}` }, payload => {
        fetchLogs();
      })
      .subscribe();
    // Real-time subscription for social-content
    const contentSub = supabase
      .channel('social-content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social-content', filter: `userId=eq.${user.id}` }, payload => {
        fetchContent();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(logsSub);
      supabase.removeChannel(contentSub);
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
  // All userContent and workflowLogs are now user-specific and real-time

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
              Social Media Growth
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-300 mb-8"
            >
              Welcome to your social media command center. Let's grow your audience and engagement.
            </motion.p>

            <div className="glass-card p-6 rounded-xl mb-8 bg-gradient-to-br from-[#0c1225]/80 to-[#0a192f]/80">
              <h2 className="text-2xl font-bold text-white mb-4">Upload Your Social Media Assets</h2>
              <p className="text-gray-300 mb-6">Upload branding materials and content to kickstart your social media growth strategy.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <FileUploadCard
                  title="Content Calendar"
                  description="Upload your content calendar or content ideas for AI enhancement."
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>}
                  acceptedFileTypes=".xls,.xlsx,.csv,.doc,.docx,.pdf"
                  fileCategory="calendar"
                  intentType="grow_social_media"
                />
                
                <FileUploadCard
                  title="Brand Assets"
                  description="Upload logos, images, and visual brand elements for consistent social content."
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>}
                  acceptedFileTypes=".jpg,.jpeg,.png,.gif,.svg,.zip"
                  fileCategory="assets"
                  intentType="grow_social_media"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="glass-card p-6 rounded-xl"
              >
                <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-medium"
                  >
                    Generate Content Ideas
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20"
                  >
                    Analyze Competitor Profiles
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20"
                  >
                    Schedule Posts
                  </motion.button>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="glass-card p-6 rounded-xl"
              >
                <CampaignMetrics />
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="glass-card p-6 rounded-xl"
            >
              <PostScheduler />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="glass-card p-6 rounded-xl mt-6 text-center"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Need More Social Media Help?</h2>
              <p className="text-gray-300 mb-4">Get a personalized social growth strategy with our AI assistant</p>
              <Link href="/?intent=grow_social_media#percy" className="inline-block">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  className="py-3 px-6 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-medium"
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>

            {/* Example: Render user-specific content and logs */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-white mb-2">Your Social Content</h2>
              {userContent.length === 0 ? (
                <p className="text-gray-400">No content yet. Upload assets or generate content to get started.</p>
              ) : (
                <ul className="space-y-2">
                  {userContent.map((item: any) => (
                    <li key={item.id} className="bg-white/10 p-3 rounded text-white">
                      <div className="font-semibold">{item.content?.businessName || 'Untitled Campaign'}</div>
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
          </motion.div>
        </main>
      </div>
    </div>
  );
}
