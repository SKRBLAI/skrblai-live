"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, Zap, TrendingUp } from "lucide-react";

interface ScanResultsBridgeProps {
  scanResults: {
    type: string;
    gaps: string[];
    opportunities: string[];
    prompt?: string;
  };
  onGetStarted: () => void;
}

export default function ScanResultsBridge({ scanResults, onGetStarted }: ScanResultsBridgeProps) {
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
            I found <span className="text-red-400 font-bold">{scanResults.gaps.length} critical gaps</span> and 
            <span className="text-green-400 font-bold"> {scanResults.opportunities.length} growth opportunities</span> in your {scanResults.type}.
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
              {scanResults.gaps.map((gap, idx) => (
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
              {scanResults.opportunities.map((opportunity, idx) => (
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
