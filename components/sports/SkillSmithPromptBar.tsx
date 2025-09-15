'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Send, Zap } from 'lucide-react';

interface SkillSmithPromptBarProps {
  onCreatePlan?: (prompt: { sport: string; goal: string; time: string; input: string }) => void;
}

const SPORTS = [
  'Basketball', 'Soccer', 'Tennis', 'Baseball', 'Football', 'Golf', 'Swimming', 
  'Track & Field', 'Volleyball', 'Hockey', 'Wrestling', 'Gymnastics'
];

const GOALS = [
  'Improve technique', 'Build strength', 'Increase speed', 'Better endurance',
  'Mental toughness', 'Injury prevention', 'Competition prep', 'Team play'
];

const TIME_COMMITMENTS = [
  '30 mins/day', '1 hour/day', '2 hours/day', '3+ hours/day',
  'Weekends only', 'Flexible schedule'
];

export default function SkillSmithPromptBar({ onCreatePlan }: SkillSmithPromptBarProps) {
  // Quick Profile fields (merged from Quick Profile)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [gender, setGender] = useState('');

  // Plan builder selections
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSportDropdown, setShowSportDropdown] = useState(false);
  const [showGoalDropdown, setShowGoalDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const handleCreatePlan = async () => {
    if (!selectedSport || !selectedGoal || !selectedTime) return;
    
    // Fire optional callback for downstream usage
    onCreatePlan?.({
      sport: selectedSport,
      goal: selectedGoal,
      time: selectedTime,
      input: customInput
    });

    // Submit unified intake payload (non-blocking UI)
    try {
      setIsSubmitting(true);
      const payload = {
        name: name?.trim() || '',
        email: email?.trim() || '',
        age: ageGroup || '',
        gender: gender || '',
        sport: selectedSport,
        sport_other: '',
        goal: selectedGoal,
        time: selectedTime,
        notes: customInput || ''
      };

      const res = await fetch('/api/sports/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json().catch(() => ({}));
      if (res.ok || result?.localOnly || result?.saved) {
        // Store locally as backup
        try {
          localStorage.setItem('sports_intake', JSON.stringify({
            ...payload,
            intakeId: result?.intakeId,
            timestamp: new Date().toISOString()
          }));
        } catch { /* ignore quota errors */ }
      }
    } catch (e) {
      console.warn('Unified intake submit failed, continuing UX:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete = selectedSport && selectedGoal && selectedTime;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">
            Create Your Training Plan
          </h3>
          <p className="text-gray-400">
            Tell Skill Smith about your sport and goals to get a personalized training plan
          </p>
        </div>

        {/* Quick Profile (merged) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-300 mb-2">Age Group</label>
            <select
              id="ageGroup"
              title="Age Group"
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Select age</option>
              <option value="8-18">8-18</option>
              <option value="19+">19+</option>
            </select>
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
            <select
              id="gender"
              title="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Nonbinary">Nonbinary</option>
              <option value="Prefer not">Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Sport Selection */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sport
            </label>
            <button
              onClick={() => setShowSportDropdown(!showSportDropdown)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-left text-white hover:border-slate-500 transition-colors flex items-center justify-between"
            >
              <span className={selectedSport ? 'text-white' : 'text-gray-400'}>
                {selectedSport || 'Select sport...'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {showSportDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 z-10 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto"
              >
                {SPORTS.map((sport) => (
                  <button
                    key={sport}
                    onClick={() => {
                      setSelectedSport(sport);
                      setShowSportDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 transition-colors"
                  >
                    {sport}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Goal Selection */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Primary Goal
            </label>
            <button
              onClick={() => setShowGoalDropdown(!showGoalDropdown)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-left text-white hover:border-slate-500 transition-colors flex items-center justify-between"
            >
              <span className={selectedGoal ? 'text-white' : 'text-gray-400'}>
                {selectedGoal || 'Select goal...'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {showGoalDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 z-10 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto"
              >
                {GOALS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => {
                      setSelectedGoal(goal);
                      setShowGoalDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 transition-colors"
                  >
                    {goal}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Time Commitment */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time Available
            </label>
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-left text-white hover:border-slate-500 transition-colors flex items-center justify-between"
            >
              <span className={selectedTime ? 'text-white' : 'text-gray-400'}>
                {selectedTime || 'Select time...'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {showTimeDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 z-10 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl"
              >
                {TIME_COMMITMENTS.map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      setShowTimeDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 transition-colors"
                  >
                    {time}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Custom Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Additional Details (Optional)
          </label>
          <textarea
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Any specific areas you want to focus on, current skill level, equipment available, etc..."
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Create Button */}
        <div className="text-center">
          <button
            onClick={handleCreatePlan}
            disabled={!isComplete || isSubmitting}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto ${
              isComplete && !isSubmitting
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/25'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Zap className="w-5 h-5" />
            {isSubmitting ? 'Saving...' : 'Create Training Plan'}
          </button>
          {!isComplete && (
            <p className="text-gray-500 text-sm mt-2">
              Please select sport, goal, and time commitment
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}