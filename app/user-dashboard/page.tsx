'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { auth } from '@/utils/firebase';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  status: 'queued' | 'in_progress' | 'complete';
  type: string;
  createdAt: any;
}

interface UserFile {
  id: string;
  fileName: string;
  fileType: string;
  category: string;
  downloadURL: string;
  uploadedAt: any;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recentFiles, setRecentFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      
      const fetchData = async () => {
        try {
          // Fetch user's tasks
          const tasksQuery = query(
            collection(db, 'agent_jobs'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(3)
          );
          
          const tasksSnapshot = await getDocs(tasksQuery);
          const taskList: Task[] = [];
          
          tasksSnapshot.forEach((doc) => {
            taskList.push({
              id: doc.id,
              ...doc.data()
            } as Task);
          });
          
          setTasks(taskList);
          
          // Fetch recent files
          const filesQuery = query(
            collection(db, 'user_files'),
            where('userId', '==', currentUser.uid),
            orderBy('uploadedAt', 'desc'),
            limit(3)
          );
          
          const filesSnapshot = await getDocs(filesQuery);
          const fileList: UserFile[] = [];
          
          filesSnapshot.forEach((doc) => {
            fileList.push({
              id: doc.id,
              ...doc.data()
            } as UserFile);
          });
          
          setRecentFiles(fileList);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, []);

  if (loading) {
    return <div className="h-full flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-electric-blue border-t-transparent animate-spin"></div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, {user?.displayName || user?.email?.split('@')[0]}
        </h1>
        <p className="text-gray-400">
          Here's what's happening with your SKRBL AI projects
        </p>
      </motion.div>
      
      {/* Task Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Tasks</h2>
          <Link href="/user-dashboard/tasks" className="text-electric-blue hover:underline text-sm">
            View all tasks →
          </Link>
        </div>
        
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(task => (
              <div key={task.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-white">{task.title}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(task.createdAt?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded ${
                    task.status === 'complete' ? 'bg-green-600' : 
                    task.status === 'in_progress' ? 'bg-blue-600' : 'bg-yellow-600'
                  } text-white`}>
                    {task.status.replace('_', ' ')}
                  </div>
                </div>
                <Link
                  href={`/user-dashboard/tasks/${task.id}`}
                  className="text-electric-blue hover:text-electric-blue/80 text-sm font-medium"
                >
                  View details →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-400 mb-4">No tasks found. Start creating content with SKRBL AI!</p>
            <Link 
              href="/#percy"
              className="inline-block px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 transition-colors"
            >
              Create new task
            </Link>
          </div>
        )}
      </motion.div>
      
      {/* Recent Files */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Uploads</h2>
          <Link href="/user-dashboard/uploads" className="text-electric-blue hover:underline text-sm">
            Manage files →
          </Link>
        </div>
        
        {recentFiles.length > 0 ? (
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">File Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Uploaded</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {recentFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-750">
                      <td className="px-4 py-3 text-sm text-white">{file.fileName}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{file.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(file.uploadedAt?.toDate()).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <a 
                          href={file.downloadURL} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-electric-blue hover:underline"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-400 mb-4">No files uploaded yet.</p>
            <Link 
              href="/user-dashboard/uploads"
              className="inline-block px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 transition-colors"
            >
              Upload files
            </Link>
          </div>
        )}
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/?intent=publish_book#percy"
            className="flex flex-col items-center p-4 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span className="text-3xl mb-2">📚</span>
            <span className="text-white font-medium">Publish Book</span>
          </Link>
          <Link
            href="/?intent=design_brand#percy" 
            className="flex flex-col items-center p-4 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span className="text-3xl mb-2">🎨</span>
            <span className="text-white font-medium">Design Brand</span>
          </Link>
          <Link
            href="/?intent=launch_website#percy"
            className="flex flex-col items-center p-4 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span className="text-3xl mb-2">🌐</span>
            <span className="text-white font-medium">Create Content</span>
          </Link>
          <Link
            href="/?intent=grow_social_media#percy"
            className="flex flex-col items-center p-4 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span className="text-3xl mb-2">📱</span>
            <span className="text-white font-medium">Social Media</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
