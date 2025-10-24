'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Crown, Shield, Zap, Users, BarChart3, Settings,
  ArrowRight, CheckCircle, Star, Sparkles
} from 'lucide-react';
import CardShell from '../../../components/ui/CardShell';
import PageLayout from '../../../components/layout/PageLayout';
import type { User } from '@supabase/supabase-js';

interface FounderClientProps {
  user: User;
}

const FOUNDER_FEATURES = [
  {
    id: "unlimited-agents",
    title: "Unlimited Agent Access",
    description: "Full access to all AI agents without restrictions",
    icon: <Users className="w-6 h-6" />,
    gradient: "from-purple-500 to-violet-500",
    route: "/agents"
  },
  {
    id: "premium-features",
    title: "Premium Features",
    description: "Advanced automation and exclusive capabilities",
    icon: <Zap className="w-6 h-6" />,
    gradient: "from-emerald-500 to-teal-500",
    route: "/dashboard/premium"
  },
  {
    id: "priority-support",
    title: "Priority Support",
    description: "Direct access to our team for assistance",
    icon: <Shield className="w-6 h-6" />,
    gradient: "from-blue-500 to-cyan-500",
    route: "/support"
  },
  {
    id: "analytics",
    title: "Advanced Analytics",
    description: "Deep insights into your business performance",
    icon: <BarChart3 className="w-6 h-6" />,
    gradient: "from-pink-500 to-rose-500",
    route: "/dashboard/analytics"
  }
];

export default function FounderClient({ user }: FounderClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/30 mb-4"></div>
          <div className="h-4 w-24 bg-purple-500/30 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full mb-6"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome, Founder
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            You have exclusive access to all premium features and unlimited AI agents.
            Build something extraordinary.
          </p>
        </div>

        {/* Founder Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FOUNDER_FEATURES.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <CardShell
                className="group cursor-pointer hover:scale-105 transition-all duration-300"
                onClick={() => router.push(feature.route)}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
                  <span className="text-sm font-medium">Explore</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardShell>
            </motion.div>
          ))}
        </div>

        {/* Exclusive Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-2xl p-8 border border-purple-500/20"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Exclusive Founder Benefits</h2>
            <p className="text-gray-300">
              As a founder, you have access to features that help you build and scale your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Priority Access</h3>
              <p className="text-gray-400 text-sm">
                Get first access to new features and updates before anyone else.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Direct Support</h3>
              <p className="text-gray-400 text-sm">
                Skip the queue and get direct access to our development team.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Custom Solutions</h3>
              <p className="text-gray-400 text-sm">
                Request custom features and integrations tailored to your needs.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/agents')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400 text-white rounded-lg transition-all duration-300"
            >
              <Users className="w-5 h-5 mr-2" />
              Browse Agents
            </button>
            <button
              onClick={() => router.push('/dashboard/premium')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg transition-all duration-300"
            >
              <Zap className="w-5 h-5 mr-2" />
              Premium Features
            </button>
            <button
              onClick={() => router.push('/support')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white rounded-lg transition-all duration-300"
            >
              <Shield className="w-5 h-5 mr-2" />
              Get Support
            </button>
            <button
              onClick={() => router.push('/dashboard/analytics')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white rounded-lg transition-all duration-300"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              View Analytics
            </button>
          </div>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}