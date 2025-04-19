'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '@/utils/firebase';
import '@/styles/components/BookPublishing.css';
import type { BookPublishingState, FileUploadStatus } from '@/types/book-publishing';

export default function BookPublishingPage() {
  const [state, setState] = useState<BookPublishingState>({
    prompt: '',
    uploadedFile: null,
    uploadedFileName: '',
    uploadedFileUrl: '',
    isSubmitting: false,
    response: null
  });
  
  const [uploadStatus, setUploadStatus] = useState<FileUploadStatus>({
    progress: 0,
    success: false
  });
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setState(prev => ({
      ...prev,
      uploadedFile: file,
      uploadedFileName: file.name
    }));

    try {
      const storage = getStorage(app);
      const storageRef = ref(storage, `public-manuscripts/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadStatus(prev => ({ ...prev, progress }));
        },
        (error) => {
          setUploadStatus(prev => ({ ...prev, error: error.message }));
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setState(prev => ({
            ...prev,
            uploadedFileUrl: downloadURL
          }));
          setUploadStatus(prev => ({ ...prev, success: true }));
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus(prev => ({ ...prev, error: 'Failed to upload file. Please try again.' }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const handlePromptSubmit = async () => {
    if (!state.prompt.trim() && !state.uploadedFile) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    // Simulate API call - would be replaced with actual backend call
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        response: {
          steps: [
            {
              title: 'Initial Review',
              description: 'AI-powered analysis of your manuscript',
              timeline: '1-2 days'
            },
            {
              title: 'Content Enhancement',
              description: 'Style and clarity improvements',
              timeline: '3-5 days'
            },
            {
              title: 'Publishing Preparation',
              description: 'Formatting and metadata optimization',
              timeline: '2-3 days'
            }
          ],
          recommendations: [
            'Consider strengthening the opening chapter',
            'Add more character development in chapter 3',
            'Enhance dialogue authenticity'
          ],
          nextSteps: [
            'Review AI suggestions',
            'Schedule consultation',
            'Begin cover design process'
          ],
          estimatedCompletion: '2 weeks'
        }
      }));
    }, 2000);
  };

  const removeFile = () => {
    setState(prev => ({
      ...prev,
      uploadedFile: null,
      uploadedFileName: '',
      uploadedFileUrl: ''
    }));
    setUploadStatus({
      progress: 0,
      success: false
    });
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white text-4xl md:text-5xl font-bold mb-4 drop-shadow-[0_0_6px_rgba(165,120,255,0.75)]"
          >
            AI-Powered Book Publishing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            Turn your manuscript into a published book with our cutting-edge AI publishing platform
          </motion.p>
        </div>

        {/* Main content section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-8 rounded-2xl"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">How It Works</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center text-electric-blue font-bold">
                  1
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium text-white">Upload Your Manuscript</h3>
                  <p className="mt-1 text-gray-400">Upload your manuscript in any format. Our AI will analyze and prepare it for publishing.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center text-electric-blue font-bold">
                  2
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium text-white">AI Enhancement</h3>
                  <p className="mt-1 text-gray-400">Our AI will suggest formatting improvements, cover designs, and metadata optimization.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center text-electric-blue font-bold">
                  3
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium text-white">Global Distribution</h3>
                  <p className="mt-1 text-gray-400">Publish your book across all major platforms like Amazon, Apple Books, and more with one click.</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card p-8 rounded-2xl"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">Platform Features</h2>
            <ul className="space-y-4">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-electric-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">AI-powered cover design generation</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-electric-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Automated formatting and typesetting</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-electric-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">SEO-optimized book descriptions</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-electric-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Metadata optimization for discoverability</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-electric-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Multi-platform publishing with one click</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-electric-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Real-time sales dashboard and analytics</span>
              </li>
            </ul>
          </motion.div>
        </div>
        
        {/* Interactive Manuscript Submission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-16"
        >
          <div className="glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Get Your Publishing Plan</h2>
            
            <div className="prompt-input-container">
              <h3 className="text-xl font-medium text-white mb-4">Describe Your Book</h3>
              <textarea
                className="prompt-input"
                placeholder="Tell us about your book idea, genre, target audience, or any specific requirements..."
                value={state.prompt}
                onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
              />
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-medium text-white mb-4">Upload Your Manuscript</h3>
              {!state.uploadedFile ? (
                <div {...getRootProps()} className={`file-drop-zone ${isDragActive ? 'dragging' : ''}`}>
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p className="text-white">Drop your manuscript here...</p>
                  ) : (
                    <div>
                      <p className="text-gray-300 mb-2">Drag & drop your manuscript or click to select</p>
                      <p className="text-gray-400 text-sm">Supported formats: PDF, DOCX, DOC, TXT</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="file-preview">
                  <div className="file-preview-content">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-white font-medium">{state.uploadedFileName}</p>
                      {uploadStatus.progress < 100 && !uploadStatus.success && (
                        <div className="upload-progress-bar">
                          <div
                            className="upload-progress-bar-fill"
                            data-progress={`${uploadStatus.progress}%`}
                          />
                        </div>
                      )}
                      {uploadStatus.success && (
                        <p className="text-green-400 text-sm">Upload complete</p>
                      )}
                      {uploadStatus.error && (
                        <p className="text-red-400 text-sm">{uploadStatus.error}</p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={removeFile}
                    className="text-gray-400 hover:text-white"
                    aria-label="Remove file"
                    title="Remove file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="text-center">
              <button 
                onClick={handlePromptSubmit}
                disabled={state.isSubmitting || (!state.prompt && !state.uploadedFile)}
                className={`bg-electric-blue hover:shadow-lg text-white font-semibold px-6 py-3 rounded-lg transition-all
                  duration-300 hover:drop-shadow-[0_0_8px_rgba(165,120,255,0.75)] transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {state.isSubmitting ? 'Processing...' : 'Get Publishing Plan'}
              </button>
            </div>

            {/* Response Display */}
            <AnimatePresence>
              {state.response && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="response-panel mt-8"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Your Publishing Plan</h3>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-electric-blue mb-2">Publishing Steps</h4>
                    <div className="space-y-4">
                      {state.response.steps.map((step, index) => (
                        <div key={index} className="publish-step">
                          <div className="step-number">{index + 1}</div>
                          <div>
                            <h5 className="text-white font-medium">{step.title}</h5>
                            <p className="text-gray-400">{step.description}</p>
                            <p className="text-sm text-electric-blue">Timeline: {step.timeline}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-electric-blue mb-2">Recommendations</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {state.response.recommendations.map((rec, index) => (
                        <li key={index} className="text-gray-300">{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-electric-blue mb-2">Next Steps</h4>
                    <ol className="list-decimal pl-5 space-y-1">
                      {state.response.nextSteps.map((step, index) => (
                        <li key={index} className="text-gray-300">{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-electric-blue/10 p-4 rounded-lg text-center">
                    <p className="text-white">Estimated completion: <span className="font-bold">{state.response.estimatedCompletion}</span></p>
                    <Link href="/signup">
                      <button className="mt-4 bg-electric-blue hover:shadow-lg text-white font-semibold px-6 py-2 rounded-lg transition-all
                        duration-300 hover:drop-shadow-[0_0_8px_rgba(165,120,255,0.75)] transform hover:scale-105">
                        Create Account to Continue
                      </button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* CTA section */}
        {!state.response && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-center"
          >
            <h2 className="text-white text-3xl font-bold mb-6 drop-shadow-[0_0_6px_rgba(165,120,255,0.75)]">Ready to Publish Your Book?</h2>
            <Link href="/signup">
              <button className="bg-electric-blue hover:shadow-lg text-white font-semibold px-6 py-3 rounded-lg transition-all
                duration-300 hover:drop-shadow-[0_0_8px_rgba(165,120,255,0.75)] transform hover:scale-105">
                Create Free Account
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 