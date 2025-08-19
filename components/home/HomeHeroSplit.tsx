"use client";

import Link from "next/link";
import { cta } from "@/lib/ctaRoutes";

export default function HomeHeroSplit() {
  // For simplicity, assume not authed for client-side rendering
  // This will route to signup if needed
  const authed = false;
  
  return (
    <section className="mt-12">
      <div className="mx-auto max-w-5xl px-4 grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl p-6 bg-white/5 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-2">Automate My Business</h3>
          <p className="text-white/70 mb-4">Branding • Publishing • Social Growth • Automation</p>
          <Link href={cta.launchPercy(authed)} className="btn-solid-grad inline-flex px-5 py-3">
            Launch Percy
          </Link>
        </div>
        <div className="rounded-3xl p-6 bg-white/5 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-2">Level Up My Game</h3>
          <p className="text-white/70 mb-4">Sports Analysis • Training • Nutrition • Performance</p>
          <Link href={cta.launchSkillSmith} className="btn-solid-grad inline-flex px-5 py-3">
            Launch SkillSmith
          </Link>
        </div>
      </div>
    </section>
  );
}
