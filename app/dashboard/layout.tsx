'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/utils/firebase';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { PersistentPercy } from '@/components/assistant/PersistentPercy';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login?reason=session-expired');
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
