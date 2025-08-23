"use client";
import { useState } from "react";

export default function AgentChat({ agentId = "ira" }: { agentId?: string }) {
  const [items, setItems] = useState<{ role: "user"|"assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setItems(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        cache: "no-store",
      });
      const data = await res.json();
      setItems(prev => [...prev, { role: "assistant", content: data.reply ?? "…" }]);
    } catch (e) {
      setItems(prev => [...prev, { role: "assistant", content: "Sorry—IRA had a hiccup." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 min-h-[320px]">
        {items.length === 0 ? (
          <div className="opacity-70 text-sm">
            Chat with IRA about AOIs, volume profile, options flow, earnings catalysts…
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
          placeholder="Ask IRA about today’s AOIs…"
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
