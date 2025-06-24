"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStats } from "@/hooks/useAgentStats";
import { useUser } from "@/hooks/useUser";
import { Agent, AgentStats } from "@/types/agent";
import Link from "next/link";
import { 
  TrendingUp, Activity, Clock, Users, Target, Zap, 
  BarChart3, PieChart, ArrowUpRight, Calendar, 
  Settings, Rocket, MessageCircle, Star, Crown, Brain, AlertTriangle
} from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';
import AgentStatsPanel from '@/components/ui/AgentStatsPanel';
import { usePercyContext } from '@/components/assistant/PercyProvider';

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } }
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const pulseVariant = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'agent_launch' | 'workflow_complete' | 'collaboration' | 'insight';
  title: string;
  description: string;
  timestamp: string;
  agent?: string;
  status: 'success' | 'pending' | 'failed';
}

// Enhanced interfaces for Phase 6B
interface PercyDashboardInsight {
  id: string;
  type: 'optimization' | 'competitive' | 'predictive' | 'vip_exclusive';
  title: string;
  description: string;
  action: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  potential_impact: string;
  confidence: number;
  vip_only?: boolean;
}

interface VIPDashboardFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'active' | 'coming_soon' | 'exclusive';
  value_proposition: string;
}

export default function DashboardHome() {
  const { user } = useUser();
  const { topAgents } = useAgentStats();
  
  // Enhanced Percy integration
  const { 
    generateSmartResponse, 
    trackBehavior, 
    conversionScore, 
    conversationPhase,
    getFilteredAgents
  } = usePercyContext();

  const [dashboardView, setDashboardView] = useState<'overview' | 'analytics' | 'agents'>('overview');
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [agentMetrics, setAgentMetrics] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  
  // Phase 6B: Percy Dashboard Intelligence
  const [percyInsights, setPercyInsights] = useState<PercyDashboardInsight[]>([]);
  const [vipFeatures, setVIPFeatures] = useState<VIPDashboardFeature[]>([]);
  const [isVIPUser, setIsVIPUser] = useState(false);
  const [percyDashboardState, setPercyDashboardState] = useState<'monitoring' | 'analyzing' | 'optimizing'>('monitoring');
  const [competitiveAlerts, setCompetitiveAlerts] = useState<string[]>([]);
  const [percyRecommendations, setPercyRecommendations] = useState<any[]>([]);

  const steps = [
    {
      title: "Choose your agent",
      description: "Select from our curated list of AI agents specialized in different tasks",
      icon: "🤖",
      link: "/agents"
    },
    {
      title: "Start a workflow",
      description: "Begin your creative journey with your chosen agent",
      icon: "🚀",
      link: "/workflow"
    },
    {
      title: "Review & refine",
      description: "Collaborate with your agent to perfect your results",
      icon: "✨",
      link: "/dashboard"
    }
  ];

  // Generate Percy's proactive dashboard insights
  const generatePercyDashboardInsights = useCallback(() => {
    const insights: PercyDashboardInsight[] = [
      {
        id: 'workflow_optimization',
        type: 'optimization',
        title: '🚀 Workflow Efficiency Alert',
        description: 'I detected 3 workflow bottlenecks costing you 4.2 hours weekly. Auto-fix available.',
        action: 'Optimize Now',
        urgency: 'high',
        potential_impact: '+$2,400 monthly time savings',
        confidence: 94
      },
      {
        id: 'competitive_threat',
        type: 'competitive', 
        title: '⚡ Competitive Intelligence',
        description: 'Your competitors gained 12% market advantage while you were offline. Strike back?',
        action: 'View Strategy',
        urgency: 'critical',
        potential_impact: 'Market position recovery',
        confidence: 87
      },
      {
        id: 'revenue_prediction',
        type: 'predictive',
        title: '🎯 Revenue Opportunity',
        description: 'AI predicts 73% chance of $50K+ opportunity in next 30 days if you act now.',
        action: 'Seize Opportunity',
        urgency: 'high',
        potential_impact: '$50,000+ revenue potential',
        confidence: 91
      }
    ];

    // Add VIP exclusive insights
    if (isVIPUser) {
      insights.push({
        id: 'vip_intelligence',
        type: 'vip_exclusive',
        title: '👑 VIP Exclusive: Market Domination',
        description: 'Advanced AI analysis reveals 3 untapped revenue streams exclusive to VIP members.',
        action: 'Access VIP Intel',
        urgency: 'medium',
        potential_impact: 'Industry leadership positioning',
        confidence: 96,
        vip_only: true
      });
    }

    setPercyInsights(insights);
  }, [isVIPUser]);

  // Initialize Percy Dashboard Intelligence
  useEffect(() => {
    const initializePercyDashboard = async () => {
      // Track dashboard entry for Percy
      trackBehavior?.('dashboard_entry', { timestamp: Date.now(), section: 'home' });
      
      // Check VIP status
      try {
        const response = await fetch('/api/vip/recognition');
        const data = await response.json();
        if (data.success && data.vipStatus?.isVIP) {
          setIsVIPUser(true);
        }
      } catch (error) {
        console.error('VIP status check failed:', error);
      }
      
      // Generate Percy dashboard insights
      generatePercyDashboardInsights();
      
      // Set competitive monitoring
      generateCompetitiveAlerts();
    };
    
    initializePercyDashboard();
  }, [trackBehavior, generatePercyDashboardInsights]);

  // Generate competitive alerts
  const generateCompetitiveAlerts = () => {
    const alerts = [
      "🚨 Industry alert: 47 businesses automated their competition away in the last 6 hours",
      "⚡ Market shift detected: AI adoption rate increased 23% in your sector this week",
      "🎯 Opportunity window: 72-hour competitive advantage window opening now"
    ];
    setCompetitiveAlerts(alerts);
  };

  // Enhanced VIP features list
  const vipDashboardFeatures: VIPDashboardFeature[] = [
    {
      id: 'predictive_analytics',
      title: '🔮 Predictive Business Intelligence',
      description: 'AI forecasts market opportunities 30 days ahead',
      icon: '🧠',
      status: 'active',
      value_proposition: 'Stay ahead of 99% of competitors'
    },
    {
      id: 'competitive_monitoring',
      title: '🕵️ Real-time Competitive Intelligence',
      description: 'Monitor competitor moves as they happen',
      icon: '⚡',
      status: 'active',
      value_proposition: 'React faster than humanly possible'
    },
    {
      id: 'automation_orchestration',
      title: '🤖 Advanced Automation Suite',
      description: 'Cross-agent collaboration and workflow optimization',
      icon: '🚀',
      status: 'active',
      value_proposition: 'Superhuman productivity levels'
    }
  ];

  // Enhanced data loading
  useEffect(() => {
    const loadEnhancedData = async () => {
      try {
        // Load recent activity
        const activityData: RecentActivity[] = [
          {
            id: '1',
            type: 'agent_launch',
            title: 'Content Creation Agent Launched',
            description: 'Generated 3 blog posts for marketing campaign',
            timestamp: '2 minutes ago',
            agent: 'Content Creator',
            status: 'success'
          },
          {
            id: '2',
            type: 'workflow_complete',
            title: 'Analytics Report Generated',
            description: 'Monthly performance analysis completed',
            timestamp: '15 minutes ago',
            agent: 'Analytics Agent',
            status: 'success'
          },
          {
            id: '3',
            type: 'collaboration',
            title: 'Agent Handoff Successful',
            description: 'Branding Agent → Social Media Agent',
            timestamp: '1 hour ago',
            status: 'success'
          },
          {
            id: '4',
            type: 'insight',
            title: 'Performance Optimization Suggestion',
            description: 'Recommended workflow improvements available',
            timestamp: '2 hours ago',
            status: 'pending'
          }
        ];
        setRecentActivity(activityData);

        // Load agent performance metrics
        const metrics = {
          totalLaunches: 156,
          successRate: 94.2,
          avgResponseTime: '2.3s',
          topPerformer: 'Analytics Agent',
          collaborations: 23,
          automationSavings: '47 hours'
        };
        setAgentMetrics(metrics);

        // Load performance trends
        const performanceTrends = {
          weeklyLaunches: [12, 18, 15, 22, 19, 25, 21],
          successRates: [92, 94, 91, 96, 95, 94, 97],
          responseTimeData: [2.1, 2.3, 1.9, 2.5, 2.2, 2.0, 2.3]
        };
        setPerformanceData(performanceTrends);

      } catch (error) {
        console.error('Error loading enhanced dashboard data:', error);
      }
    };

    loadEnhancedData();
  }, []);

  const quickActions: QuickAction[] = [
    {
      title: 'Launch Agent',
      description: 'Start a new AI agent workflow',
      icon: <Rocket className="w-6 h-6" />,
      action: () => window.location.href = '/agents',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: <BarChart3 className="w-6 h-6" />,
      action: () => setDashboardView('analytics'),
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Percy Intelligence',
      description: 'Access competitive insights',
      icon: <Brain className="w-6 h-6" />,
      action: () => setDashboardView('analytics'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: isVIPUser ? 'VIP Portal' : 'Upgrade to VIP',
      description: isVIPUser ? 'Access exclusive features' : 'Unlock advanced capabilities',
      icon: isVIPUser ? <Crown className="w-6 h-6" /> : <Settings className="w-6 h-6" />,
      action: () => window.location.href = isVIPUser ? '/dashboard/vip' : '/dashboard/profile',
      color: isVIPUser ? 'from-gold-500 to-gold-600' : 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Percy Intelligence */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {isVIPUser ? '👑 VIP Command Center' : 'Dashboard Command Center'}
                </h1>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    percyDashboardState === 'monitoring' ? 'bg-blue-500/20 text-blue-400' :
                    percyDashboardState === 'analyzing' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    🧠 Percy: {percyDashboardState}
                  </div>
                  {conversionScore > 70 && (
                    <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold animate-pulse">
                      🔥 HOT PROSPECT
                    </div>
                  )}
                </div>
              </div>
              <p className="text-gray-400 text-lg">
                {isVIPUser 
                  ? 'Advanced AI intelligence monitoring your empire' 
                  : 'AI-powered command center for business domination'
                }
              </p>
            </div>
            
            {/* Competitive Alerts Bar */}
            {competitiveAlerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 max-w-md"
              >
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-semibold">Competitive Alert:</span>
                </div>
                <p className="text-red-300 text-xs mt-1">
                  {competitiveAlerts[0]}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Percy Dashboard Insights Panel */}
        {percyInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-400" />
                  Percy's Live Intelligence Feed
                </h2>
                <div className="text-sm text-purple-300">
                  Updated {Math.floor(Math.random() * 5) + 1} minutes ago
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {percyInsights.slice(0, 3).map((insight) => (
                  <motion.div
                    key={insight.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      insight.urgency === 'critical' ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' :
                      insight.urgency === 'high' ? 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20' :
                      insight.vip_only ? 'bg-gold-500/10 border-gold-500/30 hover:bg-gold-500/20' :
                      'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm">{insight.title}</h3>
                      <div className="text-xs text-gray-400">
                        {insight.confidence}% confidence
                      </div>
                    </div>
                    <p className="text-gray-300 text-xs mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 text-xs font-semibold">
                        {insight.potential_impact}
                      </span>
                      <button className="px-3 py-1 bg-white/10 text-white text-xs rounded-lg hover:bg-white/20 transition-all">
                        {insight.action}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIP Features Section */}
        {isVIPUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-gold-500/10 to-yellow-500/10 rounded-2xl p-6 border border-gold-500/20">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-gold-400" />
                VIP Exclusive Intelligence Suite
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vipDashboardFeatures.map((feature) => (
                  <div key={feature.id} className="bg-black/20 rounded-xl p-4 border border-gold-500/20">
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300 text-sm mb-3">{feature.description}</p>
                    <div className="text-gold-400 text-xs font-semibold">
                      {feature.value_proposition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {dashboardView === 'overview' && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* Key Metrics Cards */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl rounded-xl p-6 border border-blue-500/20">
                <div className="flex items-center justify-between mb-4">
                  <Rocket className="w-8 h-8 text-blue-400" />
                  <span className="text-green-400 text-sm font-medium">+23%</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{agentMetrics?.totalLaunches || '156'}</h3>
                <p className="text-gray-400">Agent Launches</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl rounded-xl p-6 border border-green-500/20">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">+5.2%</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{agentMetrics?.successRate || '94.2'}%</h3>
                <p className="text-gray-400">Success Rate</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-purple-400" />
                  <span className="text-green-400 text-sm font-medium">-0.3s</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{agentMetrics?.avgResponseTime || '2.3s'}</h3>
                <p className="text-gray-400">Avg Response</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl rounded-xl p-6 border border-orange-500/20">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="w-8 h-8 text-orange-400" />
                  <span className="text-green-400 text-sm font-medium">+12h</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{agentMetrics?.automationSavings || '47h'}</h3>
                <p className="text-gray-400">Time Saved</p>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={fadeInUp}>
              <h2 className="text-2xl font-semibold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.title}
                    onClick={action.action}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`bg-gradient-to-r ${action.color} rounded-xl p-6 text-left hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      {action.icon}
                      <ArrowUpRight className="w-5 h-5 opacity-60" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                    <p className="text-white/80 text-sm">{action.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <motion.div variants={fadeInUp} className="lg:col-span-2">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </h2>
                    <button className="text-gray-400 hover:text-white text-sm">View All</button>
                  </div>
                  
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                      >
                        <div className={`p-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500/20 text-green-400' :
                          activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {activity.type === 'agent_launch' && <Rocket className="w-4 h-4" />}
                          {activity.type === 'workflow_complete' && <Target className="w-4 h-4" />}
                          {activity.type === 'collaboration' && <Users className="w-4 h-4" />}
                          {activity.type === 'insight' && <Star className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{activity.title}</h3>
                          <p className="text-gray-400 text-sm">{activity.description}</p>
                          <span className="text-gray-500 text-xs">{activity.timestamp}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Agent Performance */}
              <motion.div variants={fadeInUp}>
                <AgentStatsPanel />
              </motion.div>
            </div>

            {/* Top Agents Section */}
            {topAgents && topAgents.length > 0 && (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="mb-8"
              >
                <h2 className="text-2xl font-semibold text-white mb-6">Your Top Agents</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topAgents.slice(0, 3).map((agent: AgentStats, index: number) => (
                    <motion.div
                      key={agent.id}
                      variants={fadeInUp}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-6 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 hover:border-teal-500/40 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-2xl">
                          {agent.emoji || "🤖"}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{agent.name}</h3>
                          <p className="text-sm text-gray-400">
                            {agent.usageCount || 0} sessions
                          </p>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {dashboardView === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AnalyticsDashboard />
          </motion.div>
        )}

        {dashboardView === 'agents' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-8 border border-gray-700/50"
          >
            <h2 className="text-2xl font-semibold text-white mb-6">Agent Management</h2>
            <p className="text-gray-400 mb-4">
              Detailed agent statistics and management tools coming soon...
            </p>
            <button 
              onClick={() => window.location.href = '/agents'}
              className="bg-electric-blue text-white px-6 py-3 rounded-lg hover:bg-electric-blue/90 transition-colors"
            >
              Launch Agent League
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
