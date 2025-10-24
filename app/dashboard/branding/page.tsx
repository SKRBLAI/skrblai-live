import React from 'react';
import { requireUser } from '@/lib/auth/requireUser';
import BrandingClient from './BrandingClient';

// Force dynamic rendering - requires auth at runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BrandingPage() {
  // Server-side auth guard - redirects if not authenticated
  const user = await requireUser();

  return <BrandingClient user={user} />;
}