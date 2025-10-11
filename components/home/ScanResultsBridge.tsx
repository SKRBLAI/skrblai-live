"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, Zap, TrendingUp, Download, Mail, Check, DollarSign } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ScanResultsBridgeProps {
  scanResults: {
    type: string;
    gaps?: string[];
    problems?: string[];
    opportunities?: string[];
    prompt?: string;
    agentRecommendations?: any[];
    quickWins?: any[];
    scanId?: string;
    analysis?: any;
  };
  onGetStarted: () => void;
  scansRemaining?: number;
}

export default function ScanResultsBridge({ scanResults, onGetStarted, scansRemaining = 3 }: ScanResultsBridgeProps) {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Normalize data (handle both gaps/problems and opportunities)
  const gaps = scanResults.gaps || scanResults.problems || [];
  const opportunities = scanResults.opportunities || [];
  const agentRecommendations = scanResults.agentRecommendations || [];
  const quickWin = scanResults.quickWins?.[0] || {
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
          scanId: scanResults.scanId,
          quickWin,
          gaps,
          type: scanResults.type
        })
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skrbl-ai-quick-win-${scanResults.scanId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF downloaded! 📥');
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
          scanId: scanResults.scanId,
          quickWin,
          gaps,
          type: scanResults.type
        })
      });

      if (!response.ok) throw new Error('Email failed');

      setEmailSent(true);
      toast.success('Quick Win sent to your email! 📧');
    } catch (error) {
      console.error('Email error:', error);
      toast.error('Failed to send email. Please try again.');
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/50 rounded-full px-6 py-2 mb-6">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-semibold text-sm">SCAN COMPLETE</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Here's What's Holding You Back
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            I found <span className="text-red-400 font-bold">{gaps.length} critical gaps</span> and 
            <span className="text-green-400 font-bold"> {opportunities.length} growth opportunities</span> in your {scanResults.type}.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Problems Found */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-red-300">Critical Issues Found</h3>
            </div>
            
            <div className="space-y-3">
              {gaps.slice(0, 3).map((gap, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                >
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-red-200 text-sm">{gap}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Opportunities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-green-900/20 border border-green-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-green-300">Growth Opportunities</h3>
            </div>
            
            <div className="space-y-3">
              {opportunities.slice(0, 3).map((opportunity, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                >
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-green-200 text-sm">{opportunity}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Win Section */}
        {quickWin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
              💡 Your FREE Quick Win:
            </h3>
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6 max-w-3xl mx-auto">
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
          </motion.div>
        )}

        {/* Bundle Pricing (if agent recommendations exist) */}
        {agentRecommendations.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-2xl p-6 max-w-3xl mx-auto relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                💎 BEST VALUE
              </div>
              
              <h4 className="text-white font-bold text-xl mb-3">Complete Solution Bundle</h4>
              
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
                onClick={() => router.push(`/pricing?bundle=${agentRecommendations.map((a: any) => a.agentId).join(',')}&source=scan`)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group"
              >
                <Zap className="w-5 h-5" />
                Get Bundle - Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {/* The Good News */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-purple-500/30 rounded-2xl p-8"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            🎉 The Good News? SKRBL AI Can Fix All of This.
          </h3>
          <p className="text-lg text-gray-300 mb-6 max-w-3xl mx-auto">
            Meet <span className="text-cyan-400 font-bold">Percy</span> and <span className="text-purple-400 font-bold">SkillSmith</span> - 
            your AI powerhouse team that automates growth and eliminates every gap Percy just found.
          </p>
          
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <Zap className="w-5 h-5" />
            <span>Show Me How Percy & SkillSmith Work</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <p className="text-sm text-gray-400 mt-4">
            ↓ Scroll down to see your specialized AI team in action
          </p>
        </motion.div>
      </div>
    </section>
  );
}
