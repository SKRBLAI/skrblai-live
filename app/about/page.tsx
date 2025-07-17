'use client';

import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import CosmicHeading from '@/components/shared/CosmicHeading';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import CosmicButton from '@/components/shared/CosmicButton';
import FloatingParticles from '@/components/ui/FloatingParticles';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { TrendingUp, DollarSign, Clock, Users, Zap, Target, Star, Crown, Rocket, Shield, Brain } from 'lucide-react';
import SkrblAiText from '@/components/shared/SkrblAiText';

// Live metrics simulation
const useLiveMetrics = () => {
  const [metrics, setMetrics] = useState({
    companiesTransformed: 2847,
    revenueGenerated: 18500000,
    activeAgents: 14,
    dailyTasks: 156789
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        companiesTransformed: prev.companiesTransformed + Math.floor(Math.random() * 3),
        revenueGenerated: prev.revenueGenerated + Math.floor(Math.random() * 50000),
        activeAgents: 14,
        dailyTasks: prev.dailyTasks + Math.floor(Math.random() * 200)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return metrics;
};

const disruptionStory = [
  {
    phase: "The Vision",
    title: "AI Automation for Everyone",
    description: "While others built complex enterprise tools, we created Percy - an AI concierge that makes automation accessible to creators, entrepreneurs, and businesses of all sizes.",
    icon: "🎯",
    metric: "14 AI Agents",
    color: "from-cyan-400 to-blue-600"
  },
  {
    phase: "The Revolution",
    title: "N8N-Powered Intelligence",
    description: "Real workflows, real results. Our agents don't just chat - they execute. From content creation to analytics, every agent delivers measurable business impact.",
    icon: "⚡",
    metric: "2000+ Workflows",
    color: "from-purple-400 to-pink-600"
  },
  {
    phase: "The Future",
    title: "Revenue-First Platform",
    description: "Built for businesses that need results, not just conversations. Every feature designed to drive growth, increase efficiency, and generate real ROI.",
    icon: "🚀",
    metric: "$18.5M+ Generated",
    color: "from-green-400 to-emerald-600"
  }
];

const competitiveAdvantages = [
  {
    advantage: "Real Workflow Execution",
    description: "While others offer chatbots, we deliver actual business automation",
    icon: <Zap className="w-6 h-6" />,
    proof: "2000+ Live Workflows"
  },
  {
    advantage: "Revenue-Focused Design",
    description: "Every feature built to drive measurable business results",
    icon: <DollarSign className="w-6 h-6" />,
    proof: "$18.5M+ Generated"
  },
  {
    advantage: "No-Code Accessibility",
    description: "Complex automation made simple through intuitive interfaces",
    icon: <Target className="w-6 h-6" />,
    proof: "94% User Success Rate"
  },
  {
    advantage: "Enterprise-Grade Security",
    description: "Bank-level security with complete data privacy and control",
    icon: <Shield className="w-6 h-6" />,
    proof: "SOC 2 Certified"
  },
  {
    advantage: "24/7 AI Orchestration",
    description: "Percy coordinates agent workflows around the clock",
    icon: <Brain className="w-6 h-6" />,
    proof: "99.9% Uptime"
  },
  {
    advantage: "Rapid ROI Delivery",
    description: "Most customers see positive ROI within their first week",
    icon: <Clock className="w-6 h-6" />,
    proof: "7-Day Average ROI"
  }
];

const testimonials = [
  {
    quote: "SKRBL AI transformed our content strategy completely. Percy's automation saved us 40+ hours per week.",
    author: "Sarah Chen",
    role: "Marketing Director",
    company: "TechFlow Dynamics",
    results: "90% Time Reduction",
    avatar: "👩‍💼"
  },
  {
    quote: "The ROI is incredible. Percy's agent orchestration helped us automate our entire sales funnel.",
    author: "Marcus Rodriguez",
    role: "CEO",
    company: "GrowthLab Solutions",
    results: "300% Revenue Increase",
    avatar: "👨‍💼"
  },
  {
    quote: "Finally, an AI platform that actually delivers on its promises. Real automation, real results.",
    author: "Dr. Amanda Foster",
    role: "Operations Director",
    company: "Innovation Institute",
    results: "85% Process Efficiency",
    avatar: "👩‍🔬"
  }
];

export default function AboutPage(): JSX.Element {
  const metrics = useLiveMetrics();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <PageLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
          <FloatingParticles />
        </div>

        {/* Hero Section */}
        <section className="relative z-10 pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Live Revenue Banner */}
              <motion.div
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-400/30 mb-8"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-bold">
                  LIVE: ${metrics.revenueGenerated.toLocaleString()}+ Revenue Generated
                </span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </motion.div>

              <CosmicHeading className="text-5xl md:text-7xl lg:text-8xl mb-8">
                The AI Revolution
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Starts Here
                </span>
              </CosmicHeading>

              <motion.p
                className="text-2xl text-electric-blue mb-6 font-bold max-w-4xl mx-auto"
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
                we're not just another AI tool - we're your business transformation partner.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
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
                  See Pricing & ROI
                </CosmicButton>
              </motion.div>
            </motion.div>

            {/* Live Metrics Dashboard - Single Floating Container */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassmorphicCard variant="floating" className="border-cyan-400/20">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400 mb-2 whitespace-nowrap leading-none">
                      {metrics.companiesTransformed.toLocaleString()}+
                    </div>
                    <div className="text-gray-300 text-sm">Companies Transformed</div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mx-auto mt-2 animate-pulse"></div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2 whitespace-nowrap leading-none">
                      ${(metrics.revenueGenerated / 1000000).toFixed(1)}M+
                    </div>
                    <div className="text-gray-300 text-sm">Revenue Generated</div>
                    <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-2 animate-pulse"></div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2 whitespace-nowrap leading-none">
                      {metrics.activeAgents}
                    </div>
                    <div className="text-gray-300 text-sm">Active AI Agents</div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full mx-auto mt-2 animate-pulse"></div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2 whitespace-nowrap leading-none">
                      {metrics.dailyTasks.toLocaleString()}+
                    </div>
                    <div className="text-gray-300 text-sm">Daily Tasks Automated</div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full mx-auto mt-2 animate-pulse"></div>
                  </div>
                </div>
              </GlassmorphicCard>
            </motion.div>
          </div>
        </section>

        {/* Disruption Story */}
        <section className="relative z-10 py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <CosmicHeading className="text-4xl md:text-5xl mb-6">
                How We're <span className="text-electric-blue">Disrupting</span> AI
              </CosmicHeading>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                While the industry builds chatbots, we build business transformation tools.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {disruptionStory.map((story, index) => (
                <motion.div
                  key={story.phase}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <GlassmorphicCard variant="floating" className="h-full hover:border-cyan-400/50 transition-all duration-300">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${story.color} mb-6`}>
                      <span className="text-2xl">{story.icon}</span>
                    </div>
                    <div className="text-sm text-cyan-400 font-bold mb-2">{story.phase}</div>
                    <h3 className="text-2xl font-bold text-white mb-4">{story.title}</h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">{story.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-electric-blue">{story.metric}</span>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                  </GlassmorphicCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Competitive Advantages */}
        <section className="relative z-10 py-20 bg-gradient-to-b from-transparent to-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <CosmicHeading className="text-4xl md:text-5xl mb-6">
                Why <span className="text-electric-blue">Businesses Choose</span> <SkrblAiText variant="glow" size="inherit">SKRBL AI</SkrblAiText>
              </CosmicHeading>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                We don't just compete - we redefine what AI automation can achieve.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {competitiveAdvantages.map((advantage, index) => (
                <motion.div
                  key={advantage.advantage}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassmorphicCard variant="floating" className="h-full hover:border-electric-blue/50 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                        {advantage.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-3">{advantage.advantage}</h3>
                        <p className="text-gray-300 mb-4">{advantage.description}</p>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-bold text-electric-blue">{advantage.proof}</span>
                        </div>
                      </div>
                    </div>
                  </GlassmorphicCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="relative z-10 py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <CosmicHeading className="text-4xl md:text-5xl mb-6">
                Real Results, <span className="text-electric-blue">Real Revenue</span>
              </CosmicHeading>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Don't just take our word for it - see the measurable impact we're delivering.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.author}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <GlassmorphicCard variant="floating" className="h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-2xl">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-white">{testimonial.author}</div>
                        <div className="text-sm text-gray-400">{testimonial.role}</div>
                        <div className="text-sm text-electric-blue">{testimonial.company}</div>
                      </div>
                    </div>
                    <blockquote className="text-gray-300 italic mb-6">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-bold text-green-400">{testimonial.results}</span>
                    </div>
                  </GlassmorphicCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-20">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <GlassmorphicCard variant="floating" className="text-center bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-400/30">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-400/30 mb-8">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="text-cyan-300 font-bold">JOIN THE REVOLUTION</span>
                </div>

                <CosmicHeading className="text-4xl md:text-5xl mb-6">
                  Ready to <span className="text-electric-blue">Transform</span> Your Business?
                </CosmicHeading>

                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of businesses already using SKRBL AI to automate, scale, and dominate their markets.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <CosmicButton href="/agents" variant="primary" size="lg">
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Free Trial
                  </CosmicButton>
                  <CosmicButton href="/contact" variant="secondary" size="lg">
                    <Users className="w-5 h-5 mr-2" />
                    Schedule Demo
                  </CosmicButton>
                </div>
              </GlassmorphicCard>
            </motion.div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
