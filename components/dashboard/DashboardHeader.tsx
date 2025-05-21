'use client';

import { signOut } from '@/utils/supabase-auth';
import { useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function DashboardHeader() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        router.push('/');
      } else {
        console.error('Logout error:', result.error);
      }
    } catch (error) {
      console.error('Logout error:', error);
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
    <header className="bg-deep-navy/90 backdrop-blur-md border-b border-electric-blue/20 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-electric-blue">SKRBL AI Dashboard</h1>
        <div className="flex items-center space-x-4">
          {/* n8n Status Indicator */}
          <div
            className="flex items-center"
            aria-live="polite"
            role="status"
          >
            {n8nOnline === true && (
              <motion.span
                className="flex items-center px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 font-medium mr-2 shadow-glow"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.08, 1], boxShadow: [
                  '0 0 0px #00ffe7',
                  '0 0 12px #00ffe7',
                  '0 0 0px #00ffe7'
                ] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="w-2 h-2 mr-2 rounded-full bg-teal-400 animate-pulse" />
                {n8nMessage}
              </motion.span>
            )}
            {n8nOnline === false && (
              <motion.span
                className="flex items-center px-3 py-1 rounded-full bg-orange-400/20 text-orange-300 font-medium mr-2"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="w-2 h-2 mr-2 rounded-full bg-orange-400 animate-pulse" />
                {n8nMessage}
                <span className="ml-2 text-xs text-orange-200">Try again later or contact support</span>
              </motion.span>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}