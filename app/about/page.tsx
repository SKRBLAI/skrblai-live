'use client';
import React from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import PercyAvatar from '@/components/home/PercyAvatar';

// Removed unused `sections` constant from earlier draft to avoid TS unused variable error.

export default function AboutPage(): JSX.Element {
  return (
    <PageLayout>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
      >
        {/* Hero Story Section */}
        <section className="text-white py-24 px-6 relative overflow-hidden">
          <FloatingParticles />
          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <motion.h1
                className="skrblai-heading text-3xl md:text-5xl mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                About SKRBL AI
              </motion.h1>
              <motion.p
                className="text-lg text-[#30D5C8] leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Built for creators, teams, and visionaries on their second act—SKRBL AI is more than a platform. It’s your gateway to a universe where digital superheroes help you write, design, publish, and grow.
              </motion.p>
              <motion.p
                className="text-lg text-gray-300 leading-relaxed mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Born from a journey of reinvention, SKRBL AI is led by Percy the Cosmic Concierge and a league of agents—each with a unique power to elevate your business.
              </motion.p>
            </div>
            {/* Cosmic Divider */}
            <motion.div
              className="w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400/60 to-transparent mb-20"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.3 }}
            />
            {/* Meet the League */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="max-w-4xl mx-auto mb-16"
            >
              <h2 className="skrblai-heading text-2xl md:text-3xl text-center mb-8">Meet the League</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <div className="flex flex-col items-center text-center">
                  <PercyAvatar size="md" animate />
                  <h3 className="text-cyan-300 mt-4">Percy</h3>
                  <p className="text-gray-300 text-sm max-w-xs">Your cosmic concierge, connecting you to the perfect AI power for every challenge.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-4xl">⚡</span>
                  <h3 className="text-cyan-300 mt-4">Content Creator</h3>
                  <p className="text-gray-300 text-sm max-w-xs">Generates captivating copy, blogs, and social posts at lightspeed.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-4xl">🛸</span>
                  <h3 className="text-cyan-300 mt-4">SiteGen</h3>
                  <p className="text-gray-300 text-sm max-w-xs">Builds beautiful, responsive pages so you can launch that idea today.</p>
                </div>
              </div>
            </motion.div>
            {/* Testimonial — floating card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="cosmic-float-card shadow-cosmic rounded-2xl p-6 sm:p-8 border-2 border-teal-400/20 max-w-2xl mx-auto mb-12 bg-white/5 backdrop-blur-xl bg-clip-padding flex flex-col items-center transform hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="flex items-center justify-center mb-6">
                <span aria-label="Testimonial quote" className="text-5xl text-cyan-300 drop-shadow-glow">“</span>
              </div>
              <blockquote className="text-center">
                <p className="text-xl italic text-white mb-4">
                  "SKRBL AI helped me bring my idea to life faster than I ever imagined. The combination of AI agents and human creativity is truly revolutionary."
                </p>
                <footer className="text-gray-400">—A Visionary Creator</footer>
              </blockquote>
            </motion.div>
            {/* Stats — floating cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 text-center mt-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
              <div className="cosmic-float-card shadow-cosmic rounded-2xl p-6 sm:p-8 bg-white/5 backdrop-blur-xl bg-clip-padding border-2 border-teal-400/20 transform hover:scale-[1.02] transition-transform duration-300">
                <div className="skrblai-heading text-3xl sm:text-4xl font-bold">10,000+</div>
                <div className="text-gray-300">Creators Empowered</div>
              </div>
              <div className="cosmic-float-card shadow-cosmic rounded-2xl p-6 sm:p-8 bg-white/5 backdrop-blur-xl bg-clip-padding border-2 border-teal-400/20 transform hover:scale-[1.02] transition-transform duration-300">
                <div className="skrblai-heading text-3xl sm:text-4xl font-bold">1M+</div>
                <div className="text-gray-300">AI Tasks Completed</div>
              </div>
              <div className="cosmic-float-card shadow-cosmic rounded-2xl p-6 sm:p-8 bg-white/5 backdrop-blur-xl bg-clip-padding border-2 border-teal-400/20 transform hover:scale-[1.02] transition-transform duration-300">
                <div className="skrblai-heading text-3xl sm:text-4xl font-bold">24/7</div>
                <div className="text-gray-300">AI Concierge</div>
              </div>
            </div>
            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-20"
            >
              <h3 className="skrblai-heading text-2xl mb-4">Ready to join the SKRBL universe?</h3>
              <a
                href="/sign-up"
                className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-full text-white shadow-lg hover:shadow-xl transition"
              >
                Start Your Free Trial
              </a>
            </motion.div>
          </div>
        </section>
      </motion.div>
    </PageLayout>
  );
}
