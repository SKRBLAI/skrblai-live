'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function DashboardHeader() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      // The signOut function now handles redirection
    } catch (error) {
      console.error('[DASHBOARD] Logout error:', error);
      toast.error('There was a problem signing out. Please try again.');
    }
  };

  // n8n health state
  const [n8nOnline, setN8nOnline] = useState<boolean | null>(null);
  const [n8nMessage, setN8nMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/n8n/health');
        if (!res.ok) throw new Error('Offline');
        const data = await res.json();
        if (isMounted) {
          setN8nOnline(data?.healthy === true);
          setN8nMessage(data?.healthy === true ? 'Automations Online' : 'Automations Offline');
        }
      } catch {
        if (isMounted) {
          setN8nOnline(false);
          setN8nMessage('Automations Offline');
        }
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          {n8nOnline !== null && (
            <div className={`ml-4 px-2 py-1 rounded-full text-xs flex items-center ${
              n8nOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-1 ${
                n8nOnline ? 'bg-green-400' : 'bg-red-400'
              }`}></span>
              {n8nMessage}
            </div>
          )}
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <div className="h-8 w-8 rounded-full bg-electric-blue flex items-center justify-center text-white">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-white hidden md:block">{user?.email || 'User'}</span>
            <svg 
              className={`w-4 h-4 text-gray-400 transform transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {menuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg overflow-hidden z-10"
            >
              <div className="py-1">
                <button
                  onClick={() => {
                    router.push('/dashboard/profile');
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                >
                  Profile Settings
                </button>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}