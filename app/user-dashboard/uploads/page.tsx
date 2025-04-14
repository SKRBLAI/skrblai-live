'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
import FileUpload from '@/components/dashboard/FileUpload';

interface UserFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  downloadURL: string;
  uploadedAt: any;
}

export default function UploadsPage() {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      let q;
      
      if (activeCategory === 'all') {
        q = query(
          collection(db, 'user_files'),
          where('userId', '==', user.uid),
          orderBy('uploadedAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'user_files'),
          where('userId', '==', user.uid),
          where('category', '==', activeCategory),
          orderBy('uploadedAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const fileList: UserFile[] = [];
      
      querySnapshot.forEach((doc) => {
        fileList.push({
          id: doc.id,
          ...doc.data()
        } as UserFile);
      });
      
      setFiles(fileList);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const handleUploadComplete = (fileUrl: string, metadata: any) => {
    // Show success message
    setUploadSuccess(true);
    
    // Hide after 3 seconds
    setTimeout(() => {
      setUploadSuccess(false);
    }, 3000);
    
    // Refresh file list
    fetchFiles();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-white mb-6">Files & Uploads</h1>
        
        {/* Success message */}
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-600/20 border border-green-600 rounded-lg p-4 mb-6"
          >
            <p className="text-green-500">File uploaded successfully!</p>
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar: Upload section */}
          <div className="space-y-6">
            <FileUpload
              category="manuscripts"
              allowedFileTypes={['.pdf', '.doc', '.docx', '.txt']}
              maxSizeMB={10}
              onUploadComplete={handleUploadComplete}
            />
            
            <FileUpload
              category="brand-assets"
              allowedFileTypes={['.jpg', '.jpeg', '.png', '.svg', '.ai', '.psd']}
              maxSizeMB={5}
              onUploadComplete={handleUploadComplete}
            />
            
            <FileUpload
              category="content"
              allowedFileTypes={['.pdf', '.doc', '.docx', '.txt', '.md']}
              maxSizeMB={5}
              onUploadComplete={handleUploadComplete}
            />
          </div>
          
          {/* Right side: File list */}
          <div className="lg:col-span-2">
            {/* Category filter */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-lg ${activeCategory === 'all' ? 'bg-electric-blue text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                All Files
              </button>
              <button 
                onClick={() => setActiveCategory('manuscripts')}
                className={`px-4 py-2 rounded-lg ${activeCategory === 'manuscripts' ? 'bg-electric-blue text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                Manuscripts
              </button>
              <button 
                onClick={() => setActiveCategory('brand-assets')}
                className={`px-4 py-2 rounded-lg ${activeCategory === 'brand-assets' ? 'bg-electric-blue text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                Brand Assets
              </button>
              <button 
                onClick={() => setActiveCategory('content')}
                className={`px-4 py-2 rounded-lg ${activeCategory === 'content' ? 'bg-electric-blue text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                Content
              </button>
            </div>
            
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-electric-blue border-t-transparent animate-spin"></div>
              </div>
            ) : files.length > 0 ? (
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">File Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Size</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Uploaded</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-750">
                        <td className="px-4 py-3 text-sm text-white">{file.fileName}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{file.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{formatFileSize(file.fileSize)}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(file.uploadedAt?.toDate()).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm space-x-3">
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
            ) : (
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <p className="text-gray-400 mb-4">No files found in this category.</p>
                {activeCategory !== 'all' && (
                  <button 
                    onClick={() => setActiveCategory('all')}
                    className="px-4 py-2 bg-electric-blue rounded-lg text-white"
                  >
                    View All Files
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
