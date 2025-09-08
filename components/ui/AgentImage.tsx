'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getAgentImagePaths, isValidAgentSlug, type AgentSlug } from '@/lib/agents/assets';

interface AgentImageProps {
  slug: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
}

/**
 * AgentImage component with automatic webp->png fallback
 * Standardizes agent image loading across the application
 */
export default function AgentImage({
  slug,
  alt,
  className = '',
  width = 100,
  height = 100,
  priority = false,
  fill = false,
}: AgentImageProps) {
  const [imageError, setImageError] = useState(false);
  
  // Validate slug and get paths
  const validSlug: AgentSlug = isValidAgentSlug(slug) ? slug : 'default';
  const imagePaths = getAgentImagePaths(validSlug);
  
  // Use fallback if primary webp failed to load
  const imageSrc = imageError ? imagePaths.fallback : imagePaths.webp;
  const altText = alt || `${validSlug} agent`;

  const handleImageError = () => {
    setImageError(true);
  };

  const imageProps = {
    src: imageSrc,
    alt: altText,
    className,
    onError: handleImageError,
    priority,
  };

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
      />
    );
  }

  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
    />
  );
}