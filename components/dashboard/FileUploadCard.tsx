'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { uploadFileToStorage } from '@/utils/supabase-helpers';
import { supabase } from '@/utils/supabase';

interface FileUploadCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  acceptedFileTypes: string;
  fileCategory: string;
  intentType: string;
}

export default function FileUploadCard({
  title,
  description,
  icon,
  acceptedFileTypes,
  fileCategory,
  intentType
}: FileUploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
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
      const filePath = `${intentType}/${user.id}/${fileCategory}/${Date.now()}_${file.name}`;
      
      setProgress(30);
      // Upload to Supabase Storage
      const result = await uploadFileToStorage(file, filePath);
      
      if (!result.success || !result.url) {
        throw new Error('Failed to upload file');
      }
      
      setProgress(70);
      
      // Create a job in Supabase
      const { error: jobError } = await supabase
        .from('agent_jobs')
        .insert({
          userId: user.id,
          title: `${title} - ${file.name}`,
          fileUrl: result.url,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          category: fileCategory,
          intentType: intentType,
          userPrompt: prompt.trim() || `Process this ${fileCategory} file`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: 0
        });
        
      if (jobError) throw jobError;
      
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 rounded-xl"
    >
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-electric-blue flex items-center justify-center mr-3">
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      
      <p className="text-gray-400 mb-6">{description}</p>
      
      <div className="mt-4 space-y-4">
        {/* Text prompt area */}
        <div className="mb-4">
          <label htmlFor={`prompt-${fileCategory}`} className="block text-sm font-medium text-white mb-2">
            Describe your request (optional):
          </label>
          <textarea
            id={`prompt-${fileCategory}`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`How would you like us to handle your ${fileCategory}? Any specific instructions or requirements?`}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white h-24 focus:outline-none focus:ring-2 focus:ring-electric-blue/50 focus:border-transparent transition-all duration-300"
          ></textarea>
        </div>
        
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
              className={`mt-4 w-full py-2 rounded-lg font-medium transition-all ${uploading ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-gradient-to-r from-electric-blue to-teal-400 text-white'}`}
            >
              {uploading ? 'Uploading...' : 'Upload File'}
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
            <span className="text-sm text-white font-medium">Drop file here or click to browse</span>
            <span className="text-xs text-gray-400 mt-1">Supported formats: {acceptedFileTypes.replace(/\./g, ' ')}</span>
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
        
        {uploading && (
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
            <div 
              className={`bg-gradient-to-r from-electric-blue to-teal-400 h-2.5 rounded-full transition-all duration-300 w-[${progress}%]`}
            ></div>
            <p className="text-gray-400 text-center mt-2">Uploading... {progress}%</p>
          </div>
        )}
        
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>
      
      {success && (
        <div className="text-center">
          <div className="bg-green-500/20 p-3 rounded-lg mb-4">
            <p className="text-green-400">Upload successful! Your file is being processed.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSuccess(false)}
            className="py-3 px-4 rounded-lg bg-electric-blue text-white font-medium w-full"
          >
            Upload Another
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
