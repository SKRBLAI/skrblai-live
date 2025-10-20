import React from 'react';
import { requireUser } from '@/lib/auth/requireUser';

// Force dynamic rendering - requires auth at runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function UserDashboardPage() {
  // Server-side auth guard - redirects if not authenticated
  const user = await requireUser();

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">User Dashboard</h1>
      {/* TODO: Replace with real dashboard in Phase D */}
      <div className="glass rounded-xl p-6">
        <p className="text-white/80">Dashboard coming soon...</p>
      </div>
    </div>
  );
}