'use client';
import React from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import PercyProvider from '../../components/assistant/PercyProvider';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import PercyAvatar from '@/components/home/PercyAvatar';

const sections = [
  {
    title: 'Built With Purpose',
    content: 'SKRBL AI was born from a vision to create lasting impact. Founded with the goal of helping entrepreneurs and creators build their legacy, our platform combines cutting-edge AI with intuitive design to make automation accessible to everyone.',
    icon: '🎯'
  },
  {
    title: 'Our Vision',
    content: 'We believe in empowering entrepreneurs to achieve more with less. By automating creative and operational tasks, SKRBL AI helps businesses focus on what truly matters - building relationships, innovating, and growing their legacy.',
    icon: '🚀'
  },
  {
    title: 'Why Percy?',
    content: 'Percy is more than an AI assistant - he's your dedicated concierge in the world of automation. Trained to understand your unique needs, Percy guides you toward success by leveraging our suite of AI agents effectively.',
    icon: '🤖'
  }
];

export default function AboutPage(): JSX.Element {
  return (
    <PercyProvider>
      <PageLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="relative min-h-screen w-full bg-gradient-to-b from-[#0d1117] to-[#161b22] overflow-x-hidden">
            <FloatingParticles />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center mb-16">
                <motion.h1 
                  className="text-4xl font-bold text-white mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  About SKRBL AI
                </motion.h1>
                <motion.p 
                  className="text-lg text-gray-300"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Building the future of AI-powered automation
                </motion.p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                {sections.map((section, index) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className="glass-card p-6 rounded-xl backdrop-blur-lg border border-sky-500/10"
                  >
                    <div className="text-3xl mb-4">{section.icon}</div>
                    <h2 className="text-xl font-semibold text-white mb-4">{section.title}</h2>
                    <p className="text-gray-300">{section.content}</p>
                  </motion.div>
                ))}
              </div>

              {/* Percy Testimonial */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-card p-8 rounded-xl backdrop-blur-lg border border-teal-400/20 max-w-3xl mx-auto"
              >
                <div className="flex items-center justify-center mb-6">
                  <PercyAvatar size="lg" className="mx-auto" />
                </div>
                <blockquote className="text-center">
                  <p className="text-lg text-gray-300 italic mb-4">
                    "SKRBL AI helped me bring my idea to life faster than I ever imagined. The combination of AI agents and human creativity is truly revolutionary."
                  </p>
                  <footer className="text-teal-400 font-semibold">
                    — A Visionary Creator
                  </footer>
                </blockquote>
              </motion.div>

              {/* Stats Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
              >
                <div>
                  <div className="text-3xl font-bold text-white mb-2">10,000+</div>
                  <div className="text-gray-400">Creators Empowered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-2">1M+</div>
                  <div className="text-gray-400">AI Tasks Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-2">24/7</div>
                  <div className="text-gray-400">AI Support</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </PageLayout>
    </PercyProvider>
  );
} 