'use client';

import { useEffect, useState } from 'react';
import PercyHero from '@/components/home/PercyHero';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import FloatingParticles from '@/components/ui/FloatingParticles';
import { agentDashboardList } from '@/lib/agents/agentRegistry';
import Image from 'next/image';

export default function HomePage() {
  const { setPercyIntent, closePercy } = usePercyContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [demoAgent, setDemoAgent] = useState<any>(null);

  const allCategories = Array.from(
    new Set(agentDashboardList.flatMap(agent => agent.agentCategory || []))
  );
  const filteredAgents =
    selectedCategory === 'all'
      ? agentDashboardList
      : agentDashboardList.filter(agent =>
          (agent.agentCategory || []).includes(selectedCategory)
        );

  useEffect(() => {
    closePercy();
    setPercyIntent('');
    console.log(
      "[Percy] Reset on HomePage mount: isOpen=false, percyIntent=''"
    );
  }, [closePercy, setPercyIntent]);

  return (
    <div className="min-h-screen relative text-white bg-[#0d1117] pt-16 overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <FloatingParticles />
      </div>
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/90 to-[#0d1117]/80" />

      {/* Main Content */}
      <div className="relative z-10 pt-8 px-4 md:px-8 max-w-7xl mx-auto">
        {/* PercyHero: Futuristic hero with animated Percy, tagline, and cosmic glassmorphism */}
        <section className="mb-8">
          <div className="flex flex-col items-center justify-center">
            <PercyHero />
            <h1 className="mt-6 text-2xl md:text-4xl font-bold text-teal-300 text-center drop-shadow-[0_0_12px_#2dd4bf] animate-pulse-subtle shadow-glow" aria-label="Meet Our League of Digital Superheroes">
              Meet Our League of Digital Superheroes
            </h1>
            {process.env.NODE_ENV === 'development' && (
              <script dangerouslySetInnerHTML={{ __html: "console.log('[SKRBL DEDUPLICATION] Homepage hero tagline deduplication complete.')" }} />
            )}
          </div>
        </section>

        {/* Agent Highlights Section with Filter & Demo Modal */}
        <div className="relative mt-16">
          {/* Cosmic Background Layer */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="opacity-40">
              <FloatingParticles particleCount={32} />
            </div>
            {/* Animated gradient overlay */}
            <div
              className="absolute inset-0 animate-cosmic-gradient bg-[radial-gradient(ellipse_at_60%_40%,rgba(56,189,248,0.16)_0%,rgba(244,114,182,0.09)_60%,transparent_100%)]"
              style={{ mixBlendMode: 'screen' }}
            />
          </div>

          {/* Main Content Layer (Filter, Grid, Modal) */}
          <div className="relative z-10">
            {/* --- Filter Bar --- */}
            <button
              className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400 ${selectedCategory === 'all' ? 'bg-electric-blue text-white shadow-glow' : 'bg-white/10 text-teal-300 hover:bg-electric-blue/20'}`}
              onClick={() => setSelectedCategory('all')}
            >
              <span role="img" aria-label="All" className="mr-1">✨</span>All
            </button>
            {allCategories.map(cat => {
              const icon =
                cat.toLowerCase().includes('brand') ? '🎨' :
                cat.toLowerCase().includes('content') ? '📝' :
                cat.toLowerCase().includes('video') ? '🎬' :
                cat.toLowerCase().includes('analytics') ? '📊' :
                cat.toLowerCase().includes('social') ? '🤖' :
                cat.toLowerCase().includes('biz') ? '💼' :
                cat.toLowerCase().includes('payment') ? '💳' :
                cat.toLowerCase().includes('client') ? '🧑‍💼' :
                cat.toLowerCase().includes('proposal') ? '📝' :
                cat.toLowerCase().includes('site') ? '🌐' :
                cat.toLowerCase().includes('publishing') ? '📢' :
                cat.toLowerCase().includes('sync') ? '🔄' :
                '✨';
              return (
                <motion.button
                  key={cat}
                  className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400 flex items-center gap-1 ${selectedCategory === cat ? 'bg-electric-blue text-white shadow-glow' : 'bg-white/10 text-teal-300 hover:bg-electric-blue/20'}`}
                  onClick={() => setSelectedCategory(cat)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.08 }}
                  animate={selectedCategory === cat ? { scale: 1.08 } : { scale: 1 }}
                >
                  <span role="img" aria-label={cat} className="mr-1">{icon}</span>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </motion.button>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center">
              {filteredAgents.map(agent => {
                let badge = null;
                if (agent.roleRequired === 'pro') badge = 'Pro';
                else if (agent.isBeta) badge = 'Beta';
                else if (agent.isNew) badge = 'New';
                if (agent.id === 'paymentManagerAgent') badge = 'Pro';
                if (agent.id === 'percySyncAgent') badge = 'Beta';
                if (agent.id === 'videoContentAgent') badge = 'New';
                return (
                  <motion.div
                    key={agent.id}
                    whileHover={{ y: -8, scale: 1.03, boxShadow: '0 0 32px #38bdf8, 0 0 24px #f472b6' }}
                    className="bg-gradient-to-br from-electric-blue/30 via-fuchsia-500/10 to-teal-400/20 rounded-2xl shadow-glow p-6 flex flex-col items-center border-2 border-fuchsia-400/30 hover:border-teal-400/80 transition-all duration-300 relative"
                  >
                    {/* Badge */}
                    {badge && (
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-bold shadow-glow z-10 ${badge==='Pro' ? 'bg-gradient-to-r from-fuchsia-500 to-electric-blue text-white' : badge==='Beta' ? 'bg-gradient-to-r from-yellow-400 to-pink-400 text-white' : 'bg-gradient-to-r from-teal-400 to-fuchsia-400 text-white'}`}
                      >{badge}</motion.span>
                    )}
                    <motion.div
                      className="mb-4 flex items-center justify-center"
                      whileHover={{ scale: 1.06, rotate: -2 }}
                      transition={{ type: 'spring', stiffness: 80 }}
                    >
                      <Image
                        src={`/images/agents-${agent.imageSlug || agent.id}.png`}
                        alt={agent.name}
                        width={96}
                        height={96}
                        className="rounded-xl shadow-glow bg-gradient-to-br from-electric-blue/30 to-fuchsia-500/20"
                        loading="lazy"
                      />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2 text-center bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent drop-shadow-glow">
                      {agent.name}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 text-center min-h-[48px]">
                      {agent.hoverSummary || agent.description || 'AI Agent'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        className="inline-block px-5 py-2 rounded-lg font-semibold bg-gradient-to-r from-fuchsia-400 to-teal-400 text-white shadow-glow hover:shadow-electric-blue/50 hover:scale-105 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400 relative group"
                        onClick={() => setDemoAgent(agent)}
                        tabIndex={0}
                        aria-label={`Try a live demo of ${agent.name}`}
                      >
                        Try Demo
                        <motion.span
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                          className="absolute left-1/2 -bottom-9 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none bg-black/90 text-xs text-white px-3 py-1 rounded shadow-glow transition-opacity duration-200 z-30 whitespace-nowrap"
                          aria-live="polite"
                        >
                          Try a live demo of {agent.name}
                        </motion.span>
                      </button>
                      <Link href={agent.route || `/services/${agent.id}`} legacyBehavior>
                        <a className="inline-block px-5 py-2 rounded-lg font-semibold bg-gradient-to-r from-electric-blue to-teal-400 text-white shadow-glow hover:shadow-electric-blue/50 hover:scale-105 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400 relative group"
                          tabIndex={0}
                          aria-label={`Learn more about ${agent.name}`}
                        >
                          Learn More
                          <motion.span
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.18 }}
                            className="absolute left-1/2 -bottom-9 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none bg-black/90 text-xs text-white px-3 py-1 rounded shadow-glow transition-opacity duration-200 z-30 whitespace-nowrap"
                            aria-live="polite"
                          >
                            Learn more about {agent.name}
                          </motion.span>
                        </a>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Demo Modal */}
          {demoAgent && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, type: 'spring', stiffness: 120 }}
              onClick={() => setDemoAgent(null)}
              aria-label="Agent Demo Modal"
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
            >
              <motion.div
                className="relative bg-gradient-to-br from-electric-blue/70 via-fuchsia-500/40 to-teal-400/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center border-4 border-fuchsia-400/80"
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 120 }}
                tabIndex={0}
                aria-live="polite"
              >
                <motion.button
                  className="absolute top-2 right-2 text-gray-200 hover:text-teal-400 text-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400 rounded-full bg-black/10 px-2 py-1"
                  onClick={() => setDemoAgent(null)}
                  aria-label="Close Agent Demo"
                  whileHover={{ rotate: 90, scale: 1.15 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  ×
                </motion.button>
                <div className="mb-4 flex flex-col items-center">
                  <Image
                    src={`/images/agents-${demoAgent.imageSlug || demoAgent.id}.png`}
                    alt={demoAgent.name}
                    width={120}
                    height={120}
                    className="rounded-xl shadow-glow mb-2"
                    loading="lazy"
                  />
                  <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent drop-shadow-glow">
                    {demoAgent.name}
                  </h3>
                  <p className="text-gray-200 text-center mt-2 mb-4">
                    {demoAgent.hoverSummary || demoAgent.description}
                  </p>
                </div>
                {demoAgent.id === 'percy-agent' ? (
                  <div className="w-full">
                    <PercyHero />
                  </div>
                ) : (
                  <div className="w-full bg-black/20 rounded-xl p-4 text-left text-white shadow-inner">
                    <div className="font-semibold mb-2 text-teal-300">Sample Output:</div>
                    <div className="text-sm text-gray-100">
                      "{demoAgent.demoOutput || 'This agent can help you automate creative, branding, or business tasks. Contact us for a live demo!'}"
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 mb-24 text-center"
        >
          <p className="text-lg mb-8 text-teal-300 max-w-2xl mx-auto bg-[#0d1117]/80 backdrop-blur-sm p-4 rounded-lg">
            Ready to experience creative freedom? Explore our features or chat with Percy—your personal AI concierge—right now.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/features">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-electric-blue text-white font-semibold rounded-lg shadow-glow hover:shadow-electric-blue/50 transition-all duration-300"
              >
                Get 7-Day Free Trial
              </motion.button>
            </Link>
            <Link href="/services">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white/5 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                See Features
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
