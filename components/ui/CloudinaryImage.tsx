'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { getAgentImagePath } from '@/utils/agentUtils';
import type { Agent } from '@/types/agent';

interface CloudinaryImageProps {
  agent: Agent;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  useCloudinary?: boolean;
  quality?: number;
  size?: string;
  webp?: boolean;
  cloudinaryTransformation?: string;
  fallbackToLocal?: boolean;
  fallbackImagePath?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Enhanced image component that supports Cloudinary images with loading states and error fallbacks
 * Falls back to local images if Cloudinary fails or if useCloudinary is false
 */
const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  agent,
  alt,
  width = 250,
  height = 250,
  priority = false,
  className = '',
  useCloudinary = true,
  quality = 85,
  size = 'original',
  webp = true,
  cloudinaryTransformation = '',
  fallbackToLocal = true,
  fallbackImagePath = '/images/default-agent.png',
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Get image source using our enhanced utility
  const imageSrc = useFallback 
    ? fallbackImagePath 
    : getAgentImagePath(agent, {
        webp,
        quality,
        size,
        cdn: true,
        useCloudinary,
        cloudinaryTransformation,
        fallbackToLocal
      });

  // Handle image load
  const handleImageLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  // Handle image error
  const handleImageError = () => {
    // If already using fallback image, just show error state
    if (useFallback) {
      setHasError(true);
      setIsLoading(false);
      if (onError) onError();
    } else {
      // Otherwise try fallback image
      setUseFallback(true);
    }
  };

  // We'll create a dynamic className with width and height added directly
  const containerStyle = { width: `${width}px`, height: `${height}px` };
  
  return (
    <div className={`relative ${className}`} style={containerStyle}>
      {/* Loading state overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm rounded-lg animate-pulse">
          <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error state - only shown if both primary and fallback images fail */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/30 backdrop-blur-sm rounded-lg">
          <svg className="w-12 h-12 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-center text-white">Image failed to load</p>
        </div>
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className={`transition-opacity duration-300 rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};

export default CloudinaryImage;
