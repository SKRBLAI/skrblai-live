/** Book Publishing Enhancements - Prompt Input + File Upload - April 2025 */

'use client';

export const dynamic = 'force-dynamic';

import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DownloadCenter from '@/components/dashboard/DownloadCenter';
import FileUploadCard from '@/components/dashboard/FileUploadCard';
import { useCallback, useEffect, useState, CSSProperties } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app, storage } from '@/utils/firebase';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import '@/styles/components/BookPublishing.css';
import type { BookPublishingState, FileUploadStatus } from '@/types/book-publishing';

export default function BookPublishingDashboard() {
  const [isLoading, setIsLoading] = useState(true);
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
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setState(prev => ({
      ...prev,
      uploadedFile: file,
      uploadedFileName: file.name
    }));

    const storageRef = ref(storage, `manuscripts/${file.name}`);
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

    // Mock response - replace with actual API call
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

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-electric-blue/30 mb-4"></div>
          <div className="h-4 w-24 bg-electric-blue/30 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-navy">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white text-3xl font-bold mb-6 drop-shadow-[0_0_6px_rgba(165,120,255,0.75)]"
            >
              Book Publishing
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-300 mb-8"
            >
              Your book publishing journey starts here. Let's bring your story to life.
            </motion.p>
            
            <div className="prompt-input-container">
              <h2 className="text-2xl font-bold text-white mb-4">Tell Us About Your Book</h2>
              <p className="text-gray-300 mb-6">Share your vision or upload your manuscript to get started.</p>
              
              <textarea
                className="prompt-input"
                placeholder="Tell us what you need help publishing..."
                value={state.prompt}
                onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
              />

              <div className="mt-6">
                <div {...getRootProps()} className={`file-drop-zone ${isDragActive ? 'dragging' : ''}`}>
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p className="text-white">Drop your manuscript here...</p>
                  ) : (
                    <p className="text-gray-300">
                      Drag & drop your manuscript here, or click to select
                      <br />
                      <span className="text-sm text-gray-400">(.doc, .docx, .pdf, .txt)</span>
                    </p>
                  )}
                </div>

                {state.uploadedFile && (
                  <div className="file-preview">
                    <svg className="file-preview-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="file-preview-info">
                      <p className="text-white font-medium">{state.uploadedFileName}</p>
                      {uploadStatus.progress < 100 && (
                        <div className="upload-progress-bar">
                          <div
                            className="upload-progress-bar-fill"
                            style={{ ['--upload-progress' as string]: `${uploadStatus.progress}%` }}
                          />
                        </div>
                      )}
                      {uploadStatus.error && (
                        <p className="text-red-400 text-sm mt-1">{uploadStatus.error}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="file-preview-remove"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <motion.button
                className="action-button mt-6"
                onClick={handlePromptSubmit}
                disabled={!state.prompt.trim() && !state.uploadedFile}
                whileHover={{ scale: state.isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: state.isSubmitting ? 1 : 0.98 }}
              >
                {state.isSubmitting ? 'Generating Plan...' : 'Generate Plan of Action'}
              </motion.button>

              <AnimatePresence>
                {state.response && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="response-panel"
                  >
                    <h3 className="text-xl font-semibold text-white mb-4">Your Publishing Plan</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-white font-medium mb-2">Timeline & Steps</h4>
                        <div className="space-y-3">
                          {state.response.steps.map((step, index) => (
                            <div key={index} className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-electric-blue flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="text-white font-bold">{index + 1}</span>
                              </div>
                              <div>
                                <h5 className="text-white font-medium">{step.title}</h5>
                                <p className="text-gray-400 text-sm">{step.description}</p>
                                <p className="text-electric-blue text-sm mt-1">{step.timeline}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-medium mb-2">Recommendations</h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                          {state.response.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-white font-medium mb-2">Next Steps</h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                          {state.response.nextSteps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-white/10">
                        <p className="text-gray-400">
                          Estimated completion time: 
                          <span className="text-electric-blue font-medium ml-2">
                            {state.response.estimatedCompletion}
                          </span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="glass-card p-6 rounded-xl"
              >
                <h2 className="text-xl font-semibold mb-4 text-white">Publishing Steps</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-electric-blue flex items-center justify-center mr-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Manuscript Review</h3>
                      <p className="text-gray-400 text-sm">Upload your manuscript for AI analysis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Editing & Formatting</h3>
                      <p className="text-gray-400 text-sm">AI-powered editing and formatting</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Cover Design</h3>
                      <p className="text-gray-400 text-sm">Generate cover options with AI</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Publishing & Distribution</h3>
                      <p className="text-gray-400 text-sm">Get your book to market</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="glass-card p-6 rounded-xl"
              >
                <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-medium"
                  >
                    Upload Manuscript
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20"
                  >
                    Generate Book Cover
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20"
                  >
                    Book Marketing Plan
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20"
                  >
                    Schedule Consultation
                  </motion.button>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="glass-card p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Resources & Downloads</h2>
              <DownloadCenter />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="glass-card p-6 rounded-xl mt-6 text-center"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Need More Publishing Services?</h2>
              <p className="text-gray-300 mb-4">Get a personalized publishing plan with our AI assistant</p>
              <a href="/?intent=publish_book#percy" className="inline-block">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  className="py-3 px-6 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-medium"
                >
                  Get Started
                </motion.button>
              </a>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
