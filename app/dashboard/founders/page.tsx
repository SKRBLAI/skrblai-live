import { requireRole } from '@/lib/auth/roles';
import FoundersDashboardClient from './FoundersDashboardClient';

// Force dynamic rendering - requires auth at runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FoundersDashboardPage() {
  // Server-side role guard - redirects if not authenticated or not founder/admin
  const user = await requireRole(['founder', 'admin']);

  return <FoundersDashboardClient user={user} />;
}