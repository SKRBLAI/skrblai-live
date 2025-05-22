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
        <div role="menu" aria-label="Dashboard Navigation">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              tabIndex={0}
              aria-current={activeSection === item.id}
              aria-label={item.label}
              title={item.label}
              onClick={() => {
                setActiveSection(item.id);
                const region = document.getElementById('dashboard-announce');
                if(region) region.textContent = `${item.label} section activated.`;
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveSection(item.id);
                  const region = document.getElementById('dashboard-announce');
                  if(region) region.textContent = `${item.label} section activated.`;
                }
              }}
              className={`w-full text-left p-3 mb-2 rounded-lg cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400 transition-all duration-150 relative overflow-hidden group z-10 ${
                activeSection === item.id 
                  ? 'bg-gradient-to-r from-fuchsia-700/30 to-electric-blue/20 text-electric-blue font-black shadow-glow' 
                  : 'text-white/80 hover:bg-fuchsia-800/10 hover:text-fuchsia-400'
              }`}
            >
              {/* Animated cosmic left border for active nav */}
              <span
                className={`absolute left-0 top-0 h-full w-1 rounded-r-full bg-gradient-to-b from-fuchsia-400 via-electric-blue to-teal-400 transition-all duration-300 ${activeSection === item.id ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50 group-hover:opacity-60'}`}
                aria-hidden="true"
              />
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardSidebar;
