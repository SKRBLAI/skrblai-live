'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
import { JobStatus } from '@/utils/agentJobStatus';
import Link from 'next/link';

interface TaskDetail {
  id: string;
  userId: string;
  title: string;
  status: JobStatus;
  type: string;
  agentType: string;
  intent: string;
  progress: number;
  createdAt: any;
  updatedAt?: any;
  output?: any;
  error?: string;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaskDetail = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.push('/login');
          return;
        }

        const taskId = params.id as string;
        const taskRef = doc(db, 'agent_jobs', taskId);
        const taskDoc = await getDoc(taskRef);

        if (!taskDoc.exists()) {
          setError('Task not found');
          setLoading(false);
          return;
        }

        const taskData = taskDoc.data() as TaskDetail;
        
        // Verify this task belongs to current user
        if (taskData.userId !== user.uid && !taskData.userId.includes(user.email as string)) {
          setError('You do not have permission to view this task');
          setLoading(false);
          return;
        }

        setTask(taskData);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching task details');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetail();
  }, [params.id, router]);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      const jsDate = date.toDate ? date.toDate() : new Date(date);
      return jsDate.toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusBadgeClass = () => {
    if (!task) return 'bg-gray-600';
    
    switch (task.status) {
      case 'queued': return 'bg-yellow-600';
      case 'in_progress': return 'bg-blue-600';
      case 'complete': return 'bg-green-600';
      case 'failed': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getTaskIcon = () => {
    if (!task) return '🤖';
    
    switch (task.type) {
      case 'publish': return '📚';
      case 'design': return '🎨';
      case 'launch': return '🚀';
      case 'grow': return '📈';
      case 'improve': return '📊';
      default: return '🤖';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-electric-blue border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Link
          href="/user-dashboard/tasks"
          className="px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90"
        >
          Back to All Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/user-dashboard/tasks"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-white">Task Details</h1>
        </div>
        
        {task?.status === 'complete' && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Export
          </button>
        )}
      </div>
      
      {task && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Task header */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{getTaskIcon()}</div>
                <div>
                  <h2 className="text-xl font-bold text-white">{task.title}</h2>
                  <p className="text-gray-400">{task.intent.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <div className={`px-3 py-1 text-sm rounded-full ${getStatusBadgeClass()} text-white`}>
                {task.status.replace(/_/g, ' ')}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Created</p>
                <p className="text-white">{formatDate(task.createdAt)}</p>
              </div>
              {task.updatedAt && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="text-white">{formatDate(task.updatedAt)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">Agent</p>
                <p className="text-white">{task.agentType || 'General'}</p>
              </div>
            </div>
            
            {task.status === 'in_progress' && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${task.progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-electric-blue"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Task output */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Results</h3>
            
            {task.status === 'queued' && (
              <div className="bg-gray-750 rounded-lg p-6 text-center">
                <div className="text-amber-400 text-lg mb-2">⏳ Queued</div>
                <p className="text-gray-400">Task is waiting to be processed. Check back soon for updates.</p>
              </div>
            )}
            
            {task.status === 'in_progress' && (
              <div className="bg-gray-750 rounded-lg p-6 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-electric-blue border-t-transparent animate-spin mx-auto mb-4"></div>
                <div className="text-blue-400 text-lg mb-2">🔄 In Progress</div>
                <p className="text-gray-400">Your task is currently being processed.</p>
                <p className="text-gray-500 mt-2">This may take a few minutes.</p>
              </div>
            )}
            
            {task.status === 'failed' && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
                <div className="text-red-400 text-lg mb-2">❌ Task Failed</div>
                <p className="text-gray-400 mb-4">There was an issue processing your task.</p>
                
                {task.error && (
                  <div className="bg-red-900/30 p-4 rounded-lg">
                    <p className="text-red-300 font-mono text-sm">{task.error}</p>
                  </div>
                )}
                
                <div className="mt-6">
                  <Link
                    href={`/user-dashboard/tasks/retry/${task.id}`}
                    className="px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90"
                  >
                    Retry Task
                  </Link>
                </div>
              </div>
            )}
            
            {task.status === 'complete' && task.output && (
              <div className="space-y-6">
                {/* If output has a socialContentId (from socialBotAgent) */}
                {task.output.socialContentId && (
                  <div className="bg-gray-750 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-3">Social Media Content</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-gray-400">Content ID: {task.output.socialContentId}</p>
                        <p className="text-gray-400">Platforms: {task.output.platformCount}</p>
                        <p className="text-gray-400">Posts per platform: {task.output.postCount}</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <Link
                          href={`/user-dashboard/social-content/${task.output.socialContentId}`}
                          className="px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90"
                        >
                          View Full Content
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Generic output display for other agents */}
                {!task.output.socialContentId && (
                  <div className="bg-gray-750 rounded-lg p-6">
                    <pre className="text-gray-300 whitespace-pre-wrap overflow-auto max-h-96">
                      {JSON.stringify(task.output, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Link
                    href="/user-dashboard/tasks/new"
                    className="px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90"
                  >
                    Create New Task
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
