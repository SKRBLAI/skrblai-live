'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AnalyticsDashboard } from '@/components/dashboard';

interface AnalyticsData {
  tasksByType: Record<string, number>;
  tasksByStatus: Record<string, number>;
  totalTasks: number;
  completionRate: number;
  avgCompletionTime: number;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');





  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          
          {/* Time range selector */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg ${timeRange === 'week' ? 'bg-electric-blue text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Last Week
            </button>
            <button 
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg ${timeRange === 'month' ? 'bg-electric-blue text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Last Month
            </button>
            <button 
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-lg ${timeRange === 'year' ? 'bg-electric-blue text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Last Year
            </button>
            <button 
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-lg ${timeRange === 'all' ? 'bg-electric-blue text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              All Time
            </button>
          </div>
        </div>
        
        {/* Analytics Dashboard Component */}
        <AnalyticsDashboard timeRange={timeRange} />
      </motion.div>
    </div>
  );
}
