'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Dumbbell, Target, Heart, Zap, Users, Trophy } from 'lucide-react';

interface PromptChip {
  id: string;
  text: string;
  category: 'technique' | 'training' | 'nutrition' | 'mental' | 'recovery';
  icon: React.ComponentType<{ className?: string }>;
}

const promptChips: PromptChip[] = [
  {
    id: 'squat-form',
    text: 'How can I improve my squat form?',
    category: 'technique',
    icon: Dumbbell
  },
  {
    id: 'speed-training',
    text: 'What are the best speed training exercises?',
    category: 'training',
    icon: Zap
  },
  {
    id: 'pre-game-nutrition',
    text: 'What should I eat before a game?',
    category: 'nutrition',
    icon: Heart
  },
  {
    id: 'performance-anxiety',
    text: 'How do I handle performance anxiety?',
    category: 'mental',
    icon: Target
  },
  {
    id: 'team-building',
    text: 'Best team building exercises for sports?',
    category: 'training',
    icon: Users
  },
  {
    id: 'recovery-routine',
    text: 'What\'s a good recovery routine?',
    category: 'recovery',
    icon: Trophy
  }
];

const categories = {
  technique: { name: 'Technique', color: 'blue' },
  training: { name: 'Training', color: 'purple' },
  nutrition: { name: 'Nutrition', color: 'green' },
  mental: { name: 'Mental', color: 'orange' },
  recovery: { name: 'Recovery', color: 'pink' }
};

interface SkillSmithPromptBarProps {
  onPromptSelect: (prompt: string) => void;
  className?: string;
}

export default function SkillSmithPromptBar({ onPromptSelect, className = '' }: SkillSmithPromptBarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredChips = selectedCategory === 'all' 
    ? promptChips 
    : promptChips.filter(chip => chip.category === selectedCategory);

  const handlePromptClick = (prompt: string) => {
    // Analytics stub
    console.log('event:prompt_chip_click', { prompt, category: selectedCategory });
    onPromptSelect(prompt);
  };

  const categoryColorClasses = {
    blue: 'from-blue-500 to-cyan-500 border-blue-400/30',
    purple: 'from-purple-500 to-indigo-500 border-purple-400/30',
    green: 'from-green-500 to-emerald-500 border-green-400/30',
    orange: 'from-orange-500 to-yellow-500 border-orange-400/30',
    pink: 'from-pink-500 to-rose-500 border-pink-400/30'
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Category Filter */}
      <div className="mb-4">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full sm:w-auto flex items-center justify-between gap-2 bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-2 text-white hover:bg-gray-700/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            aria-label="Select prompt category"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
          >
            <span className="capitalize">
              {selectedCategory === 'all' ? 'All Categories' : categories[selectedCategory as keyof typeof categories]?.name}
            </span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown - Mobile-friendly stacking */}
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 border border-gray-600/50 rounded-lg backdrop-blur-xl z-50 shadow-xl"
              role="listbox"
              aria-label="Category options"
            >
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-white hover:bg-purple-500/20 transition-colors border-b border-gray-600/30 focus:outline-none focus:bg-purple-500/20"
                role="option"
                aria-selected={selectedCategory === 'all'}
              >
                All Categories
              </button>
              {Object.entries(categories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedCategory(key);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-white hover:bg-purple-500/20 transition-colors last:border-0 border-b border-gray-600/30 focus:outline-none focus:bg-purple-500/20"
                  role="option"
                  aria-selected={selectedCategory === key}
                >
                  {category.name}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Prompt Chips - Mobile-friendly grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredChips.map((chip) => {
          const category = categories[chip.category];
          const colorClass = categoryColorClasses[category.color as keyof typeof categoryColorClasses];
          
          return (
            <motion.button
              key={chip.id}
              onClick={() => handlePromptClick(chip.text)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative p-4 bg-gradient-to-r ${colorClass} rounded-xl text-left transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-gray-900`}
              aria-label={`Select prompt: ${chip.text}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <chip.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm leading-relaxed group-hover:text-white/90 transition-colors">
                    {chip.text}
                  </p>
                  <p className="text-white/70 text-xs mt-1 capitalize">
                    {category.name}
                  </p>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.button>
          );
        })}
      </div>

      {/* No results message */}
      {filteredChips.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No prompts available for this category.</p>
        </div>
      )}

      {/* Mobile usage hint */}
      <div className="mt-4 text-center sm:hidden">
        <p className="text-xs text-gray-400">
          Tap any prompt above to start chatting with Skill Smith
        </p>
      </div>
    </div>
  );
}