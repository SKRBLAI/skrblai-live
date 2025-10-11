'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Mail, TrendingUp, Zap, DollarSign, ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ScanResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: any;
  scansRemaining: number;
}

export default function ScanResultsModal({ 
  isOpen, 
  onClose, 
  results,
  scansRemaining 
}: ScanResultsModalProps) {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Extract data from results
  const {
    analysis = {},
    agentRecommendations = [],
    quickWins = [],
    scanId,
    type
  } = results;

  const gaps = analysis.challenges || analysis.opportunities || [];
  const quickWin = quickWins[0] || {
    title: 'Optimize Your Strategy',
    steps: [
      'Review your current approach',
      'Implement AI-driven improvements',
      'Track results and iterate'
    ]
  };

  // Calculate bundle pricing
  const individualTotal = agentRecommendations.reduce((sum: number, agent: any) => {
    return sum + (agent.price || 49);
  }, 0);
  const bundlePrice = Math.floor(individualTotal * 0.7); // 30% discount
  const savings = individualTotal - bundlePrice;

  // Handle PDF download
  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    
    try {
      const response = await fetch('/api/percy/generate-quick-win-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanId,
          quickWin,
          gaps,
          type
        })
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skrbl-ai-quick-win-${scanId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF downloaded! 📥');

      // Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'quick_win_downloaded', {
          scan_id: scanId,
          format: 'pdf'
        });
      }

    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  // Handle email Quick Win
  const handleEmailQuickWin = async () => {
    try {
      const response = await fetch('/api/percy/email-quick-win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanId,
          quickWin,
          gaps,
          type
        })
      });

      if (!response.ok) throw new Error('Email failed');

      setEmailSent(true);
      toast.success('Quick Win sent to your email! 📧');

      // Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'quick_win_emailed', {
          scan_id: scanId
        });
      }

    } catch (error) {
      console.error('Email error:', error);
      toast.error('Failed to send email. Please try again.');
    }
  };

  // Handle bundle checkout
  const handleBundleCheckout = () => {
    const agentIds = agentRecommendations.map((a: any) => a.agentId).join(',');
    router.push(`/pricing?bundle=${agentIds}&source=scan`);
    
    // Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'bundle_clicked', {
        scan_id: scanId,
        agents: agentIds,
        bundle_price: bundlePrice
      });
    }
  };

  // Handle individual agent selection
  const handleAgentClick = (agent: any) => {
    router.push(`/agents/${agent.agentId}/backstory?source=scan`);
    
    // Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'agent_clicked', {
        scan_id: scanId,
        agent_id: agent.agentId
      });
    }
  };

  // Handle upgrade
  const handleUpgrade = () => {
    router.push('/pricing?source=scan_limit');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-4"
              >
                <TrendingUp className="w-8 h-8 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                🎯 Scan Complete - {gaps.length} Gaps Found
              </h2>
              <p className="text-gray-400">
                Analysis of: <span className="text-cyan-400">{analysis.title || analysis.input || 'Your Business'}</span>
              </p>
            </div>

            {/* Gaps Section */}
            {gaps.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  ❌ Critical Issues Costing You Revenue:
                </h3>
                <div className="space-y-3">
                  {gaps.slice(0, 3).map((gap: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
                    >
                      <h4 className="text-white font-bold mb-1">
                        {typeof gap === 'string' ? gap : gap.title || gap.challenge}
                      </h4>
                      {gap.description && (
                        <p className="text-gray-300 text-sm mb-2">{gap.description}</p>
                      )}
                      {gap.impact && (
                        <span className="inline-flex items-center gap-1 text-red-400 text-sm font-bold">
                          <DollarSign className="w-4 h-4" />
                          {gap.impact}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Win Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                💡 Your FREE Quick Win:
              </h3>
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                <h4 className="text-white font-bold text-lg mb-4">{quickWin.title}</h4>
                <ul className="space-y-2 mb-6">
                  {quickWin.steps?.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloadingPDF}
                    className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download className="w-5 h-5" />
                    {downloadingPDF ? 'Generating...' : 'Download PDF'}
                  </button>
                  
                  <button
                    onClick={handleEmailQuickWin}
                    disabled={emailSent}
                    className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Mail className="w-5 h-5" />
                    {emailSent ? 'Sent!' : 'Email Me'}
                  </button>
                </div>
              </div>
            </div>

            {/* Agent Recommendations */}
            {agentRecommendations.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  🤖 Percy Recommends These Agents:
                </h3>

                {/* Bundle Option */}
                {agentRecommendations.length >= 2 && (
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-xl p-6 mb-6 relative overflow-hidden">
                    <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                      💎 BEST VALUE
                    </div>
                    
                    <h4 className="text-white font-bold text-lg mb-3">Complete Solution Bundle</h4>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {agentRecommendations.map((agent: any, index: number) => (
                        <span key={index} className="bg-white/10 text-cyan-400 px-3 py-1 rounded-full text-sm font-bold">
                          {agent.superheroName || agent.name}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-gray-400 line-through text-lg">${individualTotal}/mo</span>
                      <span className="text-white text-3xl font-bold">${bundlePrice}/mo</span>
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-bold">
                        Save ${savings}/mo
                      </span>
                    </div>
                    
                    <button
                      onClick={handleBundleCheckout}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group"
                    >
                      <Zap className="w-5 h-5" />
                      Get Bundle - Start Free Trial
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {/* Individual Agents */}
                <p className="text-gray-400 text-sm mb-4">Or choose individual agents:</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {agentRecommendations.slice(0, 3).map((agent: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => handleAgentClick(agent)}
                      className="bg-white/5 border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/50 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-center mb-3">
                        <div className="relative w-16 h-16">
                          <Image
                            src={`/images/agents-${agent.agentId}-nobg-skrblai.webp`}
                            alt={agent.superheroName || agent.name}
                            fill
                            className="object-contain"
                            onError={(e) => {
                              // Fallback to Percy image if agent image not found
                              (e.target as HTMLImageElement).src = '/images/agents-percy-nobg-skrblai.webp';
                            }}
                          />
                        </div>
                      </div>
                      
                      <h5 className="text-white font-bold text-center mb-2">
                        {agent.superheroName || agent.name}
                      </h5>
                      <p className="text-gray-300 text-sm text-center mb-3">
                        {agent.reason || agent.description}
                      </p>
                      <div className="text-center">
                        <span className="text-cyan-400 font-bold">${agent.price || 49}/mo</span>
                      </div>
                      
                      <button className="w-full mt-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-bold py-2 px-4 rounded-lg transition-all group-hover:bg-cyan-500/30">
                        Learn More
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Scans Footer */}
            <div className="border-t border-gray-700 pt-6">
              {scansRemaining > 0 ? (
                <p className="text-center text-gray-400">
                  🎁 <span className="text-cyan-400 font-bold">{scansRemaining} free scans</span> remaining
                  {' · '}
                  <button 
                    onClick={() => router.push('/pricing')}
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Sign up for unlimited
                  </button>
                </p>
              ) : (
                <div className="text-center">
                  <p className="text-white font-bold mb-4">
                    🚀 You've used all 3 free scans!
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => router.push('/pricing?tier=email')}
                      className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 font-bold py-3 px-6 rounded-xl transition-all"
                    >
                      Get 5 More Scans (Free)
                    </button>
                    <button
                      onClick={handleUpgrade}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
                    >
                      Upgrade to Unlimited
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
