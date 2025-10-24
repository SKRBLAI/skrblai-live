'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Sparkles, Target, Users, Gamepad2, ArrowRight, 
  CheckCircle, BarChart3, Zap, Globe
} from 'lucide-react';
import CardShell from '../../components/ui/CardShell';
import PageLayout from '../../components/layout/PageLayout';
import { DashboardWithActivityFeed } from '../../components/dashboard/DashboardWithActivityFeed';

const RECOMMENDED_AGENTS = [
  {
    id: "percy",
    name: "Percy",
    description: "Your AI business concierge and strategist",
    specialty: "Business Strategy & Automation",
    icon: <Sparkles className="w-8 h-8" />,
    gradient: "from-purple-500 to-violet-500",
    route: "/agents/percy"
  },
  {
    id: "brand-alexander", 
    name: "BrandAlexander",
    description: "Elite brand transformation specialist",
    specialty: "Brand Identity & Positioning",
    icon: <Target className="w-8 h-8" />,
    gradient: "from-emerald-500 to-teal-500",
    route: "/agents/brand-alexander"
  },
  {
    id: "content-carltig",
    name: "Content Carltig", 
    description: "High-converting content creation machine",
    specialty: "Content Marketing & SEO",
    icon: <BarChart3 className="w-8 h-8" />,
    gradient: "from-blue-500 to-cyan-500",
    route: "/agents/content-carltig"
  },
  {
    id: "social-nino",
    name: "Social Nino",
    description: "Social media growth and engagement expert", 
    specialty: "Social Media Marketing",
    icon: <Users className="w-8 h-8" />,
    gradient: "from-pink-500 to-rose-500",
    route: "/agents/social-nino"
  }
];

const QUICK_ACTIONS = [
  {
    id: "agent-league",
    title: "Meet Your Agent League",
    description: "Explore all available AI agents",
    icon: <Users className="w-6 h-6" />,
    route: "/agents",
    color: "from-purple-500 to-violet-500"
  },
  {
    id: "business-scan",
    title: "Start Business Scan", 
    description: "Get instant optimization insights",
    icon: <Zap className="w-6 h-6" />,
    route: "/?action=scan",
    color: "from-emerald-500 to-teal-500"
  },
  {
    id: "sports",
    title: "Go to Sports",
    description: "Level up your athletic performance",
    icon: <Gamepad2 className="w-6 h-6" />,
    route: "/sports",
    color: "from-orange-500 to-red-500"
  }
];

interface DashboardClientProps {
  user: any;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();
  const [quickWins, setQuickWins] = useState<string[]>([]);
  const [profileSynced, setProfileSynced] = useState(false);

  // Profile sync fallback - ensure profile exists when dashboard loads
  useEffect(() => {
    if (user && !profileSynced) {
      fetch('/api/user/profile-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(res => res.json())
        .then(data => {
          if (data.ok) {
            console.log('[DASHBOARD] Profile sync successful');
          } else {
            console.warn('[DASHBOARD] Profile sync failed (non-critical):', data.error);
          }
          setProfileSynced(true);
        })
        .catch(err => {
          console.warn('[DASHBOARD] Profile sync error (non-critical):', err);
          setProfileSynced(true);
        });
    }
  }, [user, profileSynced]);

  // Load quick wins from localStorage if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('business-quick-wins');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setQuickWins(parsed.slice(0, 3)); // Show max 3
        } catch (e) {
          console.warn('Failed to parse stored quick wins:', e);
        }
      }
    }
  }, []);

  return (
    <PageLayout>
      <DashboardWithActivityFeed userId={user?.id} showActivityFeed={true}>
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-white/60">
              Your AI automation command center is ready to dominate
            </p>
          </motion.div>

        {/* Quick Wins Teaser */}
        {quickWins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <CardShell className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Your Quick Wins
              </h3>
              <div className="space-y-2">
                {quickWins.map((win, i) => (
                  <div key={i} className="flex items-start gap-3 text-white/80 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    <span>{win}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push('/?action=scan')}
                className="mt-4 text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
              >
                Run another scan →
              </button>
            </CardShell>
          </motion.div>
        )}

        {/* Recommended Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Your Agent Squad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {RECOMMENDED_AGENTS.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <CardShell className="p-4 hover:shadow-xl transition-shadow cursor-pointer group">
                  <button
                    onClick={() => router.push(agent.route)}
                    className="w-full text-left"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${agent.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      {agent.icon}
                    </div>
                    <h3 className="font-semibold text-white mb-1">{agent.name}</h3>
                    <p className="text-white/60 text-sm mb-2">{agent.description}</p>
                    <p className="text-cyan-400 text-xs">{agent.specialty}</p>
                    <div className="mt-3 flex items-center gap-2 text-cyan-400 text-sm group-hover:gap-3 transition-all">
                      <span>Launch Agent</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </CardShell>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <CardShell className="p-4 hover:shadow-xl transition-shadow cursor-pointer group">
                  <button
                    onClick={() => router.push(action.route)}
                    className="w-full text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                    <p className="text-white/60 text-sm">{action.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-cyan-400 text-sm group-hover:gap-3 transition-all">
                      <span>Go</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </CardShell>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Plan Tab Teaser (if coming from wizard) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-8"
        >
          <CardShell className="p-6 text-center">
            <Globe className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Ready to Dominate Your Market?
            </h3>
            <p className="text-white/60 mb-4">
              Your personalized automation strategy is waiting
            </p>
            <button
              onClick={() => router.push('/?action=scan')}
              className="btn-solid-grad px-6 py-3"
            >
              Start Business Scan
            </button>
          </CardShell>
        </motion.div>
        </div>
      </DashboardWithActivityFeed>
    </PageLayout>
  );
}