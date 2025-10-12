'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { getBrowserSupabase } from '@/lib/supabase';
import PercyAvatar from '../ui/PercyAvatar';
import type { BookPublishingState, FileUploadStatus, BookPublishingResponse } from '@/types/book-publishing';
import classNames from 'classnames';
import Link from 'next/link';
import PageLayout from '../layout/PageLayout';

type StepType = BookPublishingResponse['steps'][number];

const initialState: BookPublishingState = {
  prompt: '',
  uploadedFile: null,
  uploadedFileName: '',
  uploadedFileUrl: '',
  isSubmitting: false,
  response: null
};

export default function PublishingAssistantPanel({ className = '' }: { className?: string }) {
  const [state, setState] = useState(initialState);
  const [uploadStatus, setUploadStatus] = useState<FileUploadStatus>({ progress: 0, success: false });
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [aiAnalysisStage, setAiAnalysisStage] = useState(0);

  const aiStages = [
    'Analyzing manuscript structure...',
    'Evaluating writing style...',
    'Generating publishing recommendations...',
    'Creating distribution strategy...'
  ];

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    setState(prev => ({ ...prev, uploadedFile: file, uploadedFileName: file.name }));
    
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    try {
      // Create a FormData object to track upload progress
      const formData = new FormData();
      formData.append('file', file);
      
      // Use XHR to track progress
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadStatus(prev => ({ ...prev, progress }));
        }
      });
      
      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Upload to Supabase storage
          const supabase = getBrowserSupabase();
          if (!supabase) {
            throw new Error('Database unavailable');
          }

          const { data, error } = await supabase.storage
            .from('public-manuscripts')
            .upload(fileName, file);
            
          if (error) throw error;
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('public-manuscripts')
            .getPublicUrl(fileName);
            
          setState(prev => ({
            ...prev,
            uploadedFileUrl: urlData.publicUrl
          }));
          setUploadStatus(prev => ({ ...prev, success: true }));
        } else {
          throw new Error('Upload failed');
        }
      });
      
      xhr.addEventListener('error', () => {
        setUploadStatus(prev => ({ ...prev, error: 'Upload failed' }));
      });
      
      // Simulate upload with XHR (this is just for progress tracking)
      xhr.open('POST', '/api/dummy-upload');
      xhr.send(formData);
      
    } catch (error: any) {
      setUploadStatus(prev => ({ ...prev, error: error.message }));
    }
  }, [setState, setUploadStatus]);

  const removeFile = useCallback(() => {
    setState(prev => ({ ...prev, uploadedFile: null, uploadedFileName: '', uploadedFileUrl: '' }));
    setUploadStatus({ progress: 0, success: false });
  }, []);

  const handlePromptSubmit = useCallback(() => {
    if (!state.prompt.trim() && !state.uploadedFile) return;
    setState(prev => ({ ...prev, isSubmitting: true }));
    setIsTyping(true);
    setCurrentStep(3);

    // Animate through AI analysis stages
    const maxStages = aiStages.length;
    const stageInterval = setInterval(() => {
      setAiAnalysisStage(prev => {
        if (prev >= maxStages - 1) {
          clearInterval(stageInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    setTimeout(() => {
      setIsTyping(false);
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        response: {
          steps: [
            { title: 'Initial Review', description: 'AI-powered analysis', timeline: '1-2 days' },
            { title: 'Content Editing', description: 'Enhance clarity and style', timeline: '3-5 days' },
            { title: 'Publishing Prep', description: 'Final formatting and export', timeline: '2-3 days' }
          ],
          recommendations: ['Add more depth to Chapter 1', 'Clarify your protagonist\'s journey'],
          nextSteps: ['Review edits', 'Upload final draft'],
          estimatedCompletion: '7-10 days'
        }
      }));
    }, 1500);
  }, [state.prompt, state.uploadedFile, aiStages.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1
  });

  return (
    <PageLayout title="Book Publishing Assistant">
      <div className={`glass-panel p-8 rounded-3xl ${className}`}>
        <motion.div 
          className={`publishing-panel glass-card p-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="steps-indicator mb-6 flex justify-between items-center">
            {[1, 2, 3].map((step) => (
              <motion.div
                key={step}
                className={`step-circle ${currentStep >= step ? 'active' : ''}`}
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: currentStep === step ? 1.1 : 1,
                  backgroundColor: currentStep >= step ? '#3B82F6' : '#1F2937'
                }}
              >
                {step}
              </motion.div>
            ))}
          </div>
          
          <motion.h2 
            className="text-2xl text-white font-semibold mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {currentStep === 1 ? 'Describe Your Book' :
             currentStep === 2 ? 'Upload Your Manuscript' :
             'AI Analysis & Publishing Plan'}
          </motion.h2>
          <textarea
            className="w-full bg-black/20 text-white rounded-lg p-4 mb-4"
            value={state.prompt}
            placeholder="Describe your book concept, genre, or story..."
            onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
          />
          <div {...getRootProps()} className="border-dashed border-2 border-blue-300 p-6 mb-4 cursor-pointer">
            <input {...getInputProps()} />
            <p className="text-white">{isDragActive ? 'Drop the file...' : 'Drag & drop a manuscript, or click to select file'}</p>
          </div>
          {state.uploadedFile && (
            <div className="text-white mb-4">
              <strong>Uploaded:</strong> {state.uploadedFileName}
              <button onClick={removeFile} className="ml-4 text-red-500 underline">Remove</button>
            </div>
          )}
          <button onClick={handlePromptSubmit} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
            {state.isSubmitting ? 'Analyzing...' : 'Submit to Percy'}
          </button>
          <AnimatePresence>
            {state.response && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 bg-white/10 p-4 rounded-xl"
              >
                <div className="flex items-center mb-4">
                  <PercyAvatar size="sm" />
                  <div className="ml-3">
                    <h3 className="text-white font-bold">AI Analysis Complete</h3>
                    <p className="text-blue-400 text-sm">Publishing plan generated</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {aiStages.map((stage, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: aiAnalysisStage >= index ? 1 : 0.5,
                        x: aiAnalysisStage >= index ? 0 : -10
                      }}
                      className={`flex items-center ${aiAnalysisStage >= index ? 'text-white' : 'text-gray-500'}`}
                    >
                      <div className={`w-2 h-2 rounded-full mr-3 ${aiAnalysisStage >= index ? 'bg-blue-500' : 'bg-gray-600'}`} />
                      {stage}
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  className="mt-6 space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h4 className="text-lg font-semibold text-white">Publishing Plan</h4>
                  <ul className="space-y-3">
                    {state.response.steps.map((s, i) => (
                      <li key={i} className="flex flex-col text-white gap-1">
                        <div>
                          <strong>{s.title}:</strong>
                          <span>{s.description}</span>
                          <span>Timeline: {s.timeline}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageLayout>
  );
}
