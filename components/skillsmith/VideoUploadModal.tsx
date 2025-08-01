'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Play, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useSkillSmithGuest } from '../../lib/skillsmith/guestTracker';
import CosmicButton from '../shared/CosmicButton';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'guest' | 'auth' | 'platform';
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

interface AnalysisResult {
  feedback: string;
  score: number;
  improvements: string[];
  quickWins: QuickWin[];
  sport: string;
  ageGroup: 'youth' | 'teen' | 'adult' | 'senior';
}

interface QuickWin {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  category: 'technique' | 'training' | 'nutrition' | 'mental';
}

export default function VideoUploadModal({ 
  isOpen, 
  onClose, 
  userType,
  onAnalysisComplete 
}: VideoUploadModalProps) {
  const [dragActive, setDragActive] = useState(false); // TODO: REVIEW UNUSED
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { canUseScan, useScan: triggerScan, scansRemaining } = useSkillSmithGuest();

  const MAX_DURATION = 30; // 30 seconds
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateVideo = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      if (file.size > MAX_FILE_SIZE) {
        setError('File size must be under 100MB');
        resolve(false);
        return;
      }

      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        resolve(false);
        return;
      }

      // Create video element to check duration
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        setVideoDuration(duration);
        
        if (duration > MAX_DURATION) {
          setError(`Video must be ${MAX_DURATION} seconds or shorter. Current duration: ${Math.round(duration)}s`);
          URL.revokeObjectURL(url);
          resolve(false);
        } else {
          setVideoPreview(url);
          resolve(true);
        }
      };

      video.onerror = () => {
        setError('Unable to process video file');
        URL.revokeObjectURL(url);
        resolve(false);
      };

      video.src = url;
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setError(null);
    const file = files[0];
    
    const isValid = await validateVideo(file);
    if (isValid) {
      setSelectedFile(file);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    await handleFiles(e.dataTransfer.files);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(e.target.files);
  };

  const simulateAnalysis = async (file: File): Promise<AnalysisResult> => {
    // Simulate AI analysis - in production this would call your AI service
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
    
    const sports = ['basketball', 'soccer', 'tennis', 'golf', 'swimming', 'running'];
    const sport = sports[Math.floor(Math.random() * sports.length)];
    
    const feedbacks = [
      `Excellent form analysis! Your ${sport} technique shows strong fundamentals with room for optimization in timing and follow-through.`,
      `Great job! I've identified 3 key areas where you can improve your ${sport} performance immediately.`,
      `Your ${sport} form has solid basics. Let's focus on power generation and consistency for the next level.`,
      `Strong technique foundation! I've spotted some efficiency improvements that could boost your ${sport} performance by 15-20%.`
    ];

    const improvements = [
      'Improve follow-through consistency',
      'Optimize timing and rhythm',
      'Enhance core stability',
      'Refine technique precision'
    ];

    const quickWins: QuickWin[] = [
      {
        id: 'qw1',
        title: '5-Minute Form Fix',
        description: 'Quick drill to improve your technique immediately',
        downloadUrl: '/downloads/form-fix.pdf',
        category: 'technique'
      },
      {
        id: 'qw2', 
        title: 'Power Boost Routine',
        description: '3 exercises to increase your power output',
        downloadUrl: '/downloads/power-boost.pdf',
        category: 'training'
      }
    ];

    return {
      feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
      score: 70 + Math.floor(Math.random() * 25),
      improvements: improvements.slice(0, 3),
      quickWins,
      sport,
      ageGroup: 'adult'
    };
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !canUseScan) return;

    setUploading(true);
    setError(null);

    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!triggerScan()) {
        setError('No scans remaining. Please upgrade to continue.');
        return;
      }

      setUploading(false);
      setAnalyzing(true);

      const result = await simulateAnalysis(selectedFile);
      
      setAnalyzing(false);
      onAnalysisComplete?.(result);
      
    } catch (err) {
      setError('Analysis failed. Please try again.');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setVideoPreview(null);
    setVideoDuration(null);
    setError(null);
    setUploading(false);
    setAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-orange-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-orange-500/20 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Upload Video for Analysis
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {userType === 'guest' && (
              <div className="mt-4 text-sm">
                <span className="text-orange-400 font-semibold">
                  {scansRemaining} free scans remaining
                </span>
                <span className="text-gray-400 ml-2">
                  • Max 30 seconds
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {!selectedFile ? (
              /* Upload Area */
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-orange-400 bg-orange-500/10' 
                    : 'border-gray-600 hover:border-orange-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Drop your video here
                </h3>
                <p className="text-gray-400 mb-4">
                  or click to select a file
                </p>
                <CosmicButton
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black"
                >
                  Select Video
                </CosmicButton>
                
                <div className="mt-4 text-xs text-gray-500">
                  Supports: MP4, MOV, WEBM • Max 30 seconds • Max 100MB
                </div>
              </div>
            ) : (
              /* Preview Area */
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">Selected Video</h3>
                    <button
                      onClick={resetModal}
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      Choose Different
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-gray-300 text-sm truncate">{selectedFile.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span>{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                        {videoDuration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.round(videoDuration)}s
                          </span>
                        )}
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                    </div>
                    
                    {videoPreview && (
                      <video
                        ref={videoRef}
                        src={videoPreview}
                        className="w-20 h-20 rounded-lg object-cover"
                        controls={false}
                        muted
                        onClick={() => videoRef.current?.play()}
                      />
                    )}
                  </div>
                </div>

                {/* Analysis Button */}
                <CosmicButton
                  variant="primary"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={uploading || analyzing || !canUseScan}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
                >
                  {uploading && (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Uploading...
                    </>
                  )}
                  {analyzing && (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Performance...
                    </>
                  )}
                  {!uploading && !analyzing && (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Analyze My Performance
                    </>
                  )}
                </CosmicButton>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 