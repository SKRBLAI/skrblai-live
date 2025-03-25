'use client';

import { motion } from 'framer-motion';

export default function DashboardOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stat Cards */}
        <div className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20">
          <h3 className="text-lg font-semibold mb-2">Active Campaigns</h3>
          <p className="text-3xl font-bold text-electric-blue">3</p>
        </div>
        <div className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20">
          <h3 className="text-lg font-semibold mb-2">Scheduled Posts</h3>
          <p className="text-3xl font-bold text-electric-blue">12</p>
        </div>
        <div className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20">
          <h3 className="text-lg font-semibold mb-2">Monthly Budget</h3>
          <p className="text-3xl font-bold text-electric-blue">$2,500</p>
        </div>
      </div>
    </motion.div>
  );
} 