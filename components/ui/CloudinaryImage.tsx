'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getAgentImagePath } from '../../utils/agentUtils';
import type { SafeAgent } from '@/types/agent';

interface CloudinaryImageProps {
  agent: SafeAgent;
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
    : getAgentImagePath(agent, "card");

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
    if (fallbackToLocal) {
      setUseFallback(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`transition-opacity duration-300 rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleLoad}
        onError={handleError}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
          <div className="w-6 h-6 border-2 border-electric-blue border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default CloudinaryImage;
