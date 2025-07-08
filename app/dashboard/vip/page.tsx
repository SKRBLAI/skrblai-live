'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Shield, Star, Zap, TrendingUp, Users, MessageCircle, Settings, ChevronRight } from 'lucide-react';
// VIP Dashboard uses the standard dashboard layout from parent

// VIP Tier Configuration
const VIP_TIERS = {
  gold: {
    name: 'VIP Gold',
    icon: <Crown className="w-6 h-6" />,
    gradient: 'from-yellow-400 via-orange-500 to-yellow-600',
    glowColor: 'rgba(255, 193, 7, 0.6)',
    borderColor: 'border-yellow-400/50',
    bgPattern: 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20',
    features: ['Priority Support', 'Enhanced Analytics', 'Exclusive Templates', 'Early Access']
  },
  platinum: {
    name: 'VIP Platinum',
    icon: <Shield className="w-6 h-6" />,
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
    glowColor: 'rgba(192, 192, 192, 0.6)',
    borderColor: 'border-gray-300/50',
    bgPattern: 'bg-gradient-to-br from-gray-800/20 to-gray-700/20',
    features: ['White Glove Support', 'Advanced AI Models', 'Custom Integrations', 'Beta Access']
  },
  diamond: {
    name: 'VIP Diamond',
    icon: <Star className="w-6 h-6" />,
    gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    glowColor: 'rgba(56, 189, 248, 0.8)',
    borderColor: 'border-cyan-400/50',
    bgPattern: 'bg-gradient-to-br from-cyan-900/20 to-purple-900/20',
    features: ['Dedicated Account Manager', 'Unlimited Everything', 'Personal AI Consultant', 'Direct Line to CEO']
  }
};

export default function VIPDashboard() {
  const { vipStatus, user, isLoading } = useAuth();
  const router = useRouter();

  // VIP Gatekeeper
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/sign-in');
      } else if (!vipStatus?.isVIP) {
        toast.error('VIP access required – upgrade to unlock.');
        router.replace('/dashboard');
      }
    }
  }, [vipStatus, user, isLoading, router]);

  const [vipTier, setVipTier] = useState<'gold' | 'platinum' | 'diamond'>('diamond'); // Demo with Diamond
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const tierConfig = VIP_TIERS[vipTier];

  useEffect(() => {
    // Hide welcome animation after 3 seconds
    const timer = setTimeout(() => setShowWelcomeAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const vipStats = [
    { label: 'AI Agents Deployed', value: '47', trend: '+12%', icon: <Users className="w-5 h-5" /> },
    { label: 'Revenue Generated', value: '$127k', trend: '+34%', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'VIP Support Response', value: '<2min', trend: 'Instant', icon: <MessageCircle className="w-5 h-5" /> },
    { label: 'Exclusivity Level', value: 'Maximum', trend: 'Elite', icon: <Crown className="w-5 h-5" /> }
  ];

  const exclusiveFeatures = [
    {
      title: 'Instant Agent Deployment',
      description: 'Deploy any AI agent instantly without queues',
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      title: 'Custom AI Model Training',
      description: 'Train personalized AI models on your data',
      icon: <Star className="w-6 h-6" />,
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      title: 'White Glove Concierge',
      description: 'Personal AI strategist and implementation support',
      icon: <Crown className="w-6 h-6" />,
      gradient: 'from-cyan-400 to-blue-500'
    },
    {
      title: 'Enterprise Integrations',
      description: 'Custom integrations with your existing systems',
      icon: <Settings className="w-6 h-6" />,
      gradient: 'from-green-400 to-emerald-500'
    }
  ];

  return (
    <div className={`min-h-screen ${tierConfig.bgPattern} relative overflow-hidden`}>
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 bg-gradient-to-r ${tierConfig.gradient} rounded-full opacity-20`}
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>

        {/* Welcome Animation Overlay */}
        <AnimatePresence>
          {showWelcomeAnimation && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="text-center"
              >
                <motion.div
                  className={`p-8 rounded-3xl bg-gradient-to-r ${tierConfig.gradient} mb-6`}
                  animate={{ 
                    boxShadow: [
                      `0 0 30px ${tierConfig.glowColor}`,
                      `0 0 60px ${tierConfig.glowColor}`,
                      `0 0 30px ${tierConfig.glowColor}`
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {tierConfig.icon}
                </motion.div>
                
                <motion.h1
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl font-bold text-white mb-4"
                >
                  Welcome to {tierConfig.name}
                </motion.h1>
                
                <motion.p
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl text-gray-300"
                >
                  Your exclusive AI empire awaits
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Dashboard Content */}
        <div className="relative z-10 p-6">
          {/* VIP Header */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`mb-8 p-6 rounded-2xl bg-gradient-to-r ${tierConfig.gradient} ${tierConfig.borderColor} border backdrop-blur-xl`}
            style={{
              boxShadow: `0 0 40px ${tierConfig.glowColor}`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"
                >
                  {tierConfig.icon}
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{tierConfig.name} Dashboard</h1>
                  <p className="text-white/80">Elite access to SKRBL AI's most powerful features</p>
                </div>
              </div>
              
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-white font-semibold">ACTIVE</span>
              </motion.div>
            </div>
          </motion.div>

          {/* VIP Stats Grid */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {vipStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5, boxShadow: `0 10px 30px ${tierConfig.glowColor}` }}
                className={`p-6 rounded-xl bg-white/5 backdrop-blur-xl border ${tierConfig.borderColor} hover:bg-white/10 transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${tierConfig.gradient}`}>
                    {stat.icon}
                  </div>
                  <span className="text-green-400 text-sm font-semibold">{stat.trend}</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Exclusive Features Grid */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Crown className="w-6 h-6 text-yellow-400" />
              Exclusive VIP Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exclusiveFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 cursor-pointer transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient}`}
                    >
                      {feature.icon}
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 mb-4">{feature.description}</p>
                      <div className="flex items-center text-cyan-400 font-semibold group-hover:translate-x-2 transition-transform">
                        Access Now <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* VIP Benefits Banner */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className={`p-6 rounded-2xl bg-gradient-to-r ${tierConfig.gradient} bg-opacity-20 border ${tierConfig.borderColor} backdrop-blur-xl`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Your VIP Benefits</h3>
                <div className="flex flex-wrap gap-3">
                  {tierConfig.features.map((benefit, index) => (
                    <motion.span
                      key={benefit}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium"
                    >
                      {benefit}
                    </motion.span>
                  ))}
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-white font-semibold transition-colors backdrop-blur-sm"
              >
                Contact Concierge
              </motion.button>
            </div>
          </motion.div>
                 </div>
       </div>
   );
 }