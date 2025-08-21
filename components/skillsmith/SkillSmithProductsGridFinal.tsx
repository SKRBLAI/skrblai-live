'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Zap, Star, Rocket, Crown, BadgeCheck, Trophy, Target, Award, Medal } from 'lucide-react';
import AgentLeagueCard from '../ui/AgentLeagueCard';
import CosmicButton from '../shared/CosmicButton';
import CheckoutButton from '../payments/CheckoutButton';
import { tierConfigs } from '../../lib/config/skillsmithTiers';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
  bestValue?: boolean;
}

export default function SkillSmithProductsGrid() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [isLoadingTier, setIsLoadingTier] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = getSupabase();

  // Product data - in a real app, this would come from a database or API
  const products: Product[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for beginners exploring AI-powered sports analysis',
      price: 29,
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      features: [
        'Basic sports analytics',
        '3 AI agent slots',
        'Email support',
        'Standard dashboard access'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Advanced tools for serious sports enthusiasts and analysts',
      price: 79,
      icon: <Star className="w-6 h-6 text-purple-400" />,
      features: [
        'Advanced sports analytics',
        '10 AI agent slots',
        'Priority email support',
        'Enhanced dashboard access',
        'Custom workflow builder'
      ],
      popular: true,
      bestValue: true
    },
    {
      id: 'elite',
      name: 'Elite',
      description: 'Premium package for professional sports organizations',
      price: 199,
      icon: <Crown className="w-6 h-6 text-orange-400" />,
      features: [
        'All Pro features',
        'Unlimited AI agents',
        '24/7 VIP support',
        'Premium dashboard access',
        'Advanced workflow automation',
        'Team collaboration tools'
      ],
      popular: false
    }
  ];

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'starter': return <BadgeCheck className="w-5 h-5 text-green-400" />;
      case 'pro': return <Trophy className="w-5 h-5 text-purple-400" />;
      case 'elite': return <Award className="w-5 h-5 text-orange-400" />;
      default: return <Target className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-electric-blue via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          SkillSmith Arsenal
        </h1>
        <p className="text-lg text-soft-gray max-w-2xl mx-auto">
          Transform your sports business with AI agents designed for analysis, strategy, and fan engagement.
        </p>
      </motion.div>

      {/* Products Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="relative"
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            <AgentLeagueCard className={`h-full ${product.popular ? 'ring-2 ring-purple-500/50' : ''}`}>
              {/* Popular Badge */}
              {product.popular && (
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
                {/* Product Icon */}
                <div className="mb-4">
                  {product.icon}
                </div>

                {/* Product Title */}
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  {product.name}
                  {product.popular && <Medal className="w-5 h-5 text-yellow-400" />}
                </h3>

                {/* Product Description */}
                <p className="text-soft-gray text-sm mb-6">
                  {product.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6 flex-grow">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-soft-gray text-sm">
                      <span className="mr-2 text-green-400">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Price and CTA */}
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-white">${product.price}</span>
                    <span className="text-soft-gray">/month</span>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckoutButton
                      label="Purchase Now"
                      sku={product.id}
                      mode="payment"
                      vertical="skillsmith"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-bold"
                      icon={<ShoppingCart className="w-4 h-4 mr-2" />}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Hover Effect */}
              <AnimatePresence>
                {hoveredProduct === product.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 rounded-2xl pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </AgentLeagueCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom CTA Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mt-16"
      >
        <p className="text-soft-gray mb-6 max-w-2xl mx-auto">
          All plans include access to our cutting-edge AI agents, cosmic-themed dashboard, 
          and premium analytics tools. Upgrade anytime with prorated billing.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <CosmicButton
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/contact'}
            className="border-electric-blue text-electric-blue hover:bg-electric-blue/10"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Contact Sales
          </CosmicButton>
          <CosmicButton
            variant="secondary"
            size="lg"
            onClick={() => window.location.href = '/demo'}
            className="bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-700/40 hover:to-indigo-700/40 border border-purple-400/30"
          >
            <Star className="w-5 h-5 mr-2" />
            Book a Demo
          </CosmicButton>
        </div>
      </motion.div>
    </div>
  );
}
