import React from 'react';
import { requireRole } from '@/lib/auth/roles';
import HeirDashboardClient from './HeirDashboardClient';

// Force dynamic rendering - requires auth at runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HeirDashboardPage() {
  // Server-side role guard - redirects if not authenticated or not heir/admin
  const user = await requireRole(['heir', 'admin']);

  return <HeirDashboardClient user={user} />;
}