// @deprecated (2025-09-26): superseded by HomeHeroScanFirst. Kept for reference.
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Zap, DollarSign, Clock, ArrowRight, Sparkles } from 'lucide-react';

const SUPER_POWERS = [
  {
    id: 'revenue-generation',
    icon: DollarSign,
    superpower: 'Revenue Generation',
    tagline: 'Multiply Your Income Streams',
    description: 'AI agents that create content, run marketing campaigns, and generate leads 24/7',
    results: '+340% average revenue increase',
    timeframe: 'First 30 days',
    cta: 'See Revenue Agents',
    route: '?scan=revenue',
    gradient: 'from-green-500 to-emerald-600',
    glow: 'shadow-[0_0_40px_rgba(34,197,94,0.4)]'
  },
  {
    id: 'time-multiplication',
    icon: Clock,
    superpower: 'Time Multiplication',
    tagline: 'Get 40+ Hours Back Per Week',
    description: 'Automate customer service, social media, email marketing, and content creation',
    results: '40+ hours saved weekly',
    timeframe: 'Immediate start',
    cta: 'See Time Agents',
    route: '?scan=automation',
    gradient: 'from-blue-500 to-cyan-600',
    glow: 'shadow-[0_0_40px_rgba(59,130,246,0.4)]'
  },
  {
    id: 'competitive-domination',
    icon: Zap,
    superpower: 'Competitive Domination',
    tagline: 'Outperform Your Entire Industry',
    description: 'Advanced AI strategies that give you capabilities your competitors can\'t match',
    results: '10x faster execution',
    timeframe: 'Beat competition',
    cta: 'See Power Agents',
    route: '?scan=competitive',
    gradient: 'from-purple-500 to-pink-600',
    glow: 'shadow-[0_0_40px_rgba(147,51,234,0.4)]'
  }
];

interface SuperAgentPowersProps {
  useAiAutomationHomepage?: boolean;
}

export default function SuperAgentPowers({ useAiAutomationHomepage = true }: SuperAgentPowersProps): React.JSX.Element | null {
  const router = useRouter();
  const [hoveredPower, setHoveredPower] = useState<string | null>(null);

  const handlePowerClick = (power: typeof SUPER_POWERS[0]) => {
    // Scroll to Percy for business scan with specific intent
    const el = document.getElementById('onboarding');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Could also route to specific scan: router.push(power.route);
  };

  // Progressive enhancement: show basic version for all variants, enhance for new ones
  const showEnhancedPowers = useAiAutomationHomepage;

  return (
    <section className="w-full relative py-16">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 relative z-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 mb-4">
          3 Ways Super Agents Handle Your Business
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Each Super Agent has specialized <span className="text-teal-400 font-semibold">SUPERPOWERS</span> that eliminate entire categories of work
        </p>
      </motion.div>

      {/* Super Powers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 relative z-10">
        {SUPER_POWERS.map((power, index) => {
          const Icon = power.icon;
          return (
            <motion.div
              key={power.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ 
                scale: 1.05, 
                rotateX: 5, 
                rotateY: -5,
              }}
              className={`relative rounded-2xl overflow-hidden bg-gradient-to-br from-black/40 via-gray-900/50 to-black/60 backdrop-blur-xl border-2 border-gradient-to-r ${power.gradient} p-6 cursor-pointer ${power.glow} hover:shadow-2xl transition-all duration-300`}
              style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
              onMouseEnter={() => setHoveredPower(power.id)}
              onMouseLeave={() => setHoveredPower(null)}
              onClick={() => handlePowerClick(power)}
            >
              {/* Cosmic Background Effects */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${power.gradient} opacity-10 blur-xl`}
                  animate={{
                    scale: hoveredPower === power.id ? [1, 1.2, 1] : [1, 1.1, 1],
                    opacity: hoveredPower === power.id ? [0.1, 0.3, 0.1] : [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Power Icon */}
              <motion.div
                className="relative mb-6"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${power.gradient} flex items-center justify-center ${power.glow}`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                {/* Sparkle effects */}
                {hoveredPower === power.id && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: `${50 + Math.cos((i * Math.PI * 2) / 6) * 40}%`,
                          top: `${50 + Math.sin((i * Math.PI * 2) / 6) * 40}%`,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0],
                        }}
                        transition={{
                          duration: 1,
                          delay: i * 0.1,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                      />
                    ))}
                  </>
                )}
              </motion.div>

              {/* Power Details */}
              <div className="relative z-10">
                <h3 className={`text-xl font-bold bg-gradient-to-r ${power.gradient} bg-clip-text text-transparent mb-2`}>
                  {power.superpower}
                </h3>
                
                <p className="text-gray-300 text-lg font-semibold mb-3">
                  {power.tagline}
                </p>
                
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {power.description}
                </p>

                {/* Results */}
                <div className="bg-black/30 rounded-lg p-3 mb-4 border border-gray-700/50">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-lg">{power.results}</span>
                    <span className="text-gray-400 text-sm">{power.timeframe}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 bg-gradient-to-r ${power.gradient} text-white font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg`}
                >
                  {power.cta}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Hover overlay */}
              {hoveredPower === power.id && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center mt-12"
      >
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-red-900/30 to-orange-900/30 backdrop-blur-lg border border-red-500/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
          <p className="text-red-400 text-sm font-bold mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Free Business Scan
          </p>
          <p className="text-white text-lg leading-relaxed mb-4">
            Discover which Super Agents your business needs most.
            <br />
            <span className="text-teal-400 font-medium">Takes 2 minutes. Get instant recommendations.</span>
          </p>
          
          <motion.button
            onClick={() => {
              const el = document.getElementById('onboarding');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 50px rgba(34,197,94,0.6), 0 0 80px rgba(59,130,246,0.4)'
            }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.5)] border border-green-400/30"
          >
            🚀 GET MY FREE BUSINESS SCAN
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}