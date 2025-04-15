'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '@/utils/firebase';

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
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to upload files');
      }

      // Upload to Firebase Storage
      const storage = getStorage();
      const fileRef = ref(storage, `${intentType}/${user.uid}/${fileCategory}/${Date.now()}_${file.name}`);
      
      setProgress(30);
      await uploadBytes(fileRef, file);
      
      setProgress(70);
      const downloadURL = await getDownloadURL(fileRef);
      
      // Create a job in Firestore
      const db = getFirestore();
      const jobRef = await addDoc(collection(db, 'agent_jobs'), {
        userId: user.uid,
        title: `${title} - ${file.name}`,
        fileUrl: downloadURL,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        category: fileCategory,
        intentType: intentType,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        progress: 0
      });
      
      setProgress(100);
      setSuccess(true);
      setFile(null);
      
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
      
      <div className="mb-6">
        {file ? (
          <div className="p-4 border border-dashed border-electric-blue/50 rounded-lg bg-electric-blue/10">
            <div className="flex items-center justify-between">
              <span className="text-white truncate max-w-[80%]">{file.name}</span>
              <button 
                onClick={() => setFile(null)}
                className="text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={handleSelectFile}
            className="p-6 border border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-electric-blue/50 hover:bg-electric-blue/10 transition-all text-center"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept={acceptedFileTypes}
              onChange={handleFileChange}
              aria-label={`Upload ${title} file`}
              title={`Upload ${title} file`}
            />
            <p className="text-gray-400">Click to select a file or drag and drop</p>
            <p className="text-gray-500 text-sm mt-2">Supported formats: {acceptedFileTypes.replace(/\./g, '').toUpperCase()}</p>
          </div>
        )}
        
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>
      
      {uploading ? (
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
          <div 
            className={`bg-gradient-to-r from-electric-blue to-teal-400 h-2.5 rounded-full transition-all duration-300 w-[${progress}%]`}
          ></div>
          <p className="text-gray-400 text-center mt-2">Uploading... {progress}%</p>
        </div>
      ) : success ? (
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
      ) : (
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUpload}
          disabled={!file}
          className={`w-full py-3 px-4 rounded-lg ${
            file 
              ? 'bg-gradient-to-r from-electric-blue to-teal-400 text-white' 
              : 'bg-gray-700 text-gray-400'
          } font-medium transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(165,120,255,0.75)]`}
        >
          {file ? 'Upload File' : 'Select a File First'}
        </motion.button>
      )}
    </motion.div>
  );
}
