'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getAgentImageCandidates } from '../../utils/agentImages';

interface AgentImageProps {
  agentId: string;
  agentName: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  style?: React.CSSProperties;
  fallbackContent?: React.ReactNode;
}

export default function AgentImage({
  agentId,
  agentName,
  fill,
  width,
  height,
  className = '',
  sizes,
  priority,
  style,
  fallbackContent
}: AgentImageProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const candidates = getAgentImageCandidates(agentId);
  
  const handleImageError = () => {
    if (imageIndex < candidates.length - 1) {
      setImageIndex(prev => prev + 1);
    } else {
      // Last fallback failed, show fallback content
      const target = document.querySelector(`[data-agent-image="${agentId}"]`) as HTMLImageElement;
      if (target) {
        target.style.display = 'none';
        const fallback = target.parentElement?.querySelector('.agent-fallback') as HTMLElement;
        if (fallback) fallback.style.display = 'flex';
      }
    }
  };

  return (
    <>
      <Image
        data-agent-image={agentId}
        src={candidates[imageIndex]}
        alt={`${agentName} Avatar`}
        fill={fill}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        priority={priority}
        style={style}
        onError={handleImageError}
      />
      {fallbackContent && (
        <div className="agent-fallback absolute inset-0 hidden items-center justify-center rounded-xl bg-zinc-900/60 text-zinc-300">
          {fallbackContent}
        </div>
      )}
    </>
  );
}