'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '@/utils/firebase';
import PercyAvatar from '@/components/home/PercyAvatar';
import type { BookPublishingState, FileUploadStatus, BookPublishingResponse } from '@/types/book-publishing';
import classNames from 'classnames';
import Link from 'next/link';

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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setState(prev => ({ ...prev, uploadedFile: file, uploadedFileName: file.name }));
    const storage = getStorage(app);
    const storageRef = ref(storage, `public-manuscripts/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed',
      (snapshot) => setUploadStatus(prev => ({ ...prev, progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100 })),
      (error) => setUploadStatus(prev => ({ ...prev, error: error.message })),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setState(prev => ({ ...prev, uploadedFileUrl: url }));
        setUploadStatus(prev => ({ ...prev, success: true }));
      });
  }, []);

  const removeFile = useCallback(() => {
    setState(prev => ({ ...prev, uploadedFile: null, uploadedFileName: '', uploadedFileUrl: '' }));
    setUploadStatus({ progress: 0, success: false });
  }, []);

  const handlePromptSubmit = useCallback(() => {
    if (!state.prompt.trim() && !state.uploadedFile) return;
    setState(prev => ({ ...prev, isSubmitting: true }));
    setIsTyping(true);
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
          recommendations: ['Add more depth to Chapter 1', 'Clarify your protagonist’s journey'],
          nextSteps: ['Review edits', 'Upload final draft'],
          estimatedCompletion: '7-10 days'
        }
      }));
    }, 1500);
  }, [state.prompt, state.uploadedFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1
  });

  return (
    <div className={`publishing-panel glass-card p-6 ${className}`}>
      <h2 className="text-xl text-white font-semibold mb-4">Upload or Describe Your Book</h2>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 bg-white/10 p-4 rounded-xl">
            <PercyAvatar size="sm" />
            <h3 className="text-white font-bold mb-2 mt-4">Publishing Plan</h3>
            <ul className="text-white space-y-2">
              {state.response.steps.map((s, i) => (
                <li key={i}><strong>{s.title}:</strong> {s.description} – <em>{s.timeline}</em></li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
