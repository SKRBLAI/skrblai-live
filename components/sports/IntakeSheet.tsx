'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Users, Trophy } from 'lucide-react';
import CosmicButton from '../shared/CosmicButton';

interface IntakeData {
  name: string;
  email: string;
  age: string;
  gender: string;
  sport: string;
  sport_other: string;
}

interface IntakeSheetProps {
  onIntakeComplete?: (data: IntakeData & { intakeId?: string }) => void;
}

export default function IntakeSheet({ onIntakeComplete }: IntakeSheetProps) {
  const [formData, setFormData] = useState<IntakeData>({
    name: '',
    email: '',
    age: '',
    gender: '',
    sport: '',
    sport_other: ''
  });
  
  const [errors, setErrors] = useState<Partial<IntakeData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const validateEmail = (email: string) => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Partial<IntakeData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (formData.sport === 'Other' && !formData.sport_other.trim()) {
      newErrors.sport_other = 'Please specify your sport';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/sports/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.saved || result.localOnly) {
        // Store in localStorage as backup
        localStorage.setItem('sports_intake', JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          intakeId: result.intakeId
        }));
        
        setIsCompleted(true);
        onIntakeComplete?.({ ...formData, intakeId: result.intakeId });
      }
    } catch (error) {
      console.error('Intake submission failed:', error);
      // Fallback to localStorage only
      localStorage.setItem('sports_intake', JSON.stringify({
        ...formData,
        timestamp: new Date().toISOString(),
        localOnly: true
      }));
      setIsCompleted(true);
      onIntakeComplete?.({ ...formData });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setIsCompleted(true);
    onIntakeComplete?.({ ...formData });
  };

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-4 bg-green-900/20 border border-green-400/30 rounded-xl"
      >
        <Trophy className="w-6 h-6 text-green-400 mx-auto mb-2" />
        <p className="text-green-300 font-medium">Profile saved! Ready for personalized analysis.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-900/60 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6 mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Quick Profile (Optional)</h3>
        <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">30 seconds</span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none text-sm"
              placeholder="Your name"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none text-sm"
              placeholder="your@email.com (optional)"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Age Group
            </label>
            <select
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none text-sm"
            >
              <option value="">Select age</option>
              <option value="8-18">8-18</option>
              <option value="19+">19+</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none text-sm"
            >
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Nonbinary">Nonbinary</option>
              <option value="Prefer not">Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* Sport */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Primary Sport
          </label>
          <select
            value={formData.sport}
            onChange={(e) => setFormData({ ...formData, sport: e.target.value, sport_other: '' })}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none text-sm"
          >
            <option value="">Select sport</option>
            <option value="Basketball">Basketball</option>
            <option value="Baseball">Baseball</option>
            <option value="Soccer">Soccer</option>
            <option value="Football">Football</option>
            <option value="Tennis">Tennis</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Other">Other</option>
          </select>
          
          {formData.sport === 'Other' && (
            <input
              type="text"
              value={formData.sport_other}
              onChange={(e) => setFormData({ ...formData, sport_other: e.target.value })}
              className="w-full px-3 py-2 mt-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none text-sm"
              placeholder="Specify your sport"
            />
          )}
          {errors.sport_other && <p className="text-red-400 text-xs mt-1">{errors.sport_other}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <CosmicButton
            type="submit"
            disabled={isSubmitting}
            className="flex-1 text-sm py-2"
          >
            {isSubmitting ? 'Saving...' : 'Save My Profile'}
          </CosmicButton>
          
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Skip
          </button>
        </div>
      </form>
    </motion.div>
  );
}