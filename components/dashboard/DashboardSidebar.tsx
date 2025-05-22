'use client';

import React, { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  href: string;
}

interface DashboardSidebarProps {
  activeSection?: string;
  setActiveSection?: Dispatch<SetStateAction<string>>;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeSection = 'overview',
  setActiveSection = () => {}
}) => {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Dashboard Overview', href: '/dashboard' },
    { id: 'metrics', label: 'Campaign Metrics', href: '/dashboard/marketing' },
    { id: 'content', label: 'Content Calendar', href: '/dashboard/content' },
    { id: 'analytics', label: 'Analytics', href: '/dashboard/analytics' },
    { id: 'social', label: 'Social Media Planner', href: '/dashboard/social-media' },
    { id: 'video', label: 'Video Content Queue', href: '/dashboard/video' }
  ];

  // Check if current path matches this item's href
  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    return pathname.startsWith(href) && href !== '/dashboard';
  };

  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-deep-navy/95 border-r border-electric-blue/20"
    >
      <div className="p-6">
        <nav aria-label="Dashboard Navigation">
          <ul className="space-y-2 list-none p-0 m-0">
            {navItems.map(item => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  title={item.label}
                  className={`block w-full text-left p-3 mb-2 rounded-lg cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400 transition-all duration-150 relative overflow-hidden group z-10 ${
                    isActive(item.href) 
                      ? 'bg-gradient-to-r from-fuchsia-700/30 to-electric-blue/20 text-electric-blue font-black shadow-glow' 
                      : 'text-white/80 hover:bg-fuchsia-800/10 hover:text-fuchsia-400'
                  }`}
                >
                  {/* Animated cosmic left border for active nav */}
                  <span
                    className={`absolute left-0 top-0 h-full w-1 rounded-r-full bg-gradient-to-b from-fuchsia-400 via-electric-blue to-teal-400 transition-all duration-300 ${isActive(item.href) ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50 group-hover:opacity-60'}`}
                    aria-hidden="true"
                  />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </motion.div>
  );
};

export default DashboardSidebar;
