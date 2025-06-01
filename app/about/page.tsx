'use client';
import React from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import PercyProvider from '../../components/assistant/PercyProvider';
import BrandLogo from '@/components/ui/BrandLogo';
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
    content: "Percy is more than an AI assistant - he's your dedicated concierge in the world of automation. Trained to understand your unique needs, Percy guides you toward success by leveraging our suite of AI agents effectively.",
    icon: '🤖'
  }
];

export default function AboutPage(): JSX.Element {
  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="relative min-h-screen w-full overflow-x-hidden">
          <FloatingParticles />
          <div className="flex justify-center items-center min-h-[80vh]">
            <div className="bg-white/5 backdrop-blur-xl bg-clip-padding cosmic-gradient border-2 border-[#30D5C8] shadow-[0_0_32px_4px_#30D5C880] rounded-2xl p-8 md:p-16 max-w-4xl w-full mx-auto">
              <div className="flex flex-col items-center mb-10">
                <BrandLogo className="skrblai-heading text-center mb-2" />
                <span className="text-lg text-[#30D5C8] mb-4">Building the future of AI-powered automation</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {sections.map((section, index) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className="bg-white/10 rounded-xl p-6 border border-white/10 shadow-glow"
                  >
                    <div className="text-3xl mb-4">{section.icon}</div>
                    <h2 className="text-xl font-semibold text-white mb-4">{section.title}</h2>
                    <p className="text-gray-300">{section.content}</p>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/10 rounded-xl p-8 border border-teal-400/20 max-w-2xl mx-auto mb-12 shadow-glow"
              >
                <div className="flex items-center justify-center mb-6">
                  <PercyAvatar size="lg" className="mx-auto" />
                </div>
                <blockquote className="text-center">
                  <p className="text-xl italic text-white mb-4">
                    "SKRBL AI helped me bring my idea to life faster than I ever imagined. The combination of AI agents and human creativity is truly revolutionary."
                  </p>
                  <footer className="text-gray-400">—A Visionary Creator</footer>
                </blockquote>
              </motion.div>
              <div className="flex flex-wrap justify-center gap-12 text-center mt-8">
                <div>
                  <div className="text-3xl font-bold text-electric-blue">10,000+</div>
                  <div className="text-gray-400">Creators Empowered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-electric-blue">1M+</div>
                  <div className="text-gray-400">AI Tasks Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-electric-blue">24/7</div>
                  <div className="text-gray-400">AI Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </PageLayout>
  );
}
