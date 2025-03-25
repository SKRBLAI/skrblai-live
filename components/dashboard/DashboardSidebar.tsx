'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DashboardSidebar({ activeSection, setActiveSection }) {
  const navItems = [
    { id: 'overview', label: 'Dashboard Overview' },
    { id: 'metrics', label: 'Campaign Metrics' },
    { id: 'scheduler', label: 'Schedule a Post' },
    { id: 'proposals', label: 'Proposal Generator' },
    { id: 'billing', label: 'Billing' },
    { id: 'downloads', label: 'Downloads' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'video', label: 'Video Content Queue' },
  ];

  return (
    <motion.nav 
      className="w-64 bg-deep-navy/90 backdrop-blur-md border-r border-electric-blue/20 p-4"
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full text-left p-2 rounded-md transition-colors ${
              activeSection === item.id
                ? 'bg-electric-blue/10 text-electric-blue'
                : 'text-soft-gray hover:bg-electric-blue/5 hover:text-electric-blue'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </motion.nav>
  );
} 