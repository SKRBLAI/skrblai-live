'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

interface TaskData {
  id: string;
  type?: string;
  status?: 'queued' | 'in_progress' | 'complete' | 'failed';
  createdAt: string;
  updatedAt?: string;
  userId: string;
  [key: string]: any; // For other properties that might exist
}

interface AnalyticsProps {
  timeRange?: 'week' | 'month' | 'year' | 'all';
}

export default function AnalyticsDashboard({ timeRange = 'month' }: AnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [tasksByType, setTasksByType] = useState<Record<string, number>>({});
  const [tasksByStatus, setTasksByStatus] = useState<Record<string, number>>({});
  const [completionTimes, setCompletionTimes] = useState<number[]>([]);
  const [dailyTasksData, setDailyTasksData] = useState<{ labels: string[], data: number[] }>({
    labels: [],
    data: []
  });
  const [completionRate, setCompletionRate] = useState(0);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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
          .eq('userId', user.id)
          .gte('createdAt', startDate.toISOString())
          .order('createdAt', { ascending: false });

        if (error) throw error;
        
        const tasks = tasksData as TaskData[];

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
        setTasksByType(typeCount);
        setTasksByStatus(statusCount);
        setCompletionTimes(times);
        setDailyTasksData({
          labels: dailyTasksLabels,
          data: dailyTasksValues
        });
        setCompletionRate(totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeRange]);

  const getAverageCompletionTime = () => {
    if (completionTimes.length === 0) return 0;
    const sum = completionTimes.reduce((a, b) => a + b, 0);
    return sum / completionTimes.length;
  };

  const taskTypeChartData = {
    labels: Object.keys(tasksByType).map(t => t.charAt(0).toUpperCase() + t.slice(1)),
    datasets: [
      {
        label: 'Tasks by Type',
        data: Object.values(tasksByType),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const taskStatusChartData = {
    labels: Object.keys(tasksByStatus).map(s => s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')),
    datasets: [
      {
        label: 'Tasks by Status',
        data: Object.values(tasksByStatus),
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)', // queued - yellow
          'rgba(54, 162, 235, 0.6)', // in_progress - blue
          'rgba(75, 192, 192, 0.6)', // complete - green
          'rgba(255, 99, 132, 0.6)', // failed - red
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const dailyTasksChartData = {
    labels: dailyTasksData.labels,
    datasets: [
      {
        label: 'Tasks Created',
        data: dailyTasksData.data,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(20, 25, 39, 0.9)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(54, 162, 235, 0.5)',
        borderWidth: 1,
        padding: 10,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 12
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-xl backdrop-blur-md p-6 border border-gray-800">
      <h2 className="text-xl font-semibold text-white mb-6">Analytics Dashboard</h2>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-electric-blue rounded-full border-t-transparent"
          />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
            >
              <h3 className="text-sm font-medium text-gray-400 mb-1">Total Tasks</h3>
              <p className="text-2xl font-bold text-white">
                {Object.values(tasksByType).reduce((a, b) => a + b, 0)}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
            >
              <h3 className="text-sm font-medium text-gray-400 mb-1">Completion Rate</h3>
              <p className="text-2xl font-bold text-white">
                {completionRate.toFixed(1)}%
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
            >
              <h3 className="text-sm font-medium text-gray-400 mb-1">Avg. Completion Time</h3>
              <p className="text-2xl font-bold text-white">
                {getAverageCompletionTime().toFixed(1)} min
              </p>
            </motion.div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/30 p-4 rounded-lg border border-gray-700"
            >
              <h3 className="text-sm font-medium text-gray-400 mb-3">Task Types</h3>
              <div className="h-64">
                <Pie data={taskTypeChartData} options={chartOptions} />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/30 p-4 rounded-lg border border-gray-700"
            >
              <h3 className="text-sm font-medium text-gray-400 mb-3">Task Status</h3>
              <div className="h-64">
                <Pie data={taskStatusChartData} options={chartOptions} />
              </div>
            </motion.div>
          </div>
          
          {/* Activity Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800/30 p-4 rounded-lg border border-gray-700"
          >
            <h3 className="text-sm font-medium text-gray-400 mb-3">Activity Over Time</h3>
            <div className="h-72">
              <Line data={dailyTasksChartData} options={chartOptions} />
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
