"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cta } from "@/lib/ctaRoutes";

export default function UnifiedOnboarding({ preset, onClose }: {
  preset?: { path: "business"|"sports"; email?: string; urls?: string[]; quickWins?: string[]; };
  onClose?: () => void;
}) {
  const r = useRouter();
  const [email, setEmail] = useState(preset?.email || "");
  const [path, setPath] = useState<"business"|"sports">(preset?.path || "business");

  const go = () => {
    if (path === "sports") {
      r.push(cta.launchSkillSmith);
    } else {
      r.push(cta.launchPercy(false)); // will send to signup then to /dashboard
    }
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-end sm:place-items-center bg-black/40">
      <div className="w-full sm:w-[560px] bg-[#0f1220] border border-white/10 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-white">You're almost set</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        
        {preset?.quickWins?.length ? (
          <div className="mb-4 rounded-lg border border-emerald-400/30 bg-emerald-500/5 p-3 text-emerald-200 text-sm">
            <div className="font-semibold mb-1">Instant quick wins</div>
            <ul className="list-disc pl-5 space-y-1">
              {preset.quickWins.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </div>
        ) : null}
        
        <label className="text-sm text-white/80">Email (optional)</label>
        <input 
          value={email} 
          onChange={e => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2 text-white placeholder-white/40"
          placeholder="you@brand.com" 
        />
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button 
            onClick={() => setPath("business")}
            className={`rounded-lg p-3 border ${
              path === "business" 
                ? "border-cyan-400 bg-cyan-400/10" 
                : "border-white/10 bg-white/5"
            } text-white`}
          >
            Business
          </button>
          <button 
            onClick={() => setPath("sports")}
            className={`rounded-lg p-3 border ${
              path === "sports" 
                ? "border-cyan-400 bg-cyan-400/10" 
                : "border-white/10 bg-white/5"
            } text-white`}
          >
            Sports
          </button>
        </div>
        
        <button onClick={go} className="mt-5 w-full btn-solid-grad py-3">
          Continue
        </button>
      </div>
    </div>
  );
}
