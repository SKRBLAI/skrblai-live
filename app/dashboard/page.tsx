/* eslint-disable react-hooks/exhaustive-deps */
'use client';

// Configure dynamic rendering
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../components/context/AuthContext';
import { User } from '@supabase/supabase-js'; 
import { supabase } from '../../utils/supabase';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '../../utils/supabase-helpers';
import { userJourneyTracker } from '../../lib/analytics/userJourney';
import RevenuePulseWidget from '../../components/ui/RevenuePulseWidget';
import AIEmpowermentCoach from '../../components/ui/AIEmpowermentCoach';
import useUsageBasedPricing from '../../hooks/useUsageBasedPricing';

import Spinner from '../../components/ui/Spinner';
import ActionBanner from '../../components/ui/ActionBanner';

// Import actual UI components - paths should be verified by USER
import PageLayout from '../../components/layout/ClientPageLayout'; // Corrected from DashboardLayout
import DashboardHeader from '../../components/dashboard/DashboardHeader'; // Corrected from DashboardWelcomeHeader
import DashboardOverview from '../../components/dashboard/DashboardOverview'; // Corrected from OverviewSection
import Notifications from '../../components/dashboard/Notifications'; // Corrected from NotificationsPanel
import SectionNavigation from '../../components/dashboard/SectionNavigation';
import DashboardWrapper from './DashboardWrapper';
import VIPStatusIndicator from '../../components/ui/VIPStatusIndicator';

// Missing component imports - commented out
// import PremiumFeaturesPanel from '../../components/dashboard/PremiumFeaturesPanel'; 
// import UpsellCard from '../../components/ui/UpsellCard'; 
// import MyAgentsSection from '../../components/dashboard/MyAgentsSection'; 
// import ActivityFeed from '../../components/dashboard/ActivityFeed'; 
// import AgentDiscovery from '../../components/dashboard/AgentDiscovery'; 
// import QuickActionPanel from '../../components/dashboard/QuickActionPanel'; 
// import UsageStats from '../../components/dashboard/UsageStats'; 
// import FeaturedAgent from '../../components/dashboard/FeaturedAgent'; 
// import SuggestionModal from '../../components/ui/SuggestionModal'; 

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
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
};


export default function Dashboard() {
  // Check for VIP status and redirect if needed
  const [isVIP, setIsVIP] = useState(false);
  const [vipTier, setVipTier] = useState<'gold' | 'platinum' | 'diamond' | null>(null);
  const [vipCheckLoading, setVipCheckLoading] = useState(true);
  
  const router = useRouter();
  const { user: authUser, session, isLoading: authLoading, accessLevel, vipStatus, benefits, isEmailVerified } = useAuth();

  // NEW: Redirect unverified users to onboarding
  useEffect(() => {
    if (authLoading) return;
    
    if (!authUser || !session) {
      console.log('[DASHBOARD] No authenticated user, redirecting to sign-in');
      router.replace('/sign-in');
      return;
    }

    // NEW: Additional check for email verification
    if (!isEmailVerified) {
      console.log('[DASHBOARD] User not verified, redirecting to onboarding');
      router.replace('/');
      return;
    }
  }, [authUser, session, authLoading, isEmailVerified, router]);

  // ✨ NEW: Usage-based pricing integration
  const {
    usage,
    currentTier,
    recommendation,
    upgradeUrgency,
    valueRealized,
    trackUsage,
    shouldShowUpgradePrompt
  } = useUsageBasedPricing();

  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'free' | 'premium'>('free');
  const [localIsLoading, setLocalIsLoading] = useState<boolean>(true);
  
  // First-time user celebration/checklist state
  const [showCelebration, setShowCelebration] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistDismissed, setChecklistDismissed] = useState(false);
  const [checklist, setChecklist] = useState([
    { label: 'Try your first agent', key: 'try-agent', done: false },
    { label: 'Complete your profile', key: 'complete-profile', done: false },
    { label: 'Explore premium features', key: 'explore-premium', done: false },
    { label: 'Join our community', key: 'join-community', done: false },
    { label: 'Invite a teammate', key: 'invite-teammate', done: false },
  ]);
  
  // ✨ NEW: Enhanced usage pressure state
  const [showUsagePressure, setShowUsagePressure] = useState(false);
  
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

  // VIP Status Check
  useEffect(() => {
    const checkVIPStatus = async () => {
      if (!authUser?.email) {
        setVipCheckLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/vip/recognition', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: authUser.email }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.vipUser) {
            setIsVIP(true);
            setVipTier(data.vipUser.vip_level as 'gold' | 'platinum' | 'diamond');
            
            // Redirect to VIP dashboard if diamond tier
            if (data.vipUser.vip_level === 'diamond') {
              router.push('/dashboard/vip');
              return;
            }
          }
        }
      } catch (error) {
        console.error('VIP status check failed:', error);
      } finally {
        setVipCheckLoading(false);
      }
    };

    checkVIPStatus();
  }, [authUser?.email, router]);

  // ✨ NEW: Enhanced celebration/checklist effect with usage tracking
  useEffect(() => {
    if (!authLoading && authUser) {
      const onboardingComplete = window.localStorage.getItem('skrbl_onboarding_complete');
      const dashboardFirstVisit = window.localStorage.getItem('skrbl_dashboard_first_visit');
      if (onboardingComplete && !dashboardFirstVisit) {
        setShowCelebration(true);
        setShowChecklist(true);
        window.localStorage.setItem('skrbl_dashboard_first_visit', 'true');
        userJourneyTracker.trackEvent('page_view', { userId: authUser.id, page: 'dashboard_first_visit' });
        
        // Track dashboard access for usage-based pricing
        trackUsage('dashboard_access', { firstTime: true });
      }

      // ✨ NEW: Show usage pressure based on tier and usage
      if (currentTier === 'free' && (usage.agentsUsedToday >= 2 || usage.scansUsedToday >= 2)) {
        setShowUsagePressure(true);
      }
    }
  }, [authLoading, authUser, currentTier, usage.agentsUsedToday, usage.scansUsedToday, trackUsage]);

  // Auth effect
  useEffect(() => {
    console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Auth useEffect triggered. AuthIsLoading:', authLoading, 'AuthUser:', !!authUser, 'AuthSession:', !!session);
    if (!authLoading) {
      if (!authUser || !session) {
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
  }, [authUser, authLoading, router, checkUserRole]);

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
      .subscribe((status: any, err: any) => {
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
          .catch((err: any) => console.error(`[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Error unsubscribing from workflowLogs:`, err));
      }
    };
  }, [userId, authUser]); 

  if (!authLoading && !authUser) {
    console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Render: Auth loaded, no user. Showing spinner pending redirect.');
    return <Spinner />;
  }

  if (localIsLoading) {
    console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Render: localIsLoading is true. Showing spinner.');
    return <Spinner />;
  }
  
  // Confetti SVG (lightweight, no npm)
  const Confetti = () => showCelebration ? (
    <svg className="fixed inset-0 pointer-events-none z-50" width="100vw" height="100vh" style={{width:'100vw',height:'100vh'}} aria-hidden>
      <g>
        {[...Array(40)].map((_,i) => (
          <circle key={i} cx={Math.random()*window.innerWidth} cy={Math.random()*window.innerHeight/2} r={6+Math.random()*8} fill={`hsl(${Math.random()*360},90%,60%)`} opacity=".6">
            <animate attributeName="cy" values={`0;${window.innerHeight}`} dur={`${2+Math.random()*2}s`} repeatCount="indefinite"/>
          </circle>
        ))}
      </g>
    </svg>
  ) : null;

  // ✨ NEW: Enhanced checklist interaction with usage tracking
  const handleChecklistClick = (idx: number) => {
    const updated = [...checklist];
    updated[idx].done = true;
    setChecklist(updated);
    userJourneyTracker.trackEvent('page_view', { item: updated[idx].key, userId, action: 'checklist_item_clicked' });
    
    // Track task completion for usage-based pricing
    trackUsage('task_completed', { 
      task: updated[idx].key,
      checklistComplete: updated.every(item => item.done)
    });
    
    // Optionally auto-dismiss when all done
    if (updated.every(item => item.done)) {
      setShowChecklist(false);
      trackUsage('checklist_completed', { totalTasks: updated.length });
    }
  };

  // Dismiss checklist
  const dismissChecklist = () => {
    setShowChecklist(false);
    setChecklistDismissed(true);
    userJourneyTracker.trackEvent('page_view', { userId, action: 'checklist_dismissed' });
  };

  // Dismiss celebration
  const dismissCelebration = () => {
    setShowCelebration(false);
    userJourneyTracker.trackEvent('page_view', { userId, action: 'celebration_dismissed' });
  };

  console.log('[SKRBL_AUTH_DEBUG_DASHBOARD_PAGE] Render: User authenticated, data loaded. Rendering dashboard.');
  return (
    <div className="relative">
      {/* VIP Status Indicator - Now properly integrated */}
      <VIPStatusIndicator 
        vipTier={vipTier}
        isVisible={isVIP && !vipCheckLoading}
        className="z-50"
      />
      
      <PageLayout>
        {/* Enhanced welcome message for VIP users */}
        {isVIP && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-gold-500/20 to-yellow-500/20 border border-gold-500/30 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <h3 className="text-gold-400 font-bold">Welcome back, VIP {vipTier?.toUpperCase()}!</h3>
                <p className="text-sm text-gray-300">Your exclusive features are active and ready.</p>
              </div>
              <button 
                onClick={() => router.push('/dashboard/vip')}
                className="ml-auto px-4 py-2 bg-gold-500/20 hover:bg-gold-500/30 rounded-lg text-sm font-medium transition-colors"
              >
                VIP Portal →
              </button>
            </div>
          </motion.div>
        )}

        {/* Cosmic Divider */}
        <div className="w-full flex justify-center my-8">
          <div className="h-1 w-2/3 rounded-full bg-gradient-to-r from-electric-blue via-cyan-400 to-pink-400 shadow-glow animate-pulse-slow" aria-hidden="true"></div>
        </div>


        {/* First-time celebration banner */}
        <AnimatePresence>
          {showCelebration && !checklistDismissed && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mb-6 p-6 bg-gradient-to-r from-electric-blue/20 to-teal-400/20 border border-electric-blue/30 rounded-2xl backdrop-blur-sm relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-teal-400/10"
                animate={{ 
                  scale: [1, 1.02, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-3xl"
                    >
                      🎉
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Welcome to SKRBL AI!</h3>
                      <p className="text-electric-blue font-medium">Your AI automation empire starts here</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCelebration(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid gap-3 mb-4">
                  {checklist.map((item, index) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        item.done 
                          ? 'bg-green-500/20 border border-green-500/30' 
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        item.done ? 'bg-green-500 text-white' : 'bg-white/20 text-gray-400'
                      }`}>
                        {item.done ? '✓' : index + 1}
                      </div>
                      <span className={`flex-1 ${item.done ? 'text-green-300' : 'text-white'}`}>
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={() => setChecklistDismissed(true)}
                  className="w-full py-3 bg-gradient-to-r from-electric-blue to-teal-400 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-electric-blue/20 transition-all"
                >
                  Let's Build My Empire →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lightweight confetti animation */}
        <Confetti />
        
        {/* ✨ NEW: Enhanced Usage Pressure Banner with dynamic messaging */}
        {showUsagePressure && shouldShowUpgradePrompt() && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full px-4"
          >
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6 mb-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {usage.agentsUsedToday >= 3 ? '🚨 Agent Usage Limit Reached!' : 
                       usage.scansUsedToday >= 3 ? '�� Scan Limit Reached!' :
                       '🔥 Usage Momentum Detected!'}
                    </h3>
                    <p className="text-orange-200 text-sm">
                      {upgradeUrgency >= 70 ? 
                        `High-velocity usage detected! You've used ${usage.agentsUsedToday} agents and ${usage.scansUsedToday} scans today.` :
                        `You're building momentum with ${usage.agentsUsedToday} agents used today. Unlock the full arsenal!`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => router.push('/pricing?offer=dashboard_pressure')}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    {recommendation?.potentialRevenue === 67 ? 'Scale to Business ($67/mo)' : 'Upgrade to Dominate ($27/mo)'}
                  </button>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-300">{usage.agentsUsedToday}/3 daily agents</span>
                    <span className="text-orange-300">Urgency: {upgradeUrgency}%</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowUsagePressure(false)}
                  className="text-orange-300 hover:text-white text-xl ml-4"
                >
                  ×
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* New-user checklist panel */}
        {showChecklist && !checklistDismissed && (
          <div className="max-w-xl mx-auto bg-gradient-to-r from-[#0d1117] to-[#161b22] border border-teal-400/30 rounded-xl shadow-glow p-6 mt-8 mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🚀</span>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#0066FF] to-teal-400 bg-clip-text text-transparent">Get Started Checklist</h2>
              {/* ✨ NEW: Progress indicator */}
              <span className="text-sm text-gray-400">
                ({checklist.filter(item => item.done).length}/{checklist.length})
              </span>
            </div>
            <ul className="space-y-3 mb-4">
              {checklist.map((item, idx) => (
                <li key={item.key} className="flex items-center gap-2">
                  <button
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${item.done ? 'bg-teal-400 border-teal-400' : 'bg-gray-800 border-gray-600 hover:border-teal-400'}`}
                    aria-label={item.label}
                    onClick={() => handleChecklistClick(idx)}
                    disabled={item.done}
                  >
                    {item.done ? <span className="text-white">✓</span> : ''}
                  </button>
                  <span className={`text-white ${item.done ? 'line-through opacity-60' : ''}`}>{item.label}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between">
              <button
                className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#0066FF] to-teal-400 text-white shadow-glow hover:opacity-90 focus:outline-none"
                onClick={dismissChecklist}
              >
                Dismiss
              </button>
              {/* ✨ NEW: Value realization indicator */}
              <div className="text-xs text-gray-400">
                Value Score: <span className="text-teal-400 font-bold">{valueRealized}%</span>
              </div>
            </div>
          </div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 md:space-y-8 p-4 md:p-6 dashboard-content"
        >
          <motion.div variants={itemVariants}>
            <DashboardHeader />
          </motion.div>
          
          {/* ✨ ENHANCED: Usage Pressure Banner with dynamic metrics */}
          <motion.div variants={itemVariants}>
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Gateway Tier: {usage.agentsUsedToday}/3 Agents Used Today</h3>
                    <p className="text-orange-200 text-sm">
                      Unlock 11+ more agents with Starter Hustler ($27/month). Your competition isn't waiting.
                    </p>
                    {/* ✨ NEW: Real-time usage metrics */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-orange-300">
                      <span>Scans: {usage.scansUsedToday}/3</span>
                      <span>•</span>
                      <span>This Week: {usage.agentsUsedThisWeek} agents</span>
                      <span>•</span>
                      <span>Streak: {usage.consecutiveDaysActive} days</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      trackUsage('upgrade_click', { source: 'dashboard_banner', urgency: upgradeUrgency });
                      router.push('/pricing?offer=dashboard_banner');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    Upgrade to Dominate
                  </button>
                  <p className="text-orange-300 text-xs text-center">
                    {currentTier === 'free' ? '11 agents locked' : 'Advanced features available'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* {userRole === 'free' && upsellAgent && (
            <motion.div variants={itemVariants}>
              <UpsellCard agent={upsellAgent} onCTAClick={() => router.push('/pricing')} />
            </motion.div>
          )} */}

          <motion.div variants={itemVariants}>
            <DashboardWrapper>
              <div>
                {/* Dashboard content would go here */}
              </div>
            </DashboardWrapper>
          </motion.div>
        </motion.div>

        {/* ✨ NEW: Friday Competition Alert - Fixed Bottom Banner */}
        {/* Floating AI Empowerment Coach Widget */}
        <div className="fixed bottom-8 right-4 sm:right-8 z-50 pointer-events-auto max-w-xs w-full sm:max-w-sm">
          <AIEmpowermentCoach className="cosmic-glass shadow-glow rounded-2xl border border-cyan-400/40 backdrop-blur-lg bg-gradient-to-br from-black/70 to-cyan-900/30 p-4" />
        </div>
        <RevenuePulseWidget 
          currentTier={currentTier}
          agentsUsedToday={usage.agentsUsedToday}
          scansUsedToday={usage.scansUsedToday}
          showOnPages={['dashboard']}
          className="dashboard-banner"
        />
      </PageLayout>
    </div>
  );
}

