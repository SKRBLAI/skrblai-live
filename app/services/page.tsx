'use client';
import React from 'react';
import { motion } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import Image from 'next/image';
import { BookOpen, Palette, FilePenLine, Megaphone, BarChart2, LayoutDashboard } from 'lucide-react';

export default function ServicesPage() {
  return (
    <PageLayout>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="min-h-screen relative"
      >
        {/* FloatingParticles - COMMENTED OUT FOR MOBILE SCROLL CRASH DEBUGGING */}
        {/* <FloatingParticles
          particleCount={35}
          speed={0.35}
          size={2.5}
          colors={['#38bdf8', '#f472b6', '#0ea5e9', '#22d3ee']}
          glowIntensity={0.5}
        /> */}

        {/* Content */}
        <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24 flex flex-col items-center px-4 md:px-8 lg:px-12">
          {/* Hero Section */}
          <motion.div
            className="w-full flex flex-col items-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="skrblai-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-4 max-w-5xl mx-auto px-4 bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-glow">
              Let Percy Orchestrate Your Brand’s Next Level
            </h1>
            <p className="text-xl text-teal-300 text-center max-w-2xl mx-auto mb-8 px-4 font-semibold">
              SKRBL AI automates, creates, and scales your business with a league of digital superheroes—led by your personal AI concierge.
            </p>
            <Image
              src="/images/agents-percy-nobg-skrblai.png"
              alt="Percy the AI Concierge"
              width={128}
              height={128}
              className="rounded-full shadow-cosmic bg-white/10 border-2 border-cyan-400/30 mb-6"
              priority
            />
          </motion.div>

          {/* Features Section */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {[
              { icon: BookOpen, title: 'Automated Book Publishing' },
              { icon: Palette, title: 'Instant Brand Identity' },
              { icon: FilePenLine, title: 'Supercharged Content Creation' },
              { icon: Megaphone, title: 'Social Campaigns & Ads' },
              { icon: BarChart2, title: 'Actionable Analytics' },
              { icon: LayoutDashboard, title: 'All-in-One Dashboard' },
            ].map(({ icon: Icon, title }) => (
              <motion.div
                key={title}
                className="cosmic-glass border border-teal-400/20 shadow-cosmic rounded-2xl p-6 flex items-center gap-4 backdrop-blur-md"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <div className="flex-shrink-0 bg-teal-500/20 p-3 rounded-full border border-teal-400/40 shadow-glow">
                  <Icon className="text-teal-300" size={28} />
                </div>
                <h3 className="text-teal-200 font-semibold text-lg">{title}</h3>
              </motion.div>
            ))}
          </motion.div>

          {/* Percy Callout */}
          <motion.div
            className="max-w-3xl text-center mb-16 px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <p className="text-lg md:text-xl text-teal-300 font-medium">
              <span className="font-bold text-white">Percy personalizes the experience.</span> No guesswork, no overwhelm—Percy guides you step by step and assembles the perfect digital squad for your goals.
            </p>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 mb-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <a
              href="/sign-up"
              className="cosmic-btn-primary px-8 py-3 rounded-full font-bold text-lg shadow-glow"
            >
              Start Free Trial
            </a>
            <a
              href="/agents"
              className="cosmic-btn-secondary px-8 py-3 rounded-full font-semibold text-lg border border-teal-400/70 backdrop-blur-md"
            >
              Meet the Agent League
            </a>
          </motion.div>
        </div>
      </motion.div>
    </PageLayout>
  );
}
