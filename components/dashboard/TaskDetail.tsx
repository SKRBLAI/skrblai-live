'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './TaskDetail.module.css';
import { getBrowserSupabase } from '../../lib/supabase';
import { JobStatus } from '../../utils/agentJobStatus';

interface TaskDetailProps {
  taskId: string;
}

interface TaskData {
  id: string;
  type: string;
  status: JobStatus;
  progress: number;
  createdAt: any;
  updatedAt?: any;
  userId: string;
  output?: any;
  results?: any;
  error?: string;
  [key: string]: any;
}

export default function TaskDetail({ taskId }: TaskDetailProps) {
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const supabase = getBrowserSupabase();
        if (!supabase) {
          throw new Error('Supabase client is not available');
        }
        const { data, error } = await supabase
          .from('agent_jobs')
          .select('*')
          .eq('id', taskId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setTask(data as TaskData);
        } else {
          setError('Task not found');
        }
      } catch (err) {
        console.error('Error fetching task:', err);
        setError('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };
    
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle ISO string or timestamp
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'queued': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'complete': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: JobStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-electric-blue border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="rounded-lg bg-red-900/20 p-6 text-center">
        <h3 className="text-lg text-red-400 mb-2">Error</h3>
        <p className="text-white">{error || 'Task not found'}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Task Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{task.type || 'Task'} Details</h1>
          <p className="text-gray-400">Task ID: {task.id}</p>
        </div>
        <div className={`px-4 py-2 rounded-lg ${getStatusColor(task.status)}`}>
          {getStatusText(task.status)}
        </div>
      </div>
      
      {/* Task Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm mb-2">Type</h3>
          <p className="text-xl font-bold text-white capitalize">{task.type || 'Unknown'}</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm mb-2">Created</h3>
          <p className="text-xl font-bold text-white">{formatDate(task.createdAt)}</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm mb-2">Last Updated</h3>
          <p className="text-xl font-bold text-white">{formatDate(task.updatedAt)}</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm mb-2">Progress</h3>
          <div className="flex items-center">
            <div className={styles.progressBar}>
              <div 
                className={styles.progressBarFill}
                style={{ '--progress-width': `${task.progress || 0}%` } as React.CSSProperties}
              ></div>
            </div>
            <span className="text-white font-bold">{task.progress || 0}%</span>
          </div>
        </div>
      </div>
      
      {/* Task Output/Results */}
      {(task.output || task.results) && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Results</h3>
          <div className="space-y-4">
            {task.output && typeof task.output === 'object' ? (
              <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
                {JSON.stringify(task.output, null, 2)}
              </pre>
            ) : task.output ? (
              <p className="text-white">{String(task.output)}</p>
            ) : null}
            
            {task.results && typeof task.results === 'object' ? (
              <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
                {JSON.stringify(task.results, null, 2)}
              </pre>
            ) : task.results ? (
              <p className="text-white">{String(task.results)}</p>
            ) : null}
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {task.error && (
        <div className="bg-red-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Error</h3>
          <p className="text-white">{task.error}</p>
        </div>
      )}
      
      {/* Task Metadata/Additional Info */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Additional Information</h3>
        <div className="space-y-2">
          {Object.entries(task).filter(([key]) => 
            !['id', 'type', 'status', 'progress', 'createdAt', 'updatedAt', 'userId', 'output', 'results', 'error'].includes(key)
          ).map(([key, value]) => (
            <div key={key} className="grid grid-cols-3 gap-4">
              <div className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
              <div className="col-span-2 text-white">
                {typeof value === 'object' ? 
                  JSON.stringify(value) : 
                  String(value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
