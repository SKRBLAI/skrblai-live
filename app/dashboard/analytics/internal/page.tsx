'use client';

import React, { useState, useEffect } from 'react';
import { FEATURE_FLAGS } from '@/lib/config/featureFlags';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Brain, 
  Users, 
  Zap, 
  Target, 
  TrendingUp, 
  Eye,
  MousePointer,
  ShoppingCart,
  Mail,
  Activity,
  DollarSign
} from 'lucide-react';

interface AnalyticsData {
  events: any[];
  metrics: {
    totalEvents: number;
    uniqueUsers: number;
    eventTypes: Record<string, number>;
    topSources: Record<string, number>;
    conversionRate: number;
  };
}

interface QuickWinsFunnel {
  assigned: number;
  used: number;
  conversionRate: number;
}

interface PopupMetrics {
  percy_opened: number;
  percy_engaged: number;
  skillsmith_opened: number;
  skillsmith_engaged: number;
  exit_intent_opened: number;
  leads_captured: number;
}

interface AddOnMetrics {
  business_addons: Record<string, number>;
  sports_addons: Record<string, number>;
  total_revenue: number;
  promo_usage: number;
}

interface ArrData {
  ok: boolean;
  sportsARR?: number;
  businessARR?: number;
  totalARR?: number;
  counts?: {
    sportsSubs: number;
    businessSubs: number;
    unknownSubs: number;
  };
  reason?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Check if ARR dashboard feature is enabled
const ARR_DASH_ENABLED = FEATURE_FLAGS.ENABLE_ARR_DASH;

export default function InternalAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [quickWinsFunnel, setQuickWinsFunnel] = useState<QuickWinsFunnel | null>(null);
  const [popupMetrics, setPopupMetrics] = useState<PopupMetrics | null>(null);
  const [addOnMetrics, setAddOnMetrics] = useState<AddOnMetrics | null>(null);
  const [arrData, setArrData] = useState<ArrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load general analytics
      const analyticsResponse = await fetch(`/api/analytics/dashboard?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalyticsData(analyticsData);
      }

      // Load Quick Wins funnel data
      const quickWinsResponse = await fetch(`/api/analytics/quick-wins?range=${timeRange}`);
      if (quickWinsResponse.ok) {
        const quickWinsData = await quickWinsResponse.json();
        setQuickWinsFunnel(quickWinsData);
      }

      // Load popup metrics
      const popupResponse = await fetch(`/api/analytics/popups?range=${timeRange}`);
      if (popupResponse.ok) {
        const popupData = await popupResponse.json();
        setPopupMetrics(popupData);
      }

      // Load add-on metrics
      const addOnResponse = await fetch(`/api/analytics/addons?range=${timeRange}`);
      if (addOnResponse.ok) {
        const addOnData = await addOnResponse.json();
        setAddOnMetrics(addOnData);
      }

      // Load ARR data (flag-gated)
      if (ARR_DASH_ENABLED) {
        const arrResponse = await fetch('/api/analytics/arr');
        if (arrResponse.ok) {
          const arrData = await arrResponse.json();
          setArrData(arrData);
        }
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Analytics Error</h1>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={loadAnalyticsData}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const eventTypesData = analyticsData?.metrics.eventTypes ? 
    Object.entries(analyticsData.metrics.eventTypes).map(([name, value]) => ({
      name: name.replace(/\./g, ' ').replace(/_/g, ' ').toUpperCase(),
      value
    })) : [];

  const sourcesData = analyticsData?.metrics.topSources ?
    Object.entries(analyticsData.metrics.topSources).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').toUpperCase(),
      value
    })) : [];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Internal Analytics Dashboard</h1>
            <p className="text-gray-400">Real-time insights into user behavior and conversions</p>
          </div>
          
          <div className="flex gap-2">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-blue-400" />
              <span className="text-gray-300 font-medium">Total Events</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {analyticsData?.metrics.totalEvents?.toLocaleString() || '0'}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-green-400" />
              <span className="text-gray-300 font-medium">Unique Users</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {analyticsData?.metrics.uniqueUsers?.toLocaleString() || '0'}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-6 h-6 text-purple-400" />
              <span className="text-gray-300 font-medium">Leads Captured</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {popupMetrics?.leads_captured || '0'}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-orange-400" />
              <span className="text-gray-300 font-medium">Conversion Rate</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {analyticsData?.metrics.conversionRate?.toFixed(1) || '0'}%
            </div>
          </div>
        </div>

        {/* ARR Cards (flag-gated) */}
        {ARR_DASH_ENABLED && arrData && (
          <div className="mb-8">
            {arrData.ok ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-6 h-6 text-blue-400" />
                    <span className="text-gray-300 font-medium">Sports ARR</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    ${arrData.sportsARR?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {arrData.counts?.sportsSubs || 0} active subscriptions
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-6 h-6 text-green-400" />
                    <span className="text-gray-300 font-medium">Business ARR</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    ${arrData.businessARR?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {arrData.counts?.businessSubs || 0} active subscriptions
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-6 h-6 text-purple-400" />
                    <span className="text-gray-300 font-medium">Total ARR</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    ${arrData.totalARR?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {(arrData.counts?.sportsSubs || 0) + (arrData.counts?.businessSubs || 0)} total active
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm text-center">
                  ARR unavailable ({arrData.reason || 'configure Stripe'})
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Wins Funnel */}
        {quickWinsFunnel && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Quick Wins Funnel
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  {quickWinsFunnel.assigned.toLocaleString()}
                </div>
                <div className="text-gray-300">Quick Wins Assigned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {quickWinsFunnel.used.toLocaleString()}
                </div>
                <div className="text-gray-300">Quick Wins Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {quickWinsFunnel.conversionRate.toFixed(1)}%
                </div>
                <div className="text-gray-300">Usage Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Popup Performance */}
        {popupMetrics && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-cyan-400" />
              Popup Performance
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-cyan-400 mb-1">
                  {popupMetrics.percy_opened}
                </div>
                <div className="text-sm text-gray-300">Percy Opened</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-cyan-300 mb-1">
                  {popupMetrics.percy_engaged}
                </div>
                <div className="text-sm text-gray-300">Percy Engaged</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-400 mb-1">
                  {popupMetrics.skillsmith_opened}
                </div>
                <div className="text-sm text-gray-300">SkillSmith Opened</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-300 mb-1">
                  {popupMetrics.skillsmith_engaged}
                </div>
                <div className="text-sm text-gray-300">SkillSmith Engaged</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400 mb-1">
                  {popupMetrics.exit_intent_opened}
                </div>
                <div className="text-sm text-gray-300">Exit Intent</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400 mb-1">
                  {popupMetrics.leads_captured}
                </div>
                <div className="text-sm text-gray-300">Leads Captured</div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Event Types Chart */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Event Types
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventTypesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic Sources */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Traffic Sources
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourcesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourcesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Add-on Performance */}
        {addOnMetrics && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-400" />
              Add-on Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  ${addOnMetrics.total_revenue?.toLocaleString() || '0'}
                </div>
                <div className="text-gray-300">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  {Object.values(addOnMetrics.business_addons || {}).reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-gray-300">Business Add-ons</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-2">
                  {Object.values(addOnMetrics.sports_addons || {}).reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-gray-300">Sports Add-ons</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          Last updated: {new Date().toLocaleString()} • 
          Data refreshes automatically every 5 minutes
        </div>
      </div>
    </div>
  );
}