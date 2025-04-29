'use client';

import { motion } from 'framer-motion';

import { useState } from "react";
import WorkflowLaunchpadModal from "@/components/ui/WorkflowLaunchpadModal";

export default function DashboardOverview() {
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 16px #00fff7" }}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold text-lg shadow-glow border-2 border-electric-blue/40 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 transition-all"
          onClick={() => setShowLaunchpad(true)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Launch Workflow
        </motion.button>
      </div>
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
    {/* Workflow Launchpad Modal */}
    <WorkflowLaunchpadModal isOpen={showLaunchpad} onClose={() => setShowLaunchpad(false)} />
    </motion.div>
  );
} 