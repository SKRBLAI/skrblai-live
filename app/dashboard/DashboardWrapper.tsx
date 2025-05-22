'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/utils/supabase-auth';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { PersistentPercy } from '@/components/assistant/PersistentPercy';

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[SKRBL AUTH] Unauthenticated user redirected from dashboard to /auth');
        }
        router.push('/auth?reason=session-expired');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <PersistentPercy>
      <div className="flex min-h-screen bg-[#0D1117]">
        <DashboardSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </PersistentPercy>
  );
} 