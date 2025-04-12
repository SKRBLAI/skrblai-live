'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

export default function Dashboard() {
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
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <DashboardOverview />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
