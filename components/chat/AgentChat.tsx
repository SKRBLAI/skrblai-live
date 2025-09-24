"use client";
import { useState } from "react";

// Agent-specific configurations with defaults
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
