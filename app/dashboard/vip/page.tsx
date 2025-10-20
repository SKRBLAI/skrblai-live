import React from 'react';
import { requireRole } from '@/lib/auth/roles';
import VIPDashboardClient from './VIPDashboardClient';

// Force dynamic rendering - requires auth at runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function VIPDashboard() {
  // Server-side role guard - redirects if not authenticated or not VIP
  const user = await requireRole(['vip', 'admin']);

  return <VIPDashboardClient user={user} />;
}