'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Crown, Shield, Zap, Users, BarChart3, Settings,
  ArrowRight, CheckCircle, Star, Sparkles
} from 'lucide-react';
import CardShell from '../../../components/ui/CardShell';
import PageLayout from '../../../components/layout/PageLayout';

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

export default function FounderDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [founderInfo, setFounderInfo] = useState<any>(null);
  const [isCreator, setIsCreator] = useState(false);

  // Verify founder access and get role info
  useEffect(() => {
    if (!isLoading && user) {
      fetch('/api/founders/me')
        .then(res => res.json())
        .then(data => {
          if (!data.founderAccess) {
            // Not a founder, redirect to regular dashboard
            router.push('/dashboard');
            return;
          }
          setFounderInfo(data);
          setIsCreator(data.isCreator);
        })
        .catch(err => {
          console.error('Error checking founder status:', err);
          router.push('/dashboard');
        });
    }
  }, [user, isLoading, router]);

  // Auth check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/sign-in?from=dashboard/founder');
    }
  }, [user, isLoading, router]);

  if (isLoading || !founderInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading founder dashboard...</div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Founder Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Founder Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-medium">
                  {founderInfo.highestRole.charAt(0).toUpperCase() + founderInfo.highestRole.slice(1)} Access
                </span>
              </div>
            </div>
          </div>
          <p className="text-white/60">
            Welcome to your exclusive founder command center. All features unlocked.
          </p>
        </motion.div>

        {/* Founder Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <CardShell className="p-6 border-2 border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Founder Status Active
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
              {isCreator && (
                <button
                  onClick={() => router.push('/api/founders/admin/overview')}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Admin Panel
                </button>
              )}
            </div>
          </CardShell>
        </motion.div>

        {/* Founder Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Your Founder Privileges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FOUNDER_FEATURES.map((feature, i) => (
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
                    <div className="flex items-center gap-2 text-yellow-400 text-sm group-hover:gap-3 transition-all">
                      <span>Access Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </CardShell>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Creator Admin Section */}
        {isCreator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Creator Controls</h2>
            <CardShell className="p-6 border-2 border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-violet-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">System Administration</h3>
                  <p className="text-white/60">Monitor founder activity and system health</p>
                </div>
                <button
                  onClick={() => window.open('/api/founders/admin/overview', '_blank')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  View Admin Overview
                </button>
              </div>
            </CardShell>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <CardShell className="p-6 text-center">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Ready to Build Your Empire?
            </h3>
            <p className="text-white/60 mb-4">
              All systems unlocked. Your AI army awaits your command.
            </p>
            <button
              onClick={() => router.push('/agents')}
              className="btn-solid-grad px-6 py-3"
            >
              Launch All Agents
            </button>
          </CardShell>
        </motion.div>
      </div>
    </PageLayout>
  );
}