'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePercyContext } from '../../contexts/PercyContext';
import { saveLeadToSupabase } from '../../lib/supabase/helpers';
import type { SupabaseTimestamp, Lead } from '@/types/supabase';

interface IntakeFormData {
  name: string;
  email: string;
  selectedPlan: string;
  intent: string;
  freeTrial?: boolean;
  businessGoal?: string;
  createdAt?: string;
  userId?: string;
  userPrompt?: string;
  userLink?: string;
  userFileUrl?: string;
  userFileName?: string;
  timestamp?: SupabaseTimestamp;
}

type IntentType = 'logo-design' | 'visual-identity' | 'brand-voice' | 'brand-guidelines' | 'social-kit' | 'brand-strategy' | 'default';

const intentMessages: Record<IntentType, string> = {
  'logo-design': 'You selected Logo Design. Would you like to upload brand assets, describe your vision, or paste a link for reference?',
  'visual-identity': 'Ready to develop your visual identity. Share your inspiration through files, description, or reference links.',
  'brand-voice': 'Let\'s define your brand voice. Share examples, describe your tone, or link to references.',
  'brand-guidelines': 'Time to create your brand guidelines. Upload existing assets, describe your vision, or share references.',
  'social-kit': 'Let\'s optimize your social media presence. Share your current assets, describe your goals, or link to inspiration.',
  'brand-strategy': 'Ready to develop your brand strategy. Share your current materials, describe your goals, or link to competitors.',
  'default': 'How would you like to start? You can upload files, describe your vision, or share reference links.'
};

export default function PercyIntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { percyIntent } = usePercyContext();
  const intent = searchParams?.get('intent') || percyIntent;
  
  const [formData, setFormData] = useState<IntakeFormData>({
    name: '',
    email: '',
    selectedPlan: 'basic',
    intent: intent || 'default',
    timestamp: new Date().toISOString()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const welcomeMessage = intent && intent in intentMessages
    ? intentMessages[intent as IntentType]
    : intentMessages.default;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement file upload to storage service
      setFormData(prev => ({
        ...prev,
        userFileName: file.name,
        userFileUrl: 'placeholder-url' // Replace with actual upload URL
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await saveLeadToSupabase({
        ...formData,
        intent: intent || 'default',
        timestamp: new Date().toISOString()
      } as Lead);

      // Route to appropriate dashboard section
      router.push(`/dashboard/${intent || 'branding'}`);
    } catch (error) {
      console.error('Error saving intake form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = formData.userPrompt || formData.userFileUrl || formData.userLink;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-2xl max-w-2xl mx-auto"
    >
      <h2 className="text-xl font-semibold text-white mb-4">
        {welcomeMessage}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Upload Reference Files
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="w-full p-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-300"
            aria-label="Upload reference files"
            title="Choose files to upload"
          />
        </div>

        {/* Text Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Describe Your Vision
          </label>
          <textarea
            value={formData.userPrompt || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, userPrompt: e.target.value }))}
            className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-300 min-h-[100px]"
            placeholder="Describe what you're looking for..."
          />
        </div>

        {/* Reference Link */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reference Link
          </label>
          <input
            type="url"
            value={formData.userLink || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, userLink: e.target.value }))}
            className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-300"
            placeholder="https://example.com"
          />
        </div>

        <motion.button
          type="submit"
          disabled={!isValid || isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isValid && !isSubmitting
              ? 'bg-electric-blue text-white hover:bg-electric-blue/90'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Continue'}
        </motion.button>
      </form>
    </motion.div>
  );
}
