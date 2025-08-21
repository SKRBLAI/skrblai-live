'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Zap, 
  Star, 
  Rocket, 
  Crown, 
  Play, 
  CheckCircle, 
  ArrowRight,
  Calendar,
  DollarSign,
  Award,
  Target,
  Trophy,
  Medal
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import CheckoutButton from '@/components/payments/CheckoutButton';
import CosmicButton from '@/components/shared/CosmicButton';
import AgentLeagueCard from '@/components/ui/AgentLeagueCard';
import { tierConfigs } from '@/lib/config/skillsmithTiers';

export default function SportsPage() {
  const { user } = useAuth();
  const supabase = getSupabase();
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTierSelect = (tier: string) => {
    // This function is now handled by the CheckoutButton component
    console.log(`Tier selected: ${tier}`);
  };

  const stats = [
    { icon: Users, value: '10K+', label: 'Active Users' },
    { icon: TrendingUp, value: '47K+', label: 'Businesses Transformed' },
    { icon: Zap, value: '247+', label: 'Intelligence Score' },
    { icon: Star, value: '99.9%', label: 'Uptime Reliability' }
  ];

  const features = [
    {
      icon: Target,
      title: 'Precision Analytics',
      description: 'Advanced metrics and insights for performance optimization'
    },
    {
      icon: Trophy,
      title: 'Win Prediction',
      description: 'AI-powered forecasting for game outcomes and strategies'
    },
    {
      icon: Medal,
      title: 'Player Insights',
      description: 'Deep analysis of individual and team performance patterns'
    },
    {
      icon: Award,
      title: 'Fan Engagement',
      description: 'Tools to enhance audience interaction and loyalty'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] bg-cover opacity-10"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-electric-blue via-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              Sports Intelligence
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl text-soft-gray mb-10 max-w-2xl mx-auto"
            >
              Transform your sports business with AI agents designed for analysis, strategy, and fan engagement.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/demo">
                <CosmicButton
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-electric-blue to-purple-600 hover:from-electric-blue/80 hover:to-purple-700/80 font-bold px-8 py-4"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Book a Demo
                </CosmicButton>
              </Link>
              <Link href="/contact">
                <CosmicButton
                  variant="outline"
                  size="lg"
                  className="border-electric-blue text-electric-blue hover:bg-electric-blue/10 font-bold px-8 py-4"
                >
                  Contact Sales
                  <ArrowRight className="w-5 h-5 ml-2" />
                </CosmicButton>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-electric-blue/20 to-purple-600/20 mb-4">
                  <stat.icon className="w-8 h-8 text-electric-blue" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-soft-gray">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Revolutionizing Sports Business
            </h2>
            <p className="text-lg text-soft-gray max-w-2xl mx-auto">
              Our AI agents provide cutting-edge tools for sports organizations to optimize performance, engage fans, and drive revenue.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto"
          >
            {features.map((feature, index) => (
              <AgentLeagueCard key={feature.title} className="p-6">
                <feature.icon className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-soft-gray">{feature.description}</p>
              </AgentLeagueCard>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              SkillSmith Arsenal
            </h2>
            <p className="text-lg text-soft-gray max-w-2xl mx-auto">
              Choose the perfect plan to elevate your sports business with AI-powered insights.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {Object.entries(tierConfigs).map(([tierId, tier], index) => (
              <motion.div
                key={tierId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="relative"
                onMouseEnter={() => setHoveredTier(tierId)}
                onMouseLeave={() => setHoveredTier(null)}
              >
                <AgentLeagueCard className={`h-full ${tier.popular ? 'ring-2 ring-purple-500/50' : ''}`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-4 py-2 rounded-full text-sm font-bold shadow-lg border border-purple-400/30 bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-lg text-white"
                      >
                        🏆 POPULAR
                      </motion.div>
                    </div>
                  )}

                  <div className="p-6 flex flex-col h-full">
                    <div className="mb-4">
                      {tier.icon}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      {tier.name}
                      {tier.popular && <Medal className="w-5 h-5 text-yellow-400" />}
                    </h3>

                    <p className="text-soft-gray text-sm mb-6">
                      {tier.description}
                    </p>

                    <ul className="space-y-2 mb-6 flex-grow">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-soft-gray text-sm">
                          <span className="mr-2 text-green-400">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-4">
                      <div className="text-center">
                        <span className="text-3xl font-bold text-white">${tier.price}</span>
                        <span className="text-soft-gray">/month</span>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CheckoutButton
                          label="Get Started"
                          sku={tierId}
                          mode="payment"
                          vertical="skillsmith"
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-bold"
                        />
                      </motion.div>
                    </div>
                  </div>

                  {hoveredTier === tierId && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 rounded-2xl pointer-events-none"
                    />
                  )}
                </AgentLeagueCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Sports Business?
            </h2>
            <p className="text-lg text-soft-gray mb-10 max-w-2xl mx-auto">
              Join thousands of sports organizations leveraging AI to gain competitive advantages and maximize revenue.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/demo">
                <CosmicButton
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-electric-blue to-purple-600 hover:from-electric-blue/80 hover:to-purple-700/80 font-bold px-8 py-4"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Demo
                </CosmicButton>
              </Link>
              <Link href="/pricing">
                <CosmicButton
                  variant="secondary"
                  size="lg"
                  className="bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-700/40 hover:to-indigo-700/40 border border-purple-400/30 font-bold px-8 py-4"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  View All Plans
                </CosmicButton>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
