'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const navItems = [
  { 
    path: '/user-dashboard', 
    label: 'Dashboard', 
    icon: '📊' 
  },
  { 
    path: '/user-dashboard/tasks', 
    label: 'Task Progress', 
    icon: '🧭' 
  },
  { 
    path: '/user-dashboard/analytics', 
    label: 'Analytics', 
    icon: '📈' 
  },
  { 
    path: '/user-dashboard/uploads', 
    label: 'Files & Uploads', 
    icon: '📝' 
  },
  { 
    path: '/user-dashboard/settings', 
    label: 'Account Settings', 
    icon: '⚙️' 
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div 
      className={`bg-gray-800 text-white ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 h-screen sticky top-0 flex flex-col`}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className={`${collapsed ? 'sr-only' : 'block'}`}>
          <span className="text-2xl font-bold bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent">SKRBL</span>
          <span>AI</span>
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded hover:bg-gray-700"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="flex-1 mt-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center p-4 ${pathname === item.path ? 'bg-electric-blue/20 border-r-4 border-electric-blue' : 'hover:bg-gray-700'} transition-colors`}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            <span className={collapsed ? 'sr-only' : 'block'}>{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <Link
          href="/logout"
          className="flex items-center p-2 hover:bg-gray-700 rounded transition-colors"
        >
          <span className="text-xl mr-3">🚪</span>
          <span className={collapsed ? 'sr-only' : 'block'}>Logout</span>
        </Link>
      </div>
    </motion.div>
  );
}
