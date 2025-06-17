/* eslint-disable react-hooks/exhaustive-deps */
'use client';

// Configure dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/context/AuthContext'; 
import { supabase } from '@/utils/supabase';

import Spinner from '@/components/ui/Spinner';

// Import actual UI components - paths should be verified by USER
import PageLayout from '@/components/layout/PageLayout'; // Corrected from DashboardLayout
import DashboardHeader from '@/components/dashboard/DashboardHeader'; // Corrected from DashboardWelcomeHeader
import DashboardOverview from '@/components/dashboard/DashboardOverview'; // Corrected from OverviewSection
import Notifications from '@/components/dashboard/Notifications'; // Corrected from NotificationsPanel

// Missing component imports - commented out
// import PremiumFeaturesPanel from '@/components/dashboard/PremiumFeaturesPanel'; 
// import UpsellCard from '@/components/ui/UpsellCard'; 
// import SectionNavigation from '@/components/dashboard/SectionNavigation'; 
// import MyAgentsSection from '@/components/dashboard/MyAgentsSection'; 
// import ActivityFeed from '@/components/dashboard/ActivityFeed'; 
// import AgentDiscovery from '@/components/dashboard/AgentDiscovery'; 
// import QuickActionPanel from '@/components/dashboard/QuickActionPanel'; 
// import UsageStats from '@/components/dashboard/UsageStats'; 
// import FeaturedAgent from '@/components/dashboard/FeaturedAgent'; 
// import SuggestionModal from '@/components/ui/SuggestionModal'; 

// Types
export type Agent = {
  id: string;
  name: string;
  description: string;
  category?: string;
  lastUsed?: string;
  intent?: string; 
  visible?: boolean; 
  avatar?: string; 
  specialty?: string; 
};

type ActivityItem = {
  id: string;
  description: string;
  timestamp: string;
};

type WorkflowLog = {
  id: string;
  userId: string; 
  description: string;
  created_at: string;
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function Dashboard() {
  const router = useRouter();
  const { user: authUser, session: authSession, isLoading: authIsLoading } = useAuth();

  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'free' | 'premium'>('free');
  const [localIsLoading, setLocalIsLoading] = useState<boolean>(true);
  
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [lastUsed, setLastUsed] = useState<Agent[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [suggestion, setSuggestion] = useState<string>("");
  const [upsellAgent, setUpsellAgent] = useState<Agent | null>(null); 
  const [featuredAgent, setFeaturedAgent] = useState<Agent | null>(null); 

  const checkUserRole = useCallback(async (id: string): Promise<'free' | 'premium'> => {
    console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] checkUserRole called for ID:', id);
    if (!id) return 'free';
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', id)
        .single();
      if (error) {
        console.error('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Error fetching user role:', error.message);
        if (error.code === 'PGRST116') return 'free'; 
      }
      return data?.role || 'free';
    } catch (e) {
      console.error('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Exception fetching user role:', e);
      return 'free';
    }
  }, []);

  // Auth effect
  useEffect(() => {
    console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Auth useEffect triggered. AuthIsLoading:', authIsLoading, 'AuthUser:', !!authUser, 'AuthSession:', !!authSession);
    if (!authIsLoading) {
      if (!authUser || !authSession) {
        console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Auth loaded: No user/session. Redirecting to /sign-in.');
        router.push('/sign-in');
      } else {
        console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Auth loaded: User and session EXIST. User ID:', authUser.id);
        setUserId(authUser.id);
        checkUserRole(authUser.id).then(role => {
          console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] User role fetched:', role);
          setUserRole(role);
          setLocalIsLoading(false);
          console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] localIsLoading set to false.');
        }).catch(err => {
           console.error('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Error in checkUserRole promise:', err);
           setLocalIsLoading(false); 
        });
      }
    } else {
      console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Auth IS STILL LOADING. localIsLoading set to true.');
      setLocalIsLoading(true);
    }
  }, [authUser, authSession, authIsLoading, router, checkUserRole]);

  // Data fetching effect
  useEffect(() => {
    if (!userId || !authUser) return; 
    
    console.log(`[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Data fetching useEffect for userId: ${userId}`);
    setLocalIsLoading(true); 

    let logsSubscription: any = null;

    const loadDashboardData = async () => {
      try {
        setLastUsed([
            { id: '1', name: 'Placeholder Agent 1', description: 'Used recently', intent: 'agent1' },
            { id: '2', name: 'Placeholder Agent 2', description: 'Also used recently', intent: 'agent2' },
        ]);

        const { data: workflowLogsData } = await supabase
          .from('workflowLogs') // Specify WorkflowLog type if possible, or 'any' then map
          .select('id, description, created_at')
          .eq('userId', userId)
          .order('created_at', { ascending: false })
          .limit(5);
        setActivity(workflowLogsData?.map((log: any) => ({
          id: log.id,
          description: log.description,
          timestamp: log.created_at
        })) || []);
        
        setFeaturedAgent({ id: 'feat1', name: 'Featured Percy', description: 'Try this amazing agent!', avatar: '/images/percy-avatar.png', specialty: 'Content Creation' });
        setUpsellAgent({ id: 'upsell1', name: 'Premium Percy', description: 'Unlock more power!', intent: 'premium_percy'});

        setSuggestion('Explore new AI capabilities for your projects!');
        
      } catch (error) {
        console.error('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Error loading dashboard data:', error);
      } finally {
        setLocalIsLoading(false);
        console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Dashboard data fetch complete, localIsLoading set to false.');
      }
    };

    loadDashboardData();

    logsSubscription = supabase
      .channel(`workflow-logs-user-${userId}`)
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'workflowLogs', filter: `userId=eq.${userId}` }, 
          (payload: any) => {
            console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Realtime workflow log update:', payload);
            loadDashboardData(); 
          })
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Subscribed to workflowLogs for user ${userId}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Subscription error for workflowLogs: ${status}`, err);
        }
      });
      
    return () => {
      if (logsSubscription) {
        supabase.removeChannel(logsSubscription)
          .then(() => console.log(`[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Unsubscribed from workflowLogs for user ${userId}`))
          .catch(err => console.error(`[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Error unsubscribing from workflowLogs:`, err));
      }
    };
  }, [userId, authUser]); 

  if (!authIsLoading && !authUser) {
    console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Render: Auth loaded, no user. Showing spinner pending redirect.');
    return <Spinner />;
  }

  if (localIsLoading) {
    console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Render: localIsLoading is true. Showing spinner.');
    return <Spinner />;
  }
  
  console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Render: User authenticated, data loaded. Rendering dashboard.');
  return (
    <PageLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 md:space-y-8 p-4 md:p-6"
      >
        <motion.div variants={itemVariants}>
          <DashboardHeader />
        </motion.div>
        
        {/* {userRole === 'free' && upsellAgent && (
          <motion.div variants={itemVariants}>
            <UpsellCard agent={upsellAgent} onCTAClick={() => router.push('/pricing')} />
          </motion.div>
        )} */}

        {/* {userRole === 'premium' && (
           <motion.div variants={itemVariants}>
             <PremiumFeaturesPanel />
           </motion.div>
        )} */}

        {/* <motion.div variants={itemVariants}>
          <SectionNavigation activeSection={activeSection} onNavigate={setActiveSection} />
        </motion.div> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {activeSection === 'overview' && (
              <motion.div variants={itemVariants}>
                <DashboardOverview 
                  lastUsed={lastUsed} 
                  activity={activity} 
                  suggestion={suggestion}
                />
              </motion.div>
            )}
            {/* {activeSection === 'my-agents' && (
              <motion.div variants={itemVariants}>
                <MyAgentsSection agents={[]} onConfigureAgent={(agentId: string) => console.log('Configure agent:', agentId)} />
              </motion.div>
            )} */}
            {/* {activeSection === 'activity' && (
              <motion.div variants={itemVariants}>
                <ActivityFeed items={activity} />
              </motion.div>
            )} */}
            {/* {activeSection === 'discover' && (
              <motion.div variants={itemVariants}>
                <AgentDiscovery onAgentSelect={(agentId: string) => console.log('Discover agent selected:', agentId)} />
              </motion.div>
            )} */}
          </div>

          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            {/* <motion.div variants={itemVariants}>
              <QuickActionPanel onAction={(action: string) => console.log('Quick action:', action)} />
            </motion.div> */}
            {/* <motion.div variants={itemVariants}>
              <UsageStats stats={{ creditsUsed: 120, creditsRemaining: 880, tasksCompleted: 15 }} />
            </motion.div> */}
            {/* {featuredAgent && (
              <motion.div variants={itemVariants}>
                <FeaturedAgent agent={featuredAgent} />
              </motion.div>
            )} */}
            <motion.div variants={itemVariants}>
              <Notifications />
            </motion.div>
          </div>
        </div>
        
        {/* {suggestion && (
          <SuggestionModal 
            suggestion={suggestion} 
            onAccept={() => { console.log("Suggestion accepted"); setSuggestion(""); }} 
            onReject={() => { console.log("Suggestion rejected"); setSuggestion(""); }}
          />
        )} */}
      </motion.div>
    </PageLayout>
  );
}

