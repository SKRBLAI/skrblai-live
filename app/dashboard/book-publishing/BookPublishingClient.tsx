'use client';

import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from '../../../components/dashboard/DashboardSidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import DownloadCenter from '../../../components/dashboard/DownloadCenter';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getBrowserSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import '../../../styles/components/BookPublishing.css';
import type { BookPublishingState, FileUploadStatus } from '@/types/book-publishing';
import type { User } from '@supabase/supabase-js';

interface BookPublishingClientProps {
  user: User;
}

export default function BookPublishingClient({ user }: BookPublishingClientProps) {
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
    if (!user) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    
    // Fetch user-specific publishing projects
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('bookPublishing')
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
    fetchProjects();
    fetchLogs();
    // Real-time subscription for workflow logs
    const logsSub = supabase
      .channel('workflowLogs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workflowLogs', filter: `userId=eq.${user.id}` }, (payload: any) => {
        fetchLogs();
      })
      .subscribe();
    // Real-time subscription for publishing projects
    const projectsSub = supabase
      .channel('bookPublishing')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookPublishing', filter: `userId=eq.${user.id}` }, (payload: any) => {
        fetchProjects();
      })
      .subscribe();
    
    setIsLoading(false);
    
    return () => {
      supabase.removeChannel(logsSub);
      supabase.removeChannel(projectsSub);
    };
  }, [user]);

  const handleFileUpload = async (file: File) => {
    try {
      const supabase = getBrowserSupabase();
      if (!supabase) return;

      setUploadStatus({ progress: 0, success: false });
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('book-publishing')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('book-publishing')
        .getPublicUrl(fileName);

      setState(prev => ({
        ...prev,
        uploadedFile: file,
        uploadedFileName: file.name,
        uploadedFileUrl: publicUrl
      }));

      setUploadStatus({ progress: 100, success: true });
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      setUploadStatus({ progress: 0, success: false });
    }
  };

  const handleSubmit = async () => {
    if (!state.prompt.trim() && !state.uploadedFile) {
      toast.error('Please provide a prompt or upload a file');
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const response = await fetch('/api/book-publishing/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: state.prompt,
          fileUrl: state.uploadedFileUrl,
          fileName: state.uploadedFileName,
          userId: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const data = await response.json();
      setState(prev => ({ ...prev, response: data }));
      toast.success('Content generated successfully');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate content');
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

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
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Book Publishing Dashboard</h1>
                <p className="text-gray-400">Create and publish your books with AI assistance</p>
              </div>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/80 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold text-white mb-4">Create Your Book</h2>
                
                {/* Text Prompt */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Book Description or Prompt
                  </label>
                  <textarea
                    value={state.prompt}
                    onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
                    placeholder="Describe your book idea, genre, target audience, or any specific requirements..."
                    className="w-full h-32 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue resize-none"
                  />
                </div>

                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload Existing Content (Optional)
                  </label>
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-electric-blue transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {state.uploadedFile ? state.uploadedFileName : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">PDF, DOC, DOCX, TXT files only</p>
                    </label>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleSubmit}
                  disabled={state.isSubmitting || (!state.prompt.trim() && !state.uploadedFile)}
                  className="w-full bg-gradient-to-r from-electric-blue to-cyan-500 hover:from-electric-blue/80 hover:to-cyan-500/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isSubmitting ? 'Generating...' : 'Generate Book Content'}
                </button>
              </div>

              {/* Results Section */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold text-white mb-4">Generated Content</h2>
                {state.response ? (
                  <div className="space-y-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-2">Publishing Steps</h3>
                      <div className="space-y-3">
                        {state.response.steps.map((step, index) => (
                          <div key={index} className="flex items-start">
                            <span className="w-6 h-6 bg-electric-blue/20 text-electric-blue text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">
                              {index + 1}
                            </span>
                            <div>
                              <h4 className="text-white font-medium">{step.title}</h4>
                              <p className="text-gray-300 text-sm">{step.description}</p>
                              <p className="text-gray-400 text-xs mt-1">Timeline: {step.timeline}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-2">Recommendations</h3>
                      <ul className="text-gray-300 space-y-1">
                        {state.response.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-electric-blue rounded-full mr-2 mt-2"></span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-2">Next Steps</h3>
                      <ul className="text-gray-300 space-y-1">
                        {state.response.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-2"></span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-2">Estimated Completion</h3>
                      <p className="text-gray-300">{state.response.estimatedCompletion}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No content generated yet</p>
                    <p className="text-sm text-gray-500 mt-2">Provide a prompt or upload a file to get started</p>
                  </div>
                )}
              </div>
            </div>

            {/* Publishing Projects */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-semibold text-white mb-4">Your Publishing Projects</h2>
              {publishingProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publishingProjects.map((project, index) => (
                    <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-2">{project.title}</h3>
                      <p className="text-gray-400 text-sm mb-2">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          project.status === 'published' 
                            ? 'bg-green-500/20 text-green-400' 
                            : project.status === 'draft'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No publishing projects yet</p>
                  <p className="text-sm text-gray-500">Generate some content to create your first project</p>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}