'use client';

import React from 'react';
import type { JSX } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import CosmicHeading from '@/components/shared/CosmicHeading';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import { motion, type HTMLMotionProps } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stats = [
  { value: '10,000+', label: 'Creators Empowered' },
  { value: '1M+', label: 'AI Tasks Completed' },
  { value: '24/7', label: 'AI Concierge' }
];

const team = [
  {
    name: 'Percy',
    role: 'Your cosmic concierge, connecting you to the perfect AI power for every challenge.',
    icon: '👨‍🚀'
  },
  {
    name: 'Content Creator',
    role: 'Generates captivating copy, blogs, and social posts at lightspeed.',
    icon: '⚡'
  },
  {
    name: 'SiteGen',
    role: 'Build beautiful, responsive pages so you can launch that idea today.',
    icon: '🚀'
  }
];

export default function AboutPage(): JSX.Element {
  return (
    <PageLayout>
      <div className="min-h-screen relative z-10 pt-16 sm:pt-20 lg:pt-24 px-4 md:px-8 lg:px-12">
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6 }}
        >
          <CosmicHeading className="text-4xl md:text-5xl lg:text-6xl mb-6">
            About SKRBL AI
          </CosmicHeading>
          <p className="text-xl text-teal-300 max-w-2xl mx-auto mb-4 font-semibold">
            Built for creators, teams, and visionaries on their second act—SKRBL AI is more than a platform.
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Born from a journey of reinvention, SKRBL AI is led by Percy the Cosmic Concierge and a league of agents—each with a unique power to elevate your business.
          </p>
        </motion.div>

        <motion.div
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <CosmicHeading className="text-3xl md:text-4xl text-center mb-12">
            Meet the League
          </CosmicHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {team.map((member) => (
              <GlassmorphicCard
                key={member.name}
                hoverEffect
                className="text-center p-8"
              >
                <div className="text-4xl mb-4">{member.icon}</div>
                <h3 className="text-2xl font-bold text-electric-blue mb-3">
                  {member.name}
                </h3>
                <p className="text-gray-300">{member.role}</p>
              </GlassmorphicCard>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <GlassmorphicCard className="max-w-3xl mx-auto text-center p-8">
            <blockquote className="text-xl text-gray-300 italic mb-4">
              "SKRBL AI helped me bring my idea to life faster than I ever imagined. The combination of AI agents and human creativity is truly revolutionary."
            </blockquote>
            <cite className="text-electric-blue">— A Visionary Creator</cite>
          </GlassmorphicCard>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        >
          {stats.map((stat) => (
            <GlassmorphicCard
              key={stat.value}
              hoverEffect
              className="text-center"
            >
              <div className="text-3xl font-bold text-electric-blue mb-2">
                {stat.value}
              </div>
              <div className="text-gray-300">{stat.label}</div>
            </GlassmorphicCard>
          ))}
        </motion.div>
      </div>
    </PageLayout>
  );
}
