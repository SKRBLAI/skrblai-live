'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

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

export default function VIPPortalDashboard() {
  const [vipUser, setVipUser] = useState<VIPUser | null>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [proposalRequest, setProposalRequest] = useState<ProposalRequest>({
    generatePDF: true,
    deliveryMethod: 'both'
  });
  const [generatedProposal, setGeneratedProposal] = useState<GeneratedProposal | null>(null);

  // Mock user email for demo - in production this would come from auth
  const userEmail = 'ceo@microsoft.com';

  useEffect(() => {
    fetchVIPStatus();
    fetchProposals();
  }, []);

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
          <h2 className="text-2xl font-bold text-electric-blue mb-4">VIP Recognition Required</h2>
          <p className="text-soft-gray mb-6">
            This portal is exclusively for recognized VIP clients. Complete VIP recognition to access automated proposal generation.
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
      {/* VIP Status Header */}
      <div className="bg-gradient-to-r from-deep-navy/80 to-deep-navy/60 rounded-2xl p-6 border border-electric-blue/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getVIPBadgeColor(vipUser.vip_level)}`}>
                {vipUser.vip_level.toUpperCase()} VIP
              </span>
              <span className="text-soft-gray">Score: {vipUser.vip_score}/100</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{vipUser.company_name}</h1>
            <p className="text-soft-gray">{vipUser.email}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl mb-2">🚀</div>
            <p className="text-sm text-electric-blue font-semibold">VIP Portal</p>
          </div>
        </div>
      </div>

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