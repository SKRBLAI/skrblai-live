'use client';

import { motion } from 'framer-motion';
import { useState } from "react";
import WorkflowLaunchpadModal from "@/components/ui/WorkflowLaunchpadModal";

interface DashboardOverviewProps {
  lastUsed: any[];
  activity: any[];
  suggestion: string;
}

export default function DashboardOverview({ lastUsed, activity, suggestion }: DashboardOverviewProps) {
  const [showLaunchpad, setShowLaunchpad] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-electric-blue text-white px-4 py-2 rounded-lg font-medium"
          onClick={() => setShowLaunchpad(true)}
        >
          Launch Workflow
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <motion.div 
          className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-2">Active Campaigns</h3>
          <p className="text-3xl font-bold text-electric-blue">3</p>
        </motion.div>

        <motion.div 
          className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-2">Scheduled Posts</h3>
          <p className="text-3xl font-bold text-electric-blue">12</p>
        </motion.div>

        <motion.div 
          className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-2">Monthly Budget</h3>
          <p className="text-3xl font-bold text-electric-blue">$2,500</p>
        </motion.div>
      </div>

      {/* Recent Activity */}
      {activity.length > 0 && (
        <div className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {activity.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 text-gray-300"
              >
                <div className="w-2 h-2 rounded-full bg-electric-blue" />
                <p>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Last Used Agents */}
      {lastUsed.length > 0 && (
        <div className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20">
          <h3 className="text-lg font-semibold mb-4">Recently Used Agents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lastUsed.map((agent, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-black/20 rounded-lg border border-electric-blue/10"
              >
                <h4 className="font-medium text-electric-blue">{agent.name}</h4>
                <p className="text-sm text-gray-400">{agent.lastUsed}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestion */}
      {suggestion && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20"
        >
          <h3 className="text-lg font-semibold mb-2">AI Suggestion</h3>
          <p className="text-gray-300">{suggestion}</p>
        </motion.div>
      )}

      {/* Workflow Launchpad Modal */}
      <WorkflowLaunchpadModal isOpen={showLaunchpad} onClose={() => setShowLaunchpad(false)} />
    </motion.div>
  );
}