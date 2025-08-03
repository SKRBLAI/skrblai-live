'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, Search, ArrowRight } from 'lucide-react';
import GlassmorphicCard from '../../components/shared/GlassmorphicCard';
import CosmicButton from '../../components/shared/CosmicButton';
import { usePercyContext } from '../../components/assistant/PercyProvider';

export default function ServicesNotFound() {
  const { openPercy } = usePercyContext();

  const handlePercyHelp = () => {
    openPercy();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Main Error Card */}
        <GlassmorphicCard className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent">
              Agent Not Found
            </h1>
            <p className="text-gray-300 mb-6 text-lg">
              The AI agent you're looking for doesn't exist or may have been moved.
            </p>
            
            {/* Percy Guidance Section */}
            <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-400/30 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6 text-teal-400 mr-2" />
                <span className="text-teal-400 font-bold">Need Help Finding the Right Agent?</span>
              </div>
              <p className="text-gray-300 mb-4">
                Percy can help you find the perfect AI agent for your needs. Just describe what you're trying to accomplish!
              </p>
              <CosmicButton 
                onClick={handlePercyHelp}
                variant="primary"
                className="w-full mb-3"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask Percy for Help
              </CosmicButton>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/agents">
                <CosmicButton variant="secondary" className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Browse All Agents
                </CosmicButton>
              </Link>
              <Link href="/services">
                <CosmicButton variant="outline" className="w-full">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  View Services
                </CosmicButton>
              </Link>
            </div>
          </motion.div>
        </GlassmorphicCard>

        {/* Quick Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <GlassmorphicCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Popular Agents</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <Link href="/services/social-bot-agent" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Social Media
              </Link>
              <Link href="/services/content-creator-agent" className="text-green-400 hover:text-green-300 transition-colors">
                Content Creation
              </Link>
              <Link href="/services/branding-agent" className="text-purple-400 hover:text-purple-300 transition-colors">
                Branding
              </Link>
              <Link href="/services/analytics-agent" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                Analytics
              </Link>
            </div>
          </GlassmorphicCard>
        </motion.div>
      </div>
    </div>
  );
} 