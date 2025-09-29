// Canonical image resolution for agent assets.
// Priority:
//  1) /images/agents/{slug}-skrblai.webp
//  2) /images/agents/{slug}.webp
//  3) /images/agents/{slug}-nobg.png
//  4) /images/agents/{slug}.png
//  5) /images/agents/default.png
//
// Slugs are treated case-insensitively for filesystem-compatibility.

export type AgentImageSet = {
  primary: string;
  fallbacks: string[];
};

export function getAgentImagePaths(rawSlug: string): AgentImageSet {
  const slug = (rawSlug || '').trim().toLowerCase();
  const base = `/images/agents/${slug}`;
  const set: string[] = [
    `${base}-skrblai.webp`,
    `${base}.webp`,
    `${base}-nobg.png`,
    `${base}.png`,
  ];
  return {
    primary: set[0],
    fallbacks: [...set.slice(1), '/images/agents/default.png'],
  };
}

// Utility for cycling through fallbacks on <img onError>
export function nextFallback(currentSrc: string, imgSet: AgentImageSet): string | null {
  const list = [imgSet.primary, ...imgSet.fallbacks];
  const idx = list.indexOf(currentSrc);
  if (idx === -1 || idx === list.length - 1) return null;
  return list[idx + 1];
}

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
 * Legacy support - Gets prioritized image candidates for an agent slug
 * @deprecated Use getAgentImagePaths instead
 */
export function getAgentImageCandidates(slug: string): string[] {
  const imgSet = getAgentImagePaths(slug);
  return [imgSet.primary, ...imgSet.fallbacks];
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
  skrblaiWebp: string;
} {
  const canonicalSlug = canonicalizeAgentSlug(slug);
  
  return {
    skrblaiWebp: `/images/agents/${canonicalSlug}-skrblai.webp`,
    webp: `/images/agents/${canonicalSlug}.webp`,
    nobg: `/images/agents/${canonicalSlug}-nobg.png`,
    png: `/images/agents/${canonicalSlug}.png`,
  };
}