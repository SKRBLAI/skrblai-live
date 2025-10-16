import { Suspense } from 'react';
import { Metadata } from 'next';
import AnalyticsDashboard from '../../../components/dashboard/AnalyticsDashboard';
import { getServerSupabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const
    }
  }
};

// Data types
interface AnalyticsData {
  tasksByType: Record<string, number>;
  tasksByStatus: Record<string, number>;
  completionTimes: number[];
  dailyTasksData: {
    labels: string[];
    data: number[];
  };
  completionRate: number;
}

interface TaskData {
  id: string;
  type?: string;
  status?: 'queued' | 'in_progress' | 'complete' | 'failed';
  createdAt: string;
  updatedAt?: string;
  userId: string;
  [key: string]: any;
}

export const metadata: Metadata = {
  title: 'Analytics Dashboard | SKRBL AI',
  description: 'Comprehensive analytics and performance monitoring for your AI agents',
};

async function getUser() {
  const supabase = getServerSupabaseAdmin();
  
  if (!supabase) {
    console.error('[Analytics] Supabase unavailable');
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export default async function AnalyticsPage({
  searchParams
}: {
  searchParams: { timeRange?: string; tab?: string }
}) {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const timeRange = searchParams.timeRange as '24h' | '7d' | '30d' | '90d' || '30d';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<AnalyticsLoadingSkeleton />}>
          <AnalyticsDashboard 
            timeRange={timeRange}
            userId={user.id}
            userTier="starter" // Would get from user profile
          />
        </Suspense>
      </div>
    </div>
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-96 animate-pulse"></div>
        </div>
        <div className="flex bg-gray-800 rounded-lg p-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-16 bg-gray-700 rounded-md mx-1 animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-24 bg-gray-700 rounded-md animate-pulse"></div>
        ))}
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-16 h-6 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div>
              <div className="h-8 bg-gray-700 rounded w-20 mb-1 animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="h-6 bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>
            <div className="h-80 bg-gray-700 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
} 