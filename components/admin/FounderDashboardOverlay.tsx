import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Users, DollarSign, BarChart3, AlertTriangle, RefreshCw } from 'lucide-react';

interface FounderDashboardData {
  timestamp: string;
  accessLevel: string;
  agents: {
    totalAgents?: number;
    totalLaunches?: number;
    totalCompletions?: number;
    successRate?: number;
    status: 'green' | 'yellow' | 'red';
    error?: string;
  };
  analytics: {
    totalUsers?: number;
    signupRate?: number;
    conversionRate?: number;
    retentionRate?: number;
    averageSessionDuration?: number;
    topAgents?: Array<{ agentId: string; launches: number; successRate: number }>;
    status: 'green' | 'yellow' | 'red';
    error?: string;
  };
  sales: {
    monthlyRevenue?: number;
    totalRevenue?: number;
    activeSubscriptions?: number;
    status: 'green' | 'yellow' | 'red';
    error?: string;
  };
  userInfo: {
    totalUsers?: number;
    newUsers30d?: number;
    activeSessions24h?: number;
    status: 'green' | 'yellow' | 'red';
    error?: string;
  };
  health: {
    uptime?: string;
    apiResponseTime?: string;
    errorRate?: string;
    systemLoad?: string;
    status: 'green' | 'yellow' | 'red';
    error?: string;
  };
  errors: {
    count?: number;
    recentErrors?: any[];
    status: 'green' | 'yellow' | 'red';
    error?: string;
  };
}

interface FounderDashboardOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function FounderDashboardOverlay({ isVisible, onClose }: FounderDashboardOverlayProps) {
  const [dashboardData, setDashboardData] = useState<FounderDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('agents');

  // Fetch dashboard data when overlay opens
  useEffect(() => {
    if (isVisible) {
      fetchDashboardData();
    }
  }, [isVisible]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/founder-dashboard?code=MMM_mstr');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }
      
      setDashboardData(result.data);
    } catch (err: any) {
      console.error('[Founder Dashboard] Error fetching data:', err);
      setError(err.message || 'Dashboard temporarily unavailable');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'text-green-400 bg-green-400/20 border-green-400/40';
      case 'yellow': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/40';
      case 'red': return 'text-red-400 bg-red-400/20 border-red-400/40';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/40';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'green': return '●';
      case 'yellow': return '▲';
      case 'red': return '■';
      default: return '○';
    }
  };

  const menuItems = [
    { id: 'agents', label: 'AGENTS', icon: Activity, description: 'Agent usage & performance' },
    { id: 'analytics', label: 'ANALYTICS', icon: BarChart3, description: 'Traffic & engagement' },
    { id: 'sales', label: 'SALES', icon: DollarSign, description: 'Revenue & subscriptions' },
    { id: 'userInfo', label: 'USER INFO', icon: Users, description: 'User sessions & signups' },
    { id: 'health', label: 'HEALTH CHECK', icon: Activity, description: 'System status' },
    { id: 'errors', label: 'RECENT ERRORS', icon: AlertTriangle, description: 'Error logs' }
  ];

  const renderSectionContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-400" />
          <span className="ml-3 text-white">Loading dashboard data...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-red-400 font-bold mb-2">Dashboard Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!dashboardData) {
      return (
        <div className="p-8 text-center">
          <span className="text-gray-400">No data available</span>
        </div>
      );
    }

    const sectionData = dashboardData[selectedSection as keyof FounderDashboardData];

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {menuItems.find(item => item.id === selectedSection)?.label}
          </h2>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs border ${getStatusColor((sectionData as any)?.status || 'gray')}`}>
              {getStatusIcon((sectionData as any)?.status || 'gray')} {(sectionData as any)?.status?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
        </div>

        {/* Section-specific content */}
        {selectedSection === 'agents' && (
          <div className="space-y-4">
            {dashboardData.agents.error ? (
              <div className="text-yellow-400">{dashboardData.agents.error}</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.agents.totalAgents || 13}</div>
                  <div className="text-gray-400 text-sm">Total Agents</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.agents.totalLaunches || 0}</div>
                  <div className="text-gray-400 text-sm">Total Launches</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.agents.totalCompletions || 0}</div>
                  <div className="text-gray-400 text-sm">Completions</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.agents.successRate?.toFixed(1) || 0}%</div>
                  <div className="text-gray-400 text-sm">Success Rate</div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedSection === 'analytics' && (
          <div className="space-y-4">
            {dashboardData.analytics.error ? (
              <div className="text-yellow-400">{dashboardData.analytics.error}</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.analytics.totalUsers || 0}</div>
                  <div className="text-gray-400 text-sm">Total Users</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.analytics.signupRate?.toFixed(1) || 0}%</div>
                  <div className="text-gray-400 text-sm">Signup Rate</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.analytics.conversionRate?.toFixed(1) || 0}%</div>
                  <div className="text-gray-400 text-sm">Conversion Rate</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.analytics.retentionRate?.toFixed(1) || 0}%</div>
                  <div className="text-gray-400 text-sm">Retention Rate</div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedSection === 'sales' && (
          <div className="space-y-4">
            {dashboardData.sales.error ? (
              <div className="text-yellow-400">{dashboardData.sales.error}</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">${dashboardData.sales.monthlyRevenue || 0}</div>
                  <div className="text-gray-400 text-sm">Monthly Revenue</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">${dashboardData.sales.totalRevenue || 0}</div>
                  <div className="text-gray-400 text-sm">Total Revenue</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.sales.activeSubscriptions || 0}</div>
                  <div className="text-gray-400 text-sm">Active Subscriptions</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">Coming Soon</div>
                  <div className="text-gray-400 text-sm">Churn Rate</div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedSection === 'userInfo' && (
          <div className="space-y-4">
            {dashboardData.userInfo.error ? (
              <div className="text-yellow-400">{dashboardData.userInfo.error}</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.userInfo.totalUsers || 0}</div>
                  <div className="text-gray-400 text-sm">Total Users</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.userInfo.newUsers30d || 0}</div>
                  <div className="text-gray-400 text-sm">New Users (30d)</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.userInfo.activeSessions24h || 0}</div>
                  <div className="text-gray-400 text-sm">Active Sessions (24h)</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">Coming Soon</div>
                  <div className="text-gray-400 text-sm">Engagement Score</div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedSection === 'health' && (
          <div className="space-y-4">
            {dashboardData.health.error ? (
              <div className="text-yellow-400">{dashboardData.health.error}</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.health.uptime || '99.9%'}</div>
                  <div className="text-gray-400 text-sm">Uptime</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.health.apiResponseTime || '245ms'}</div>
                  <div className="text-gray-400 text-sm">API Response Time</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.health.errorRate || '0.3%'}</div>
                  <div className="text-gray-400 text-sm">Error Rate</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.health.systemLoad || 'Normal'}</div>
                  <div className="text-gray-400 text-sm">System Load</div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedSection === 'errors' && (
          <div className="space-y-4">
            {dashboardData.errors.error ? (
              <div className="text-yellow-400">{dashboardData.errors.error}</div>
            ) : (
              <div>
                <div className="bg-white/5 rounded-lg p-4 mb-4">
                  <div className="text-2xl font-bold text-white">{dashboardData.errors.count || 0}</div>
                  <div className="text-gray-400 text-sm">Errors (24h)</div>
                </div>
                {dashboardData.errors.recentErrors && dashboardData.errors.recentErrors.length > 0 ? (
                  <div className="space-y-2">
                    {dashboardData.errors.recentErrors.map((error, index) => (
                      <div key={index} className="bg-red-900/20 border border-red-400/30 rounded-lg p-3">
                        <div className="text-red-400 font-mono text-sm">{error.message || 'Error details'}</div>
                        <div className="text-gray-400 text-xs mt-1">{error.timestamp || 'Recent'}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-green-400 text-center py-4">No recent errors - system healthy! 🎉</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 border border-teal-400/30 rounded-xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600/20 to-purple-600/20 border-b border-teal-400/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome, Master SKRBL</h1>
                <p className="text-teal-300">Founder Dashboard • Access Level: {dashboardData?.accessLevel || 'Founder'}</p>
                {dashboardData?.timestamp && (
                  <p className="text-gray-400 text-sm mt-1">
                    Last updated: {new Date(dashboardData.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex h-full">
            {/* Sidebar Menu */}
            <div className="w-80 bg-slate-800/50 border-r border-teal-400/20 p-4">
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const sectionData = dashboardData?.[item.id as keyof FounderDashboardData] as any;
                  const status = sectionData?.status || 'gray';
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedSection(item.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                        selectedSection === item.id
                          ? 'bg-teal-600/20 border border-teal-400/40 text-white'
                          : 'hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-gray-400">{item.description}</div>
                        </div>
                      </div>
                      <span className={`w-3 h-3 rounded-full ${
                        status === 'green' ? 'bg-green-400' :
                        status === 'yellow' ? 'bg-yellow-400' :
                        status === 'red' ? 'bg-red-400' : 'bg-gray-400'
                      }`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              {renderSectionContent()}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}