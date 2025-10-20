import { requireRole } from '@/lib/auth/roles';
import ParentDashboardClient from './ParentDashboardClient';

// Force dynamic rendering - requires auth at runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ParentPortalPage() {
  // Server-side role guard - redirects if not authenticated or not parent/admin
  const user = await requireRole(['parent', 'admin']);

  return <ParentDashboardClient user={user} />;
}