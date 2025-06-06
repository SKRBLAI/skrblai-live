'use client';

// ARCHIVED: This legacy onboarding file was migrated to UnifiedPercyOnboarding.tsx as of June 2025.
// All business logic, analytics, state, and error handling are now consolidated in UnifiedPercyOnboarding.tsx.
// Do not edit. Retained for reference only.

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import { heroConfig, onboardingSteps } from '@/lib/config/heroConfig';
import { trackPercyEvent } from '@/lib/analytics/percyAnalytics';
import { Upload, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';

interface PercyOnboardingProps {
  className?: string;
}

export default function PercyOnboarding({ className = '' }: PercyOnboardingProps) {
  const router = useRouter();
  const { setPercyIntent, openPercy } = usePercyContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Handle prompt submission
  const handlePromptSubmit = useCallback(async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Track the interaction
      await trackPercyEvent({
        event_type: 'conversation_start',
        user_choice: prompt.trim(),
        session_id: `percy-${Date.now()}`,
        timestamp: new Date().toISOString()
      });

      // Set Percy intent and open chat
      if (setPercyIntent) {
        setPercyIntent(prompt.trim());
      }
      
      if (openPercy) {
        openPercy();
      }
      
      // Clear the prompt
      setPrompt('');
      
    } catch (error) {
      console.error('Error submitting prompt:', error);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, setPercyIntent, openPercy]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setSelectedFile(file);
    setIsLoading(true);

    try {
      // Track file upload as conversation start with file context
      await trackPercyEvent({
        event_type: 'conversation_start',
        user_choice: `File uploaded: ${file.name} (${file.type})`,
        session_id: `percy-${Date.now()}`,
        timestamp: new Date().toISOString()
      });

      // Set Percy intent with file context
      const fileContext = `I've uploaded a file: ${file.name} (${file.type}). Please help me analyze or work with this file.`;
      
      if (setPercyIntent) {
        setPercyIntent(fileContext);
      }
      
      if (openPercy) {
        openPercy();
      }

    } catch (error) {
      console.error('Error handling file upload:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setPercyIntent, openPercy]);

  // Handle file input change
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  // Handle explore features
  const handleExploreFeatures = useCallback(async () => {
    try {
      // Track the interaction
      await trackPercyEvent({
        event_type: 'step_completed',
        step_number: 1,
        user_choice: 'explore_features_clicked',
        session_id: `percy-${Date.now()}`,
        timestamp: new Date().toISOString()
      });

      // Navigate to features/agents page
      router.push('/services/agents');
      
    } catch (error) {
      console.error('Error navigating to features:', error);
    }
  }, [router]);

  // Handle enter key in prompt
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  }, [handlePromptSubmit]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={`flex flex-col items-center space-y-6 w-full max-w-2xl mx-auto ${className}`}
    >
      {/* Prompt Input */}
      <div className="w-full relative">
        <motion.div
          whileFocus={{ scale: 1.02 }}
          className="relative"
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={heroConfig.onboarding.promptPlaceholder}
            className="w-full px-4 py-4 pr-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-electric-blue/50 focus:border-electric-blue/50 transition-all duration-300"
            rows={3}
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePromptSubmit}
            disabled={!prompt.trim() || isLoading}
            className="absolute right-3 top-3 p-2 bg-electric-blue/20 hover:bg-electric-blue/30 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-electric-blue rounded-full border-t-transparent"
              />
            ) : (
              <ArrowRight className="w-5 h-5 text-electric-blue" />
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* File Upload Area */}
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        className={`w-full p-6 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer ${
          dragActive 
            ? 'border-electric-blue bg-electric-blue/10' 
            : 'border-white/30 hover:border-white/50 bg-white/5 hover:bg-white/10'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.csv,.xlsx,.xls"
        />
        
        <div className="flex flex-col items-center space-y-3 text-center">
          <Upload className={`w-8 h-8 ${dragActive ? 'text-electric-blue' : 'text-gray-400'}`} />
          <div>
            <p className="text-white font-medium">
              {dragActive ? 'Drop your file here' : heroConfig.onboarding.fileUploadText}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              PDF, DOC, TXT, Images, or Spreadsheets
            </p>
          </div>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 px-3 py-1 bg-electric-blue/20 rounded-full"
            >
              <span className="text-electric-blue text-sm">✓ {selectedFile.name}</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Primary CTA Button */}
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: '0 0 32px rgba(56, 189, 248, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        onClick={handleExploreFeatures}
        className="w-full max-w-md px-8 py-4 bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-electric-blue/20 transition-all duration-300 flex items-center justify-center space-x-2"
        aria-label={heroConfig.onboarding.ctaButtonAlt}
      >
        <Sparkles className="w-5 h-5" />
        <span>{heroConfig.onboarding.ctaButtonText}</span>
      </motion.button>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-electric-blue"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-electric-blue rounded-full border-t-transparent"
            />
            <span className="text-sm">{heroConfig.messaging.loadingText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 