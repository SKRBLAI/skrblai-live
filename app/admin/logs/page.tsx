import React from 'react';
import { requireRole } from '@/lib/auth/roles';
import AdminLogsClient from './AdminLogsClient';

// Force dynamic rendering - requires auth at runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PercyLogsPage() {
  // Server-side role guard - redirects if not authenticated or not admin
  const user = await requireRole(['admin']);

  return <AdminLogsClient user={user} />;
} 