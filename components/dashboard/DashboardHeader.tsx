'use client';

import { signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { useRouter } from 'next/navigation';

export default function DashboardHeader() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
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