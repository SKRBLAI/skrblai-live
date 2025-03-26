'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface NavItem {
  id: string;
  label: string;
}

interface DashboardSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function DashboardSidebar({
  activeSection,
  setActiveSection,
}: DashboardSidebarProps) {
  const navItems: NavItem[] = [
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
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <nav className="w-64 bg-deep-navy/90 backdrop-blur-md border-r border-electric-blue/20 p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                activeSection === item.id
                  ? 'bg-electric-blue/10 text-electric-blue'
                  : 'text-soft-gray/80 hover:bg-electric-blue/5'
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </motion.div>
  );
}
