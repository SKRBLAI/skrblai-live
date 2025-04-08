'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
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

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        window.location.href = '/login';
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

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

  return (
    <div className="flex min-h-screen bg-deep-navy">
      <DashboardSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
