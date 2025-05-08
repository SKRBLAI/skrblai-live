'use client';

import { signOut } from '@/utils/supabase-auth';
import { useRouter } from 'next/navigation';

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

  return (
    <header className="bg-deep-navy/90 backdrop-blur-md border-b border-electric-blue/20 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-electric-blue">SKRBL AI Dashboard</h1>
        <div className="flex items-center space-x-4">
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