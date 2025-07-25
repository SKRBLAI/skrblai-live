'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { uploadFileToStorage } from '../../utils/supabase-helpers';
import { supabase } from '../../utils/supabase';

interface FileUploadProps {
  category: string;
  allowedFileTypes: string[];
  maxSizeMB: number;
  onUploadComplete: (fileUrl: string, metadata: any) => void;
}

export default function FileUpload({ 
  category,
  allowedFileTypes,
  maxSizeMB,
  onUploadComplete
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || '';
      if (!allowedFileTypes.includes(`.${fileExtension}`)) {
        setError(`Invalid file type. Allowed types: ${allowedFileTypes.join(', ')}`);
        return;
      }
      
      // Check file size
      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        setError(`File size exceeds ${maxSizeMB}MB limit`);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to upload files');
      return;
    }
    
    setUploading(true);
    setProgress(0);
    
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `${category}/${user.id}/${timestamp}_${file.name}`;
      
      // Start upload with progress simulation
      setProgress(10);
      
      // Upload file to Supabase storage
      const result = await uploadFileToStorage(file, fileName);
      
      setProgress(70);
      
      if (!result.success || !result.url) {
        throw new Error('Failed to upload file');
      }
      
      // Save file metadata to Supabase
      const fileData = {
        userId: user.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        category,
        storagePath: fileName,
        downloadURL: result.url,
        uploadedAt: new Date().toISOString()
      };
      
      const { data, error: saveError } = await supabase
        .from('user_files')
        .insert(fileData)
        .select();
      
      if (saveError) throw saveError;
      
      setProgress(100);
      
      // Reset state
      setUploading(false);
      setFile(null);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Callback with file data
      onUploadComplete(result.url, fileData);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file. Please try again.');
      setUploading(false);
    }
  };
  
  // Get appropriate title based on category
  const getCategoryTitle = () => {
    switch(category) {
      case 'manuscripts':
        return 'Upload Manuscript';
      case 'brand-assets':
        return 'Upload Brand Assets';
      case 'content':
        return 'Upload Content';
      default:
        return `Upload ${category}`;
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{getCategoryTitle()}</h3>
      
      <div className="space-y-4">
        {/* File input */}
        <div 
          className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-electric-blue transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept={allowedFileTypes.join(',')}
            title="Upload file"
            aria-label={`Upload ${category} file`}
          />
          
          <div className="text-gray-400">
            {file ? (
              <div className="text-white">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <>
                <p className="mb-2">Drag & drop or click to select a file</p>
                <p className="text-sm">
                  Accepted formats: {allowedFileTypes.join(', ')} (Max: {maxSizeMB}MB)
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}
        
        {/* Upload progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-electric-blue"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="text-sm text-gray-400 text-right">
              {Math.round(progress)}% uploaded
            </div>
          </div>
        )}
        
        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            !file || uploading
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-electric-blue text-white hover:bg-electric-blue/90'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>
    </div>
  );
}
