'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Activity, 
  Target, Clock, Zap, Award, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { getFunnelMetrics } from '@/lib/analytics/userFunnelTracking';



interface TaskData {
  id: string;
  type?: string;
  status?: 'queued' | 'in_progress' | 'complete' | 'failed';
  createdAt: string;
  updatedAt?: string;
  userId: string;
  [key: string]: any; // For other properties that might exist
}

interface AnalyticsDashboardProps {
  timeRange?: '24h' | '7d' | '30d' | '90d';
  userId?: string;
  userTier?: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard({ 
  timeRange = '30d', 
  userId, 
  userTier = 'starter' 
}: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'funnel' | 'performance'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getFunnelMetrics(selectedTimeRange);
        setMetrics(data);
      } catch (error) {
        console.error('[Analytics Dashboard] Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTimeRange]);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-gray-400">
        Failed to load analytics data
      </div>
    );
  }

  const metricCards: MetricCard[] = [
    {
      title: 'Total Users',
      value: metrics.totalUsers.toLocaleString(),
      change: 12.5,
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Signup Rate',
      value: `${metrics.signupRate.toFixed(1)}%`,
      change: metrics.signupRate > 70 ? 5.2 : -2.1,
      trend: metrics.signupRate > 70 ? 'up' : 'down',
      icon: <Target className="w-6 h-6" />,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Activation Rate',
      value: `${metrics.activationRate.toFixed(1)}%`,
      change: metrics.activationRate > 60 ? 8.7 : -3.4,
      trend: metrics.activationRate > 60 ? 'up' : 'down',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Avg Session',
      value: `${metrics.averageSessionDuration}m`,
      change: 15.3,
      trend: 'up',
      icon: <Clock className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const funnelData = [
    { step: 'Page Views', users: 1000, rate: 100 },
    { step: 'Signups Started', users: 450, rate: 45 },
    { step: 'Signups Completed', users: 320, rate: 32 },
    { step: 'Agent Launched', users: 240, rate: 24 },
    { step: 'Workflow Completed', users: 180, rate: 18 }
  ];

  const agentPerformanceData = metrics.topAgents.map((agent: any) => ({
    name: agent.agentId.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    launches: agent.launches,
    successRate: agent.successRate,
    fill: COLORS[Math.floor(Math.random() * COLORS.length)]
  }));

  const timeSeriesData = [
    { date: '2025-01-01', users: 120, conversions: 45 },
    { date: '2025-01-02', users: 135, conversions: 52 },
    { date: '2025-01-03', users: 148, conversions: 58 },
    { date: '2025-01-04', users: 162, conversions: 64 },
    { date: '2025-01-05', users: 178, conversions: 71 },
    { date: '2025-01-06', users: 195, conversions: 78 }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h2>
          <p className="text-gray-400">Track your platform performance and user engagement</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          {(['24h', '7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedTimeRange === range
                  ? 'bg-electric-blue text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {(['overview', 'agents', 'funnel', 'performance'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? 'bg-electric-blue text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${metric.color}`}>
                {metric.icon}
              </div>
              <div className={`flex items-center text-sm ${
                metric.trend === 'up' ? 'text-green-400' : 
                metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {metric.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : 
                 metric.trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
                {Math.abs(metric.change)}%
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
              <p className="text-gray-400 text-sm">{metric.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Based on Active Tab */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'overview' && (
          <>
            {/* User Growth Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">User Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#0EA5E9" 
                    fill="url(#userGradient)" 
                  />
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Conversion Funnel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">Conversion Funnel</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="step" type="category" stroke="#9CA3AF" width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="users" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}

        {activeTab === 'agents' && (
          <>
            {/* Top Agents Performance */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">Top Performing Agents</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="launches" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Agent Success Rates */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">Success Rate Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={agentPerformanceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="successRate"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {agentPerformanceData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}

        {activeTab === 'funnel' && (
          <>
            {/* Detailed Funnel Analysis */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 lg:col-span-2"
            >
              <h3 className="text-xl font-bold text-white mb-4">Funnel Drop-off Analysis</h3>
              <div className="space-y-4">
                {metrics.dropoffPoints.map((point: any, index: number) => (
                  <div key={point.step} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        point.dropoffRate < 20 ? 'bg-green-400' :
                        point.dropoffRate < 40 ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                      <span className="text-white font-medium">{point.step.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{point.dropoffRate.toFixed(1)}%</div>
                      <div className="text-gray-400 text-sm">drop-off rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {activeTab === 'performance' && (
          <>
            {/* System Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">System Health</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">API Response Time</span>
                  <span className="text-green-400 font-bold">245ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Webhook Success Rate</span>
                  <span className="text-green-400 font-bold">99.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Database Query Time</span>
                  <span className="text-yellow-400 font-bold">89ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Error Rate</span>
                  <span className="text-green-400 font-bold">0.3%</span>
                </div>
              </div>
            </motion.div>

            {/* Real-time Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">Real-time Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <Activity className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-white text-sm">User signed up</div>
                    <div className="text-gray-400 text-xs">2 minutes ago</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-white text-sm">Agent workflow completed</div>
                    <div className="text-gray-400 text-xs">5 minutes ago</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-white text-sm">User upgraded to Star</div>
                    <div className="text-gray-400 text-xs">12 minutes ago</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
