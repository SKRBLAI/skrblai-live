'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Zap, Target, Trophy, Users, Sparkles, Play, ShoppingCart, Gift } from 'lucide-react';
import { useSkillSmithGuest } from '../../lib/skillsmith/guestTracker';
import CosmicButton from '../shared/CosmicButton';
import { products } from '../../lib/config/skillsmithProducts';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSelect?: (productId: string) => void;
  userType: 'guest' | 'auth';
}

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  onProductSelect,
  userType 
}: UpgradeModalProps) {
  const { markUpgradeOffered, usageStats } = useSkillSmithGuest();

  const handleClose = () => {
    markUpgradeOffered();
    onClose();
  };

  const handleProductSelect = (productId: string) => {
    onProductSelect?.(productId);
    handleClose();
  };

  const featuredProducts = products.slice(0, 3); // Show top 3 products

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-orange-500/30 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-orange-500/20 p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Level Up Your Game with AI!
                </h2>
                <p className="text-gray-300 text-lg">
                  You've used {usageStats.scansUsed} scans. Join {userType === 'auth' ? '12,000+' : '15,000+'} athletes who've transformed their performance.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
                title="Close modal"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">Perfect for kids to adults! Get AI-powered sports analysis, mental health support, nutrition guidance, and foundational training.</span>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {featuredProducts.map((product, index) => {
                const IconComponent = product.icon;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                      product.popular 
                        ? 'border-orange-500/50 bg-gradient-to-b from-orange-500/10 to-red-500/10' 
                        : 'border-gray-600/50 bg-gradient-to-b from-gray-800/50 to-gray-900/50'
                    } hover:border-orange-400/70 hover:shadow-xl`}
                    onClick={() => handleProductSelect(product.id)}
                  >
                    {product.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-4">
                      <IconComponent className="w-12 h-12 mx-auto mb-3 text-orange-400" />
                      <h3 className="text-xl font-bold text-white mb-2">{product.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{product.description}</p>
                      
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {product.originalPrice && (
                          <span className="text-gray-500 line-through text-lg">${product.originalPrice}</span>
                        )}
                        <span className="text-3xl font-bold text-white">${product.price}</span>
                        <span className="text-gray-400 text-sm">one-time</span>
                      </div>
                      
                      {product.originalPrice && (
                        <div className="text-green-400 text-sm font-semibold">
                          Save ${product.originalPrice - product.price}!
                        </div>
                      )}
                    </div>

                    <ul className="space-y-2 mb-6">
                      {product.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Zap className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-2">
                      <CosmicButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleProductSelect(product.id)}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white font-bold"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Get This Tool
                      </CosmicButton>
                      
                      <CosmicButton
                        variant="outline"
                        size="sm"
                        className="w-full border-orange-400 text-orange-400 hover:bg-orange-400/10"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Preview Demo
                      </CosmicButton>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust & Social Proof */}
            <div className="mt-8 text-center">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">50,000+ Young Athletes</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-blue-400">
                  <Trophy className="w-5 h-5" />
                  <span className="text-sm">Perfect for All Skill Levels</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-purple-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm">Instant Results</span>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-6">
                Basketball • Soccer • Football • Tennis • Volleyball • Table Tennis • And More!
              </p>

              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 mb-6">
                <p className="text-orange-300 font-semibold mb-2">"This is exactly what I needed to improve my game!"</p>
                <p className="text-gray-400 text-sm">- Marcus, 16, Basketball Player</p>
              </div>

              <div className="text-center">
                <CosmicButton
                  variant="outline"
                  onClick={handleClose}
                  className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-black"
                >
                  I'll Browse More
                </CosmicButton>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}