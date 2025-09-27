/**
 * Agent Image Utilities
 * Provides standardized image path resolution with fallback support
 */

import React from 'react';

/**
 * Canonicalizes an agent slug to lowercase kebab-case
 * @param slug - The agent slug to canonicalize
 * @returns Canonicalized slug (lowercase, spaces/underscores to hyphens)
 */
export function canonicalizeAgentSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Gets prioritized image candidates for an agent slug
 * @param slug - The agent slug
 * @returns Array of image paths in order of preference (PNG first, then fallbacks)
 */
export function getAgentImageCandidates(slug: string): string[] {
  const canonicalSlug = canonicalizeAgentSlug(slug);
  
  return [
    `/images/agents/${canonicalSlug}.png`,
    `/images/agents/${canonicalSlug}-nobg.png`,
    `/images/agents/${canonicalSlug}.webp`,
    `/images/agents/default.png`
  ];
}

/**
 * Gets all possible image variations for an agent (for checking purposes)
 * @param slug - The agent slug
 * @returns Object with image type flags
 */
export function getAgentImageVariations(slug: string): {
  png: string;
  nobg: string;
  webp: string;
} {
  const canonicalSlug = canonicalizeAgentSlug(slug);
  
  return {
    png: `/images/agents/${canonicalSlug}.png`,
    nobg: `/images/agents/${canonicalSlug}-nobg.png`,
    webp: `/images/agents/${canonicalSlug}.webp`
  };
}

/**
 * Hook for managing image fallback state in React components
 * @param slug - The agent slug
 * @returns Object with current image src and error handler
 */
export function useAgentImageFallback(slug: string) {
  const [imageIndex, setImageIndex] = React.useState(0);
  const candidates = getAgentImageCandidates(slug);
  
  const handleImageError = React.useCallback(() => {
    setImageIndex((prev) => Math.min(prev + 1, candidates.length - 1));
  }, [candidates.length]);
  
  const resetImage = React.useCallback(() => {
    setImageIndex(0);
  }, []);
  
  return {
    src: candidates[imageIndex],
    onError: handleImageError,
    reset: resetImage,
    isDefault: imageIndex === candidates.length - 1
  };
}

// For components that don't use React hooks
export class AgentImageFallback {
  private imageIndex = 0;
  private candidates: string[];
  
  constructor(slug: string) {
    this.candidates = getAgentImageCandidates(slug);
  }
  
  get src(): string {
    return this.candidates[this.imageIndex];
  }
  
  get isDefault(): boolean {
    return this.imageIndex === this.candidates.length - 1;
  }
  
  handleError(): string {
    this.imageIndex = Math.min(this.imageIndex + 1, this.candidates.length - 1);
    return this.src;
  }
  
  reset(): void {
    this.imageIndex = 0;
  }
}