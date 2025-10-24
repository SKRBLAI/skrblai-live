'use client';

import { StreamingPercyChat } from '@/components/percy/StreamingPercyChat';
import { useAuth } from '@/components/context/AuthContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PercyChatClient() {
  const { session, user } = useAuth();
  const [userContext, setUserContext] = useState<any>({
    mainGoal: 'grow business'
  });

  useEffect(() => {
    // Load user context from localStorage or user profile
    if (typeof window !== 'undefined') {
      const businessType = localStorage.getItem('userBusinessType') || localStorage.getItem('businessType');
      const goal = localStorage.getItem('userGoal');
      const revenue = localStorage.getItem('currentRevenue');
      
      setUserContext({
        businessType: businessType || undefined,
        mainGoal: goal || 'grow business',
        currentRevenue: revenue ? parseInt(revenue) : undefined
      });
    }
  }, []);

  const handleRecommendation = (recommendation: any) => {
    console.log('[Percy Chat] Recommendation received:', recommendation);
    // Could navigate to recommended agent or show recommendation modal
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </Link>
              
              <div className="h-6 w-px bg-gray-700" />
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Chat with Percy</h1>
                  <p className="text-xs text-gray-400">
                    Your AI business advisor
                  </p>
                </div>
              </div>
            </div>

            {user && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>{user.email}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto"
          style={{ maxWidth: '900px' }}
        >
          {/* Info Card */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-semibold text-blue-300 mb-1">
                  Intelligent Conversation
                </h2>
                <p className="text-xs text-gray-300">
                  Percy streams responses in real-time and learns about your business as you chat. 
                  Ask about revenue growth, marketing strategies, or which AI agents can help you most.
                </p>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <div className="h-[calc(100vh-280px)] min-h-[500px]">
            <StreamingPercyChat
              initialContext={userContext}
              onRecommendation={handleRecommendation}
            />
          </div>

          {/* Footer Tips */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-sm font-semibold text-white mb-1">💡 Tip</h3>
              <p className="text-xs text-gray-400">
                Be specific about your business type and goals for better recommendations
              </p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-sm font-semibold text-white mb-1">⚡ Fast</h3>
              <p className="text-xs text-gray-400">
                Responses stream token-by-token for a natural conversation feel
              </p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-sm font-semibold text-white mb-1">💾 Export</h3>
              <p className="text-xs text-gray-400">
                Click the download icon to save your conversation
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
