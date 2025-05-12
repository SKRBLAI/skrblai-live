'use client';

// Configure dynamic rendering and revalidation at the page level
export const dynamic = 'force-dynamic'; // Disable static page generation

import { useState, useEffect } from 'react';
import agentRegistry from '@/lib/agents/agentRegistry';
import { getRecentPercyMemory } from '@/lib/percy/getRecentMemory';
import UpsellModal from '@/components/percy/UpsellModal';
import { supabase } from '@/utils/supabase';

import { motion } from 'framer-motion';
import { auth, getCurrentUser } from '@/utils/supabase-auth';

import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import CampaignMetrics from '@/components/dashboard/CampaignMetrics';
import PostScheduler from '@/components/dashboard/PostScheduler';
import ProposalGenerator from '@/components/dashboard/ProposalGenerator';
import BillingInfo from '@/components/dashboard/BillingInfo';
import DownloadCenter from '@/components/dashboard/DownloadCenter';
import Notifications from '@/components/dashboard/Notifications';
import VideoContentQueue from '@/components/dashboard/VideoContentQueue';
import { checkUserRole } from '@/lib/auth/checkUserRole';
import { sendEmailAction } from '@/actions/sendEmail';
import { runAgentWorkflow } from '@/lib/agents/runAgentWorkflow';

import { useRouter } from 'next/navigation';
import FloatingParticles from "@/components/ui/FloatingParticles";
import PercyAvatar from "@/components/home/PercyAvatar";

import PercyProvider from 'components/assistant/PercyProvider';
import PageLayout from '@/components/layout/PageLayout';

export default function Dashboard() {
  const [recentAgents, setRecentAgents] = useState<any[]>([]);
  const [workflowLogs, setWorkflowLogs] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellAgent, setUpsellAgent] = useState<any>(null);
  const [userRole, setUserRole] = useState<'free' | 'premium'>('free');

  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [lastUsed, setLastUsed] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [suggestion, setSuggestion] = useState<string>("");

  // Stripe Role Gating: restrict premium dashboard sections
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // User is authenticated, continue
        // Fetch recent agents from Supabase Percy memory
        const mem = await getRecentPercyMemory();
        setRecentAgents(mem);
        
        // Fetch workflow logs from Supabase
        const { data: logs, error } = await supabase
          .from('workflowLogs')
          .select('*')
          .eq('userId', user.id)
          .order('timestamp', { ascending: false })
          .limit(10);
          
        if (!error && logs) {
          setWorkflowLogs(logs.map(log => ({ id: log.id, ...log })));
        }
        
        // Set onboarding goal and recommended
        const onboardingGoal = localStorage.getItem('userGoal');
        if (onboardingGoal) {
          setRecommended(agentRegistry.filter(a => a.category?.toLowerCase().includes(onboardingGoal.toLowerCase())));
        }
        // Get user role
        const role = await checkUserRole();
        setUserRole(role);

        // Simulate fetching last used agents from localStorage or Supabase
        let used: any[] = [];
        if (typeof window !== 'undefined') {
          const last = localStorage.getItem('lastUsedAgent');
          if (last) {
            const agent = agentRegistry.find(a => a.intent === last || a.id === last);
            if (agent) used.push(agent);
          }
          // Optionally add more recent agents from memory (simulate)
          const memory = localStorage.getItem('percyMemory');
          if (memory) {
            try {
              const arr = JSON.parse(memory);
              arr.forEach((intent: string) => {
                const agent = agentRegistry.find(a => a.intent === intent);
                if (agent && !used.find(u => u.id === agent.id)) used.push(agent);
              });
            } catch { /* future quick actions here */ }
          }
        }
        setLastUsed(used.slice(0, 5));
        // Simulate activity timeline (replace with Supabase in prod)
        setActivity(used.map((a, i) => ({
          name: a.name,
          intent: a.intent,
          timestamp: Date.now() - i * 1000 * 60 * 60,
          status: i % 3 === 0 ? 'fail' : 'success',
        })));
        // Percy suggestion
        setSuggestion("Launch Branding Bot?");
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, activeSection]);

  // Workflow handler with Resend email confirmation
  const handleRunWorkflow = async (agentId: string, payload: any, user: any) => {
    const result = await runAgentWorkflow(agentId, payload);
    
    const { error } = await supabase
      .from('workflowLogs')
      .insert({
        userId: user.id,
        agentId,
        result: result.result,
        status: result.status,
        timestamp: new Date().toISOString()
      });
      
    if (user.email) {
      await sendEmailAction(user.email, agentId, result.result);
    }
    return result;
  };

  // Run Again handler
  const handleRunAgain = (agent: any) => {
    if (userRole !== 'premium' && agent.premium) {
      setUpsellAgent(agent);
      setShowUpsell(true);
      return;
    }
    window.location.href = agent.route || '/services/' + agent.id;
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview />;
      case 'metrics':
        return <CampaignMetrics />;
      case 'scheduler':
        return <PostScheduler />;
      case 'proposals':
        return <ProposalGenerator />;
      case 'billing':
        return <BillingInfo />;
      case 'downloads':
        return <DownloadCenter />;
      case 'notifications':
        return <Notifications />;
      case 'video':
        return <VideoContentQueue />;
      default:
        return <DashboardOverview />;
    }
  };

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
        <DashboardSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            {/* Recommended Section */}
            {recommended.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2 text-teal-300">Recommended For You</h2>
                <div className="flex flex-wrap gap-2">
                  {recommended.map((agent: any) => (
                    <button
                      key={agent.id}
                      onClick={() => handleRunAgain(agent)}
                      className="px-4 py-2 rounded-lg bg-teal-700/20 border border-teal-400 text-teal-200 font-semibold text-sm shadow-glow hover:bg-teal-600/30 transition-all"
                    >
                      {agent.name}
                    </button>
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
                    const agent = agentRegistry.find((a: any) => a.intent === mem.intent || a.id === mem.intent);
                    if (!agent) return null;
                    return (
                      <div key={agent.id + idx} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                        <span>{agent.name}</span>
                        <button
                          onClick={() => handleRunAgain(agent)}
                          className="ml-2 px-3 py-1 rounded bg-gradient-to-r from-electric-blue to-teal-400 text-white text-xs font-semibold shadow-glow hover:scale-105 transition-all"
                        >Run Again</button>
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
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="bg-white/10">
                      <th className="py-2 px-4">Agent</th>
                      <th className="py-2 px-4">Date</th>
                      <th className="py-2 px-4">Status</th>
                      <th className="py-2 px-4">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflowLogs.map((log: any) => {
                      const agent = agentRegistry.find((a: any) => a.id === log.agentId || a.intent === log.agentId);
                      return (
                        <tr key={log.id} className="border-b border-white/10 hover:bg-white/10">
                          <td className="py-2 px-4">{agent?.name || log.agentId}</td>
                          <td className="py-2 px-4">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="py-2 px-4">
                            <span className={`rounded-full px-2 py-0.5 text-xs ${log.status === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-2 px-4 truncate max-w-xs">{log.result ? log.result.substring(0, 50) + '...' : 'No result'}</td>
                        </tr>
                      );
                    })}
                    {workflowLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 px-4 text-center text-gray-400">No workflow logs found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Current Section */}
            {renderSection()}
          </motion.div>
        </main>
      </div>

      {/* Upsell Modal */}
      {showUpsell && (
        <UpsellModal 
          onClose={() => setShowUpsell(false)}
          agent={upsellAgent}
        />
      )}
    </div>
  );
}
