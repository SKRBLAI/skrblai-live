'use client';

import React, { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';

interface NavItem {
  id: string;
  label: string;
}

interface DashboardSidebarProps {
  activeSection?: string;
  setActiveSection?: Dispatch<SetStateAction<string>>;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeSection = 'overview',
  setActiveSection = () => {}
}) => {
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Dashboard Overview' },
    { id: 'metrics', label: 'Campaign Metrics' },
    { id: 'content', label: 'Content Calendar' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'social', label: 'Social Media Planner' },
    { id: 'video', label: 'Video Content Queue' }
  ];

  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-deep-navy/95 border-r border-electric-blue/20"
    >
      <div className="p-6">
        {navItems.map(item => (
          <div
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`p-3 mb-2 rounded-lg cursor-pointer ${
              activeSection === item.id 
                ? 'bg-electric-blue/10 text-electric-blue' 
                : 'text-gray-300 hover:bg-deep-navy/80'
            }`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default DashboardSidebar;
