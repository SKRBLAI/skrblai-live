import React from 'react';
import { requireRole } from '@/lib/auth/roles';
import FounderClient from './FounderClient';

// Force dynamic rendering - requires auth at runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FounderPage() {
  // Server-side auth guard - requires founder role
  const user = await requireRole(['founder', 'heir']);

  return <FounderClient user={user!} />;
}