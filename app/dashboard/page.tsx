'use client';

// Configure dynamic rendering and revalidation at the page level
export const dynamic = 'force-dynamic'; // Disable static page generation

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/utils/supabase-auth';
import agentRegistry from '@/lib/agents/agentRegistry';

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
import UpgradeBanner from '@/components/ui/UpgradeBanner';

// Types
export type Agent = {
  id: string;
  name: string;
  description: string;
  category?: string;
  lastUsed?: string;
};

type Activity = {
  id: string;
  description: string;
  timestamp: string;
};

type WorkflowLog = {
  id: string;
  description: string;
  created_at: string;
};

type PercyMemory = {
  agents?: string[];
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
  const router = useRouter();
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
  const [userId, setUserId] = useState<string | null>(null);

  // Auth effect
  useEffect(() => {
    const { data: { subscription } } = auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      if (user) {
        setUserId(user.id);
        const role = await checkUserRole(user.id);
        setUserRole(role);
        setIsLoading(false);
      } else {
        console.log('[SKRBL AUTH] Dashboard route protection standardized.');
        if (!session) {
          router.push('/sign-in');
        }
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  // Load data on mount and when userId changes
  useEffect(() => {
    if (!userId) return;
    let logsSubscription: any = null;
    const loadData = async () => {
      try {
        // Fetch recent agents for this user from Supabase memory/content logs
        const { data: memory } = await supabase
          .from('user_settings')
          .select('recentAgents')
          .eq('userId', userId)
          .maybeSingle();
        let recentAgentIds: string[] = [];
        if (memory && memory.recentAgents && Array.isArray(memory.recentAgents)) {
          recentAgentIds = memory.recentAgents;
        }
        // Fallback: use agent usage logs
        if (recentAgentIds.length === 0) {
          const { data: usage } = await supabase
            .from('agent_usage')
            .select('intent')
            .eq('userId', userId)
            .order('updatedAt', { ascending: false })
            .limit(3);
          recentAgentIds = (usage || []).map((u: any) => u.intent).filter(Boolean);
        }
        const recentAgentData = recentAgentIds
          .map((id: string) => agentRegistry.find(a => a.id === id || a.intent === id))
          .filter(Boolean) as Agent[];
        setRecentAgents(recentAgentData);
        setLastUsed(recentAgentData.slice(0, 3));

        // Fetch workflow logs for this user
        const { data: logs } = await supabase
          .from('workflowLogs')
          .select('*')
          .eq('userId', userId)
          .order('created_at', { ascending: false })
          .limit(5);
        setWorkflowLogs(logs || []);
        setActivity((logs as WorkflowLog[] || []).map(log => ({
          id: log.id,
          description: log.description,
          timestamp: log.created_at
        })));

        // Recommended agents: top 3 visible agents
        setRecommended(agentRegistry.filter(a => a.visible).slice(0, 3));

        // Suggestion: personalize based on usage
        setSuggestion('Try our new AI content generator for better engagement!');
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    loadData();

    // Real-time subscription for workflow logs
    logsSubscription = supabase
      .channel('public:workflowLogs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workflowLogs', filter: `userId=eq.${userId}` }, (payload: any) => {
        loadData();
      })
      .subscribe();
    return () => {
      if (logsSubscription) supabase.removeChannel(logsSubscription);
    };
  }, [userId]);

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
            {/* Cosmic Upgrade Banner for Free Users */}
            {userRole === 'free' && (
              <motion.div variants={itemVariants}>
                <UpgradeBanner />
              </motion.div>
            )}
            <motion.div variants={itemVariants}>
              <DashboardHeader />
            </motion.div>

            {/* Agent List/Panel */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {Object.values(agentRegistry).map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, boxShadow: '0 0 16px #2dd4bf' }}
                  className="rounded-xl bg-white/10 backdrop-blur-md border border-teal-400 shadow-glow p-6 flex flex-col gap-2 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400"
                  tabIndex={0}
                  aria-label={`Agent: ${agent.name}`}
                  onClick={() => {
                    setUpsellAgent(agent);
                    setShowUpsell(true);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setUpsellAgent(agent);
                      setShowUpsell(true);
                    }
                  }}
                >
                  <h3 className="text-lg font-bold text-teal-300 mb-1 gradient-text-sk">{agent.name}</h3>
                  <p className="text-gray-300 mb-2 text-sm">{agent.description}</p>
                  <div className="flex items-center text-xs text-gray-400 mt-auto">
                    <span className="mr-2">Last Run:</span>
                    <span className="font-semibold text-white">—</span>
                  </div>
                </motion.div>
              ))}
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
  );
}
