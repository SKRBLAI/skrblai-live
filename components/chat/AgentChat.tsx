"use client";
import { useState } from "react";

// Agent-specific configurations with comprehensive coverage
const AGENT_CONFIGS = {
  ira: {
    name: "IRA",
    description: "Chat with IRA about AOIs, volume profile, options flow, earnings catalysts…",
    placeholder: "Ask IRA about today's AOIs…",
    errorMessage: "Sorry—IRA had a hiccup."
  },
  skillsmith: {
    name: "SkillSmith",
    description: "Chat with SkillSmith about training, technique, nutrition, and mental performance…",
    placeholder: "Ask about training, technique, or sports performance…",
    errorMessage: "Sorry—SkillSmith had a technical difficulty."
  },
  percy: {
    name: "Percy",
    description: "Chat with Percy about business automation, growth strategies, and AI solutions…",
    placeholder: "Ask Percy about business growth or automation…",
    errorMessage: "Sorry—Percy encountered an issue."
  },
  branding: {
    name: "BrandAlexander",
    description: "Chat with BrandAlexander about brand identity, logos, color palettes, and brand strategy…",
    placeholder: "Ask about brand identity, logos, or visual design…",
    errorMessage: "Sorry—BrandAlexander encountered a creative block."
  },
  contentcreation: {
    name: "ContentCarltig",
    description: "Chat with ContentCarltig about content creation, SEO, blogging, and content strategy…",
    placeholder: "Ask about content ideas, SEO, or writing strategy…",
    errorMessage: "Sorry—ContentCarltig had a writer's block."
  },
  social: {
    name: "SocialNino",
    description: "Chat with SocialNino about social media strategy, viral content, and engagement…",
    placeholder: "Ask about social media growth or viral content…",
    errorMessage: "Sorry—SocialNino lost connection to the social network."
  },
  analytics: {
    name: "The Don of Data",
    description: "Chat with The Don of Data about analytics, insights, ROI tracking, and performance metrics…",
    placeholder: "Ask about data analysis or performance insights…",
    errorMessage: "Sorry—The Don of Data encountered corrupted data."
  },
  videocontent: {
    name: "VideoVortex",
    description: "Chat with VideoVortex about video creation, motion graphics, and visual storytelling…",
    placeholder: "Ask about video creation or motion graphics…",
    errorMessage: "Sorry—VideoVortex experienced a rendering error."
  },
  publishing: {
    name: "PublishPete",
    description: "Chat with PublishPete about book publishing, content distribution, and multimedia publishing…",
    placeholder: "Ask about book publishing or content distribution…",
    errorMessage: "Sorry—PublishPete encountered a publishing delay."
  },
  site: {
    name: "SiteOnzite",
    description: "Chat with SiteOnzite about website creation, responsive design, and web optimization…",
    placeholder: "Ask about website design or web development…",
    errorMessage: "Sorry—SiteOnzite had a 404 error."
  },
  adcreative: {
    name: "AdmEthen",
    description: "Chat with AdmEthen about advertising, conversion optimization, and ad campaigns…",
    placeholder: "Ask about ad campaigns or conversion optimization…",
    errorMessage: "Sorry—AdmEthen's ad blocker activated."
  },
  biz: {
    name: "Biz Z.",
    description: "Chat with Biz Z. about business strategy, market analysis, and growth planning…",
    placeholder: "Ask about business strategy or market opportunities…",
    errorMessage: "Sorry—Biz Z. encountered market volatility."
  },
  proposal: {
    name: "Pro Pose G4",
    description: "Chat with Pro Pose G4 about business proposals, deal structuring, and presentations…",
    placeholder: "Ask about proposals, deals, or presentations…",
    errorMessage: "Sorry—Pro Pose G4 encountered a deadline rush."
  },
  sync: {
    name: "SyncMaster",
    description: "Chat with SyncMaster about data synchronization, API integration, and system harmony…",
    placeholder: "Ask about data sync or system integration…",
    errorMessage: "Sorry—SyncMaster experienced network latency."
  },
  clientsuccess: {
    name: "ClientWhisperer",
    description: "Chat with ClientWhisperer about customer success, relationship management, and retention…",
    placeholder: "Ask about customer success or client relationships…",
    errorMessage: "Sorry—ClientWhisperer received negative feedback."
  },
  payment: {
    name: "PayPhomo",
    description: "Chat with PayPhomo about payment processing, revenue tracking, and financial security…",
    placeholder: "Ask about payment processing or financial management…",
    errorMessage: "Sorry—PayPhomo encountered currency fluctuations."
  }
};

// Default configuration for agents not specifically configured
const getDefaultConfig = (agentId: string) => ({
  name: agentId.charAt(0).toUpperCase() + agentId.slice(1),
  description: `Chat with ${agentId} about their specialized capabilities…`,
  placeholder: `Ask ${agentId} about their expertise…`,
  errorMessage: `Sorry—${agentId} encountered a technical issue.`
});

export default function AgentChat({ agentId = "ira" }: { agentId?: string }) {
  const [items, setItems] = useState<{ role: "user"|"assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const config = AGENT_CONFIGS[agentId as keyof typeof AGENT_CONFIGS] || getDefaultConfig(agentId);
  
  // Debug log to ensure correct agent targeting
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AgentChat] Initialized for agent: ${agentId}, config:`, config);
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setItems(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch(`/api/agents/chat/${agentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        cache: "no-store",
      });
      const data = await res.json();
      setItems(prev => [...prev, { role: "assistant", content: data.message ?? data.reply ?? "…" }]);
    } catch (e) {
      setItems(prev => [...prev, { role: "assistant", content: config.errorMessage }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 min-h-[320px]">
        {items.length === 0 ? (
          <div className="opacity-70 text-sm">
            {config.description}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div className={`inline-block rounded-xl px-3 py-2 ${m.role === "user" ? "bg-white/10" : "bg-black/30"}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => (e.key === "Enter" ? send() : null)}
          placeholder={config.placeholder}
          className="flex-1 rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none"
        />
        <button
          onClick={send}
          disabled={busy}
          className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50"
        >
          {busy ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
