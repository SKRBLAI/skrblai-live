'use client';
import * as React from 'react';
import Image from 'next/image';
import { getAgentImagePaths, nextFallback } from '@/utils/agentImages';

type Props = {
  agentId: string;              // slug/id (case-insensitive)
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
};

export default function AgentImage({
  agentId,
  alt,
  className,
  sizes,
  priority,
  fill,
  width,
  height,
}: Props) {
  const imgSet = React.useMemo(() => getAgentImagePaths(agentId), [agentId]);
  const [src, setSrc] = React.useState(imgSet.primary);
  React.useEffect(() => setSrc(imgSet.primary), [imgSet.primary]);

  const handleError = () => {
    const next = nextFallback(src, imgSet);
    if (next) setSrc(next);
  };

  // Use Next/Image but allow unoptimized in prod if needed via env
  const common = { alt, className, onError: handleError, sizes, priority } as const;
  if (fill) {
    return <Image src={src} fill {...common} />;
  }
  return <Image src={src} width={width ?? 512} height={height ?? 512} {...common} />;
}