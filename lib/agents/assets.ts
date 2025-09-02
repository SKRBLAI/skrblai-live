export type AgentSlug =
  | "percy" | "branding" | "social" | "contentcreation" | "analytics"
  | "adcreative" | "videocontent" | "publishing" | "site" | "sync"
  | "clientsuccess" | "payment" | "proposal" | "biz" | "skillsmith" | "ira"
  | "default";

export function imagePathsForAgent(slug: AgentSlug) {
  const safe = (s: string) => s?.toLowerCase?.() || "default";
  const id = safe(slug) as AgentSlug;
  return {
    webp: `/images/agents/${id}.webp`,
    png:  `/images/agents/${id}-nobg.png`,
    webpFallback: `/images/agents/default.webp`,
    pngFallback:  `/images/agents/default-nobg.png`,
  };
}