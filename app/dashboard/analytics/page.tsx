'use client';

// Configure dynamic rendering and revalidation at the page level
export const dynamic = 'force-dynamic'; // Disable static page generation

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import { getCurrentUser } from '@/utils/supabase-auth';
import PageLayout from '@/components/layout/PageLayout';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';

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
      ease: 'easeOut'
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

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    tasksByType: {},
    tasksByStatus: {},
    completionTimes: [],
    dailyTasksData: {
      labels: [],
      data: []
    },
    completionRate: 0
  });

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.id);
        } else {
          window.location.href = '/sign-in';
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  // Fetch analytics data
  useEffect(() => {
    if (!userId) return;
    
    let analyticsSubscription: any = null;
    
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // Calculate date range based on timeRange
        const startDate = new Date();
        switch (timeRange) {
          case 'week':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          default:
            // 'all' - go back 2 years as reasonable default
            startDate.setFullYear(startDate.getFullYear() - 2);
        }

        // Query for user's tasks from Supabase
        const { data: tasksData, error } = await supabase
          .from('agent_jobs')
          .select('*')
          .eq('userId', userId)
          .gte('createdAt', startDate.toISOString())
          .order('createdAt', { ascending: false });

        if (error) throw error;
        
        const tasks = tasksData as TaskData[];
        processAnalyticsData(tasks);
        
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const processAnalyticsData = (tasks: TaskData[]) => {
      // Process tasks by type
      const typeCount: Record<string, number> = {};
      const statusCount: Record<string, number> = { 
        queued: 0, 
        in_progress: 0, 
        complete: 0, 
        failed: 0 
      };
      const times: number[] = [];
      const dailyTasks: Record<string, number> = {};
      
      let totalTasks = 0;
      let completedTasks = 0;

      tasks.forEach(task => {
        totalTasks++;
        
        // Count by type
        const type = task.type || 'other';
        typeCount[type] = (typeCount[type] || 0) + 1;
        
        // Count by status
        const status = task.status || 'queued';
        statusCount[status] = (statusCount[status] || 0) + 1;
        
        if (status === 'complete') {
          completedTasks++;
          
          // Calculate completion time if available
          if (task.updatedAt && task.createdAt) {
            const createdAtDate = new Date(task.createdAt);
            const updatedAtDate = new Date(task.updatedAt);
            
            const completionTimeMinutes = (updatedAtDate.getTime() - createdAtDate.getTime()) / (1000 * 60);
            if (completionTimeMinutes > 0) {
              times.push(completionTimeMinutes);
            }
          }
        }
        
        // Daily tasks count
        const createdAtDate = new Date(task.createdAt);
        const dateStr = createdAtDate.toISOString().split('T')[0];
        dailyTasks[dateStr] = (dailyTasks[dateStr] || 0) + 1;
      });
      
      // Sort dates for daily tasks chart
      const sortedDates = Object.keys(dailyTasks).sort();
      const dailyTasksLabels = sortedDates.map(date => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });
      const dailyTasksValues = sortedDates.map(date => dailyTasks[date]);
      
      // Update state with processed data
      setAnalyticsData({
        tasksByType: typeCount,
        tasksByStatus: statusCount,
        completionTimes: times,
        dailyTasksData: {
          labels: dailyTasksLabels,
          data: dailyTasksValues
        },
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      });
    };
    
    fetchAnalyticsData();

    // Set up real-time subscription for agent jobs
    analyticsSubscription = supabase
      .channel('analytics-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'agent_jobs', filter: `userId=eq.${userId}` }, 
        (payload) => {
          console.log('Analytics data changed:', payload);
          fetchAnalyticsData();
        }
      )
      .subscribe();

    // Also subscribe to reports
    const reportsSubscription = supabase
      .channel('analytics-reports')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'analytics-reports', filter: `userId=eq.${userId}` }, 
        (payload) => {
          console.log('Analytics reports changed:', payload);
          fetchAnalyticsData();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      if (analyticsSubscription) supabase.removeChannel(analyticsSubscription);
      if (reportsSubscription) supabase.removeChannel(reportsSubscription);
    };
  }, [userId, timeRange]);

  return (
    <PageLayout title="Analytics Dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-300">Track your performance metrics and analyze trends</p>
          </div>

          {/* Time range selector */}
          <div className="mb-6">
            <div className="flex space-x-2 mb-4">
              {(['week', 'month', 'year', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md transition-all ${
                    timeRange === range
                      ? 'bg-electric-blue text-white font-medium'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-electric-blue rounded-full border-t-transparent"
              />
            </div>
          ) : (
            <AnalyticsDashboard timeRange={timeRange} />
          )}
        </motion.div>
      </motion.div>
    </PageLayout>
  );
} 