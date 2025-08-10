'use client';

import React, { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadFileToStorage } from '../../utils/supabase-helpers';
import { supabase } from '../../utils/supabase';
import { usePercyContext } from '../assistant/PercyProvider';
import { BEHAVIOR_TYPES } from '../../lib/percy/contextManager';
import { useOnboarding } from '../../contexts/OnboardingContext';

export interface UniversalPromptBarProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  acceptedFileTypes?: string;
  fileCategory?: string;
  intentType?: string;
  placeholder?: string;
  promptLabel?: string;
  showPrompt?: boolean;
  buttonText?: string;
  onPromptSubmit?: (prompt: string) => void;
  onFileUpload?: (fileUrl: string, metadata: any) => void;
  onComplete?: (data: { 
    prompt: string, 
    fileUrl?: string, 
    fileName?: string, 
    fileType?: string,
    fileSize?: number 
  }) => void;
  compact?: boolean;
  minimalUI?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export default function UniversalPromptBar({
  title = 'Upload File',
  description = 'Upload a file and provide optional instructions.',
  icon,
  acceptedFileTypes = '.pdf,.doc,.docx,.txt',
  fileCategory = 'document',
  intentType = 'process',
  placeholder = 'How would you like us to handle your file? Any specific instructions?',
  promptLabel = 'Describe your request (optional):',
  showPrompt = true,
  buttonText = 'Upload',
  onPromptSubmit,
  onFileUpload,
  onComplete,
  compact = false,
  minimalUI = false,
  className = '',
  theme = 'dark',
}: UniversalPromptBarProps) {
  const pathname = usePathname() || '';
  const isDashboard = pathname.startsWith('/dashboard');
  
  // NEW: Percy Intelligence Integration
  const { generateSmartResponse, trackBehavior, conversationPhase, conversionScore } = usePercyContext();
  const { isProcessingAnalysis } = useOnboarding();

  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isListening = focused || prompt.length > 0 || uploading || isProcessingAnalysis;
  const isBusy = uploading || isProcessingAnalysis;
  const themeCls = {
    container: theme === 'dark' ? 'cosmic-glass cosmic-gradient p-4 sm:p-6 rounded-2xl shadow-[0_0_32px_#1E90FF20]' : 'glass-card p-4 sm:p-6 shadow-xl',
    input: theme === 'dark' ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900',
    button: theme === 'dark' ? 'cosmic-btn-primary' : 'bg-blue-600 text-white',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    second: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    error: 'text-red-400',
    successBg: theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100',
    successText: theme === 'dark' ? 'text-green-400' : 'text-green-700',
  };

  const selectFile = () => fileRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { 
      setFile(f); 
      setError(''); 
      // Track file selection with Percy
      trackBehavior(BEHAVIOR_TYPES.FILE_UPLOAD, {
        fileName: f.name,
        fileType: f.type,
        fileSize: f.size,
        source: 'universal_prompt_bar'
      });
    }
  };
  
  const submitPromptOnly = async () => {
    if (!prompt.trim()) { setError('Enter prompt'); return; }
    setUploading(true);
    
    try {
      // Track prompt submission with Percy
      await trackBehavior(BEHAVIOR_TYPES.MESSAGE_SENT, {
        message: prompt,
        source: 'universal_prompt_bar',
        intentType
      });
      
      // Generate Percy's smart response
      const percyResponse = await generateSmartResponse(prompt, {
        source: 'universal_prompt_bar',
        fileCategory,
        intentType
      });
      
      // Show Percy's response if it includes subscription steering
      if (percyResponse?.hasSubscriptionOffer) {
        // You can add subscription UI here or pass to parent
        console.log('[Percy] Subscription opportunity:', percyResponse);
      }
      
      onPromptSubmit?.(prompt);
      onComplete?.({ prompt });
      setPrompt(''); 
      setSuccess(true);
      
    } catch (error) {
      console.error('Error in prompt submission:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setTimeout(() => { setSuccess(false); setUploading(false); }, 2000);
    }
  };
  const upload = async () => {
    if (!file && !prompt.trim()) { setError('Select file or enter prompt'); return; }
    if (!file && prompt.trim()) { submitPromptOnly(); return; }
    try {
      console.log('[SKRBL_AUTH_DEBUG_PROMPT_BAR] Upload started. Checking for user...');
      setUploading(true); setProgress(10);
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[SKRBL_AUTH_DEBUG_PROMPT_BAR] supabase.auth.getUser() result:', user);
      if (!user) throw new Error('Login required');
      const path = `${intentType}/${user.id}/${fileCategory}/${Date.now()}_${file!.name}`;
      setProgress(30);
      const res = await uploadFileToStorage(file!, path);
      if (!res.success || !res.url) throw new Error('Upload failed');
      setProgress(70);
      const meta = { ...res, userPrompt: prompt.trim() };
      if (onFileUpload) onFileUpload(res.url, meta);
      else await supabase.from('agent_jobs').insert({ ...meta, category: fileCategory, intentType });
      onComplete?.({ prompt, fileUrl: res.url, fileName: file!.name, fileType: file!.type, fileSize: file!.size });
      setProgress(100); setSuccess(true); setFile(null); setPrompt('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      console.error('[SKRBL_AUTH_DEBUG_PROMPT_BAR] Upload failed with error:', e);
      setError(e.message||'Error');
    } finally { setUploading(false); }
  };

  const render = () => (
    <>
      <AnimatePresence>
  {success && (
    <motion.div
      key="success-banner"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      role="status"
      aria-live="polite"
      className="text-center z-10"
    >
      <div className="cosmic-glass cosmic-gradient border-2 border-teal-400 shadow-[0_0_24px_#30D5C880] flex items-center justify-center gap-2 p-3 rounded-xl mb-4">
        <span className="inline-block text-green-400 text-xl">🌟</span>
        <p className="font-bold text-green-300 drop-shadow">Success!</p>
      </div>
    </motion.div>
  )}
</AnimatePresence>
      {!minimalUI && <div className="flex items-center mb-4"><div className="mr-3">{icon}</div><div><h2 className={`text-xl ${themeCls.text}`}>{title}</h2><p className={themeCls.second}>{description}</p></div></div>}
      {showPrompt && (
        <div className="mb-4">
          <label htmlFor="uprompt" className={`block text-sm ${themeCls.text} mb-1`}>{promptLabel}</label>
          <textarea
            id="uprompt"
            title={placeholder}
            placeholder={placeholder}
            value={prompt}
            onFocus={()=>setFocused(true)}
            onBlur={()=>setFocused(false)}
            onChange={e=>setPrompt(e.target.value)}
            disabled={isBusy}
            aria-disabled={isBusy}
            className={`w-full ${themeCls.input} rounded p-2 h-24 ${isBusy ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
          {isProcessingAnalysis && (
            <div className="mt-2 h-2 w-24 rounded bg-white/10 animate-pulse" aria-hidden="true" />
          )}
          {isListening && <p className="text-xs text-electric-blue animate-pulse">Percy is listening…</p>}
        </div>
      )}
      {file ? (
  <div className="mb-4">
    <p className="truncate text-white flex items-center gap-2"><span className="text-lg">📄</span>{file.name}</p>
    <motion.button
      onClick={upload}
      disabled={isBusy}
      whileHover={{ scale: 1.02 }}
      className={`mt-2 ${isBusy ? 'bg-gray-500' : ' ' + themeCls.button} px-4 py-2 rounded ${isBusy ? 'opacity-50 animate-pulse cursor-not-allowed' : ''}`}
    >
      {isBusy ? (uploading ? 'Sending...' : 'Analyzing...') : buttonText}
    </motion.button>
  </div>
) : (
  <motion.button
    onClick={selectFile}
    disabled={isBusy}
    whileHover={{ scale: 1.03 }}
    className={`w-full py-8 border-2 border-dashed border-teal-400/40 rounded-2xl flex flex-col items-center justify-center cosmic-glass cosmic-gradient shadow-[0_0_24px_#30D5C880] transition hover:shadow-[0_0_40px_#30D5C8] relative mb-4 ${isBusy ? 'opacity-60 cursor-not-allowed' : ''}`}
    style={{ minHeight: 120 }}
    type="button"
    tabIndex={isBusy ? -1 : 0}
    aria-label="Select or drop a file to upload"
    aria-disabled={isBusy}
  >
    <span className="text-2xl mb-2 animate-bounce">🚀</span>
    <p className={`text-base font-semibold bg-gradient-to-r from-electric-blue via-teal-400 to-electric-blue bg-clip-text text-transparent drop-shadow`}>Drop or browse file</p>
    <input
      ref={fileRef}
      type="file"
      title={`Upload ${title} file`}
      aria-label={`Upload ${title} file`}
      accept={acceptedFileTypes}
      onChange={onFileChange}
      className="hidden"
    />
    <span className="absolute right-4 top-4 px-2 py-1 rounded-full bg-teal-600/80 text-xs text-white shadow-glow select-none">Premium Ready</span>
  </motion.button>
)}
      {prompt.trim() && !file && <motion.button onClick={submitPromptOnly} disabled={isBusy} whileHover={{scale:1.02}} className={`w-full py-2 rounded mt-4 ${themeCls.button} ${isBusy?'opacity-50 animate-pulse cursor-not-allowed':''}`}>{isBusy ? (uploading ? 'Sending...' : 'Analyzing...') : 'Submit'}</motion.button>}
      <AnimatePresence>
  {error && (
    <motion.div
      key="error-banner"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      role="alert"
      aria-live="assertive"
      className="z-10"
    >
      <div className="cosmic-glass border-2 border-red-400 shadow-[0_0_16px_#FF4C4C80] flex items-center gap-2 p-3 rounded-xl mt-2">
        <span className="inline-block text-red-400 text-xl">🚨</span>
        <span className="font-semibold text-red-300 drop-shadow">{error}</span>
      </div>
    </motion.div>
  )}
</AnimatePresence>
      {uploading && (
  <div className="w-full bg-gray-800/80 rounded h-2 mt-4 overflow-hidden relative">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: 'easeInOut' as const }}
      className="absolute left-0 top-0 h-full bg-gradient-to-r from-electric-blue via-teal-400 to-electric-blue shadow-[0_0_12px_#30D5C8] animate-pulse"
      style={{ borderRadius: 8 }}
    />
  </div>
)}
    </>
  );

  return (
    <AnimatePresence>
      <motion.div
        key={pathname}
        initial={{opacity:0,scale:0.95}}
        animate={{opacity:1,scale:1}}
        exit={{opacity:0,scale:0.95}}
        transition={{duration:0.3}}
        className={`${themeCls.container} relative ${className}`}
        aria-busy={isProcessingAnalysis}
      >
        {render()}
        {isProcessingAnalysis && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
