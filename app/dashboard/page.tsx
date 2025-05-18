'use client';

// Configure dynamic rendering and revalidation at the page level
export const dynamic = 'force-dynamic'; // Disable static page generation

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Initialize auth
const auth = supabase.auth;

// Helper functions
const checkUserRole = async (userId: string): Promise<'free' | 'premium'> => {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  return data?.role || 'free';
};

// Components
import PageLayout from '@/components/layout/PageLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import CampaignMetrics from '@/components/dashboard/CampaignMetrics';
import PostScheduler from '@/components/dashboard/PostScheduler';
import ProposalGenerator from '@/components/dashboard/ProposalGenerator';
import VideoContentQueue from '@/components/dashboard/VideoContentQueue';
import UpsellModal from '@/components/percy/UpsellModal';
import DownloadCenter from '@/components/dashboard/DownloadCenter';
import BillingInfo from '@/components/dashboard/BillingInfo';
import Notifications from '@/components/dashboard/Notifications';

// Types
export type Agent = {
  id: string;
  name: string;
  description: string;
  category?: string;
  lastUsed?: string;
};







const agentRegistry: { [key: string]: Agent } = {
  agent1: {
    id: 'agent1',
    name: 'Content Writer',
    description: 'AI-powered content writing assistant',
    category: 'recommended',
  },
  agent2: {
    id: 'agent2',
    name: 'Social Media Manager',
    description: 'Automated social media post generator',
    category: 'recommended',
  },
  agent3: {
    id: 'agent3',
    name: 'SEO Optimizer',
    description: 'SEO analysis and optimization tool',
    category: 'recommended',
  },
};

// Mock functions
const getRecentPercyMemory = async () => {
  return {
    agents: ['agent1', 'agent2']
  };
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

export default function Dashboard() {
  // Router
  const router = useRouter();

  // State
  const [recentAgents, setRecentAgents] = useState<Agent[]>([]);
  const [workflowLogs, setWorkflowLogs] = useState<WorkflowLog[]>([]);
  const [recommended, setRecommended] = useState<Agent[]>([]);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellAgent, setUpsellAgent] = useState<Agent | null>(null);
  const [userRole, setUserRole] = useState<'free' | 'premium'>('free');
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUsed, setLastUsed] = useState<Agent[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [suggestion, setSuggestion] = useState<string>("");

  // Auth effect
  useEffect(() => {
    const { data: { subscription } } = auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      if (user) {
        const role = await checkUserRole(user.id);
        setUserRole(role);
        setIsLoading(false);
      } else {
        router.push('/sign-in');
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get recent agents
        const recentMemory: PercyMemory = await getRecentPercyMemory();
        const recentAgentIds = recentMemory?.agents || [];
        const recentAgentData = recentAgentIds.map((id: string) => agentRegistry[id]).filter(Boolean) as Agent[];
        setRecentAgents(recentAgentData);
        setLastUsed(recentAgentData.slice(0, 3));

        // Get workflow logs
        const { data: logs } = await supabase
          .from('workflow_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        setWorkflowLogs(logs || []);
        setActivity((logs as WorkflowLog[] || []).map(log => ({
          id: log.id,
          description: log.description,
          timestamp: log.created_at
        })));

        // Get recommended agents
        const recommendedIds = Object.keys(agentRegistry)
          .filter((a: string) => agentRegistry[a].category === 'recommended')
          .slice(0, 3);
        setRecommended(recommendedIds.map((id: string) => agentRegistry[id]) as Agent[]);

        // Get suggestion
        setSuggestion('Try our new AI content generator for better engagement!');
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadData();
  }, []);

  // --- Remove all duplicate type/interface declarations below this line ---


  // Loading state
  if (isLoading) {
    return (
      <PageLayout title="Loading...">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-center min-h-[60vh]"
        >
          <motion.div variants={itemVariants} className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-electric-blue/30 mb-4" />
            <div className="h-4 w-24 bg-electric-blue/30 rounded" />
          </motion.div>
        </motion.div>
      </PageLayout>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="flex-grow overflow-auto">
        <PageLayout title="Dashboard Overview">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <DashboardHeader />
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-8">
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <motion.div variants={itemVariants}>
                  <DashboardOverview
                    lastUsed={lastUsed}
                    activity={activity}
                    suggestion={suggestion}
                  />
                </motion.div>
              )}

              {/* Campaign Metrics */}
              {activeSection === 'metrics' && (
                <motion.div variants={itemVariants}>
                  <CampaignMetrics />
                </motion.div>
              )}

              {/* Post Scheduler */}
              {activeSection === 'scheduler' && (
                <motion.div variants={itemVariants}>
                  <PostScheduler />
                </motion.div>
              )}

              {/* Proposal Generator */}
              {activeSection === 'proposals' && (
                <motion.div variants={itemVariants}>
                  <ProposalGenerator />
                </motion.div>
              )}

              {/* Video Content Queue */}
              {activeSection === 'video' && (
                <motion.div variants={itemVariants}>
                  <VideoContentQueue />
                </motion.div>
              )}

              {/* Downloads */}
              {activeSection === 'downloads' && (
                <motion.div variants={itemVariants}>
                  <DownloadCenter />
                </motion.div>
              )}

              {/* Billing */}
              {activeSection === 'billing' && (
                <motion.div variants={itemVariants}>
                  <BillingInfo />
                </motion.div>
              )}

              {/* Notifications */}
              {activeSection === 'notifications' && (
                <motion.div variants={itemVariants}>
                  <Notifications />
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Upsell Modal */}
          {showUpsell && (
            <UpsellModal 
              onClose={() => setShowUpsell(false)}
              agent={{
                name: upsellAgent?.name || '',
                description: upsellAgent?.description || ''
              }}
            />
          )}
        </PageLayout>
      </div>
      {/* Recommended Section */}
      {recommended.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-teal-300">Recommended For You</h2>
          <div className="flex flex-wrap gap-2">
            {recommended.map((agent: any) => (
              <span key={agent.id} className="px-4 py-2 rounded-lg bg-teal-700/20 border border-teal-400 text-teal-200 font-semibold text-sm shadow-glow">
                {agent.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Agents Section */}
      {recentAgents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-electric-blue">Recent Agents</h2>
          <div className="flex flex-wrap gap-2">
            {recentAgents.map((mem: any, idx: number) => {
              const agent = agentRegistry[mem.id];
              if (!agent) return null;
              return (
                <div key={agent.id + idx} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                  <span>{agent.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Workflow Log Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-white">Workflow Log</h2>
        <div className="overflow-x-auto rounded-xl bg-white/5 border border-white/10">
        </div>
      </div>
    </div>
  </div>
}
