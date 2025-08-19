"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const UnifiedOnboarding = dynamic(() => import("@/components/onboarding/UnifiedOnboarding"), { ssr: false });

type Mode = "business" | "sports";

export default function HomeHeroScanFirst() {
  const r = useRouter();
  const [mode, setMode] = useState<Mode>("business");
  const [urls, setUrls] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState<null | { quickWins: string[] }>(null);

  const start = async () => {
    if (mode === "sports") {
      r.push("/sports#scan"); // handoff to SkillSmith page
      return;
    }
    
    // Business flow
    const list = urls.split(/[\s,]+/).filter(Boolean);
    if (list.length === 0) { 
      alert("Add at least one website or social link."); 
      return; 
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/scans/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, urls: list, source: "home_hero" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Scan failed");
      
      // Open onboarding with quick wins
      setDrawer({ quickWins: json.quickWins || [] });
    } catch (e: any) {
      console.error(e); 
      alert("Could not start scan. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pt-24 md:pt-28 scroll-mt-28">
      <div className="mx-auto max-w-5xl px-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white text-center">
          Start with a Free AI Scan
        </h1>
        <p className="text-center text-white/70 mt-3">
          Paste your website or social link and get instant quick wins. Prefer sports? Switch and upload your video on the next page.
        </p>

        <div className="mt-6 flex justify-center gap-2">
          <button 
            onClick={() => setMode("business")}
            className={`px-4 py-2 rounded-full ${
              mode === "business" 
                ? "bg-cyan-500 text-white" 
                : "bg-white/5 text-white/70 border border-white/10"
            }`}
          >
            Business Scan
          </button>
          <button 
            onClick={() => setMode("sports")}
            className={`px-4 py-2 rounded-full ${
              mode === "sports" 
                ? "bg-cyan-500 text-white" 
                : "bg-white/5 text-white/70 border border-white/10"
            }`}
          >
            Sports Scan
          </button>
        </div>

        {/* Business inputs (default) */}
        {mode === "business" && (
          <div className="mt-5 grid gap-3">
            <input
              value={urls}
              onChange={e => setUrls(e.target.value)}
              placeholder="https://yourwebsite.com, https://instagram.com/brand (comma or space separated)"
              className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white placeholder-white/40"
            />
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email for results (optional)"
              className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white placeholder-white/40"
            />
          </div>
        )}

        <div className="mt-5 flex justify-center">
          <button 
            type="button" 
            onClick={start}
            className="btn-solid-grad px-8 py-3 relative z-50 pointer-events-auto disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Scanning…" : mode === "business" ? "Run Business Scan" : "Start Sports Scan"}
          </button>
        </div>
      </div>

      {drawer && (
        <UnifiedOnboarding
          preset={{ 
            path: "business", 
            email, 
            urls: urls.split(/[\s,]+/).filter(Boolean), 
            quickWins: drawer.quickWins 
          }}
          onClose={() => setDrawer(null)}
        />
      )}
    </section>
  );
}
