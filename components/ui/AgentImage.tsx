"use client";
import Image from "next/image";
import { useState } from "react";
import { imagePathsForAgent, AgentSlug } from "@/lib/agents/assets";

type Props = {
  slug: AgentSlug;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
};

export default function AgentImage({
  slug,
  alt,
  className,
  width = 512,
  height = 768,
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority
}: Props) {
  const [usePng, setUsePng] = useState(false);
  const p = imagePathsForAgent(slug);

  // If WebP fails (or missing), fall back to PNG automatically.
  const src = usePng ? p.png : p.webp;

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      onError={() => {
        if (!usePng) setUsePng(true);
      }}
      // Final guard: if both fail, Next/Image will error.
      // We rely on the default images existing in /public/images/agents.
    />
  );
}