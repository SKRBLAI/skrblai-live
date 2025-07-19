'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { 
  TrendingUp, Rocket, DollarSign, Users, Clock, Target, 
  Zap, Award, Lightbulb, Shield, ArrowRight 
} from 'lucide-react';

import ClientPageLayout from '@/components/layout/ClientPageLayout';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import Pseudo3DCard, { Pseudo3DHero, Pseudo3DFeature, Pseudo3DStats } from '@/components/shared/Pseudo3DCard';
import CosmicHeading from '@/components/shared/CosmicHeading';
import CosmicButton from '@/components/shared/CosmicButton';
import SkrblAiText from '@/components/shared/SkrblAiText';
import { useLiveMetrics } from '@/hooks/useLiveMetrics';

// Company story milestones
const storyMilestones = [
  {
    year: "2023",
    title: "The Vision",
    description: "Started with a simple question: Why are businesses still doing manual work when AI can handle it all?",
    icon: <Lightbulb className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500"
  },
  {
    year: "2024", 
    title: "AI Agent League",
    description: "Assembled 14 specialized AI agents, each designed to dominate specific business functions.",
    icon: <Users className="w-6 h-6" />,
    color: "from-blue-500 to-purple-500"
  },
  {
    year: "2024",
    title: "Market Disruption", 
    description: "Launched Percy the Cosmic Concierge and revolutionized how businesses interact with AI automation.",
    icon: <Rocket className="w-6 h-6" />,
    color: "from-green-500 to-teal-500"
  },
  {
    year: "2025",
    title: "Global Scale",
    description: "Empowering thousands of businesses worldwide to automate, scale, and dominate their industries.",
    icon: <Award className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500"
  }
];

// Core values
const coreValues = [
  {
    title: "Automation First",
    description: "Every feature built to eliminate manual work and maximize efficiency.",
    icon: <Zap className="w-8 h-8" />
  },
  {
    title: "Results Driven",
    description: "Focus on measurable business outcomes, not just pretty interfaces.",
    icon: <Target className="w-8 h-8" />
  },
  {
    title: "Enterprise Security",
    description: "Bank level security standards with enterprise grade reliability.",
    icon: <Shield className="w-8 h-8" />
  }
];

// Team achievements
const achievements = [
  {
    metric: "14",
    label: "AI Agents",
    description: "Specialized automation experts"
  },
  {
    metric: "500+",
    label: "Businesses",
    description: "Successfully transformed"
  },
  {
    metric: "97%",
    label: "Success Rate",
    description: "Client satisfaction score"
  },
  {
    metric: "127%",
    label: "Avg Growth",
    description: "Revenue increase"
  }
];

export default function AboutPage(): JSX.Element {
  const metrics = useLiveMetrics();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <ClientPageLayout>
      <div className="space-y-16">
        {/* Hero Section */}
        <Pseudo3DHero className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Live Revenue Banner */}
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-full mb-8"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-bold">
                LIVE: ${metrics.revenueGenerated.toLocaleString()}+ Revenue Generated
              </span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </motion.div>

            <CosmicHeading className="text-4xl md:text-6xl lg:text-7xl mb-8">
              The AI Revolution
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Starts Here
              </span>
            </CosmicHeading>

            <motion.p
              className="text-xl md:text-2xl text-electric-blue mb-6 font-bold max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              While others talk about AI, we deliver it. <SkrblAiText variant="wave" size="lg">SKRBL AI</SkrblAiText> is the platform disrupting how businesses automate, create, and scale.
            </motion.p>

            <motion.p
              className="text-lg text-gray-300 mb-10 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Built by entrepreneurs, for entrepreneurs. Led by Percy the Cosmic Concierge and powered by 14 specialized AI agents, 
              we are not just another AI tool - we are your business transformation partner.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CosmicButton href="/agents" variant="primary" size="lg">
                <Rocket className="w-5 h-5 mr-2" />
                Meet The Agent League
              </CosmicButton>
              <CosmicButton href="/pricing" variant="secondary" size="lg">
                <DollarSign className="w-5 h-5 mr-2" />
                See Pricing and ROI
              </CosmicButton>
            </motion.div>
          </motion.div>
        </Pseudo3DHero>

        {/* Live Metrics */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {achievements.map((achievement, index) => (
            <Pseudo3DStats key={achievement.label} className="text-center p-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{achievement.metric}</div>
              <div className="text-sm md:text-base font-semibold text-teal-400 mb-1">{achievement.label}</div>
              <div className="text-xs md:text-sm text-gray-400">{achievement.description}</div>
            </Pseudo3DStats>
          ))}
        </motion.div>

        {/* Our Story Section */}
        <Pseudo3DFeature className="text-center">
          <CosmicHeading className="text-3xl md:text-5xl mb-8">
            Our Story
          </CosmicHeading>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-12">
            From a simple idea to revolutionizing business automation - here is how we are changing the game.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {storyMilestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Pseudo3DStats className="h-full text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${milestone.color} mb-6`}>
                    {milestone.icon}
                  </div>
                  <div className="text-2xl font-bold text-teal-400 mb-2">{milestone.year}</div>
                  <h3 className="text-lg font-bold text-white mb-3">{milestone.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{milestone.description}</p>
                </Pseudo3DStats>
              </motion.div>
            ))}
          </div>
        </Pseudo3DFeature>

        {/* Core Values */}
        <Pseudo3DFeature className="text-center">
          <CosmicHeading className="text-3xl md:text-5xl mb-8">
            What Drives Us
          </CosmicHeading>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-12">
            Our core values guide every decision, every feature, and every interaction.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
              >
                <Pseudo3DStats className="text-center h-full">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{value.description}</p>
                </Pseudo3DStats>
              </motion.div>
            ))}
          </div>
        </Pseudo3DFeature>

        {/* Platform Benefits */}
        <Pseudo3DFeature className="text-center">
          <CosmicHeading className="text-3xl md:text-5xl mb-8">
            Why <SkrblAiText variant="glow">SKRBL AI</SkrblAiText> Works
          </CosmicHeading>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-12">
            We built the platform we wished existed when we were scaling our own businesses.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "No Learning Curve",
                description: "Percy guides you through everything. No technical expertise required.",
                metric: "5 min setup"
              },
              {
                title: "Immediate Results", 
                description: "See productivity gains and revenue impact within the first week.",
                metric: "7 day ROI"
              },
              {
                title: "Scales With You",
                description: "From startup to enterprise, our agents grow with your business.",
                metric: "Unlimited scale"
              },
              {
                title: "Real Support",
                description: "Percy and our team ensure you succeed, not just sell you software.",
                metric: "24/7 support"
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Pseudo3DStats className="text-left h-full">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">{benefit.description}</p>
                  <div className="text-teal-400 font-bold">{benefit.metric}</div>
                </Pseudo3DStats>
              </motion.div>
            ))}
          </div>
        </Pseudo3DFeature>

        {/* CTA Section */}
        <Pseudo3DHero className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-400/30 mb-8">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 font-bold">Join The Revolution Today</span>
            </div>

            <CosmicHeading className="text-3xl md:text-5xl mb-6">
              Ready to Transform Your Business?
            </CosmicHeading>
            
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Stop doing manual work. Start dominating your industry with AI automation that actually works.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CosmicButton href="/sign-up" size="lg" className="text-lg px-8 py-4">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </CosmicButton>
              <CosmicButton href="/services" variant="secondary" size="lg" className="text-lg px-8 py-4">
                See Solutions
              </CosmicButton>
            </div>
          </motion.div>
        </Pseudo3DHero>
      </div>
    </ClientPageLayout>
  );
}
