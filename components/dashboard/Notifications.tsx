'use client';

import { motion } from 'framer-motion';

const notifications = [
  {
    id: 1,
    agent: 'Percy AI',
    message: 'Your post has been successfully scheduled for March 15th',
    timestamp: new Date().toLocaleString(),
    color: 'text-electric-blue'
  },
  {
    id: 2,
    agent: 'Branding AI',
    message: 'New brand assets have been generated and are ready for review',
    timestamp: new Date().toLocaleString(),
    color: 'text-teal-400'
  },
  {
    id: 3,
    agent: 'Content Creator AI',
    message: 'Your blog post draft is complete and ready for editing',
    timestamp: new Date().toLocaleString(),
    color: 'text-purple-400'
  },
  {
    id: 4,
    agent: 'BizAI',
    message: 'Your monthly business analysis report is ready',
    timestamp: new Date().toLocaleString(),
    color: 'text-yellow-400'
  }
].reverse(); // Display in reverse chronological order

export default function Notifications() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Notifications</h2>
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-deep-navy/80 p-4 rounded-xl border border-electric-blue/20"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${notification.color}`}></div>
                <h3 className="font-semibold">{notification.agent}</h3>
              </div>
              <p className="text-sm text-soft-gray/80">{notification.timestamp}</p>
            </div>
            <p className="text-soft-gray">{notification.message}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 