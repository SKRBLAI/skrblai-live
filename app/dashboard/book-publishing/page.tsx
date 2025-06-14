/** Book Publishing Enhancements - Prompt Input + File Upload - April 2025 */

'use client';

export const dynamic = 'force-dynamic';

import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DownloadCenter from '@/components/dashboard/DownloadCenter';
import FileUploadCard from '@/components/dashboard/FileUploadCard';
import { useCallback, useEffect, useState, CSSProperties } from 'react';
import { useAuth } from '@/components/context/AuthContext';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import '@/styles/components/BookPublishing.css';
import type { BookPublishingState, FileUploadStatus } from '@/types/book-publishing';
import agentRegistry from '@/lib/agents/agentRegistry';
import type { User } from '@supabase/supabase-js';

export default function BookPublishingDashboard() {
  const { user, session, isLoading: authIsLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [publishingProjects, setPublishingProjects] = useState<any[]>([]);
  const [workflowLogs, setWorkflowLogs] = useState<any[]>([]);
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

  useEffect(() => {
    if (!authIsLoading && !user) { // Check for user object
      router.push('/sign-in');
    }
  }, [authIsLoading, user, router]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setState(prev => ({
      ...prev,
      uploadedFile: file,
      uploadedFileName: file.name
    }));

    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `manuscripts/${fileName}`;

    try {
      setUploadStatus(prev => ({ ...prev, progress: 0 }));
      
      // Create form data to track upload progress
      const data = new FormData();
      data.append('file', file);
      
      // Custom upload with progress tracking
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadStatus(prev => ({ ...prev, progress }));
        }
      });
      
      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Once XHR upload is complete, use Supabase to store the file
          const { data, error } = await supabase.storage
            .from('manuscripts')
            .upload(fileName, file);
            
          if (error) throw error;
          
          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('manuscripts')
            .getPublicUrl(fileName);
            
          setState(prev => ({
            ...prev,
            uploadedFileUrl: urlData.publicUrl
          }));
          setUploadStatus(prev => ({ ...prev, success: true, progress: 100 }));
        } else {
          throw new Error('Upload failed');
        }
      });
      
      xhr.addEventListener('error', () => {
        setUploadStatus(prev => ({ ...prev, error: 'Upload failed' }));
      });
      
      // Start upload using XHR (this is just to track progress, the actual upload happens with Supabase)
      xhr.open('POST', '/api/dummy-upload');
      xhr.send(data);
      
    } catch (error: any) {
      setUploadStatus(prev => ({ ...prev, error: error.message }));
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
    if (!user) return;
    // Fetch user-specific publishing projects
    const fetchPublishing = async () => {
      const { data, error } = await supabase
        .from('publishing')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });
      if (!error) setPublishingProjects(data || []);
    };
    // Fetch workflow logs for this user
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('workflowLogs')
        .select('*')
        .eq('userId', user.id)
        .order('timestamp', { ascending: false });
      if (!error) setWorkflowLogs(data || []);
    };
    fetchPublishing();
    fetchLogs();
    // Real-time subscription for workflow logs
    const logsSub = supabase
      .channel('workflowLogs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workflowLogs', filter: `userId=eq.${user.id}` }, payload => {
        fetchLogs();
      })
      .subscribe();
    // Real-time subscription for publishing
    const publishingSub = supabase
      .channel('publishing')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'publishing', filter: `userId=eq.${user.id}` }, payload => {
        fetchPublishing();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(logsSub);
      supabase.removeChannel(publishingSub);
    };
  }, [user]);

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

  // Use agentRegistry for dynamic agent logic if needed
  // All publishingProjects and workflowLogs are now user-specific and real-time

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
                            data-progress={`${uploadStatus.progress}%`}
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
              <Link href="/?intent=publish_book#percy" className="inline-block">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  className="py-3 px-6 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-medium"
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-2">Your Publishing Projects</h2>
            {publishingProjects.length === 0 ? (
              <p className="text-gray-400">No publishing projects yet. Upload a manuscript or start a project to get started.</p>
            ) : (
              <ul className="space-y-2">
                {publishingProjects.map((item: any) => (
                  <li key={item.id} className="bg-white/10 p-3 rounded text-white">
                    <div className="font-semibold">{item.bookTitle || 'Untitled Project'}</div>
                    <div className="text-xs text-gray-300">{item.createdAt || item.created_at}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-2">Recent Activity</h2>
            {workflowLogs.length === 0 ? (
              <p className="text-gray-400">No recent activity.</p>
            ) : (
              <ul className="space-y-2">
                {workflowLogs.map((log: any) => (
                  <li key={log.id} className="bg-white/10 p-3 rounded text-white">
                    <div className="font-semibold">{log.agentId || 'Agent'}</div>
                    <div className="text-xs text-gray-300">{log.result || log.status}</div>
                    <div className="text-xs text-gray-400">{log.timestamp || log.created_at}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
