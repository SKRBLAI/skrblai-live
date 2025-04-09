'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { ChatBubble } from './ChatBubble';
import { routeToAgentFromIntent } from '@/ai-agents/percySyncAgent';

interface UserGoal {
  id: string;
  label: string;
  icon: string;
  description: string;
  intent: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  message: string;
}

const userGoals: UserGoal[] = [
  {
    id: 'social',
    label: 'Grow my social media',
    icon: '🚀',
    description: 'Boost your presence across platforms',
    intent: 'grow_social_media'
  },
  {
    id: 'brand',
    label: 'Build my brand',
    icon: '✨',
    description: 'Create a strong, memorable identity',
    intent: 'design_brand'
  },
  {
    id: 'content',
    label: 'Automate content publishing',
    icon: '📱',
    description: 'Schedule and optimize your content',
    intent: 'publish_book'
  },
  {
    id: 'website',
    label: 'Launch a website',
    icon: '🌐',
    description: 'Create a professional online presence',
    intent: 'launch_website'
  },
  {
    id: 'marketing',
    label: 'Improve marketing',
    icon: '📈',
    description: 'Optimize your marketing strategy',
    intent: 'improve_marketing'
  }
];

export default function PercyAssistant() {
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'assistant',
      message: "Hi! I'm Percy, your AI assistant. What would you like help with today? 👋"
    }
  ]);

  const handleGoalClick = async (goal: UserGoal) => {
    if (isLoading) return;

    // Add user's selection to chat
    const userMessage = `I want to ${goal.label.toLowerCase()}`;
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'user',
      message: userMessage
    }]);

    setIsLoading(true);

    try {
      // Call Percy Sync Agent
      const response = await routeToAgentFromIntent({
        userId: 'demo-user', // TODO: Replace with actual user ID
        intent: goal.intent as any,
        additionalNotes: userMessage
      });

      // Add Percy's response to chat
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        message: response.message
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'assistant',
        message: "I'm having trouble connecting right now. Please try again in a moment. 🙇‍♂️"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto px-4 py-8 relative"
    >
      <div className="text-center mb-8">
        <motion.div
          className="relative w-24 h-24 mx-auto mb-6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Image
            src="/images/percy-avatar.png"
            alt="Percy AI Assistant"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      </div>

      <div className="mb-8 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.message}
            type={msg.type}
          />
        ))}
        {isLoading && (
          <ChatBubble
            message=""
            type="assistant"
            isLoading={true}
          />
        )}
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {userGoals.map((goal) => (
          <motion.button
            key={goal.id}
            onClick={() => handleGoalClick(goal)}
            disabled={isLoading}
            onHoverStart={() => setIsHovered(goal.id)}
            onHoverEnd={() => setIsHovered(null)}
            className={`
              glass-card p-6 text-left transition-all duration-300
              ${isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105 hover:shadow-electric-blue/20'
              }
            `}
            whileHover={!isLoading ? { scale: 1.02 } : undefined}
            whileTap={!isLoading ? { scale: 0.98 } : undefined}
          >
            <div className="flex items-start space-x-4">
              <span className="text-2xl">{goal.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {goal.label}
                </h3>
                <p className="text-sm text-gray-400">{goal.description}</p>
              </div>
            </div>
            <div
              className={`absolute inset-0 rounded-2xl border transition-all duration-200 ${isHovered === goal.id && !isLoading ? 'border-electric-blue/50 shadow-lg shadow-electric-blue/20' : 'border-electric-blue/20'}`}
            />
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
