"use client";

import Image from "next/image";
import React from "react";

const MOCK_AGENTS = [
  { id: "ira", name: "IRA", role: "Growth Strategist" },
  { id: "nova", name: "Nova", role: "Content Architect" },
  { id: "atlas", name: "Atlas", role: "Ops Orchestrator" },
  { id: "lyra", name: "Lyra", role: "Research Analyst" },
  { id: "zeno", name: "Zeno", role: "Automation Engineer" },
  { id: "sol", name: "Sol", role: "Design Assistant" },
  { id: "echo", name: "Echo", role: "Customer Success" },
  { id: "mira", name: "Mira", role: "Analytics" },
];

export default function AgentGrid() {
  return (
    <section className="w-full">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold">Featured agents</h2>
        <p className="text-gray-600 mt-2">
          A permanent, visible grid — no feature flags.
        </p>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {MOCK_AGENTS.map((a) => (
            <div key={a.id} className="rounded-lg border border-gray-200 p-4 bg-white">
              <div className="relative w-full h-24 bg-gray-100 rounded-md">
                {/* Placeholder avatar block */}
                <Image
                  src={`/images/agents/${a.id}.webp`}
                  alt={a.name}
                  fill
                  className="object-cover rounded-md"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              <div className="mt-3">
                <div className="font-medium">{a.name}</div>
                <div className="text-sm text-gray-500">{a.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
