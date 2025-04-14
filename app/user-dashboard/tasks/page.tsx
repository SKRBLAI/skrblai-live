'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  status: 'queued' | 'in_progress' | 'complete';
  type: string;
  createdAt: any;
  agentType: string;
  progress?: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        let q;
        
        if (filter === 'all') {
          q = query(
            collection(db, 'agent_jobs'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
        } else {
          q = query(
            collection(db, 'agent_jobs'),
            where('userId', '==', user.uid),
            where('status', '==', filter),
            orderBy('createdAt', 'desc')
          );
        }
        
        const querySnapshot = await getDocs(q);
        const taskList: Task[] = [];
        
        querySnapshot.forEach((doc) => {
          taskList.push({
            id: doc.id,
            ...doc.data()
          } as Task);
        });
        
        setTasks(taskList);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [filter]);

  // Status badge colors
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'queued':
        return 'bg-yellow-600';
      case 'in_progress':
        return 'bg-blue-600';
      case 'complete':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  // Type icon
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'publishing':
        return '📚';
      case 'branding':
        return '🎨';
      case 'content':
        return '📝';
      case 'social':
        return '📱';
      default:
        return '🤖';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-white mb-6">Task Progress</h1>
        
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-electric-blue text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            All Tasks
          </button>
          <button 
            onClick={() => setFilter('queued')}
            className={`px-4 py-2 rounded-lg ${filter === 'queued' ? 'bg-electric-blue text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Queued
          </button>
          <button 
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-lg ${filter === 'in_progress' ? 'bg-electric-blue text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            In Progress
          </button>
          <button 
            onClick={() => setFilter('complete')}
            className={`px-4 py-2 rounded-lg ${filter === 'complete' ? 'bg-electric-blue text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Complete
          </button>
        </div>
        
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-electric-blue border-t-transparent animate-spin"></div>
          </div>
        ) : tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tasks.map(task => (
              <motion.div
                key={task.id}
                whileHover={{ y: -5 }}
                className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-electric-blue transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getTypeIcon(task.type)}</div>
                    <div>
                      <h3 className="font-medium text-white">{task.title}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(task.createdAt?.toDate()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded ${getStatusBadge(task.status)} text-white`}>
                    {task.status.replace('_', ' ')}
                  </div>
                </div>
                
                {task.status === 'in_progress' && (
                  <div className="mt-3 mb-4">
                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-electric-blue"
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress || 0}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{task.progress || 0}% complete</span>
                      <span>ETA: ~3 min</span>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 text-sm text-gray-400">
                  <p><span className="text-gray-500">Agent:</span> {task.agentType || 'General'}</p>
                  <p><span className="text-gray-500">Task ID:</span> {task.id.substring(0, 8)}...</p>
                </div>
                
                <div className="mt-4">
                  <Link
                    href={`/user-dashboard/tasks/${task.id}`}
                    className="text-electric-blue hover:text-electric-blue/80 text-sm font-medium transition-colors"
                  >
                    {task.status === 'complete' ? 'View Results' : 'View Details'} →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-4">No tasks found with the selected filter.</p>
            {filter !== 'all' && (
              <button 
                onClick={() => setFilter('all')}
                className="px-4 py-2 bg-electric-blue rounded-lg text-white"
              >
                View All Tasks
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
