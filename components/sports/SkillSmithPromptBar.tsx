'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Send, Zap } from 'lucide-react';
import { getCardClass, getButtonClass, cn } from '../../styles/ui';

interface SkillSmithPromptBarProps {
  onCreatePlan?: (prompt: { sport: string; goal: string; time: string; input: string }) => void;
}

const SPORTS = [
  'Basketball', 'Soccer', 'Tennis', 'Baseball', 'Football', 'Golf', 'Swimming', 
  'Track & Field', 'Volleyball', 'Hockey', 'Wrestling', 'Gymnastics'
];

const GOALS = [
  'Improve technique', 'Build strength', 'Increase speed', 'Better endurance',
  'Mental toughness', 'Injury prevention', 'Competition prep', 'Skill development'
];

const TIME_FRAMES = [
  '1 week', '2 weeks', '1 month', '3 months', '6 months', '1 year'
];

const QUICK_PROMPTS = [
  { text: 'Pre-game warmups', icon: '🔥' },
  { text: 'Practice today', icon: '⚡' },
  { text: '2-week plan', icon: '📅' },
  { text: 'Fix my form', icon: '🎯' }
];

export default function SkillSmithPromptBar({ onCreatePlan }: SkillSmithPromptBarProps) {
  const [sport, setSport] = useState('');
  const [goal, setGoal] = useState('');
  const [timeFrame, setTimeFrame] = useState('');
  const [input, setInput] = useState('');
  
  const [isOpen, setIsOpen] = useState({
    sport: false,
    goal: false,
    time: false
  });

  const handleCreatePlan = () => {
    if (sport || goal || timeFrame || input.trim()) {
      const prompt = {
        sport: sport || 'General',
        goal: goal || 'Improve performance',
        time: timeFrame || '1 month',
        input: input.trim() || 'Create a training plan for me'
      };
      
      // Emit event to chat component
      window.dispatchEvent(new CustomEvent('skillsmith-prompt', { detail: prompt }));
      
      // Call callback if provided
      onCreatePlan?.(prompt);
      
      // Reset form
      setInput('');
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    const prompt = {
      sport: sport || 'General',
      goal: 'Quick training',
      time: 'Today',
      input: promptText
    };
    
    window.dispatchEvent(new CustomEvent('skillsmith-prompt', { detail: prompt }));
    onCreatePlan?.(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreatePlan();
    }
  };

  return (
    <div className={cn(getCardClass('glass'), 'p-6 space-y-6')}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">AI Training Assistant</h3>
        <p className="text-slate-400 text-sm">Tell me what you want to work on</p>
      </div>

      {/* Dropdowns Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Sport Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(prev => ({ ...prev, sport: !prev.sport }))}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-300 hover:border-green-400/50 transition-colors"
          >
            <span className={sport ? 'text-white' : 'text-slate-400'}>
              {sport || 'Select Sport'}
            </span>
            <ChevronDown className={cn(
              'w-4 h-4 transition-transform',
              isOpen.sport && 'rotate-180'
            )} />
          </button>
          
          {isOpen.sport && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 z-20 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto"
            >
              {SPORTS.map((sportOption) => (
                <button
                  key={sportOption}
                  onClick={() => {
                    setSport(sportOption);
                    setIsOpen(prev => ({ ...prev, sport: false }));
                  }}
                  className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {sportOption}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Goal Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(prev => ({ ...prev, goal: !prev.goal }))}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-300 hover:border-green-400/50 transition-colors"
          >
            <span className={goal ? 'text-white' : 'text-slate-400'}>
              {goal || 'Select Goal'}
            </span>
            <ChevronDown className={cn(
              'w-4 h-4 transition-transform',
              isOpen.goal && 'rotate-180'
            )} />
          </button>
          
          {isOpen.goal && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 z-20 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto"
            >
              {GOALS.map((goalOption) => (
                <button
                  key={goalOption}
                  onClick={() => {
                    setGoal(goalOption);
                    setIsOpen(prev => ({ ...prev, goal: false }));
                  }}
                  className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {goalOption}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Time Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(prev => ({ ...prev, time: !prev.time }))}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-300 hover:border-green-400/50 transition-colors"
          >
            <span className={timeFrame ? 'text-white' : 'text-slate-400'}>
              {timeFrame || 'Time Frame'}
            </span>
            <ChevronDown className={cn(
              'w-4 h-4 transition-transform',
              isOpen.time && 'rotate-180'
            )} />
          </button>
          
          {isOpen.time && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 z-20 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto"
            >
              {TIME_FRAMES.map((timeOption) => (
                <button
                  key={timeOption}
                  onClick={() => {
                    setTimeFrame(timeOption);
                    setIsOpen(prev => ({ ...prev, time: false }));
                  }}
                  className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {timeOption}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Freeform Input + Create Plan Button */}
      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe what you want to work on... (e.g., 'Help me improve my basketball shooting form')"
          className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:border-green-400/50 transition-colors"
          rows={2}
        />
        <button
          onClick={handleCreatePlan}
          disabled={!sport && !goal && !timeFrame && !input.trim()}
          className={cn(
            getButtonClass('neon'),
            'flex items-center gap-2 px-6 py-3 min-w-fit',
            (!sport && !goal && !timeFrame && !input.trim()) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Send className="w-4 h-4" />
          Create Plan
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div>
        <p className="text-sm text-slate-400 mb-3">Quick prompts:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt.text}
              onClick={() => handleQuickPrompt(prompt.text)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-green-500/20 border border-slate-600/50 hover:border-green-400/50 rounded-full text-sm text-slate-300 hover:text-green-400 transition-all duration-200"
            >
              <span>{prompt.icon}</span>
              <span>{prompt.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Zap className="w-3 h-3" />
        <span>AI will create a personalized training plan based on your inputs</span>
      </div>
    </div>
  );
}