'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import 'react-hot-toast/dist/react-hot-toast.css';

interface VideoItem {
  id: string;
  title: string;
  createdAt: Date;
  downloadUrl: string;
}

export default function VideoContentQueue() {
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/get-video-content');
        const data = await response.json();
        setVideos(data.videos || []);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Video Content Queue</h2>
      <div className="space-y-4">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-deep-navy/80 p-4 rounded-xl border border-electric-blue/20 flex justify-between items-center"
          >
            <div>
              <h4 className="font-semibold">{video.title}</h4>
              <p className="text-sm text-soft-gray/80">
                {new Date(video.createdAt).toLocaleDateString()}
              </p>
            </div>
            <a
              href={video.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Download
            </a>
          </motion.div>
        ))}
      </div>
      <button
        onClick={() => toast('Feature coming soon!')}
        className="btn-primary w-full text-center mt-4"
      >
        Request Custom Video Script
      </button>
      <Toaster position="bottom-right" />
    </div>
  );
}
