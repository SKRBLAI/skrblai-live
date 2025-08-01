'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Star, Play, ShoppingCart, Sparkles, Trophy, Zap, Target, Flame } from 'lucide-react';
import Image from 'next/image';
import { products as skillsmithProducts, Product } from '../../lib/config/skillsmithProducts';
import GlassmorphicCard from '../shared/GlassmorphicCard';
import CosmicButton from '../shared/CosmicButton';

interface SkillSmithProductsGridProps {
  className?: string;
}

export default function SkillSmithProductsGrid({ className = '' }: SkillSmithProductsGridProps) {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [floatingMascot, setFloatingMascot] = useState({ x: 0, y: 0 });

  // Floating mascot animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingMascot({
        x: Math.sin(Date.now() / 2000) * 20,
        y: Math.cos(Date.now() / 3000) * 15
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleProductClick = (productId: string) => {
    // Navigate to product page or open modal
    console.log('Product clicked:', productId);
  };

  const handlePreviewDemo = (productId: string) => {
    // Open demo modal
    console.log('Preview demo:', productId);
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Target, Trophy, Zap, Star, Flame, Sparkles
    };
    return icons[iconName] || Target;
  };

  return (
    <div className={`relative py-24 px-4 sm:px-6 lg:px-8 ${className}`}>
      {/* Floating SkillSmith Mascot */}
      <motion.div
        className="fixed top-1/3 right-8 z-20 pointer-events-none"
        animate={{
          x: floatingMascot.x,
          y: floatingMascot.y,
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <div className="relative w-16 h-16 sm:w-20 sm:h-20">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 to-red-500/30 rounded-full blur-xl animate-pulse" />
          <Image
            src="/images/agents-skillsmith-nobg-skrblai.webp"
            alt="SkillSmith Mascot"
            fill
            className="object-contain drop-shadow-2xl"
          />
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
              SkillSmith
            </span>{' '}
            <span className="text-white">Products</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Unlock your athletic potential with AI-powered training tools designed by elite sports scientists
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16"
        >
          {skillsmithProducts.map((product: Product, index: number) => {
            const IconComponent = getIconComponent('Target'); // Use default icon for now
            const isHovered = hoveredProduct === product.id;
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onHoverStart={() => setHoveredProduct(product.id)}
                onHoverEnd={() => setHoveredProduct(null)}
                className="h-full"
              >
                <GlassmorphicCard
                  className="h-full flex flex-col p-6 group cursor-pointer relative overflow-hidden"
                  glowColor={product.color}
                  mode3D={true}
                >
                  {/* Popularity Badge */}
                  {product.popular && (
                    <div className="absolute top-4 right-4 z-10">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        Popular
                      </motion.div>
                    </div>
                  )}

                  {/* Product Icon */}
                  <div className="flex justify-center mb-4">
                    <motion.div
                      animate={isHovered ? { 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      } : {}}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${product.color} flex items-center justify-center shadow-lg`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2 text-center group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-500 group-hover:bg-clip-text transition-all duration-300">
                      {product.title}
                    </h3>
                    
                    <p className="text-gray-300 text-sm mb-4 text-center leading-relaxed flex-1">
                      {product.description}
                    </p>

                    {/* Features List */}
                    <div className="mb-6">
                      <ul className="space-y-2">
                        {product.features.slice(0, 3).map((feature: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-center text-sm text-gray-300"
                          >
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + idx * 0.1 }}
                              className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mr-3 flex-shrink-0" 
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <span className="text-3xl font-bold text-white">${product.price}</span>
                      <span className="text-gray-400 text-sm ml-1">one-time</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CosmicButton
                          variant="primary"
                          size="sm"
                          className={`w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-semibold ${
                            isHovered ? 'animate-pulse shadow-lg shadow-orange-500/25' : ''
                          }`}
                          onClick={() => handleProductClick(product.id)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy Now
                        </CosmicButton>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CosmicButton
                          variant="outline"
                          size="sm"
                          className={`w-full border-orange-400 text-orange-400 hover:bg-orange-400/10 font-semibold ${
                            isHovered ? 'animate-pulse shadow-lg shadow-orange-400/25' : ''
                          }`}
                          onClick={() => handlePreviewDemo(product.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Preview Demo
                        </CosmicButton>
                      </motion.div>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </GlassmorphicCard>
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
          <GlassmorphicCard className="p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Transform Your Athletic Performance?
            </h3>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">
              Join thousands of athletes who've unlocked their potential with SkillSmith's AI-powered training tools
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CosmicButton
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-bold px-8 py-4"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Try All Products
                </CosmicButton>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CosmicButton
                  variant="outline"
                  size="lg"
                  className="border-orange-400 text-orange-400 hover:bg-orange-400/10 font-bold px-8 py-4"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  See What's Inside
                </CosmicButton>
              </motion.div>
            </div>
          </GlassmorphicCard>
        </motion.div>
      </div>
    </div>
  );
}
