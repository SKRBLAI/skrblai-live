'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
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
  createdAt: Timestamp | Date | { seconds: number; nanoseconds: number };
  updatedAt?: Timestamp | Date | { seconds: number; nanoseconds: number };
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
        const user = auth.currentUser;
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

        // Query for user's tasks
        const tasksQuery = query(
          collection(db, 'agent_jobs'),
          where('userId', '==', user.uid),
          where('createdAt', '>=', startDate),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(tasksQuery);
        const tasks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TaskData[];

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
              // Parse createdAt to a Date
              let createdAtDate: Date;
              if (task.createdAt instanceof Timestamp) {
                createdAtDate = task.createdAt.toDate();
              } else if (task.createdAt instanceof Date) {
                createdAtDate = task.createdAt;
              } else if (typeof task.createdAt === 'object' && 'seconds' in task.createdAt) {
                createdAtDate = new Date(task.createdAt.seconds * 1000);
              } else {
                createdAtDate = new Date();
              }

              // Parse updatedAt to a Date
              let updatedAtDate: Date;
              if (task.updatedAt instanceof Timestamp) {
                updatedAtDate = task.updatedAt.toDate();
              } else if (task.updatedAt instanceof Date) {
                updatedAtDate = task.updatedAt;
              } else if (typeof task.updatedAt === 'object' && 'seconds' in task.updatedAt) {
                updatedAtDate = new Date(task.updatedAt.seconds * 1000);
              } else {
                updatedAtDate = new Date();
              }
                
              const completionTimeMinutes = (updatedAtDate.getTime() - createdAtDate.getTime()) / (1000 * 60);
              if (completionTimeMinutes > 0) {
                times.push(completionTimeMinutes);
              }
            }
          }
          
          // Daily tasks count
          let createdAtDate: Date;
          if (task.createdAt instanceof Timestamp) {
            createdAtDate = task.createdAt.toDate();
          } else if (task.createdAt instanceof Date) {
            createdAtDate = task.createdAt;
          } else if (typeof task.createdAt === 'object' && 'seconds' in task.createdAt) {
            // Handle Firebase timestamp object format
            createdAtDate = new Date(task.createdAt.seconds * 1000);
          } else {
            // Fallback
            createdAtDate = new Date();
          }
            
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
        label: 'Daily Tasks',
        data: dailyTasksData.data,
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(200, 200, 200)',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        bodyFont: {
          size: 13
        },
        padding: 10,
        cornerRadius: 5,
        displayColors: true
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(150, 150, 150)',
        },
        grid: {
          color: 'rgba(50, 50, 50, 0.3)',
        }
      },
      y: {
        ticks: {
          color: 'rgb(150, 150, 150)',
        },
        grid: {
          color: 'rgba(50, 50, 50, 0.3)',
        },
        beginAtZero: true
      }
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-electric-blue border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h3 className="text-gray-400 text-sm mb-2">Total Tasks</h3>
          <p className="text-3xl font-bold text-white">
            {Object.values(tasksByType).reduce((sum, count) => sum + count, 0)}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h3 className="text-gray-400 text-sm mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold text-white">{completionRate.toFixed(1)}%</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h3 className="text-gray-400 text-sm mb-2">Avg. Completion Time</h3>
          <p className="text-3xl font-bold text-white">
            {getAverageCompletionTime().toFixed(1)} min
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h3 className="text-gray-400 text-sm mb-2">Completed Tasks</h3>
          <p className="text-3xl font-bold text-white">{tasksByStatus.complete || 0}</p>
        </motion.div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Tasks by Type</h3>
          <div className="h-80">
            <Bar data={taskTypeChartData} options={chartOptions} />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Tasks by Status</h3>
          <div className="h-80">
            <Pie data={taskStatusChartData} options={chartOptions} />
          </div>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Task Activity Over Time</h3>
        <div className="h-80">
          <Line data={dailyTasksChartData} options={chartOptions} />
        </div>
      </motion.div>
    </div>
  );
}
