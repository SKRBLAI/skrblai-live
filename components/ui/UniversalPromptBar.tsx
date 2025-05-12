'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { uploadFileToStorage } from '@/utils/supabase-helpers';
import { supabase } from '@/utils/supabase';

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
  title = "Upload File",
  description = "Upload a file and provide optional instructions.",
  icon,
  acceptedFileTypes = ".pdf,.doc,.docx,.txt",
  fileCategory = "document",
  intentType = "process",
  placeholder = "How would you like us to handle your file? Any specific instructions or requirements?",
  promptLabel = "Describe your request (optional):",
  showPrompt = true,
  buttonText = "Upload",
  onPromptSubmit,
  onFileUpload,
  onComplete,
  compact = false,
  minimalUI = false,
  className = "",
  theme = 'dark'
}: UniversalPromptBarProps) {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine theme-based classes
  const themeClasses = {
    container: theme === 'dark' ? 'glass-card' : 'bg-white shadow-lg',
    input: theme === 'dark' 
      ? 'bg-white/5 border border-white/10 text-white focus:ring-electric-blue/50' 
      : 'bg-gray-50 border border-gray-200 text-gray-900 focus:ring-blue-500',
    button: theme === 'dark'
      ? 'bg-gradient-to-r from-electric-blue to-teal-400 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    secondaryText: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    errorText: 'text-red-400',
    successBg: theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100',
    successText: theme === 'dark' ? 'text-green-400' : 'text-green-700',
  };

  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmitPromptOnly = () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (onPromptSubmit) {
      onPromptSubmit(prompt);
    }

    if (onComplete) {
      onComplete({ prompt });
    }

    // Reset if needed
    setPrompt('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleUpload = async () => {
    if (!file && !prompt.trim()) {
      setError('Please select a file or enter a prompt');
      return;
    }

    // If there's only a prompt and no file, just submit the prompt
    if (!file && prompt.trim()) {
      handleSubmitPromptOnly();
      return;
    }

    try {
      setUploading(true);
      setProgress(10);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload files');
      }

      // Upload file path
      const filePath = `${intentType}/${user.id}/${fileCategory}/${Date.now()}_${file!.name}`;
      
      setProgress(30);
      // Upload to Supabase Storage
      const result = await uploadFileToStorage(file!, filePath);
      
      if (!result.success || !result.url) {
        throw new Error('Failed to upload file');
      }
      
      setProgress(70);
      
      const fileMetadata = {
        userId: user.id,
        title: file ? `${title} - ${file.name}` : title,
        fileUrl: result.url,
        fileName: file!.name,
        fileType: file!.type,
        fileSize: file!.size,
        category: fileCategory,
        intentType: intentType,
        userPrompt: prompt.trim() || `Process this ${fileCategory} file`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0
      };

      // If we're not supposed to handle the agent job creation ourselves,
      // just call the callback
      if (onFileUpload) {
        onFileUpload(result.url, fileMetadata);
      } else {
        // Create a job in Supabase
        const { error: jobError } = await supabase
          .from('agent_jobs')
          .insert(fileMetadata);
          
        if (jobError) throw jobError;
      }
      
      if (onComplete) {
        onComplete({ 
          prompt, 
          fileUrl: result.url, 
          fileName: file!.name, 
          fileType: file!.type, 
          fileSize: file!.size 
        });
      }
      
      setProgress(100);
      setSuccess(true);
      setFile(null);
      setPrompt(''); // Clear the prompt after successful upload
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  // Compact version rendering
  if (compact) {
    return (
      <div className={`${themeClasses.container} rounded-lg p-4 ${className}`}>
        <div className="flex flex-col md:flex-row gap-3">
          {showPrompt && (
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              className={`${themeClasses.input} rounded-lg p-2 flex-grow focus:outline-none focus:ring-2`}
            />
          )}
          
          <div className="flex gap-2">
            <button
              onClick={handleSelectFile}
              className={`${themeClasses.button} rounded-lg px-4 py-2 flex items-center justify-center`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {file ? file.name.substring(0, 15) + (file.name.length > 15 ? '...' : '') : 'File'}
            </button>
            
            <button
              onClick={handleUpload}
              disabled={uploading || (!file && !prompt.trim())}
              className={`${themeClasses.button} rounded-lg px-4 py-2`}
            >
              {buttonText}
            </button>
          </div>
        </div>
        
        {uploading && (
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
            <div 
              className={`bg-gradient-to-r from-electric-blue to-teal-400 h-1.5 rounded-full transition-all duration-300 w-[${progress}%]`}
            ></div>
          </div>
        )}
        
        {error && <p className={`${themeClasses.errorText} mt-2 text-xs`}>{error}</p>}
        {success && <p className={`${themeClasses.successText} mt-2 text-xs`}>Successfully processed!</p>}
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          className="hidden"
          title={`Upload ${title} file`}
          aria-label={`Upload ${title} file`}
        />
      </div>
    );
  }

  // Minimal UI version
  if (minimalUI) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col gap-2">
          {showPrompt && (
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              className={`${themeClasses.input} rounded-lg p-3 w-full h-20 focus:outline-none focus:ring-2`}
            ></textarea>
          )}
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectFile}
              className={`p-2 rounded-lg ${themeClasses.button}`}
              title="Select a file to upload"
              aria-label="Select a file to upload"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>
            
            {file && (
              <span className={`${themeClasses.text} text-sm truncate max-w-[120px]`}>
                {file.name}
              </span>
            )}
            
            <button
              onClick={handleUpload}
              disabled={uploading || (!file && !prompt.trim())}
              className={`${themeClasses.button} rounded-lg px-4 py-2 ml-auto`}
            >
              {uploading ? 'Processing...' : buttonText}
            </button>
          </div>
        </div>
        
        {uploading && (
          <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
            <div 
              className={`bg-gradient-to-r from-electric-blue to-teal-400 h-1 rounded-full transition-all duration-300 w-[${progress}%]`}
            ></div>
          </div>
        )}
        
        {error && <p className={`${themeClasses.errorText} mt-2 text-xs`}>{error}</p>}
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          className="hidden"
          title={`Upload ${title} file`}
          aria-label={`Upload ${title} file`}
        />
      </div>
    );
  }

  // Full/Default UI
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`${themeClasses.container} p-6 rounded-xl ${className}`}
    >
      {!minimalUI && (
        <>
          <div className="flex items-center mb-4">
            {icon && (
              <div className="w-10 h-10 rounded-full bg-electric-blue flex items-center justify-center mr-3">
                {icon}
              </div>
            )}
            <h2 className={`text-xl font-semibold ${themeClasses.text}`}>{title}</h2>
          </div>
          
          <p className={themeClasses.secondaryText}>{description}</p>
        </>
      )}
      
      <div className="mt-4 space-y-4">
        {/* Text prompt area */}
        {showPrompt && (
          <div className="mb-4">
            <label htmlFor={`prompt-${fileCategory}`} className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
              {promptLabel}
            </label>
            <textarea
              id={`prompt-${fileCategory}`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              className={`w-full ${themeClasses.input} rounded-lg p-3 h-24 focus:outline-none focus:ring-2 transition-all duration-300`}
            ></textarea>
          </div>
        )}
        
        {file ? (
          <div className="flex flex-col">
            <div className="flex items-center justify-between py-2 px-3 bg-white/10 rounded-lg">
              <div className="flex items-center space-x-2 text-white truncate">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate max-w-[180px]">{file.name}</span>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-white"
                aria-label="Remove file"
                title="Remove file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              disabled={uploading}
              className={`mt-4 w-full py-2 rounded-lg font-medium transition-all ${uploading ? 'bg-white/10 text-white/50 cursor-not-allowed' : themeClasses.button}`}
            >
              {uploading ? 'Uploading...' : buttonText}
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSelectFile}
            className="w-full border-2 border-dashed border-white/20 rounded-lg py-6 px-4 flex flex-col items-center justify-center hover:border-electric-blue/40 hover:bg-white/5 transition-all"
            aria-label="Select file to upload"
          >
            <svg className="w-10 h-10 text-electric-blue mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className={`text-sm font-medium ${themeClasses.text}`}>Drop file here or click to browse</span>
            <span className={`text-xs ${themeClasses.secondaryText} mt-1`}>
              Supported formats: {acceptedFileTypes.replace(/\./g, ' ')}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFileTypes}
              onChange={handleFileChange}
              className="hidden"
              title={`Upload ${title} file`}
              aria-label={`Upload ${title} file`}
            />
          </motion.button>
        )}
        
        {/* Submit prompt only button when there's no file selected */}
        {!file && prompt.trim().length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitPromptOnly}
            className={`mt-4 w-full py-2 rounded-lg font-medium transition-all ${themeClasses.button}`}
          >
            Submit
          </motion.button>
        )}
        
        {uploading && (
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
            <div 
              className="bg-gradient-to-r from-electric-blue to-teal-400 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
            <p className={`${themeClasses.secondaryText} text-center mt-2`}>Uploading... {progress}%</p>
          </div>
        )}
        
        {error && <p className={`${themeClasses.errorText} mt-2 text-sm`}>{error}</p>}
      </div>
      
      {success && (
        <div className="text-center">
          <div className={`${themeClasses.successBg} p-3 rounded-lg mb-4`}>
            <p className={themeClasses.successText}>Upload successful! Your file is being processed.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSuccess(false)}
            className={`py-3 px-4 rounded-lg ${themeClasses.button} font-medium w-full`}
          >
            Upload Another
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
