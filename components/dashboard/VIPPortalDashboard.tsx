'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Brain, Crown, TrendingUp, Target, Zap, Star, AlertTriangle, Sparkles } from 'lucide-react';
import { usePercyContext } from '../assistant/PercyProvider';

interface VIPUser {
  email: string;
  vip_level: string;
  vip_score: number;
  company_name: string;
  domain_reputation: any;
  recommended_squad: string;
  personalized_plan: string;
}

interface ProposalRequest {
  templateId?: string;
  customRequirements?: string;
  generatePDF: boolean;
  deliveryMethod: 'email' | 'download' | 'both';
}

interface GeneratedProposal {
  proposalId: string;
  templateUsed: string;
  vipLevel: string;
  pdfGenerated: boolean;
  pdfUrl?: string;
  estimatedValue: number;
  proposalContent?: any;
}

// Phase 6B: Enhanced VIP Intelligence
interface VIPIntelligenceInsight {
  id: string;
  type: 'market_prediction' | 'competitive_advantage' | 'revenue_optimization' | 'exclusive_opportunity';
  title: string;
  description: string;
  confidence: number;
  impact_score: number;
  time_sensitive: boolean;
  action_required: string;
  estimated_value: string;
}

export default function VIPPortalDashboard() {
  const [vipUser, setVipUser] = useState<VIPUser | null>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [proposalRequest, setProposalRequest] = useState<ProposalRequest>({
    generatePDF: true,
    deliveryMethod: 'both'
  });
  const [generatedProposal, setGeneratedProposal] = useState<GeneratedProposal | null>(null);
  
  // Phase 6B: Percy VIP Intelligence Integration
  const { 
    generateSmartResponse, 
    trackBehavior, 
    conversionScore, 
    conversationPhase 
  } = usePercyContext();
  
  const [vipInsights, setVipInsights] = useState<VIPIntelligenceInsight[]>([]);
  const [percyVIPState, setPercyVIPState] = useState<'analyzing' | 'predicting' | 'optimizing'>('analyzing');
  const [marketIntelligence, setMarketIntelligence] = useState<any[]>([]);
  const [exclusiveOpportunities, setExclusiveOpportunities] = useState<any[]>([]);

  // Mock user email for demo - in production this would come from auth
  const userEmail = 'ceo@microsoft.com';

  // Generate advanced VIP intelligence insights
  const generateVIPIntelligenceInsights = () => {
    const insights: VIPIntelligenceInsight[] = [
      {
        id: 'market_prediction_1',
        type: 'market_prediction',
        title: '🔮 Market Shift Prediction',
        description: 'AI forecasts 34% market expansion in your sector within 60 days. Strategic positioning recommended.',
        confidence: 94,
        impact_score: 9.2,
        time_sensitive: true,
        action_required: 'Review expansion strategy',
        estimated_value: '$2.4M opportunity'
      },
      {
        id: 'competitive_advantage_1',
        type: 'competitive_advantage',
        title: '⚡ Competitive Blind Spot Detected',
        description: 'Your top 3 competitors have ignored automation in customer retention. 72-hour advantage window.',
        confidence: 91,
        impact_score: 8.7,
        time_sensitive: true,
        action_required: 'Deploy retention automation',
        estimated_value: '47% retention boost'
      },
      {
        id: 'revenue_optimization_1',
        type: 'revenue_optimization',
        title: '💰 Revenue Stream Optimization',
        description: 'Untapped revenue channel identified through AI analysis. Implementation could yield immediate returns.',
        confidence: 89,
        impact_score: 9.5,
        time_sensitive: false,
        action_required: 'Schedule strategic review',
        estimated_value: '$850K annual potential'
      },
      {
        id: 'exclusive_opportunity_1',
        type: 'exclusive_opportunity',
        title: '🚀 VIP-Only Market Intel',
        description: 'Exclusive partnership opportunity detected. Only available to enterprise VIP members.',
        confidence: 96,
        impact_score: 9.8,
        time_sensitive: true,
        action_required: 'Access exclusive briefing',
        estimated_value: 'Industry leadership position'
      }
    ];
    
    setVipInsights(insights);
  };

  // Generate real-time market intelligence
  const generateMarketIntelligence = () => {
    const intelligence = [
      {
        id: 'market_1',
        title: 'Industry Disruption Alert',
        description: 'AI automation adoption accelerated 23% this quarter in your industry',
        urgency: 'high',
        recommendation: 'Accelerate digital transformation initiatives'
      },
      {
        id: 'market_2', 
        title: 'Competitive Movement Detected',
        description: '2 major competitors launched AI initiatives in the past 7 days',
        urgency: 'critical',
        recommendation: 'Review competitive positioning strategy'
      },
      {
        id: 'market_3',
        title: 'Opportunity Window Opening',
        description: 'Market gap identified with 14-day advantage window',
        urgency: 'medium',
        recommendation: 'Prepare rapid deployment strategy'
      }
    ];
    
    setMarketIntelligence(intelligence);
  };

  // Generate VIP-exclusive opportunities
  const generateExclusiveOpportunities = () => {
    const opportunities = [
      {
        id: 'opp_1',
        title: 'Enterprise Partnership Portal',
        description: 'Access to Fortune 500 partnership network',
        status: 'available',
        estimated_value: '$5M+ partnership potential'
      },
      {
        id: 'opp_2',
        title: 'AI Advisory Council Invitation',
        description: 'Exclusive invite to shape next-gen AI automation standards',
        status: 'pending_approval',
        estimated_value: 'Industry influence & recognition'
      },
      {
        id: 'opp_3',
        title: 'Beta Technology Preview',
        description: 'Early access to revolutionary automation technology',
        status: 'available',
        estimated_value: '6-month competitive advantage'
      }
    ];
    
    setExclusiveOpportunities(opportunities);
  };

  const fetchVIPStatus = async () => {
    try {
      const response = await fetch(`/api/vip/recognition?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      if (data.success && data.vipStatus.isVIP) {
        setVipUser({
          email: userEmail,
          vip_level: data.vipStatus.vipLevel,
          vip_score: data.vipStatus.vipScore,
          company_name: 'Microsoft Corporation',
          domain_reputation: data.vipStatus.domainReputation,
          recommended_squad: JSON.stringify(data.vipStatus.recommendedSquad),
          personalized_plan: JSON.stringify(data.vipStatus.personalizedPlan)
        });
      }
    } catch (error) {
      console.error('Error fetching VIP status:', error);
    }
  };

  const fetchProposals = async () => {
    try {
      const response = await fetch(`/api/vip/proposal-automation?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      if (data.success) {
        setProposals(data.proposals);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };
  
  // Phase 6B: Initialize VIP Intelligence System
  const initializeVIPIntelligence = useCallback(() => {
    // Track VIP portal entry
    trackBehavior?.('vip_portal_entry', { timestamp: Date.now(), vip_level: vipUser?.vip_level });
    
    // Generate VIP-exclusive insights
    generateVIPIntelligenceInsights();
    
    // Set up real-time market monitoring
    generateMarketIntelligence();
    
    // Generate exclusive opportunities
    generateExclusiveOpportunities();
  }, [trackBehavior, vipUser]);

  useEffect(() => {
    fetchVIPStatus();
    fetchProposals();
    
    // Phase 6B: Initialize VIP Intelligence
    initializeVIPIntelligence();
  }, [initializeVIPIntelligence]);

  const generateProposal = async () => {
    if (!vipUser) {
      toast.error('VIP recognition required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vip/proposal-automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: vipUser.email,
          companyName: vipUser.company_name,
          ...proposalRequest
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedProposal(data.proposalGeneration);
        toast.success('Proposal generated successfully!');
        fetchProposals(); // Refresh proposals list
      } else {
        throw new Error(data.error || 'Failed to generate proposal');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getVIPBadgeColor = (level: string) => {
    const colors = {
      enterprise: 'from-purple-500 to-purple-700',
      platinum: 'from-gray-400 to-gray-600',
      gold: 'from-yellow-400 to-yellow-600',
      silver: 'from-gray-300 to-gray-500',
      standard: 'from-blue-400 to-blue-600'
    };
    return colors[level as keyof typeof colors] || colors.standard;
  };

  const availableTemplates = [
    { id: 'enterprise-tech', name: 'Enterprise Technology Transformation', industry: 'Technology' },
    { id: 'consulting-firm', name: 'Professional Services AI Enhancement', industry: 'Consulting' },
    { id: 'high-growth-startup', name: 'Startup Growth Acceleration', industry: 'Startup' }
  ];

  if (!vipUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 text-center"
      >
        <div className="bg-deep-navy/60 rounded-2xl p-8 border border-electric-blue/20">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-electric-blue mb-4">VIP Recognition Required</h2>
          <p className="text-soft-gray mb-6">
            This portal is exclusively for recognized VIP clients. Complete VIP recognition to access automated proposal generation and advanced AI intelligence.
          </p>
          <button className="btn-primary" onClick={fetchVIPStatus}>
            Check VIP Status
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Enhanced VIP Status Header with Percy Intelligence */}
      <div className="bg-gradient-to-r from-deep-navy/80 to-deep-navy/60 rounded-2xl p-6 border border-electric-blue/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getVIPBadgeColor(vipUser.vip_level)}`}>
                {vipUser.vip_level.toUpperCase()} VIP
              </span>
              <span className="text-soft-gray">Score: {vipUser.vip_score}/100</span>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                percyVIPState === 'analyzing' ? 'bg-purple-500/20 text-purple-400' :
                percyVIPState === 'predicting' ? 'bg-blue-500/20 text-blue-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                🧠 Percy VIP: {percyVIPState}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">{vipUser.company_name}</h1>
            <p className="text-soft-gray">{vipUser.email}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl mb-2">👑</div>
            <p className="text-sm text-electric-blue font-semibold">VIP Intelligence Portal</p>
            <p className="text-xs text-purple-300">Advanced AI Monitoring Active</p>
          </div>
        </div>
      </div>

      {/* VIP Intelligence Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-purple-500/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            VIP Intelligence Command Center
          </h2>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-300">Real-time AI Analysis</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* High Priority Insights */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-red-400" />
              Priority Intelligence
            </h3>
            {vipInsights.filter(insight => insight.time_sensitive).map((insight) => (
              <motion.div
                key={insight.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  insight.type === 'exclusive_opportunity' ? 'bg-gold-500/10 border-gold-500/30 hover:bg-gold-500/20' :
                  insight.impact_score > 9 ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' :
                  'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white text-sm">{insight.title}</h4>
                  <div className="flex items-center gap-2">
                    {insight.time_sensitive && (
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    )}
                    <span className="text-xs text-gray-400">{insight.confidence}%</span>
                  </div>
                </div>
                <p className="text-gray-300 text-xs mb-3">{insight.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-green-400 text-xs font-semibold">
                    {insight.estimated_value}
                  </span>
                  <button className="px-3 py-1 bg-white/10 text-white text-xs rounded-lg hover:bg-white/20 transition-all">
                    {insight.action_required}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Market Intelligence Feed */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Market Intelligence
            </h3>
            {marketIntelligence.map((intel) => (
              <div key={intel.id} className={`p-4 rounded-xl border ${
                intel.urgency === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                intel.urgency === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                'bg-blue-500/10 border-blue-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`w-4 h-4 ${
                    intel.urgency === 'critical' ? 'text-red-400' :
                    intel.urgency === 'high' ? 'text-orange-400' :
                    'text-blue-400'
                  }`} />
                  <h4 className="font-semibold text-white text-sm">{intel.title}</h4>
                </div>
                <p className="text-gray-300 text-xs mb-2">{intel.description}</p>
                <p className="text-blue-300 text-xs font-medium">{intel.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Exclusive VIP Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-gold-500/10 to-yellow-500/10 rounded-2xl p-6 border border-gold-500/20"
      >
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
          <Crown className="w-6 h-6 text-gold-400" />
          VIP Exclusive Opportunities
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exclusiveOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="bg-black/20 rounded-xl p-4 border border-gold-500/20">
              <div className="flex items-center justify-between mb-3">
                <Star className="w-5 h-5 text-gold-400" />
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  opportunity.status === 'available' ? 'bg-green-500/20 text-green-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {opportunity.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-semibold text-white mb-2">{opportunity.title}</h3>
              <p className="text-gray-300 text-sm mb-3">{opportunity.description}</p>
              <div className="text-gold-400 text-xs font-semibold mb-3">
                {opportunity.estimated_value}
              </div>
              <button className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                opportunity.status === 'available' 
                  ? 'bg-gold-500/20 text-gold-300 hover:bg-gold-500/30' 
                  : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
              }`}>
                {opportunity.status === 'available' ? 'Access Now' : 'Pending'}
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Proposal Generation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-deep-navy/60 rounded-2xl p-6 border border-electric-blue/20"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📄</span> Generate Proposal
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-soft-gray mb-2">
                Proposal Template
              </label>
              <select
                value={proposalRequest.templateId || ''}
                onChange={(e) => setProposalRequest(prev => ({ ...prev, templateId: e.target.value || undefined }))}
                className="w-full p-3 rounded-lg bg-deep-navy/80 border border-electric-blue/30 text-white focus:border-electric-blue focus:outline-none"
              >
                <option value="">Auto-select based on your profile</option>
                {availableTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.industry})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-soft-gray mb-2">
                Custom Requirements (Optional)
              </label>
              <textarea
                value={proposalRequest.customRequirements || ''}
                onChange={(e) => setProposalRequest(prev => ({ ...prev, customRequirements: e.target.value }))}
                placeholder="Any specific requirements or focus areas..."
                className="w-full p-3 rounded-lg bg-deep-navy/80 border border-electric-blue/30 text-white focus:border-electric-blue focus:outline-none resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-soft-gray">
                  <input
                    type="checkbox"
                    checked={proposalRequest.generatePDF}
                    onChange={(e) => setProposalRequest(prev => ({ ...prev, generatePDF: e.target.checked }))}
                    className="rounded border-electric-blue/30 text-electric-blue focus:ring-electric-blue"
                  />
                  Generate PDF
                </label>
              </div>
              <div>
                <select
                  value={proposalRequest.deliveryMethod}
                  onChange={(e) => setProposalRequest(prev => ({ ...prev, deliveryMethod: e.target.value as any }))}
                  className="w-full p-2 rounded bg-deep-navy/80 border border-electric-blue/30 text-white text-sm"
                >
                  <option value="email">Email Only</option>
                  <option value="download">Download Only</option>
                  <option value="both">Email + Download</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateProposal}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate AI Proposal
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Generated Proposal Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-deep-navy/60 rounded-2xl p-6 border border-electric-blue/20"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🎯</span> Latest Generation
          </h2>

          {generatedProposal ? (
            <div className="space-y-4">
              <div className="bg-electric-blue/10 rounded-lg p-4 border border-electric-blue/20">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-white">Proposal #{generatedProposal.proposalId.slice(-6)}</h3>
                    <p className="text-sm text-soft-gray">{generatedProposal.templateUsed}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getVIPBadgeColor(generatedProposal.vipLevel)}`}>
                    {generatedProposal.vipLevel.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-soft-gray">Estimated Value:</span>
                    <p className="text-electric-blue font-bold">${generatedProposal.estimatedValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-soft-gray">PDF Generated:</span>
                    <p className="text-white">{generatedProposal.pdfGenerated ? '✅ Yes' : '❌ No'}</p>
                  </div>
                </div>

                {generatedProposal.pdfUrl && (
                  <a
                    href={generatedProposal.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-electric-blue hover:text-teal-400 transition-colors"
                  >
                    <span>📥</span> Download PDF
                  </a>
                )}
              </div>

              {generatedProposal.proposalContent && (
                <div className="bg-teal-500/10 rounded-lg p-4 border border-teal-500/20">
                  <h4 className="text-white font-semibold mb-2">Executive Summary</h4>
                  <p className="text-sm text-soft-gray leading-relaxed">
                    {generatedProposal.proposalContent.sections?.executiveSummary?.substring(0, 200)}...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-soft-gray py-8">
              <div className="text-4xl mb-4">📋</div>
              <p>No proposals generated yet</p>
              <p className="text-sm">Generate your first AI-powered proposal!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Proposals History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-deep-navy/60 rounded-2xl p-6 border border-electric-blue/20"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>📈</span> Proposal History
        </h2>

        {proposals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposals.map((proposal, index) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-electric-blue/5 rounded-lg p-4 border border-electric-blue/10 hover:border-electric-blue/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-white">#{proposal.id.slice(-6)}</h3>
                  <span className="text-xs text-soft-gray">
                    {new Date(proposal.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-soft-gray mb-2">{proposal.template_id}</p>
                <div className="flex justify-between items-center">
                  <span className="text-electric-blue font-bold">
                    ${proposal.total_value?.toLocaleString() || '0'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    proposal.status === 'generated' ? 'bg-green-500/20 text-green-400' :
                    proposal.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {proposal.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-soft-gray py-8">
            <div className="text-4xl mb-4">📊</div>
            <p>No proposal history yet</p>
            <p className="text-sm">Generate proposals to see them here!</p>
          </div>
        )}
      </motion.div>

      {/* VIP Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-electric-blue/10 to-teal-500/10 rounded-2xl p-6 border border-electric-blue/20"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>👑</span> Your VIP Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <div>
              <p className="text-white font-semibold">Instant Proposals</p>
              <p className="text-sm text-soft-gray">AI-generated in seconds</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <p className="text-white font-semibold">Professional PDFs</p>
              <p className="text-sm text-soft-gray">High-quality exports</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-white font-semibold">Personalized Content</p>
              <p className="text-sm text-soft-gray">Tailored to your profile</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 