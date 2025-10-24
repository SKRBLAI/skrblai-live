import React from 'react';
import { requireUser } from '@/lib/auth/requireUser';
import MarketingClient from './MarketingClient';

// Force dynamic rendering - requires auth at runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MarketingPage() {
  // Server-side auth guard - redirects if not authenticated
  const user = await requireUser();

  return <MarketingClient user={user} />;
}