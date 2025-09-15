'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Play, ShoppingCart, Sparkles, Trophy, Zap, Target, Flame } from 'lucide-react';
import Image from 'next/image';
import { products as skillsmithProducts, Product } from '../../lib/config/skillsmithProducts';
import AgentLeagueCard from '../ui/AgentLeagueCard';
import CosmicButton from '../shared/CosmicButton';
import UniversalPromptBar from '../ui/UniversalPromptBar';
import SkillSmithAvatar from './SkillSmithAvatar';

interface SkillSmithProductsGridProps {
  className?: string;
}

export default function SkillSmithProductsGrid({ className = '' }: SkillSmithProductsGridProps) {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Sort products by ascending price
  const sortedProducts = [...skillsmithProducts].sort((a, b) => a.price - b.price);

  // Find the first popular product for the POPULAR badge
  const popularProductId = sortedProducts.find(p => p.popular)?.id || sortedProducts[0].id;

  const handleProductClick = async (productId: string) => {
    const product = skillsmithProducts.find(p => p.id === productId);
    if (!product) {
      console.error('Product not found:', productId);
      return;
    }
    
    try {
      
      
      // Create checkout session using unified API
      const mode = "payment"; // SkillSmith products are one-time purchases
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sku: product.sku,
          mode,
          vertical: "sports",
          metadata: { source: "skillsmith-grid", sku: product.sku },
          successPath: "/sports?success=true",
          cancelPath: "/sports"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.assign(url);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      alert('Sorry, there was an error processing your request. Please try again.');
    }
  };

  // Map icon names to actual icon components
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      Target,
      Zap,
      Trophy,
      Star,
      Flame
    };
    return icons[iconName] || Target;
  };

  return (
    <div className={`relative py-24 px-4 sm:px-6 lg:px-8 ${className}`}>
      {/* SkillSmith Mascot + Interactive Prompt Bar */}
      <div className="max-w-4xl mx-auto mb-12 flex flex-col items-center">
        <SkillSmithAvatar size="lg" animate className="mb-4" />
        <UniversalPromptBar
          title="Instant AI Sports Analysis"
          description="Upload your sports video or ask a question—Percy and SkillSmith will deliver instant AI-powered feedback!"
          acceptedFileTypes="video/*"
          fileCategory="sports_video"
          intentType="analysis"
          placeholder="Describe your goal or question (optional)"
          promptLabel="What would you like analyzed? (optional):"
          buttonText="Analyze Now"
          theme="dark"
          className="w-full"
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 mb-4">
            SkillSmith Training Arsenal
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            AI-powered sports analysis tools designed to unlock your athletic potential
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {sortedProducts.map((product, index) => {
            const IconComponent = product.icon;
            const isPopular = product.id === popularProductId;
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 10px rgba(45,212,191,0.6)' }}
                className="relative"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <AgentLeagueCard
                  agent={{
                    id: product.id,
                    name: product.title,
                    description: product.description,
                    category: 'SkillSmith',
                    visible: true,
                    capabilities: product.features,
                    canConverse: false,
                    recommendedHelpers: [],
                    handoffTriggers: []
                  }}
                  className="h-full min-h-[320px] bg-white/10 backdrop-blur-md rounded-2xl shadow-md"
                  onLaunch={() => handleProductClick(product.id)}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute top-4 right-4 z-20">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                      >
                        🔥 POPULAR
                      </motion.div>
                    </div>
                  )}

                  {/* Price and Category */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full px-3 py-1 text-xs border border-cyan-400/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-cyan-400 font-semibold">${product.price}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full px-3 py-1 text-xs border border-purple-400/30">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-purple-400 font-semibold capitalize">{product.category}</span>
                    </div>
                  </div>

                  {/* Product Content */}
                  <div className="flex flex-col items-center pt-6 pb-6 px-3">
                    {/* Icon */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/40 to-purple-600/40 rounded-full blur-lg animate-pulse"></div>
                      <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${product.color} flex items-center justify-center shadow-xl`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Product Info */}
                    <h3 className="text-xl font-bold text-white mb-2 text-center">
                      {product.title}
                    </h3>
                    <p className="text-gray-300 text-sm text-center mb-4 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Price and One-Time Purchase Badge */}
                    <div className="flex items-center gap-2 mb-4 justify-center">
                      <span className="text-3xl font-bold text-white">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-gray-500 line-through text-lg">${product.originalPrice}</span>
                      )}
                      <span className="ml-2 px-2 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30">One-Time Purchase</span>
                    </div>

                    {/* Features */}
                    <div className="w-full mb-6">
                      <div className="grid grid-cols-2 gap-3">
                        {product.features.slice(0, 4).map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-2 text-xs text-gray-400"
                          >
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                            <span className="truncate">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-3 w-full">
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <CosmicButton
                          variant="primary"
                          size="sm"
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-bold"
                          onClick={() => handleProductClick(product.id)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy ${product.price}
                        </CosmicButton>
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
            );
          })}
        </motion.div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <AgentLeagueCard
            agent={{
              id: 'cta-card',
              name: 'Transform Your Athletic Performance',
              description: "Join thousands of athletes who've unlocked their potential with SkillSmith's AI-powered training tools",
              category: 'SkillSmith',
              visible: true,
              capabilities: [],
              canConverse: false,
              recommendedHelpers: [],
              handoffTriggers: []
            }}
            className="p-8 max-w-4xl mx-auto"
            onLaunch={() => handleProductClick(sortedProducts[0].id)}
            
          >
            <div className="flex justify-center mb-6">
              <Trophy className="w-8 h-8 text-orange-400" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CosmicButton
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-bold px-8 py-4"
                  onClick={() => handleProductClick(sortedProducts[0].id)}
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Try All Products
                </CosmicButton>
              </motion.div>


            </div>
          </AgentLeagueCard>
        </motion.div>
      </div>
    </div>
  );
}