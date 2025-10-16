'use client';
// Note: Client components are inherently dynamic - no route config exports needed

import { motion } from 'framer-motion';
import DashboardSidebar from '../../../components/dashboard/DashboardSidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import FileUploadCard from '../../../components/dashboard/FileUploadCard';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../components/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBrowserSupabase } from '@/lib/supabase';
import agentRegistry from '../../../lib/agents/agentRegistry';
import type { User } from '@supabase/supabase-js';

export default function BrandingDashboard() {
  const { user, isLoading: authIsLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [brandingProjects, setBrandingProjects] = useState<any[]>([]);
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
    
    // Fetch user-specific branding assets
    const fetchBranding = async () => {
      const { data, error } = await supabase
        .from('branding')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });
      if (!error) setBrandingProjects(data || []);
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
    fetchBranding();
    fetchLogs();
    // Real-time subscription for workflow logs
    const logsSub = supabase
      .channel('workflowLogs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workflowLogs', filter: `userId=eq.${user.id}` }, (payload: any) => {
        fetchLogs();
      })
      .subscribe();
    // Real-time subscription for branding
    const brandingSub = supabase
      .channel('branding')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'branding', filter: `userId=eq.${user.id}` }, (payload: any) => {
        fetchBranding();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(logsSub);
      supabase.removeChannel(brandingSub);
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
  // All brandingProjects and workflowLogs are now user-specific and real-time

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
              Brand Design
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-300 mb-8"
            >
              Create a powerful brand identity that resonates with your audience.
            </motion.p>
            
            <div className="glass-card p-6 rounded-xl mb-8 bg-gradient-to-br from-[#0c1225]/80 to-[#0a192f]/80">
              <h2 className="text-2xl font-bold text-white mb-4">Upload Your Brand Assets</h2>
              <p className="text-gray-300 mb-6">Upload your existing brand assets or design brief to get started with AI-powered brand enhancement.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <FileUploadCard
                  title="Logo Files"
                  description="Upload your existing logo or sketches for AI enhancement or redesign."
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>}
                  acceptedFileTypes=".png,.jpg,.jpeg,.svg,.ai,.pdf"
                  fileCategory="logo"
                  intentType="design_brand"
                />
                
                <FileUploadCard
                  title="Brand Guidelines"
                  description="Upload any existing brand guidelines or documentation to ensure consistency."
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>}
                  acceptedFileTypes=".pdf,.doc,.docx,.ppt,.pptx"
                  fileCategory="guidelines"
                  intentType="design_brand"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="glass-card p-6 rounded-xl"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-electric-blue flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white">Logo Design</h2>
                </div>
                <p className="text-gray-400 mb-4">Generate AI-powered logo concepts based on your brand values and vision.</p>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-medium"
                >
                  Create Logo
                </motion.button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="glass-card p-6 rounded-xl"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-electric-blue flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white">Color Palette</h2>
                </div>
                <p className="text-gray-400 mb-4">Discover the perfect color combinations that reflect your brand personality.</p>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-medium"
                >
                  Generate Palette
                </motion.button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="glass-card p-6 rounded-xl"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-electric-blue flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white">Brand Voice</h2>
                </div>
                <p className="text-gray-400 mb-4">Develop a consistent tone and messaging style that connects with your audience.</p>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-medium"
                >
                  Define Voice
                </motion.button>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="glass-card p-6 rounded-xl mb-8"
            >
              <h2 className="text-xl font-semibold mb-6 text-white">Brand Assets</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
                  <div className="w-full aspect-square bg-gradient-to-br from-electric-blue to-teal-400 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-white text-3xl">Logo</span>
                  </div>
                  <span className="text-white text-sm">Primary Logo</span>
                </div>
                
                <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
                  <div className="w-full aspect-square bg-white/5 rounded-lg mb-3 flex items-center justify-center border border-dashed border-white/20">
                    <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">Add Logo Variant</span>
                </div>
                
                <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
                  <div className="w-full aspect-square bg-white/5 rounded-lg mb-3 flex items-center justify-center">
                    <div className="flex flex-wrap w-3/4">
                      <div className="w-1/2 h-8 bg-electric-blue"></div>
                      <div className="w-1/2 h-8 bg-teal-400"></div>
                      <div className="w-1/2 h-8 bg-purple-500"></div>
                      <div className="w-1/2 h-8 bg-deep-navy"></div>
                    </div>
                  </div>
                  <span className="text-white text-sm">Color Palette</span>
                </div>
                
                <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
                  <div className="w-full aspect-square bg-white/5 rounded-lg mb-3 flex items-center justify-center border border-dashed border-white/20">
                    <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">Add Typography</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="glass-card p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Brand Strategy</h2>
              <p className="text-gray-400 mb-6">Define your brand's positioning and messaging strategy.</p>
              
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Brand Mission</h3>
                  <p className="text-gray-400 text-sm">Define why your brand exists and what problems it solves.</p>
                  <div className="mt-3 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20"
                    >
                      Generate
                    </motion.button>
                  </div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Target Audience</h3>
                  <p className="text-gray-400 text-sm">Identify your ideal customers and their needs.</p>
                  <div className="mt-3 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20"
                    >
                      Define Audience
                    </motion.button>
                  </div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Brand Values</h3>
                  <p className="text-gray-400 text-sm">Establish the core principles that guide your brand.</p>
                  <div className="mt-3 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20"
                    >
                      Create Values
                    </motion.button>
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
              <h2 className="text-xl font-semibold mb-4 text-white">Need More Brand Design Options?</h2>
              <p className="text-gray-300 mb-4">Get a personalized brand development package with our AI assistant</p>
              <Link href="/?intent=design_brand#percy" className="inline-block">
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
            <h2 className="text-xl font-bold text-white mb-2">Your Branding Projects</h2>
            {brandingProjects.length === 0 ? (
              <p className="text-gray-400">No branding projects yet. Upload assets or start a project to get started.</p>
            ) : (
              <ul className="space-y-2">
                {brandingProjects.map((item: any) => (
                  <li key={item.id} className="bg-white/10 p-3 rounded text-white">
                    <div className="font-semibold">{item.businessName || 'Untitled Project'}</div>
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
