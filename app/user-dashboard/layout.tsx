'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { initAuth } from '@/utils/auth';
import { Sidebar, Header } from '@/components/dashboard';
import { auth } from '@/utils/firebase';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = initAuth((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        // Redirect to login if not authenticated
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-12 h-12 rounded-full border-4 border-electric-blue border-t-transparent animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar /> 
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
