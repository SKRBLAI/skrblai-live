'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Shield, Zap, Users, BarChart3, ArrowRight, 
  CheckCircle, Star, Gem, Crown
} from 'lucide-react';
import CardShell from '../../../components/ui/CardShell';
import PageLayout from '../../../components/layout/PageLayout';

const HEIR_FEATURES = [
  {
    id: "premium-agents",
    title: "Premium Agent Access",
    description: "Access to exclusive AI agents and advanced features",
    icon: <Users className="w-6 h-6" />,
    gradient: "from-purple-500 to-violet-500",
    route: "/agents"
  },
  {
    id: "advanced-automation",
    title: "Advanced Automation",
    description: "Sophisticated workflows and cross-agent orchestration",
    icon: <Zap className="w-6 h-6" />,
    gradient: "from-emerald-500 to-teal-500",
    route: "/dashboard/automation"
  },
  {
    id: "priority-support",
    title: "Priority Support",
    description: "Enhanced support with faster response times",
    icon: <Shield className="w-6 h-6" />,
    gradient: "from-blue-500 to-cyan-500",
    route: "/support"
  },
  {
    id: "analytics",
    title: "Advanced Analytics",
    description: "Detailed insights and performance metrics",
    icon: <BarChart3 className="w-6 h-6" />,
    gradient: "from-pink-500 to-rose-500",
    route: "/dashboard/analytics"
  }
];

export default function HeirDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [founderInfo, setFounderInfo] = useState<any>(null);

  // Verify heir access and get role info
  useEffect(() => {
    if (!isLoading && user) {
      fetch('/api/founders/me')
        .then(res => res.json())
        .then(data => {
          if (!data.founderAccess || !data.isHeir) {
            // Not an heir, redirect to appropriate dashboard
            if (data.isCreator || data.isFounder) {
              router.push('/dashboard/founder');
            } else {
              router.push('/dashboard');
            }
            return;
          }
          setFounderInfo(data);
        })
        .catch(err => {
          console.error('Error checking heir status:', err);
          router.push('/dashboard');
        });
    }
  }, [user, isLoading, router]);

  // Auth check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/sign-in?from=dashboard/heir');
    }
  }, [user, isLoading, router]);

  if (isLoading || !founderInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading heir dashboard...</div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Heir Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <Gem className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Heir Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 text-indigo-400" />
                <span className="text-indigo-400 font-medium">
                  Heir Access - Legacy Features Unlocked
                </span>
              </div>
            </div>
          </div>
          <p className="text-white/60">
            Welcome to your exclusive heir command center. Premium features at your fingertips.
          </p>
        </motion.div>

        {/* Heir Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <CardShell className="p-6 border-2 border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-indigo-400" />
                  Heir Status Active
                </h3>
                <div className="space-y-1">
                  {founderInfo.founderRoles.map((role: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>{role.role.charAt(0).toUpperCase() + role.role.slice(1)} - {role.codeLabel}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-indigo-400 font-medium">Legacy Access</div>
                <div className="text-white/60 text-sm">All premium features included</div>
              </div>
            </div>
          </CardShell>
        </motion.div>

        {/* Heir Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Your Heir Privileges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {HEIR_FEATURES.map((feature, i) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <CardShell className="p-4 hover:shadow-xl transition-shadow cursor-pointer group">
                  <button
                    onClick={() => router.push(feature.route)}
                    className="w-full text-left"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-white/60 text-sm mb-3">{feature.description}</p>
                    <div className="flex items-center gap-2 text-indigo-400 text-sm group-hover:gap-3 transition-all">
                      <span>Access Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </CardShell>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Legacy Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Legacy Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardShell className="p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Premium Agent Access</h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Unlimited agent interactions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Priority processing queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Advanced automation workflows</span>
                </li>
              </ul>
            </CardShell>
            
            <CardShell className="p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Exclusive Features</h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Beta feature access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Enhanced analytics dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Priority customer support</span>
                </li>
              </ul>
            </CardShell>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <CardShell className="p-6 text-center">
            <Gem className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Ready to Claim Your Legacy?
            </h3>
            <p className="text-white/60 mb-4">
              Your premium AI toolkit is ready. Time to build something extraordinary.
            </p>
            <button
              onClick={() => router.push('/agents')}
              className="btn-solid-grad px-6 py-3"
            >
              Access Premium Agents
            </button>
          </CardShell>
        </motion.div>
      </div>
    </PageLayout>
  );
}