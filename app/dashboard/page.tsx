'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/utils/firebase';
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
import { sendWorkflowResultEmail } from '@/lib/email/sendWorkflowResult';
import { runAgentWorkflow } from '@/lib/agents/runAgentWorkflow';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Stripe Role Gating: restrict premium dashboard sections
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated, continue
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });

    // Role-based gating for premium dashboard sections
    async function checkAccess() {
      const role = await checkUserRole();
      // Only allow premium users to access premium sections
      if (
        ['metrics', 'proposals', 'billing', 'downloads', 'video'].includes(activeSection)
        && role !== 'premium'
      ) {
        router.push('/upgrade');
      }
    }
    checkAccess();

    return () => unsubscribe();
  }, [router, activeSection]);

  // Workflow handler with Resend email confirmation
  const handleRunWorkflow = async (agentId: string, payload: any, user: any) => {
    const db = getFirestore();
    const result = await runAgentWorkflow(agentId, payload);
    await addDoc(collection(db, 'workflowLogs'), {
      userId: user.uid,
      agentId,
      result: result.result,
      status: result.status,
      timestamp: new Date()
    });
    if (user.email) {
      await sendWorkflowResultEmail({
        email: user.email,
        agentId,
        result: result.result
      });
    }
    return result;
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
            {renderSection()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
