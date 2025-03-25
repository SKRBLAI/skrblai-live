'use client';

import { signOut } from '@/utils/supabase';

export default function DashboardHeader() {
  return (
    <header className="bg-deep-navy/90 backdrop-blur-md border-b border-electric-blue/20 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-electric-blue">SKRBL AI Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={signOut}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
} 